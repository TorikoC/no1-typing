const db = require('../models');

async function getSnippet(req, res) {
  let { id } = req.params;

  let result = await db.Snippet.findOne({ _id: id });

  res.status(200);
  res.send(result);
}

async function getSnippets(req, res) {
  let result = await db.Snippet.find();

  res.status(200);
  res.send(result);
}

async function getRandomSnippet(req, res) {
  // TODO:
  // what's the dif between {field1: ''} and field1 is not specify?
  let lang = req.query.lang || '';

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

  res.status(200);
  res.send(result);
}

async function createSnippet(req, res) {
  const { body } = req;
  let result = await db.Snippet.create(body);

  res.status(200);
  res.send(result);
}

async function deleteSnippet(req, res) {
  const { id } = req.params;
  let result = await db.Snippet.findByIdAndDelete(id);
  res.status(200);
  res.send(result);
}

module.exports = {
  getSnippet,
  getRandomSnippet,
  getSnippets,
  createSnippet,
  deleteSnippet,
};
