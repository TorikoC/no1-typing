const db = require('../models');

async function getRecord(req, res, next) {
  let { id } = req.params;

  let result = await db.Record.findOne({ _id: id });

  req.result = result;
  next();
}

async function getRecords(req, res, next) {
  let result = await db.Record.find();

  req.result = result;
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
