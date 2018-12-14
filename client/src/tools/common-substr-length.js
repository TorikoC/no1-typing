/**
 * 返回字符串 s1, s2 的最大公共子串长度.
 * @param {String} s1
 * @param {String} s2
 */
function getLongestCommonSubstrLength(s1, s2) {
  let len = 0;
  let hasMatch = false;
  for (let i = 0; i < s1.length && i < s2.length; i += 1) {
    if (
      s1[i] !== s2[i] &&
      !(s1.charCodeAt(i) === 32 && s2.charCodeAt(i) === 160)
    ) {
      len = i;
      break;
    }
    hasMatch = true;
  }
  if (hasMatch && len === 0) {
    // s2 is sub string of s1
    len = Math.min(s1.length, s2.length);
  }
  return len;
}
export default getLongestCommonSubstrLength;
