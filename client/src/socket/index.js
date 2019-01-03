import io from 'socket.io-client';
import config from '../config/index';

const socket = io.connect(config.server);

if (window.$debug) {
  socket.on('connect', () => {
    console.log('socket connected.');
  });
  socket.on('disconnect', reason => {
    console.log('socket disconnected', reason);
  });
}

export default socket;
