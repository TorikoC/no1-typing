const router = require('express').Router();
const multer = require('multer');
const jwt = require('express-jwt');
const jwtSecret = require('config').get('jwtSecret');
const validator = jwt({ secret: jwtSecret });
const formdataParser = multer().none();

const userCtrl = require('../controllers/user');
const bookCtrl = require('../controllers/book');
const snippetCtrl = require('../controllers/snippet');
const recordCtrl = require('../controllers/record');
const roomCtrl = require('../controllers/room');

// login
router.post(
  '/login',
  formdataParser,
  userCtrl.authUser,
  userCtrl.createJwt,
  userCtrl.loginUser,
);

// users
router.get('/users/:id', userCtrl.getUser);
router.get('/users', userCtrl.getUsers);
router.post('/users', formdataParser, userCtrl.createUser);

// books
router.get('/books/:id', bookCtrl.getBook);
router.get('/books', bookCtrl.getBooks);
router.post('/books', formdataParser, bookCtrl.createBook);

// snippets
router.get('/snippets/:id', snippetCtrl.getSnippet);
router.get('/random-snippet', snippetCtrl.getRandomSnippet);
router.get('/snippets', snippetCtrl.getSnippets);
router.post('/snippets', formdataParser, snippetCtrl.createSnippet);
router.delete('/snippets/:id', snippetCtrl.deleteSnippet);

// records
router.get('/records/:id', recordCtrl.getRecord);
router.get('/records', recordCtrl.getRecords);
router.post('/records', formdataParser, recordCtrl.createRecord);

// rooms
router.get('/rooms/:id', validator, roomCtrl.getRoom);
router.get('/rooms', validator, roomCtrl.getRooms);
router.post('/rooms', validator, formdataParser, roomCtrl.createRoom);

module.exports = router;
