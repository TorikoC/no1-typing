const mongoose = require('mongoose');
const roomState = require('config').get('roomState');

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
  lang: {
    type: String,
    default: 'en',
  },
  users: {
    type: Array,
    default: [],
  },
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
