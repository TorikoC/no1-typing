const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const RecordService = require('./services/record');

process.env['NODE_CONFIG_DIR'] = path.join(__dirname, 'config');
const config = require('config');

const snippetRouter = require('./routes/snippet');
const recordRouter = require('./routes/record');
const bookRouter = require('./routes/book');

const app = express();

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
      return;
    }
    console.log('db connected');
    server.listen(config.get('server_port'), () => {
      console.log(`server is listening on port ${config.get('server_port')}`);
    });
    io.on('connection', socket => {
      join(socket);

      socket.on('disconnect', () => {
        console.log('disconnect: ', socket.id);
        leave(socket);
      });
      socket.on('re-match', () => {
        console.log('re match: ', socket.id);
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
        io.to(room.name).emit('progress', {
          id: socket.id,
          progress: 100,
          speed: data.speed,
        });
        const record = {
          time: data.time,
          speed: data.speed,
          snippetId: data.snippetId,
        };
        RecordService.create(record);
        if (room.done === room.users.length) {
          let index = rooms.findIndex(obj => obj.name === room.name);
          if (index !== -1) {
            rooms.splice(index, 1);
          }
          io.to(room.name).emit('done');
        }
      });
      function join(socket) {
        let room = getRoom();
        socketRoomMap[socket.id] = room;

        socket.join(room.name, () => {
          console.log(room);
          console.log('join: ', room.name, socket.id);
          socket.broadcast.to(room.name).emit('user-enter', socket.id);

          console.log('users: ', room.users);
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
        let index = room.users.findIndex(id => id === socket.id);
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
      function getRoom() {
        let room = rooms.find(room => {
          return (
            room.state === WAITING &&
            room.users.length <= LIMIT &&
            room.clock >= 5
          );
        });
        if (room) {
          room.users.push(socket.id);
        } else {
          room = {
            name: Date.now(),
            users: [socket.id],
            state: WAITING,
            clock: 3,
            done: 0,
          };
          rooms.push(room);
          function countdown() {
            room.clock -= 1;
            console.log('room: ', room.name, room.clock);
            io.to(room.name).emit('clock', room.clock);
            if (room.state === WAITING && room.clock > 0) {
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
