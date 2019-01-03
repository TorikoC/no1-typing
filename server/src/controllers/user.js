const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtSecret = require('config').get('jwtSecret');

const db = require('../models');

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
  body.email = body.email.toLowerCase();
  let { username, email } = body;
  let con1 = {
    username,
  };
  let con2 = {
    email,
  };
  let p1 = db.User.findOne(con1);
  let p2 = db.User.findOne(con2);
  let dupUsers = await Promise.all([p1, p2]);
  if (dupUsers[0]) {
    req.error = {
      code: 400,
      message: '该用户名已经被注册, 请重新尝试.',
    };
    next(new Error());
  }
  if (dupUsers[1]) {
    req.error = {
      code: 400,
      message: '该邮箱已经被注册, 请重新尝试.',
    };
    next(new Error());
  }
  body.password = await encryptPassword(body.password);
  let result = await db.User.create(body);
  req.result = result;
  next();
}
async function delelteUser(req, res, next) {
  const { id } = req.params;
  if (!req.user || !req.user.isAdmin) {
    req.error = {
      code: 401,
      message: 'No permisson.',
    };
    next(new Error());
  }

  let result = await db.User.deleteOne({ _id: id });
  req.result = result;
  next();
}

async function authUser(req, res, next) {
  let { email, password } = req.body;
  if (!email || !password) {
    req.error = {
      code: 400,
      message: 'miss necessary paramters.',
    };
    next(new Error('miss necessary parameters.'));
  }
  email = email.toLowerCase();
  let result = await db.User.findOne({ email });

  if (!result) {
    req.error = {
      code: 404,
      message: '找不到用户.',
    };
    next(new Error('user not found.'));
  }
  // compare password
  let match = await comparePassword(password, result.password);
  if (!match) {
    next(new Error('密码错误.'));
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

  // record where and when user login
  // may be behind proxy
  const where = {
    username: req.user.username,
  };
  let lastLoginIp =
    req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  let lastLoginTime = Date.now();
  const update = {
    lastLoginIp,
    lastLoginTime,
  };
  db.User.updateOne(where, update).exec();

  req.result = token;
  next();
}

async function encryptPassword(plainPassword) {
  let satlRounds = 10;
  let hash = await bcrypt.hash(plainPassword, satlRounds);
  return hash;
}
async function comparePassword(plainPassword, hash) {
  let match = bcrypt.compare(plainPassword, hash);
  return match;
}

module.exports = {
  getUser,
  getUsers,
  createUser,
  authUser,
  createJwt,
  loginUser,
  delelteUser,
};
