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
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

const server = require('http').Server(app);
const io = require('socket.io')(server);
const handleSocket = require('./socket/index');
handleSocket(io);

mongoose.connect(
  config.get('dbHost'),
  err => {
    if (err) {
      logger.error(err);
      return;
    }
    logger.info('db connected');
    server.listen(config.get('serverPort'), () => {
      logger.info(`server is listening on port ${config.get('serverPort')}`);
    });
  },
);
