const mongoose = require('mongoose');

const Snippet = mongoose.model(
  'Snippet',
  mongoose.Schema({
    sourceType: {
      type: String,
    },
    sourceId: {
      type: String,
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
    updatedAt: {
      type: Number,
      default: 0,
    },
  }),
);

module.exports = Snippet;
