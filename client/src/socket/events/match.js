const prefix = 'match-';

const events = [
  'user-join',
  'user-leave',

  'update-id',
  'update-book',
  'update-clock',
  'update-users',
  'update-snippet',
  'update-progress',
].map(name => prefix + name);

export default events;
