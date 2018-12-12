/**
 * 将 unix 时间戳转换为 YYYY-MM-DD HH:MM 格式的时间。
 * @param {Number} timeStamp unix时间戳
 */
function formatDate(timeStamp) {
  let date = new Date(timeStamp);
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();

  let hour = date.getHours();
  let min = date.getMinutes();
  if (month < 10) {
    month = '0' + 10;
  }
  if (day < 10) {
    day = '0' + 10;
  }
  if (hour < 10) {
    hour = '0' + 10;
  }
  if (min < 10) {
    min = '0' + 10;
  }
  const result = `${year}-${month}-${day} ${hour}:${min}`;
  return result;
}
export default formatDate;
