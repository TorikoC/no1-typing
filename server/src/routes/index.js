const router = require('express').Router();
const multer = require('multer');
const userCtrl = require('../controllers/user');

const bookRouter = require('./book');
const recordRouter = require('./record');
const snippetRouter = require('./snippet');
const room = require('./room');
const login = require('./login');

// handle formdata for post and put request.
router.post(multer().none());
router.put(multer().none());

// users
router.get('/users/:id', userCtrl.getUser);
router.get('/users', userCtrl.getUsers);
router.post('/users', userCtrl.createUser);

// books
// snippets
// records

// rooms
// matches

router.use(bookRouter);
router.use(recordRouter);
router.use(snippetRouter);
router.use('/api', room);
router.use('/api', login);

module.exports = router;
