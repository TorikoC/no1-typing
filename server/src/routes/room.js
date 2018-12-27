const router = require('express').Router();
const roomService = require('../services/room');
const multer = require('multer');
const jwtSecret = require('config').get('jwtSecret');
const expressJwt = require('express-jwt');

router.get('/rooms', (req, res) => {
  roomService.get().then(result => {
    res.send(result);
  });
});

router.get('/rooms/:id', expressJwt({ secret: jwtSecret }), (req, res) => {
  const { id } = req.params;
  roomService
    .getOne({ _id: id })
    .then(result => {
      if (!result) {
        res.status(404);
        res.send('room not exist.');
        return;
      }
      if (!result.canJoin) {
        res.status(401);
        res.send('room is private.');
        return;
      }
      if (!result.users.some(user => user.username === req.user.username)) {
        result.users.push({ username: req.user.username });
        result.save();
      }
      res.send(result);
    })
    .catch(error => {
      res.status(500);
      res.send(error);
    });
});

router.post(
  '/rooms',
  expressJwt({ secret: jwtSecret }),
  multer().none(),
  (req, res) => {
    const { body } = req;
    // body.creator = req.user.username;
    body.users = [{ username: req.user.username }];
    roomService.create(body).then(result => {
      res.send(result);
    });
  },
);

router.delete('/rooms/:id', (req, res) => {
  const { id } = req.params;
  roomService.delete({ _id: id }).then(result => {
    res.send(result);
  });
});

module.exports = router;
