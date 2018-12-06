const Record = require('../models/record');

const service = {
  get(where) {
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
    return Promise.resolve(Snippet.aggregate(option));
  },
  create(body) {
    return Promise.resolve(Record.create(body));
  },
  update() {
    return Promise.resolve(Record.update(where, option));
  },
  updateOne(where, option) {
    return Promise.resolve(Record.updateOne(where, option));
  },
  del(where) {
    return Promise.resolve(Record.remove(where));
  },
};

module.exports = service;
