const User = require('../models/User');

module.exports = {
  get(where) {
    return Promise.resolve(User.find(where));
  },
  getOne(where) {
    return Promise.resolve(User.findOne(where));
  },
  create(user) {
    return Promise.resolve(User.create(user));
  },
  update(where, option) {
    return Promise.resolve(User.update(where, option));
  },
  delete(where) {
    return Promise.resolve(User.remove(where));
  },
};
