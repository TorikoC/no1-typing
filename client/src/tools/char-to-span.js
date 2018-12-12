/**
 * 将 text 里的每个字符变成的 html span 标签, 并添加 classname 类名.
 * @param {String} text
 * @param {String} classname
 */
function charToSpan(text, classname) {
  const els = text.split('').map(char => {
    return `<span class='${classname}'>${char}</span>`;
  });
  return els.join('');
}
export default charToSpan;
