export default function(s1, s2) {
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
    len = s2.length;
  }
  return len;
}
