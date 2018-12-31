const mongoose = require('mongoose');
const roomState = require('config').get('roomState');

const RoomUserSchema = mongoose.Schema({
  username: {
    type: String,
  },
  prepared: {
    type: String,
    default: false,
  },
  snippetReceived: {
    type: Boolean,
    default: false,
  },
  done: {
    type: Boolean,
    default: false,
  },
});

const RoomSchema = mongoose.Schema({
  name: {
    type: String,
  },
  creator: {
    type: String,
  },
  userLimit: {
    type: Number,
    default: 7,
  },
  canJoin: {
    type: Boolean,
    default: true,
  },
  snippetReceivedCounter: {
    type: Number,
    default: 0,
  },
  preparedUserCounter: {
    type: Number,
    default: 0,
  },
  doneUserCounter: {
    type: Number,
    default: 0,
  },
  lang: {
    type: String,
    default: 'en',
  },
  users: [RoomUserSchema],
  state: {
    type: Number,
    default: roomState.WAITTING,
  },
  public: {
    type: Boolean,
    default: true,
  },
  secret: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Number,
    default: Date.now(),
  },
});

RoomSchema.index({ name: 1 }, { unique: true });
const Room = mongoose.model('Room', RoomSchema);

module.exports = Room;
