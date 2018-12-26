function findOneAndRemove(arr, cb) {
  if (!(arr instanceof Array)) {
    return;
  }
  if (typeof cb !== 'function') {
    return;
  }
  let idx = arr.findIndex(cb);
  console.log(arr, idx);
  if (~idx) {
    arr.splice(idx, 1);
  }
}

module.exports = findOneAndRemove;
