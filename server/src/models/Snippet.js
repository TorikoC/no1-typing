const mongoose = require('mongoose');

const Snippet = mongoose.model(
  'Snippet',
  mongoose.Schema({
    bookName: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      default: '',
    },
    language: {
      type: String,
      default: 'chinese',
    },
    length: {
      type: Number,
      default: 0,
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

module.exports = Snippet;
