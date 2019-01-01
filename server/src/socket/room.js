const db = require('../models');
const config = require('config');
const logger = require('../logger/socket');

const ONE_SECOND = 1000;

module.exports = (io, socket) => {
  socket.on('room-join', onJoin.bind(null, socket));
  socket.on('room-leave', onLeave.bind(null, socket));
  socket.on('room-start', onStart.bind(null, io));
  socket.on('room-prepare', onPrepare.bind(null, socket));
  socket.on('room-complete', onComplete.bind(null, io, socket));
  socket.on('room-fetch-book', onFetchBook.bind(null, socket));
  socket.on('room-update-progress', onUpdateProgress.bind(null, socket));
  socket.on('room-snippet-updated', onSnippetUpdated.bind(null, io));
};

function onJoin(socket, id, username) {
  socket.join(id, () => {
    logger.info(`${username} join room ${id}`);
    socket.broadcast.to(id).emit('room-user-join', username);
  });
  db.Room.findOneAndUpdate(
    {
      _id: id,
      'users.username': {
        $ne: username,
      },
    },
    {
      $push: {
        users: {
          username,
        },
      },
    },
  ).exec();
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
        username,
      },
    },
  };

  let result = await db.Room.findOneAndUpdate(where, update, { new: true });
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

  let result = await db.Room.findOneAndUpdate(where, update);
  if (!result) {
    return;
  }
  const pipeline = [
    {
      $match: {
        lang: result.lang,
      },
    },
    {
      $sample: {
        size: 1,
      },
    },
  ];

  let snippet = await db.Snippet.aggregate(pipeline);

  if (snippet instanceof Array && snippet[0]) {
    snippet = snippet[0];
  }

  io.to(id).emit('room-update-state', config.get('roomState').ONGOING);
  io.to(id).emit('room-update-snippet', snippet);
}

function onPrepare(socket, id, username) {
  logger.info(`${username} prepare, ${id}.`);
  socket.broadcast.to(id).emit('room-user-prepare', username);
}

function onComplete(io, socket, id, username, record) {
  logger.info(`${username} done, ${id}.`);
  socket.broadcast.to(id).emit('room-user-complete', username);
  db.Record.create(record);
  db.Room.findOneAndUpdate(
    { _id: id, 'users.username': username },
    {
      $set: {
        'users.$.done': true,
      },
    },
    {
      new: true,
    },
  ).then(result => {
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

async function onFetchBook(socket, bookId) {
  let result = await db.Book.findOne({ _id: bookId });
  socket.emit('room-update-book', result);
}

function onUpdateProgress(socket, id, username, progress) {
  socket.broadcast.to(id).emit('room-update-progress', username, progress);
}

function onSnippetUpdated(io, id, username) {
  db.Room.findOneAndUpdate(
    { _id: id, 'users.username': username },
    { $set: { 'users.$.snippetReceived': true } },
    { new: true },
  ).then(result => {
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

function tick(io, id, clock) {
  clock -= 1;
  io.to(id).emit('room-update-clock', clock);
  if (clock > 0) {
    setTimeout(() => {
      tick(io, id, clock);
    }, ONE_SECOND);
  }
}
