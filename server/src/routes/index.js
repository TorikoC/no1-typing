const router = require('express').Router();

const bookRouter = require('./book');
const recordRouter = require('./record');
const snippetRouter = require('./snippet');
const user = require('./user');
const login = require('./login');

router.use(bookRouter);
router.use(recordRouter);
router.use(snippetRouter);
router.use('/api/users', user);
router.use('/api', login);

module.exports = router;
