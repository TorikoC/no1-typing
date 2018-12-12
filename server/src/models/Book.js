const mongoose = require('mongoose');

const BookSchema = mongoose.Schema({
  name: {
    type: String,
  },
  author: {
    type: String,
  },
  cover: {
    type: String,
    default: '',
  },
  isbn: {
    type: String,
    default: '',
  },
  publishedAt: {
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
});

BookSchema.index({ name: 1 }, { unique: true });
const Book = mongoose.model('Book', BookSchema);

module.exports = Book;
