const db = require('../models');
const jwt = require('jsonwebtoken');
const jwtSecret = require('config').get('jwtSecret');

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

async function authUser(req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) {
    next(new Error('miss necessary parameters.'));
  }
  let result = await db.User.findOne({ email });

  if (!result) {
    next(new Error('user not found.'));
  }
  // santify password
  if (result.password !== password) {
    next(new Error('password not match.'));
  }

  // login
  req.user = {
    email: result.email,
    username: result.username,
    isAdmin: result.isAdmin,
  };

  next();
}
async function createJwt(req, res, next) {
  let user = req.user;
  if (!user) {
    next(new Error('user not found.'));
  }
  req.token = jwt.sign(
    {
      email: user.email,
      username: user.username,
      isAdmin: user.isAdmin,
    },
    jwtSecret,
  );
  next();
}
async function loginUser(req, res, next) {
  let { token } = req;
  if (!token) {
    next(new Error('token not created.'));
  }
  res.status(200);
  res.send(token);
}

module.exports = {
  getUser,
  getUsers,
  createUser,
  authUser,
  createJwt,
  loginUser,
};
