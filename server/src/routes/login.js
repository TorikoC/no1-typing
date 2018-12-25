const router = require('express').Router();
const UserService = require('../services/user');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const config = require('config');

router.post('/login', multer().none(), (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return;
  }
  UserService.getOne({ email })
    .then(result => {
      if (!result) {
        res.status(404);
        res.send('user not found');
      } else if (result.password !== password) {
        res.status(401);
        res.send('password not match');
      } else {
        res.status(200);
        const token = jwt.sign(
          {
            username: result.username,
            isAdmin: false,
          },
          config.get('jwtSecret'),
        );
        res.send(token);
      }
    })
    .catch(error => {
      res.status(500);
      res.send(error);
    });
});

module.exports = router;
