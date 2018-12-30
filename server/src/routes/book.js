const router = require('express').Router();
const multer = require('multer');
const bookService = require('../services/book');

router.get('/api/books', (req, res) => {
  let { name } = req.query || '';

  const where = {};
  if (name) {
    where.name = name;
  }
  req.log.info();
  bookService
    .get(where)
    .then(result => {
      res.send(result);
    })
    .catch(error => {
      res.status(500);
      res.send(error);
    });
});

router.post('/api/books', multer().none(), (req, res) => {
  req.log.info();
  const { body } = req;
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

router.delete('/api/books/:id', (req, res) => {
  req.log.info();
  const { id } = req.params;
  bookService
    .deleteOne({ _id: id })
    .then(result => {
      res.send(result);
    })
    .catch(error => {
      res.status(500);
      res.send(error);
    });
});

module.exports = router;
