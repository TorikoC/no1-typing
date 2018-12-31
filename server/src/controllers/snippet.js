const db = require('../models');

async function getSnippet(req, res, next) {
  let { id } = req.params;

  let result = await db.Snippet.findOne({ _id: id });

  req.result = result;
  next();
}

async function getSnippets(req, res, next) {
  let result = await db.Snippet.find();

  req.result = result;
  next();
}

async function getRandomSnippet(req, res, next) {
  let { lang } = req.query;

  const pipeline = [
    {
      $match: {
        lang: lang,
      },
    },
    {
      $sample: {
        size: 1,
      },
    },
  ];
  let result = await db.Snippet.aggregate(pipeline);

  req.result = result;
  next();
}

async function createSnippet(req, res, next) {
  const { body } = req;
  let result = await db.Snippet.create(body);

  req.result = result;
  next();
}

async function deleteSnippet(req, res, next) {
  const { id } = req.params;
  let result = await db.Snippet.findByIdAndDelete(id);

  req.result = result;
  next();
}

module.exports = {
  getSnippet,
  getRandomSnippet,
  getSnippets,
  createSnippet,
  deleteSnippet,
};
