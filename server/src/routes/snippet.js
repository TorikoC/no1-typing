const router = require('express').Router();
const multer = require('multer');
const snippetService = require('../services/snippet');
const bookService = require('../services/book');

router.get('/api/snippets', async (req, res) => {
  let snippet = await snippetService.getOneRandom();
  if (snippet.length > 0) {
    snippet = snippet[0];
  }
  bookService
    .getOne({ name: snippet.sourceId })
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
