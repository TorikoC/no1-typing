const config = {
  serverPort: 3000,
  dbHost: 'mongodb://127.0.0.1:27017/no1typing',
  jwtSecret: 'winterfox',
  roomState: {
    WAITING: 0,
    ONGOING: 1,
  },
  matchState: {
    COUNTING: 1,
    ONGOING: 2,
  },
};

module.exports = config;
