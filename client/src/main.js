import Vue from 'vue';
import VueRouter from 'vue-router';
import axios from 'axios';
import io from 'socket.io-client';

import App from './App.vue';
import router from './routes';
import config from './config';

Vue.config.productionTip = false;

Vue.prototype.$axios = axios;
Vue.prototype.$config = config;
Vue.prototype.$io = io;

Vue.use(VueRouter);

new Vue({
  router,
  render: h => h(App),
}).$mount('#app');
