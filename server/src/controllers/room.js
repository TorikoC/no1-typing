const db = require('../models');

async function getRooms(req, res, next) {
  let result = await db.Room.find();

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
    users: [
      {
        username: user.username,
      },
    ],
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
