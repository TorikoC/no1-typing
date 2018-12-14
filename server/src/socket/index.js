const RecordService = require('../services/record');
const SnippetService = require('../services/snippet');
const BookService = require('../services/book');

const findOneAndRemove = require('../tools/find-one-and-remove');

const rooms = [];
const socketRoomMap = {};
const WAITING = 1;
const MATCHING = 2;
const LIMIT = 10;

const ONE_SECOND = 1000;

const DEBUG = process.env.NODE_ENV !== 'production';
let logger = console;
if (!DEBUG) {
  logger = require('../logger/socket');
}

module.exports = io => {
  io.on('connection', socket => {
    const clientIp = socket.request.connection.remoteAddress;
    logger.info('new connection: ', clientIp, socket.id);

    socket.on('join', lang => {
      logger.info('join: ', clientIp, socket.id);
      join(socket, lang);
    });
    socket.on('re-join', lang => {
      logger.info('re-join: ', clientIp, socket.id);
      leave(socket);
      join(socket, lang);
    });
    socket.on('disconnect', () => {
      logger.info('disconnect: ', clientIp, socket.id);
      leave(socket);
    });
    socket.on('progress', data => {
      const room = socketRoomMap[socket.id];
      if (!room) {
        return;
      }
      io.to(room.name).emit('progress', {
        ip: clientIp,
        id: socket.id,
        percent: data.percent,
        speed: data.speed,
      });
    });
    socket.on('done', data => {
      logger.info('done: ', clientIp, socket.id);
      const room = socketRoomMap[socket.id];
      if (!room) {
        return;
      }
      room.done += 1;
      const record = {
        user: clientIp,
        time: data.time,
        speed: data.speed,
        snippetId: room.snippet._id,
      };
      RecordService.create(record);
    });
    async function join(socket, lang = 'cn') {
      if (socketRoomMap[socket.id]) {
        logger.info(clientIp, socket.id, " already in a room, can't not join.");
        logger.info('the room: ', socketRoomMap[socket.id]);
        return;
      }
      let room = await getRoom(lang);
      socketRoomMap[socket.id] = room;

      socket.join(room.name, () => {
        logger.info(clientIp, socket.id, 'join room: ', room.name);
        socket.broadcast
          .to(room.name)
          .emit('user-join', { id: socket.id, ip: clientIp });
        socket.emit('snippet', room.snippet);
        socket.emit('users', room.users);
      });
    }
    function leave(socket) {
      if (!socket) {
        return;
      }
      let room = socketRoomMap[socket.id];
      if (!room) {
        return;
      }
      socket.leave(room.name);
      delete socketRoomMap[socket.id];
      logger.info(clientIp, socket.id, 'leave room: ', room.name);
      findOneAndRemove(room.users, user => user.id === socket.id);
      if (room.users.length === 0) {
        // let index = rooms.findIndex(obj => obj.name === room.name);
        // if (index !== -1) {
        //   logger.info('room: ', room.name, 'removed.');
        //   rooms.splice(index, 1);
        // }
        findOneAndRemove(rooms, obj => obj.name === room.name);
      } else {
        socket.broadcast.to(room.name).emit('user-leave', socket.id);
      }
    }
    function countdown(room) {
      room.clock -= 1;
      io.to(room.name).emit('clock', room.clock);
      if (room.state === WAITING && room.clock > 0 && room.users.length > 0) {
        setTimeout(() => {
          countdown(room);
        }, ONE_SECOND);
      } else {
        logger.info('room: ', room.name, 'stop ticking.');
        room.state = MATCHING;
      }
    }
    async function getRoom(lang = 'cn') {
      let room = rooms.find(room => {
        return (
          room.lang === lang &&
          room.state === WAITING &&
          room.users.length <= LIMIT &&
          room.clock >= 5
        );
      });
      if (room) {
        room.users.push({
          id: socket.id,
          ip: clientIp,
        });
      } else {
        let snippet;
        if (lang === 'en') {
          snippet = await SnippetService.get({
            _id: '5c123c17df77e3121c530793',
          });
        } else {
          snippet = await SnippetService.getOneRandom();
        }
        let snippetSource = await BookService.getOne({
          name: snippet[0].bookName,
        });
        snippet[0].cover = snippetSource.cover;
        snippet[0].author = snippetSource.author;
        snippet[0].name = snippetSource.name;
        snippet = snippet[0];
        room = {
          name: Date.now(),
          users: [{ id: socket.id, ip: clientIp }],
          state: WAITING,
          clock: 10,
          done: 0,
          snippet: snippet,
          lang: lang,
        };
        rooms.push(room);

        setTimeout(() => {
          logger.info('room: ', room.name, 'start ticking.');
          countdown(room);
        }, ONE_SECOND);
      }
      return room;
    }
  });
};
