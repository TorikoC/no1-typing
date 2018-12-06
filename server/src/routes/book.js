const router = require('express').Router();
const multer = require('multer');
const bookService = require('../services/book');

router.get('/api/books', (req, res) => {
  bookService
    .getOneRandom()
    .then(result => {
      res.send(result);
    })
    .catch(error => {
      res.status(500);
      res.send(error);
    });
});

router.post('/api/books', multer().none(), (req, res) => {
  const { body } = req;
  console.log('post api/books', body);
  bookService
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
