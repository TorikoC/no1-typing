const Book = require('../models/Book');

const service = {
  get(where, sortOption = { createdAt: -1 }) {
    return Promise.resolve(Book.find(where).sort(sortOption));
  },
  getOne(where) {
    return Promise.resolve(Book.findOne(where));
  },
  findOne(where) {
    return Promise.resolve(Book.findOne(where));
  },
  create(body) {
    return Promise.resolve(Book.create(body));
  },
  deleteOne(where) {
    return Promise.resolve(Book.deleteOne(where));
  },
};

module.exports = service;
