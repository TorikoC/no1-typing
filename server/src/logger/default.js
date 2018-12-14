const pino = require('pino');
const path = require('path');

const logger = pino(
  pino.destination(path.join(__dirname, '../logs/default.log')),
);
module.exports = logger;