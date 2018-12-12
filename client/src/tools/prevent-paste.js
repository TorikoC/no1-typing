/**
 * 禁止 el 作为粘贴对象.
 * @param {HTMLElement} el
 */
function preventPaste(el) {
  el.addEventListener('paste', evt => evt.preventDefault(), false);
}
export default preventPaste;
