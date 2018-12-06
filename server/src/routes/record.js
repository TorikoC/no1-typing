const router = require('express').Router();
const multer = require('multer');
const recordService = require('../services/record');

router.get('/api/records', (req, res) => {
  recordService
    .getOneRandom()
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
