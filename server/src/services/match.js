const Match = require('../models/Match');
const findOneAndRemove = require('../tools/find-one-and-remove');

module.exports = {
  getOne(where) {
    console.log('1');
    return Promise.resolve(Match.findOne(where));
  },
  createOne(match) {
    return Promise.resolve(Match.create(match));
  },
  removeUser(id, username) {
    Match.findOne({ _id: id }, (err, result) => {
      if (err || !result) {
        return;
      }
      findOneAndRemove(result.users, user => user === username);
      if (result.users.length === 0) {
        result.remove();
      } else {
        result.save();
      }
    });
  },
  banOne(where) {
    Match.findOne(where, (err, result) => {
      if (err || !result) {
        return;
      }
      result.canJoin = false;
      result.save();
    });
  },
};
