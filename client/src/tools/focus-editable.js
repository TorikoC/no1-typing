export default function(el) {
  let s = window.getSelection();
  let r = document.createRange();
  el.innerHTML = '\u00a0';
  r.selectNodeContents(el);
  s.removeAllRanges();
  s.addRange(r);
  document.execCommand('delete', false, null);
}
