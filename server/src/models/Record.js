const mongoose = require('mongoose');

const Record = mongoose.model(
  'Record',
  mongoose.Schema({
    user: {
      type: String,
    },
    speed: {
      type: Number,
    },
    time: {
      type: Number,
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
