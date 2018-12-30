const router = require('express').Router();
const multer = require('multer');
const snippetService = require('../services/snippet');
const bookService = require('../services/book');

/**
 * 返回所有段落.
 */
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

/**
 * 返回一个随机段落。
 *
 * @param [String] lang
 */
router.get('/api/snippets/random', async (req, res) => {
  req.log.info();
  let { lang } = req.query;
  lang = lang || 'cn';

  const where = {
    lang,
  };

  let snippet = await snippetService.findOneRandom(where);
  if (snippet instanceof Array && snippet[0]) {
    snippet = snippet[0];
  }
  res.send(snippet);
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
