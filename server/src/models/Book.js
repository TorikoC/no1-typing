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
      default:
        'https://upload.wikimedia.org/wikipedia/en/thumb/c/c9/ElJard%C3%ADnDeSenderosQueSeBifurcan.jpg/200px-ElJard%C3%ADnDeSenderosQueSeBifurcan.jpg',
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
