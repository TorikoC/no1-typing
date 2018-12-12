const logger = require('../logger/socket');

const RecordService = require('../services/record');
const SnippetService = require('../services/snippet');
const BookService = require('../services/book');

const rooms = [];
const socketRoomMap = {};
const WAITING = 1;
const MATCHING = 2;
const LIMIT = 10;

module.exports = io => {
  io.on('connection', socket => {
    var clientIp = socket.request.connection.remoteAddress;
    logger.info('new connection: ', clientIp, socket.id);
    join(socket);

    socket.on('disconnect', () => {
      logger.info('disconnect: ', clientIp, socket.id);
      leave(socket);
    });
    socket.on('re-start', () => {
      logger.info('re-match', clientIp, socket.id);
      leave(socket);
      join(socket);
    });
    socket.on('progress', data => {
      const room = socketRoomMap[socket.id];
      if (!room) {
        return;
      }
      io.to(room.name).emit('progress', data);
    });
    socket.on('done', data => {
      const room = socketRoomMap[socket.id];
      if (!room) {
        return;
      }
      logger.info('done: ', clientIp, socket.id, 'at room: ', room.name);
      room.done += 1;
      const record = {
        user: clientIp,
        time: data.time,
        speed: data.speed,
        snippetId: data.snippetId,
      };
      RecordService.create(record);
    });
    async function join(socket) {
      let room = await getRoom();
      socketRoomMap[socket.id] = room;

      socket.join(room.name, () => {
        logger.info(clientIp, socket.id, 'join room: ', room.name);
        socket.broadcast.to(room.name).emit('user-enter', socket.id);
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
      logger.info(clientIp, socket.id, 'leave room: ', room.name);
      let index = room.users.findIndex(user => user.id === socket.id);
      if (index !== -1) {
        logger.info(clientIp, socket, 'removed from room: ', room.name);
        room.users.splice(index, 1);
      }
      if (room.users.length === 0) {
        let index = rooms.findIndex(obj => obj.name === room.name);
        if (index !== -1) {
          logger.info('room: ', room.name, 'removed.');
          rooms.splice(index, 1);
        }
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
        }, 1000);
      } else {
        logger.info('room: ', room.name, 'stop ticking.');
        room.state = MATCHING;
      }
    }
    async function getRoom() {
      let room = rooms.find(room => {
        return (
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
        let snippet = await SnippetService.getOneRandom();
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
        };
        rooms.push(room);

        setTimeout(() => {
          logger.info('room: ', room.name, 'start ticking.');
          countdown(room);
        }, 1000);
      }
      return room;
    }
  });
};
