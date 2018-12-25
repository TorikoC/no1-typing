const router = require('express').Router();
const roomService = require('../services/room');
const multer = require('multer');

router.get('/rooms', (req, res) => {
  roomService.get().then(result => {
    res.send(result);
  });
});

router.get('/rooms/:id', (req, res) => {
  const { id } = req.params;
  roomService.getOne({ _id: id }).then(result => {
    res.send(result);
  });
});

router.post('/rooms', multer().none(), (req, res) => {
  const { body } = req;
  roomService.create(body).then(result => {
    res.send(result);
  });
});

router.delete('/rooms/:id', (req, res) => {
  const { id } = req.params;
  roomService.delete({ _id: id }).then(result => {
    res.send(result);
  });
});

module.exports = router;
