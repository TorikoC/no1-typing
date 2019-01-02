const router = require('express').Router();
const multer = require('multer');
const jwt = require('express-jwt');
const jwtSecret = require('config').get('jwtSecret');

const validate = jwt({ secret: jwtSecret });
const parseFormdata = multer().none();

const userCtrl = require('../controllers/user');
const bookCtrl = require('../controllers/book');
const snippetCtrl = require('../controllers/snippet');
const recordCtrl = require('../controllers/record');
const roomCtrl = require('../controllers/room');

// login
router.post(
  '/login',
  parseFormdata,
  userCtrl.authUser,
  userCtrl.createJwt,
  userCtrl.loginUser,
);

// users
router.get('/users/:id', userCtrl.getUser);
router.get('/users', userCtrl.getUsers);
router.post('/users', parseFormdata, userCtrl.createUser);
router.delete('/users/:id', validate, userCtrl.delelteUser);

// books
router.get('/books/:id', bookCtrl.getBook);
router.get('/books', bookCtrl.getBooks);
router.post('/books', parseFormdata, bookCtrl.createBook);
router.delete('/books/:id', validate, bookCtrl.deleteBook);

// snippets
router.get('/snippets/:id', snippetCtrl.getSnippet);
router.get('/random-snippet', snippetCtrl.getRandomSnippet);
router.get('/snippets', snippetCtrl.getSnippets);
router.post('/snippets', parseFormdata, snippetCtrl.createSnippet);
router.delete('/snippets/:id', snippetCtrl.deleteSnippet);

// records
router.get('/records/:id', recordCtrl.getRecord);
router.get('/records', recordCtrl.getRecords);
router.post('/records', parseFormdata, recordCtrl.createRecord);

// rooms
router.get('/rooms/:id', validate, roomCtrl.getRoom);
router.get('/rooms', validate, roomCtrl.getRooms);
router.post('/rooms', validate, parseFormdata, roomCtrl.createRoom);

module.exports = router;
