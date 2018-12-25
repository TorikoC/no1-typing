const mongoose = require('mongoose');

const RecordSchema = mongoose.Schema({
  username: {
    type: String,
  },
  mode: {
    type: String,
  },
  time: {
    type: Number,
  },
  speed: {
    type: Number,
  },
  lang: {
    type: String,
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
});

RecordSchema.index({ lang: 1 });

const Record = mongoose.model('Record', RecordSchema);

module.exports = Record;
