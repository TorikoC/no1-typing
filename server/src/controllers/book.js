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

module.exports = {
  getBook,
  getBooks,
  createBook,
};
