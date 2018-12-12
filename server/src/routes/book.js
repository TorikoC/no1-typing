const router = require('express').Router();
const multer = require('multer');
const bookService = require('../services/book');

router.get('/api/books', (req, res) => {
  bookService
    .get()
    .then(result => {
      console.log(result);
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

router.delete('/api/books/:id', (req, res) => {
  const { id } = req.params;
  console.log('delete api/books/', id);
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
