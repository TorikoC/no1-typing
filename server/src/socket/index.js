const RecordService = require('../services/record');
const SnippetService = require('../services/snippet');
const RoomService = require('../services/room');

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

const idUserMap = {};
const idCounterMap = {};
const idUsersMap = {};
const idDoneMap = {};
const idPrepareMap = {};
const idClockMap = {};

module.exports = io => {
  io.on('connection', socket => {
    const clientIp = socket.request.connection.remoteAddress;
    logger.info('new connection: ', clientIp, socket.id);

    socket.on('join-room', (roomId, username) => {
      logger.info(`user ${username} join room ${roomId}`);
      joinRoom(socket, roomId, username);
    });
    function joinRoom(socket, id, username) {
      socket.join(id);
      socket.broadcast.to(id).emit('user-join', username);
      if (!idUsersMap[id]) {
        idUsersMap[id] = [username];
      } else {
        idUsersMap[id].push(username);
      }
      idUserMap[id] = idUsersMap[id].length;
      socket.emit('users', idUsersMap[id]);
    }
    socket.on('room-prepare', (roomId, username) => {
      socket.broadcast.to(roomId).emit('prepare', username);
      if (!idPrepareMap[roomId]) {
        idPrepareMap[roomId] = 1;
      } else {
        idPrepareMap[roomId] += 1;
      }
      console.log(
        'prepared',
        username,
        ' total users: ',
        idUserMap[roomId],
        'prepared: ',
        idPrepareMap[roomId],
      );
      if (idPrepareMap[roomId] === idUserMap[roomId]) {
        idPrepareMap[roomId] = 0;
        RoomService.getOne({ _id: roomId }).then(async result => {
          io.to(roomId).emit(
            'snippet',
            await SnippetService.getOneRandomWithSource({ lang: result.lang }),
          );
          idClockMap[roomId] = 10;
        });
      }
    });
    socket.on('leave-room', (roomId, username) => {
      logger.info(`user ${username} leave room ${roomId}`);
      logger.info('users', idUsersMap[roomId]);
      socket.leave(roomId);

      if (idUsersMap[roomId]) {
        socket.broadcast.to(roomId).emit('user-leave', username);
        RoomService.removeUser(roomId, username);
        findOneAndRemove(idUsersMap[roomId], name => name === username);
        logger.info('users', idUsersMap[roomId]);
        idUserMap[roomId] = idUsersMap[roomId].length;
      }
    });
    function leaveRoom(socket, id, username) {}
    function tickRoom(id) {
      idClockMap[id] -= 1;
      io.to(id).emit('clock', idClockMap[id]);
      if (idClockMap[id] > 0) {
        setTimeout(() => {
          tickRoom(id);
        }, 1000);
      }
    }
    socket.on('room-start', async (roomId, lang) => {
      io.to(roomId).emit(
        'snippet',
        await SnippetService.getOneRandomWithSource({ lang }),
      );
      idClockMap[roomId] = 10;
    });
    socket.on('room-progress', (roomId, progress, username) => {
      io.to(roomId).emit('progress', {
        percent: progress.percent,
        speed: progress.speed,
        username: username,
      });
    });
    socket.on('snippet-received', roomId => {
      if (!idCounterMap[roomId]) {
        idCounterMap[roomId] = 1;
      } else {
        idCounterMap[roomId] += 1;
      }
      logger.info('received');
      console.log(idUserMap[roomId], idCounterMap[roomId]);
      if (idCounterMap[roomId] === idUserMap[roomId]) {
        idCounterMap[roomId] = 0;
        logger.info('assign completed');
        tickRoom(roomId);
      }
    });
    socket.on('room-done', (roomId, record, username) => {
      socket.broadcast.to(roomId).emit('done', username);
      RecordService.create(record);
      if (!idDoneMap[roomId]) {
        idDoneMap[roomId] = 1;
      } else {
        idDoneMap[roomId] += 1;
      }
      if (idDoneMap[roomId] === idUserMap[roomId]) {
        io.to(roomId).emit('all-done');
        idDoneMap[roomId] = 0;
      }
    });
    socket.on('room-progress', (roomId, progress) => {
      io.to(roomId).emit('room-progress', progress);
    });

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

    function leaveRoom(socket, id) {
      socket.leave(id);
    }
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
      console.log(clientIp, socket.id, 'find room: ', room);
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
