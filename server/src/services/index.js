const fs = require('fs');
const path = require('path');

const obj = {};
const files = fs.readdirSync(__dirname);

files.forEach(file => {
  obj[file.split('.').shift()] = require(path.join(__dirname, file));
});

module.exports = obj;
