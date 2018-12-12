const router = require('express').Router();
const multer = require('multer');
const recordService = require('../services/record');

/**
 * @param snippedId String
 * @param limit Number
 */
router.get('/api/records', (req, res) => {
  let { snippetId, limit } = req.query;
  snippetId = snippetId || '';
  limit = +limit || 10;

  const where = {};
  if (snippetId) {
    where.snippetId = snippetId;
  }
  const sort = {
    speed: -1,
  };

  console.log('get api/records:', snippetId, limit);
  recordService
    .get(where, sort, limit)
    .then(result => {
      res.send(result);
    })
    .catch(error => {
      res.status(500);
      res.send(error);
    });
});

router.post('/api/records', multer().none(), (req, res) => {
  const { body } = req;
  console.log('post api/records', body);
  recordService
    .create(body)
    .then(result => {
      res.send(result);
    })
    .catch(error => {
      res.status(500);
      res.send(error);
    });
});

module.exports = router;
