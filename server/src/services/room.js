const Room = require('../models/Room');
const findOneAndRemove = require('../tools/find-one-and-remove');

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
  removeUser(id, username) {
    Room.findOne({ _id: id }, (err, result) => {
      if (result) {
        if (err) {
          return;
        }
        console.log('before users', result.users);
        findOneAndRemove(result.users, name => name === username);
        console.log('users', result.users);
        if (result.users.length === 0) {
          console.log('remove');
          Room.remove({ _id: result._id }, (err, result) => {
            console.log('remove resutl', result);
          });
        } else {
          result.save();
        }
      }
    });
  },
  addUser(id, username) {
    Room.findOne({ _id: id }, result => {
      result.users.push(username);
      result.save();
    });
  },
};
