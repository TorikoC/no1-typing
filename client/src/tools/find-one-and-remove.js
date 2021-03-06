function findOneAndRemove(arr, cb) {
  if (!(arr instanceof Array)) {
    return;
  }
  if (typeof cb !== 'function') {
    return;
  }
  let idx = arr.findIndex(cb);
  if (~idx) {
    arr.splice(idx, 1);
  }
}

export default findOneAndRemove;
