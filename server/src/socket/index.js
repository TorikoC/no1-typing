const RecordService = require('../services/record');
const SnippetService = require('../services/snippet');

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
class Room {
  constructor(name, lang = 'cn', users = [], snippet) {
    this.name = name;
    this.lang = lang;
    this.users = users;
    this.snippet = snippet;

    this.state = WAITING;
    this.done = 0;
    this.clock = 10;
  }
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
      if (!socket || !socketRoomMap[socket.id]) {
        return;
      }
      let room = socketRoomMap[socket.id];
      logger.info(clientIp, socket.id, 'leave room: ', room.name);
      socket.leave(room.name);
      delete socketRoomMap[socket.id];
      findOneAndRemove(room.users, user => user.id === socket.id);
      if (room.users.length === 0) {
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
        let snippet = await SnippetService.getOneRandomWithSource({ lang });
        room = new Room(
          Date.now(),
          lang,
          [{ id: socket.id, ip: clientIp }],
          snippet,
        );
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
