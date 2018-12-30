const db = require('../models');

async function getUser(req, res) {
  let { id } = req.params;

  let result = await db.User.findOne({ _id: id });

  res.status(200);
  res.send(result);
}

async function getUsers(req, res) {
  let result = await db.User.find();

  res.status(200);
  res.send(result);
}

async function createUser(req, res) {
  const { body } = req;
  let result = await db.User.create(body);
  res.status(200);
  res.send(result);
}

module.exports = {
  getUser,
  getUsers,
  createUser,
};
