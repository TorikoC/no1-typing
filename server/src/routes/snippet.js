const router = require('express').Router();
const multer = require('multer');
const snippetService = require('../services/snippet');
const bookService = require('../services/book');

router.get('/api/snippets', (req, res) => {
  req.log.info();
  snippetService
    .get()
    .then(result => {
      res.send(result);
    })
    .catch(error => {
      res.status(500);
      res.send(error);
    });
});

router.get('/api/random-snippet', async (req, res) => {
  // req.log.info();
  let snippet = await snippetService.getOneRandom();
  console.log(snippet);
  if (snippet.length > 0) {
    snippet = snippet[0];
  }
  bookService
    .getOne({ name: snippet.bookName })
    .then(result => {
      res.send({
        name: result.name,
        author: result.author,
        cover: result.cover,
        content: snippet.content,
        length: snippet.length,
      });
    })
    .catch(error => {
      res.status(500);
      res.send(error);
    });
});

router.post('/api/snippets', multer().none(), (req, res) => {
  req.log.info();
  const { body } = req;
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

router.delete('/api/snippets/:id', async (req, res) => {
  const { id } = req.params;
  const result = await snippetService.deleteOne({ _id: id });
  res.send(result);
});
module.exports = router;
