const router = require('express').Router();

const bookRouter = require('./book');
const recordRouter = require('./record');
const snippetRouter = require('./snippet');
const user = require('./user');

router.use(bookRouter);
router.use(recordRouter);
router.use(snippetRouter);
router.use('/api/users', user);

module.exports = router;
