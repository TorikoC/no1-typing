const config = {
  serverPort: 3000,
  dbHost: 'mongodb://127.0.0.1:27017/no1typing',
  jwtSecret: 'winterfox',
  roomState: {
    WAITING: 1,
    ONGOING: 3,
  },
  matchState: {
    COUNTING: 1,
    ONGOING: 2,
  },
};

module.exports = config;
