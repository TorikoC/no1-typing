const db = require('../models');

async function getRooms(req, res) {
  let result = await db.Room.find();

  res.status(200);
  res.send(result);
}

async function getRoom(req, res) {
  const { id } = req.params;

  let result = await db.Room.findOne({ _id: id });

  res.status(200);
  res.send(result);
}

async function createRoom(req, res) {
  const { body, user } = req;

  let room = Object.assign(body, {
    users: [
      {
        username: user.username,
      },
    ],
  });

  let result = await db.Room.create(room);

  res.status(200);
  res.send(result);
}

module.exports = {
  getRoom,
  getRooms,
  createRoom,
};
