const prefix = 'room-';
const events = [
  'user-join',
  'user-leave',
  'user-prepare',
  'user-complete',

  'update-book',
  'update-state',
  'update-clock',
  'update-snippet',
  'update-progress',
].map(name => prefix + name);

export default events;
