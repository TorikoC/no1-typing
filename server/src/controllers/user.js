const db = require('../models');
const jwt = require('jsonwebtoken');
const jwtSecret = require('config').get('jwtSecret');

async function getUser(req, res, next) {
  let { id } = req.params;

  let result = await db.User.findOne({ _id: id });
  req.result = result;
  next();
}

async function getUsers(req, res, next) {
  let { username } = req.query;

  const where = {};

  if (username) {
    where.username = username;
  }

  let result = await db.User.find(where);
  req.result = result;
  next();
}

async function createUser(req, res, next) {
  const { body } = req;
  let result = await db.User.create(body);
  req.result = result;
  next();
}

async function authUser(req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) {
    req.error = {
      code: 400,
      message: 'miss necessary paramters.',
    };
    next(new Error('miss necessary parameters.'));
  }
  let result = await db.User.findOne({ email });

  if (!result) {
    req.error = {
      code: 404,
      message: 'user not found.',
    };
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

  req.result = token;
  next();
}

module.exports = {
  getUser,
  getUsers,
  createUser,
  authUser,
  createJwt,
  loginUser,
};
