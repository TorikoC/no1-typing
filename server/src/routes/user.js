const router = require('express').Router();
const UserService = require('../services/user');
const RecordService = require('../services/record');
const multer = require('multer');

router.get('/', (req, res) => {
  UserService.get({}).then(result => {
    res.send(result);
  });
});

router.get('/:username', (req, res) => {
  const { username } = req.params;
  const p1 = UserService.getOne({ username });
  const p2 = RecordService.getTop({ username, mode: 'match' }, 1);
  const p3 = RecordService.getTop({ username, mode: 'pratice' }, 1);
  const p4 = RecordService.getLatest({ username });
  Promise.all([p1, p2, p3, p4]).then(result => {
    const data = {
      user: result[0],
      bestMatchRecord: result[1],
      bestPraticeRecord: result[2],
      latestRecords: result[3],
    };
    console.log(data);

    res.send(data);
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
