import Vue from 'vue';
import VueRouter from 'vue-router';
import axios from 'axios';
import io from 'socket.io-client';

import App from './App.vue';
import router from './routes';
import config from './config';

import Back from './components/common/back';
import Progress from './components/common/progress';

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
Vue.filter('formatDate', timeStamp => {
  let date = new Date(timeStamp);
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();

  let hour = date.getHours();
  let min = date.getMinutes();
  if (month < 10) {
    month = '0' + 10;
  }
  if (day < 10) {
    day = '0' + 10;
  }
  if (hour < 10) {
    hour = '0' + 10;
  }
  if (min < 10) {
    min = '0' + 10;
  }
  const result = `${year}-${month}-${day} ${hour}:${min}`;
  return result;
});
Vue.component('back', Back);
Vue.component('n1-progress', Progress);

new Vue({
  router,
  render: h => h(App),
}).$mount('#app');
