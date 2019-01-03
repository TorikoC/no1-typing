const config = {
  serverPort: 3000,
  dbName: 'happytyper',
  dbHost: `mongodb://127.0.0.1:27017/${this.dbName}`,
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
