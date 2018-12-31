const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
  },
  createdAt: {
    type: Number,
    default: Date.now(),
  },
});

UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { unique: true });
const User = mongoose.model('User', UserSchema);

module.exports = User;
