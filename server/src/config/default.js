const config = {
  serverPort: 3000,
  dbHost: 'mongodb://127.0.0.1:27017/no1typing',
  jwtSecret: 'winterfox',
  roomState: {
    WAITTING: 1,
    COUNTING: 2,
    MATCHING: 3,
  },
};

module.exports = config;
