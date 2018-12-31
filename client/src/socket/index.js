import io from 'socket.io-client';
import config from '../config/index';

const socket = io.connect(config.server);

socket.on('connect', () => {
  console.log('socket connected.');
});
socket.on('disconnect', reason => {
  console.log('socket disconnected', reason);
});

export default socket;
