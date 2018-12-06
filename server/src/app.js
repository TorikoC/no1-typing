const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

process.env['NODE_CONFIG_DIR'] = path.join(__dirname, 'config');
const config = require('config');

const router = require('./routes/snippet');

const app = express();

app.use(cors());

app.use(router);

mongoose.connect(
  config.get('db_host'),
  err => {
    if (err) {
      return;
    }
    console.log('db connected');
    app.listen(config.get('server_port'), () => {
      console.log(`server is listening on port ${config.get('server_port')}`);
    });
  },
);
