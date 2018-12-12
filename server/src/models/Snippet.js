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
    length: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Number,
      default: Date.now(),
    },
    language: {
      type: String,
      default: '',
    },
    updatedAt: {
      type: Number,
      default: 0,
    },
  }),
);

module.exports = Snippet;
