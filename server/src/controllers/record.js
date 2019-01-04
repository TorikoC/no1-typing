const db = require('../models');

async function getRecord(req, res, next) {
  let { id } = req.params;

  let result = await db.Record.findOne({ _id: id });

  req.result = result;
  next();
}

async function getRecords(req, res, next) {
  let { lang, size, sort, snippetId, skip } = req.query;
  lang = lang || '';
  skip = +skip || 0;
  size = size || 10;
  sort = sort || 'speed|desc';
  snippetId = snippetId || '';

  let where = {};

  if (lang) {
    where.lang = lang;
  }
  if (snippetId) {
    where.snippetId = snippetId;
  }

  let sortField = sort.split('|').shift();
  let sortType = sort.split('|').pop();
  let sortOption = {};
  sortOption[sortField] = sortType === 'desc' ? -1 : 1;

  let p1 = db.Record.find(where)
    .sort(sortOption)
    .skip(skip)
    .limit(size);
  let p2 = db.Record.find(where)
    .sort(sortOption)
    .count();
  let results = await Promise.all([p1, p2]);

  req.result = {
    records: results[0],
    total: results[1],
  };
  next();
}

async function createRecord(req, res, next) {
  const { body } = req;
  let result = await db.Record.create(body);

  req.result = result;
  next();
}

module.exports = {
  getRecord,
  getRecords,
  createRecord,
};
