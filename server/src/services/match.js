const Match = require('../models/Match');
const matchState = require('config').get('matchState');

module.exports = {
  getOne(where) {
    return Promise.resolve(Match.findOne(where));
  },
  createOne(match) {
    return Promise.resolve(Match.create(match));
  },
  removeUser(id, username) {
    Match.findOneAndUpdate(
      { _id: id },
      {
        $pull: {
          users: username,
        },
      },
      { new: true },
      (err, result) => {
        if (err || !result) {
          return;
        }
        if (result.users.length === 0) {
          result.remove();
        }
      },
    );
  },
  banOne(where) {
    Match.findOneAndUpdate(
      where,
      { $set: { canJoin: false } },
      (err, result) => {
        if (err) {
          console.log(err);
        }
      },
    );
  },
};
