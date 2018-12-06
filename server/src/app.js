const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

process.env['NODE_CONFIG_DIR'] = path.join(__dirname, 'config');
const config = require('config');

const snippetRouter = require('./routes/snippet');
const recordRouter = require('./routes/record');

const app = express();

app.use(cors());

app.use(snippetRouter);
app.use(recordRouter);

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
