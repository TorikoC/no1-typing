const fs = require('fs');
const path = require('path');

const files = fs.readdirSync(__dirname);

function capitalize(str) {
  const first = str[0].toUpperCase();
  const rest = str.substr(1);
  return first + rest;
}

const obj = {};
files.forEach(file => {
  if (file === 'index.js') {
    return;
  }
  obj[
    file
      .split('.')
      .shift()
      .split('-')
      .reduce((prev, curr, index) => {
        if (index === 0) {
          return prev + curr;
        } else {
          return prev + capitalize(curr);
        }
      }, '')
  ] = require(path.join(__dirname, file));
});
console.log(obj);

module.exports = obj;
