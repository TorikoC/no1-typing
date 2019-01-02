const db = require('../models');

async function getBook(req, res, next) {
  let { id } = req.params;

  let result = await db.Book.findOne({ _id: id });

  req.result = result;
  next();
}

async function getBooks(req, res, next) {
  let result = await db.Book.find();

  req.result = result;
  next();
}

async function createBook(req, res, next) {
  const { body } = req;
  let result = await db.Book.create(body);

  req.result = result;
  next();
}

async function deleteBook(req, res, next) {
  const { id } = req.params;
  if (!req.user || !req.user.isAdmin) {
    req.error = {
      code: 401,
      message: 'No permisson.',
    };
    next(new Error());
  }
  let result = await db.Book.deleteOne({ _id: id });

  req.result = result;
  next();
}

module.exports = {
  getBook,
  getBooks,
  createBook,
  deleteBook,
};
