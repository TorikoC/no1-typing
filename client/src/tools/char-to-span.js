export default function(text, classname) {
  const els = text.split('').map(char => {
    return `<span class='${classname}'>${char}</span>`;
  });
  return els.join('');
}
