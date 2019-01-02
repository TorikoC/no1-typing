const handleMatchMode = require('./match');
const handleRoomMode = require('./room');
const db = require('../models');

module.exports = io => {
  io.on('connection', socket => {
    // 处理匹配模式
    handleMatchMode(io, socket);

    // 处理房间模式
    handleRoomMode(io, socket);

    socket.emit('test', 'it works!');

    socket.on('fetch-best-records', async (snippetId, lang) => {
      let size = 10;
      let sort = {
        speed: -1,
      };
      let where = {
        lang,
        snippetId,
      };
      let result = await db.Record.find(where)
        .sort(sort)
        .limit(size);
      socket.emit('update-best-records', result);
    });
  });
};
