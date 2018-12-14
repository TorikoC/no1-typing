const mongoose = require('mongoose');

const SnippetSchema = mongoose.Schema({
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
  lang: {
    type: String,
    default: '',
  },
  updatedAt: {
    type: Number,
    default: 0,
  },
});

SnippetSchema.index({ lang: 1 });

const Snippet = mongoose.model('Snippet', SnippetSchema);

module.exports = Snippet;
