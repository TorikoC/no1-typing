const db = require('../models');

async function getRooms(req, res, next) {
  let { canJoin } = req.query;
  canJoin = Boolean(canJoin) || false;

  let where = {
    canJoin,
  };

  let result = await db.Room.find(where);

  req.result = result;
  next();
}

async function getRoom(req, res, next) {
  const { id } = req.params;

  let result = await db.Room.findOne({ _id: id });

  req.result = result;
  next();
}

async function createRoom(req, res, next) {
  const { body, user } = req;

  let room = Object.assign(body, {
    creator: user.username,
    users: [
      {
        username: user.username,
      },
    ],
    canJoin: +body.userLimit !== 1,
  });

  let result = await db.Room.create(room);

  req.result = result;
  next();
}

module.exports = {
  getRoom,
  getRooms,
  createRoom,
};
