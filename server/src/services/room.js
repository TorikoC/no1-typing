const Room = require('../models/Room');

module.exports = {
  get(where) {
    return Promise.resolve(Room.find(where));
  },
  getOne(where) {
    return Promise.resolve(Room.findOne(where));
  },
  create(room) {
    return Promise.resolve(Room.create(room));
  },
  update(where, option) {
    return Promise.resolve(Room.update(where, option));
  },
  delete(where) {
    return Promise.resolve(Room.remove(where));
  },
};
