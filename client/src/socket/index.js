import io from 'socket.io-client';
import config from '../config/index';

const socket = io.connect(config.server);

import roomEvents from './events/room';
import matchEvents from './events/match';

socket.on('connect', () => {
  console.log('socket connected.');
});
socket.on('disconnect', reason => {
  console.log('socket disconnected.', reason);
});

export default bus => {
  roomEvents.forEach(eventName => {
    socket.on(eventName, data => {
      bus.$emit(eventName, data);
    });
  });
  matchEvents.forEach(eventName => {
    socket.on(eventName, data => {
      bus.$emit(eventName, data);
    });
  });
  return socket;
};
