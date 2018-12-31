const db = require('../models');

async function getBook(req, res) {
  let { id } = req.params;

  let result = await db.Book.findOne({ _id: id });

  res.status(200);
  res.send(result);
}

async function getBooks(req, res) {
  let result = await db.Book.find();
  console.log(result);

  res.status(200);
  res.send(result);
}

async function createBook(req, res) {
  const { body } = req;
  let result = await db.Book.create(body);

  res.status(200);
  res.send(result);
}

module.exports = {
  getBook,
  getBooks,
  createBook,
};
