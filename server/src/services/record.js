const Record = require('../models/record');

const service = {
  getTop(where = {}, size = 10) {
    const sortOption = {
      speed: -1,
    };
    return Promise.resolve(
      Record.find(where)
        .sort(sortOption)
        .limit(size),
    );
  },
  create(body) {
    return Promise.resolve(Record.create(body));
  },
};

module.exports = service;
