function computeSpeed(top, bot) {
  const speed = Math.floor((top / bot) * 60).toFixed(0);
  return speed;
}

export default computeSpeed;
