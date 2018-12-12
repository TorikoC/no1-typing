const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const pino = require('pino');
const expressPino = require('express-pino-logger')({
  logger: pino(pino.destination(path.join(__dirname, 'logs/req.log'))),
});

process.env['NODE_CONFIG_DIR'] = path.join(__dirname, 'config');
const config = require('config');

const logger = require('./logger/default');
const router = require('./routes/index');

const app = express();

app.use(expressPino);
app.use(express.static(path.join(__dirname, 'dist')));
app.use(cors());
app.use(router);

const server = require('http').Server(app);
const io = require('socket.io')(server);
const handleIo = require('./socket/index');
handleIo(io);

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
  },
);
