/**
 * 将 unix 时间戳转换为 00:00(分：秒) 格式的时间。
 * @param {Number} timeStamp unix时间戳
 */
function formatTime(timeStamp) {
  let result = '';
  let seconds = Math.floor(timeStamp / 1000);
  let mins = Math.floor(seconds / 60);
  seconds %= 60;
  if (mins < 10) {
    mins = '0' + mins;
  }
  if (seconds < 10) {
    seconds = '0' + seconds;
  }
  result = `${mins}:${seconds}`;
  return result;
}
export default formatTime;
