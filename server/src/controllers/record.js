const db = require('../models');

async function getRecord(req, res, next) {
  let { id } = req.params;

  let result = await db.Record.findOne({ _id: id });

  req.result = result;
  next();
}

async function getRecords(req, res, next) {
  let { lang, size, sort, snippetId } = req.query;
  lang = lang || 'cn';
  size = size || 10;
  sort = sort || 'speed|desc';
  snippetId = snippetId || '';

  let where = {
    lang,
  };

  if (snippetId) {
    where.snippetId = snippetId;
  }

  console.log(lang, size, sort, snippetId);

  let sortField = sort.split('|').shift();
  let sortType = sort.split('|').pop();
  let sortOption = {};
  sortOption[sortField] = sortType === 'desc' ? -1 : 1;

  let result = await db.Record.find(where)
    .sort(sortOption)
    .limit(size);

  req.result = result;
  next();
}

async function createRecord(req, res, next) {
  const { body } = req;
  console.log(body);
  let result = await db.Record.create(body);

  req.result = result;
  next();
}

module.exports = {
  getRecord,
  getRecords,
  createRecord,
};
