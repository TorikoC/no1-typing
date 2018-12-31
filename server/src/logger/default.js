const pino = require('pino');
const path = require('path');

const logger =
  process.env.NODE_ENV === 'production'
    ? pino(pino.destination(path.join(__dirname, '../logs/default.log')))
    : console;

module.exports = logger;
