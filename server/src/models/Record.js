const mongoose = require('mongoose');

const Record = mongoose.model(
  'Record',
  mongoose.Schema({
    user: {
      type: String,
    },
    time: {
      type: Number,
    },
    speed: {
      type: Number,
    },
    snippetId: {
      type: String,
    },
    accurate: {
      type: Number,
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

module.exports = Record;
