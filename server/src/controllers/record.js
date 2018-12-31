const db = require('../models');

async function getRecord(req, res) {
  let { id } = req.params;

  let result = await db.Record.findOne({ _id: id });

  res.status(200);
  res.send(result);
}

async function getRecords(req, res) {
  let result = await db.Record.find();

  res.status(200);
  res.send(result);
}

async function createRecord(req, res) {
  const { body } = req;
  let result = await db.Record.create(body);

  res.status(200);
  res.send(result);
}

module.exports = {
  getRecord,
  getRecords,
  createRecord,
};
