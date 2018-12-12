const Record = require('../models/record');

const service = {
  get(where, sort = { speed: -1 }, limit = 10) {
    return Promise.resolve(
      Record.find(where)
        .sort(sort)
        .limit(limit),
    );
  },
  getAll(where) {
    return Promise.resolve(Record.find(where));
  },
  getOne(where) {
    return Promise.resolve(Record.findOne(where));
  },
  getOneRandom() {
    const option = [
      {
        $sample: {
          size: 1,
        },
      },
    ];
    return Promise.resolve(Record.aggregate(option));
  },
  create(body) {
    return Promise.resolve(Record.create(body));
  },
};

module.exports = service;
