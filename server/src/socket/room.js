const db = require('../services/index');
const config = require('config');
const logger = require('../logger/socket');

module.exports = (io, socket) => {
  socket.on('room-join', onJoin.bind(null, socket));
  socket.on('room-leave', onLeave.bind(null, socket));
  socket.on('room-start', onStart.bind(null, io));
  socket.on('room-prepare', onPrepare.bind(null, socket));
  socket.on('room-complete', onComplete.bind(null, io, socket));

  socket.on('room-update-progress', onUpdateProgress.bind(null, socket));
  socket.on('room-snippet-updated', onSnippetUpdated.bind(null, io));

  socket.on('room-fetch-book', onFetchBook.bind(null, socket));
};

function onJoin(socket, id, username) {
  socket.join(id, () => {
    logger.info(`${username} user join ${id}`);
    socket.broadcast.to(id).emit('room-user-join', username);
  });
}

async function onLeave(socket, id, username) {
  // leave socket room
  socket.leave(id, err => {
    if (err) {
      logger.error(err);
    }
    logger.info(`${username}(socket) leave room ${id}`);
  });

  // update database
  const where = {
    _id: id,
  };
  const update = {
    $pull: {
      users: {
        username: username,
      },
    },
  };

  let result = await db.room.findOneAndUpdate(where, update);
  logger.info(`remove ${username} from room ${id}.`);

  if (!result) {
    return;
  }

  if (result.users.length === 0) {
    // remove room if no users.
    logger.info(`remove room ${id}.`);
    result.remove();
  } else if (
    result.users.length < result.userLimit &&
    result.state === config.get('roomState').WAITING &&
    !result.canJoin
  ) {
    logger.info(`update room ${id}. canJoin: true.`);
    result.canJoin = true;
    result.save();
  }

  socket.broadcast.to(id).emit('room-user-leave', username);
}

async function onStart(io, id) {
  const where = {
    _id: id,
  };
  const update = {
    $set: {
      canJoin: false,
      state: config.get('roomState').ONGOING,
    },
  };

  let result = await db.room.findOneAndUpdate(where, update);
  if (!result) {
    return;
  }

  let snippet = await db.snippet.findOneRandom({
    lang: result.lang,
  });

  if (snippet instanceof Array && snippet[0]) {
    snippet = snippet[0];
  }

  io.to(id).emit('room-update-state', config.get('roomState').ONGOING);
  io.to(id).emit('room-update-snippet', snippet);
}
function onUpdateProgress(socket, id, username, progress) {
  socket.broadcast.to(id).emit('room-update-progress', username, progress);
}
function onPrepare(socket, id, username) {
  logger.info(`${username} prepare, ${id}.`);
  socket.broadcast.to(id).emit('room-user-prepare', username);
}

function onSnippetUpdated(io, id, username) {
  db.room
    .findOneAndUpdate(
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

function onComplete(io, socket, id, username, record) {
  logger.info(`${username} done, ${id}.`);
  socket.broadcast.to(id).emit('room-user-complete', username);
  db.record.create(record);
  db.room
    .findOneAndUpdate(
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
        io.to(id).emit('room-all-complete');

        result.state = config.get('roomState').WAITING;
        io.to(id).emit('room-update-state', config.get('roomState').WAITING);

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
async function onFetchBook(socket, bookName) {
  const where = {
    name: bookName,
  };
  let result = await db.book.findOne(where);
  socket.emit('room-update-book', result);
}

function tick(io, id, clock) {
  clock -= 1;
  io.to(id).emit('room-update-clock', clock);
  if (clock > 0) {
    setTimeout(() => {
      tick(io, id, clock);
    }, 1000);
  }
}
