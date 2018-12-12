/**
 * 聚焦 el.
 * 注意事项:
 * 1. el 的 contenteditable 必须为 true
 * 2. 必须在浏览器环境下运行（可以访问 document 元素)
 * @param {HTMLElement} el
 */
function focusEditable(el) {
  let s = window.getSelection();
  let r = document.createRange();
  el.innerHTML = '\u00a0';
  r.selectNodeContents(el);
  s.removeAllRanges();
  s.addRange(r);
  document.execCommand('delete', false, null);
}

export default focusEditable;
