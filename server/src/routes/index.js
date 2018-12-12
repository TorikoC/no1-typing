const router = require('express').Router();

const bookRouter = require('./book');
const recordRouter = require('./record');
const snippetRouter = require('./snippet');

router.use(bookRouter);
router.use(recordRouter);
router.use(snippetRouter);

module.exports = router;
