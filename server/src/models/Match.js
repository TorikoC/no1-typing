const mongoose = require('mongoose');
const matchState = require('config').get('matchState');

const MatchSchema = mongoose.Schema({
  users: {
    type: Array,
    default: [],
  },
  usersLimit: {
    type: Number,
    default: 7,
  },
  snippet: {
    type: Object,
  },
  lang: {
    type: String,
    default: 'en',
  },
  state: {
    type: Number,
    default: matchState.COUNTING,
  },
  canJoin: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Number,
    default: Date.now(),
  },
});

const Match = mongoose.model('Match', MatchSchema);

module.exports = Match;
