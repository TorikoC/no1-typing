const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const expressPino = require('express-pino-logger')();

const RecordService = require('./services/record');
const SnippetService = require('./services/snippet');
const BookService = require('./services/book');

process.env['NODE_CONFIG_DIR'] = path.join(__dirname, 'config');
const config = require('config');
const logger = require('./logger/index');

const snippetRouter = require('./routes/snippet');
const recordRouter = require('./routes/record');
const bookRouter = require('./routes/book');

const app = express();

app.use(expressPino);
app.use(express.static(path.join(__dirname, 'dist')));
app.use(cors());
app.use(snippetRouter);
app.use(recordRouter);
app.use(bookRouter);

const server = require('http').Server(app);
const io = require('socket.io')(server);

const rooms = [];
const socketRoomMap = {};
const WAITING = 1;
const MATCHING = 2;
const LIMIT = 10;

mongoose.connect(
  config.get('db_host'),
  err => {
    if (err) {
      logger.error(err);
      return;
    }
    logger.info('db connected');
    server.listen(config.get('server_port'), () => {
      logger.info(`server is listening on port ${config.get('server_port')}`);
    });

    io.on('connection', socket => {
      var clientIp = socket.request.connection.remoteAddress;

      join(socket);

      socket.on('disconnect', () => {
        logger.info('socket disconnect', clientIp);
        leave(socket);
      });
      socket.on('re-start', () => {
        logger.info('re-match', clientIp);
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
        logger.info('room number when', clientIp, 'join:', rooms.length);
        let room = await getRoom();
        socketRoomMap[socket.id] = room;

        socket.join(room.name, () => {
          logger.info(clientIp, 'join room: ', room.name);
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
        let index = room.users.findIndex(user => user.id === socket.id);
        if (index !== -1) {
          room.users.splice(index, 1);
        }
        if (room.users.length === 0) {
          let index = rooms.findIndex(obj => obj.name === room.name);
          if (index !== -1) {
            rooms.splice(index, 1);
          }
        } else {
          socket.broadcast.to(room.name).emit('user-leave', socket.id);
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
          function countdown() {
            room.clock -= 1;
            io.to(room.name).emit('clock', room.clock);
            if (
              room.state === WAITING &&
              room.clock > 0 &&
              room.users.length > 0
            ) {
              setTimeout(() => {
                countdown();
              }, 1000);
            } else {
              room.state = MATCHING;
            }
          }
          setTimeout(() => {
            countdown();
          }, 1000);
        }
        return room;
      }
    });
  },
);
