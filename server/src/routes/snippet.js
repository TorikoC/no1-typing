const router = require('express').Router();
const multer = require('multer');
const snippetService = require('../services/snippet');

router.get('/api/snippets', (req, res) => {
  snippetService
    .getOne({ _id: '5c08b2f3ddb06454dc53f902' })
    .then(result => {
      console.log(result);
      if (result instanceof Array) {
        res.send(result[0]);
      } else {
        res.send(result);
      }
    })
    .catch(error => {
      res.status(500);
      res.send(error);
    });
});

router.post('/api/snippets', multer().none(), (req, res) => {
  const { body } = req;
  console.log('post api/snippets', body);
  snippetService
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
