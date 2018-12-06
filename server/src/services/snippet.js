const Snippet = require('../models/Snippet');

const service = {
  get(where) {
    return Promise.resolve(Snippet.find(where));
  },
  getOne(where) {
    return Promise.resolve(Snippet.findOne(where));
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
    return Promise.resolve(Snippet.create(body));
  },
  update() {
    return Promise.resolve(Snippet.update(where, option));
  },
  updateOne(where, option) {
    return Promise.resolve(Snippet.updateOne(where, option));
  },
  del(where) {
    return Promise.resolve(Snippet.remove(where));
  },
};

module.exports = service;
