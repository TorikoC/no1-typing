const db = require('../models');

const logger = console;

const CLOCK = 10;

module.exports = (io, socket) => {
  socket.on('match-join', toJoin.bind(null, io, socket));
  socket.on('match-leave', toLeave.bind(null, socket));
  socket.on('match-update-progress', (id, progress) => {
    console.log(progress);
    io.to(id).emit('match-update-progress', progress);
  });
  socket.on('match-fetch-book', async bookId => {
    let result = await db.Book.findOne({ _id: bookId });
    socket.emit('match-update-book', result);
  });
  socket.on('match-done', record => {
    db.Record.create(record);
  });
};

function tick(io, id, clock) {
  clock -= 1;
  if (clock === 5) {
    db.Match.findOneAndUpdate(
      { _id: id },
      { $set: { canJoin: false } },
      (err, result) => {
        if (err) {
          console.log(err);
        }
      },
    );
  }
  logger.info(`match ${id} start at ${clock}`);
  io.to(id).emit('match-update-clock', clock);
  if (clock > 0) {
    setTimeout(() => {
      tick(io, id, clock);
    }, 1000);
  }
}

function toJoin(io, socket, lang, username) {
  username = username || socket.request.connection.remoteAddress;

  socket.emit('ip', socket.request.connection.remoteAddress);

  db.Match.findOne({ canJoin: true, lang: lang }).then(result => {
    if (result) {
      result.users.push(username);
      if (result.users.length >= result.usersLimit) {
        result.canJoin = false;
      }
      result.save();
      socket.join(result._id, () => {
        socket.broadcast.to(result._id).emit('match-user-join', username);
        socket.emit('match-update-id', result._id);
        socket.emit('match-update-users', result.users);
        socket.emit('match-update-snippet', result.snippet);
        logger.info(`${username} join match ${result._id}`);
      });
    } else {
      const match = {
        users: [username],
        lang: lang,
      };
      const pipeline = [
        {
          $match: {
            lang: lang,
          },
        },
        {
          $sample: {
            size: 1,
          },
        },
      ];
      db.Snippet.aggregate(pipeline).then(result => {
        if (!result) {
          return;
        }
        if (result instanceof Array && result[0]) {
          result = result[0];
        }
        match.snippet = result;
        db.Match.create(match).then(result => {
          socket.join(result._id);
          socket.emit('match-update-id', result._id);
          socket.emit('match-update-users', result.users);
          socket.emit('match-update-snippet', result.snippet);
          logger.info(`${username} join match ${result._id}`);
          tick(io, result._id, CLOCK);
        });
      });
    }
  });
}
function toLeave(socket, id, username) {
  username = username || socket.request.connection.remoteAddress;
  logger.info(`${username} leaving match ${id}`);

  socket.leave(id, () => {
    socket.broadcast.to(id).emit('match-user-leave', username);
    db.Match.findOneAndUpdate(
      { _id: id },
      {
        $pull: {
          users: username,
        },
      },
      { new: true },
      (err, result) => {
        if (err || !result) {
          return;
        }
        if (result.users.length === 0) {
          result.remove();
        }
      },
    );
    logger.info(`${username} leave match ${id}`);
  });
}
