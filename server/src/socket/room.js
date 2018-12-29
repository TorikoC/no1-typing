const db = require('../services/index');
const config = require('config');
const logger = require('../logger/socket');

module.exports = (io, socket) => {
  socket.on('room-join', onJoin.bind(null, socket));
  socket.on('room-leave', onLeave.bind(null, socket));
  socket.on('room-start', onStart.bind(null, io));
  socket.on('room-update-progress', onUpdateProgress.bind(null, socket));

  socket.on('room-prepared', onPrepared.bind(null, socket));
  socket.on('room-snippet-updated', onSnippetUpdated.bind(null, io));
  socket.on('room-done', onDone.bind(null, io, socket));
};

function onJoin(socket, id, username) {
  socket.join(id, () => {
    logger.info(`${username} user join ${id}`);
    socket.broadcast.to(id).emit('user-join', username);
  });
}
function onLeave(socket, id, username) {
  socket.leave(id, () => {
    logger.info(`${username} user leave ${id}`);
    socket.broadcast.to(id).emit('user-leave', username);
    db.room
      .getOneAndModify(
        { _id: id },
        {
          $pull: {
            users: {
              username: username,
            },
          },
        },
      )
      .then(result => {
        if (!result) {
          return;
        }
        logger.info(`remove user ${username} from room ${id}.`);
        if (result.users.length === 0) {
          logger.info(`remove room ${id}.`);
          result.remove();
        } else if (
          result.users.length < result.userLimit &&
          result.state === config.get('roomState').WAITING &&
          !result.canJoin
        ) {
          result.canJoin = true;
          result.save();
        }
      });
  });
}
function onUpdateProgress(socket, id, progress) {
  socket.broadcast.to(id).emit('update-progress', progress);
}
function onPrepared(socket, id, username) {
  logger.info(`${username} prepared, ${id}.`);
  socket.broadcast.to(id).emit('user-prepared', username);
}
function onStart(io, id) {
  logger.info(`start ${id}.`);
  db.room
    .getOneAndModify(
      { _id: id },
      { $set: { state: config.get('roomState').ONGOING, canJoin: false } },
      { new: true },
    )
    .then(async result => {
      if (!result) {
        return;
      }
      const snippet = await db.snippet.getOneRandomWithSource({
        lang: result.lang,
      });
      io.to(id).emit('update-room-state', config.get('roomState').ONGOING);
      io.to(id).emit('update-snippet', snippet);
    });
}

function onSnippetUpdated(io, id, username) {
  db.room
    .getOneAndModify(
      { _id: id, 'users.username': username },
      { $set: { 'users.$.snippetReceived': true } },
    )
    .then(result => {
      if (!result) {
        return;
      }
      logger.info(`${username} receive snippet , ${id}.`);
      const distributing = result.users.some(user => !user.snippetReceived);
      if (!distributing) {
        logger.info(`${id} clock start.`);
        tick(io, id, 5);
      }
    });
}

function onDone(io, socket, id, username, record) {
  logger.info(`${username} done, ${id}.`);
  socket.broadcast.to(id).emit('user-done', username);
  db.record.create(record);
  db.room
    .getOneAndModify(
      { _id: id, 'users.username': username },
      {
        $set: {
          'users.$.done': true,
        },
      },
    )
    .then(result => {
      if (!result) {
        return;
      }
      let ongoing = result.users.some(user => !user.done);
      if (!ongoing) {
        logger.info(`all done ${id}`);
        io.to(id).emit('all-done');

        result.state = config.get('roomState').WAITING;
        io.to(id).emit('update-room-state', config.get('roomState').WAITING);

        if (result.users.length < result.userLimit) {
          result.canJoin = true;
        }
        result.users.forEach(user => {
          user.snippetReceived = false;
          user.done = false;
        });
        result.save();
      }
    });
}

function tick(io, id, clock) {
  clock -= 1;
  io.to(id).emit('update-clock', clock);
  if (clock > 0) {
    setTimeout(() => {
      tick(io, id, clock);
    }, 1000);
  }
}
