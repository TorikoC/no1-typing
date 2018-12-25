const router = require('express').Router();
const UserService = require('../services/user');
const multer = require('multer');

router.get('/', (req, res) => {
  UserService.get({}).then(result => {
    res.send(result);
  });
});

router.get('/:username', (req, res) => {
  const { username } = req.params;
  console.log(username);
  UserService.getOne({ username }).then(result => {
    res.send(result);
  });
});

router.post('/', multer().none(), (req, res) => {
  const { body } = req;
  UserService.create(body).then(result => {
    res.send(result);
  });
});

router.put('/:username', multer().none(), (req, res) => {
  const { body } = req;
  const { username } = req.params;
  UserService.update({ username }, body).then(result => {
    res.send(result);
  });
});

router.delete('/:username', (req, res) => {
  const { username } = req.params;
  UserService.delete({ username }).then(result => {
    res.send(result);
  });
});

module.exports = router;
