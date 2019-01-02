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
  users: [RoomUserSchema],
  userLimit: {
    type: Number,
    default: 7,
  },
  canJoin: {
    type: Boolean,
    default: true,
  },
  lang: {
    type: String,
    default: 'en',
  },
  state: {
    type: Number,
    default: roomState.WAITTING,
  },
  creator: {
    type: String,
    default: '',
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
