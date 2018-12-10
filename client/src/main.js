import Vue from 'vue';
import VueRouter from 'vue-router';
import axios from 'axios';
import io from 'socket.io-client';

import App from './App.vue';
import router from './routes';
import config from './config';

import Back from './components/common/back';

Vue.config.productionTip = false;

Vue.prototype.$axios = axios;
Vue.prototype.$config = config;
Vue.prototype.$io = io;

Vue.use(VueRouter);

Vue.filter('formatTime', stamp => {
  let result = '';
  let seconds = Math.floor(stamp / 1000);
  let mins = Math.floor(seconds / 60);
  seconds %= 60;
  if (mins < 10) {
    mins = '0' + mins;
  }
  if (seconds < 10) {
    seconds = '0' + seconds;
  }
  result = `${mins}:${seconds}`;
  return result;
});
Vue.component('back', Back);

new Vue({
  router,
  render: h => h(App),
}).$mount('#app');
