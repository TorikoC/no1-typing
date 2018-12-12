const Book = require('../models/Book');

const service = {
  get(where) {
    return Promise.resolve(Book.find(where));
  },
  getUniq(where) {
    return Promise.resolve(Book.distinct('name'));
  },
  getOne(where) {
    return Promise.resolve(Book.findOne(where));
  },
  getOneRandom() {
    const option = [
      {
        $sample: {
          size: 1,
        },
      },
    ];
    return Promise.resolve(Book.aggregate(option));
  },
  create(body) {
    return Promise.resolve(Book.create(body));
  },
  update() {
    return Promise.resolve(Book.update(where, option));
  },
  updateOne(where, option) {
    return Promise.resolve(Book.updateOne(where, option));
  },
  deleteOne(where) {
    return Promise.resolve(Book.deleteOne(where));
  },
};

module.exports = service;
