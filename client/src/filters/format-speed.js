/**
 *
 * @param {String} speed
 * @param {String} lang
 */
function formatSpeed(speed, lang) {
  let unit = '';
  switch (lang) {
    case 'cn': {
      unit = '字/分钟';
      break;
    }
    case 'en': {
      unit = 'WPM';
      break;
    }
    default: {
      break;
    }
  }
  return speed + unit;
}

export default formatSpeed;
