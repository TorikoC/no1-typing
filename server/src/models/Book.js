const mongoose = require('mongoose');

const BookSchema = mongoose.Schema({
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
});

BookSchema.index({ name: 1 }, { unique: true });
const Book = mongoose.model('Book', BookSchema);
Book.on('index', (error, name) => {
  console.log('index', error, name);
});

module.exports = Book;
