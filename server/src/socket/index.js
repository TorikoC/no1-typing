const handleMatchMode = require('./match');
const handleRoomMode = require('./room');

module.exports = io => {
  io.on('connection', socket => {
    // 处理匹配模式
    handleMatchMode(io, socket);

    // 处理房间模式
    handleRoomMode(io, socket);

    socket.emit('test', 'it works!');
  });
};
