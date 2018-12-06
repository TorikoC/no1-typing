const mongoose = require('mongoose');

const Book = mongoose.model(
  'Book',
  mongoose.Schema({
    name: {
      type: String,
    },
    author: {
      type: String,
    },
    publishedAt: {
      type: String,
      default: '',
    },
    cover: {
      type: String,
      default: '',
    },
    createdAt: {
      type: Number,
      default: Date.now(),
    },
    updatedAt: {
      type: Number,
      default: 0,
    },
  }),
);

module.exports = Book;
