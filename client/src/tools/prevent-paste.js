export default function(el) {
  el.addEventListener('paste', evt => evt.preventDefault(), false);
}
