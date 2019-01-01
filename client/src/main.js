import Vue from 'vue';
import VueRouter from 'vue-router';

import App from './App.vue';
import axios from './axios';
import socket from './socket';
import router from './routes';
import config from './config';
import filters from './filters';
import components from './components/Common';

import jwtDecode from 'jwt-decode';
if (localStorage.getItem('jwt')) {
  let jwt = localStorage.getItem('jwt');
  let data = jwtDecode(jwt);
  window.login = true;
  window.$user = data;

  axios.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;
}

Vue.config.productionTip = false;

Vue.use(VueRouter);

Vue.prototype.$axios = axios;

Vue.prototype.$bus = new Vue();
Vue.prototype.$config = config;
Vue.prototype.$socket = socket;

for (let key of Object.keys(filters)) {
  Vue.filter(key, filters[key]);
}
for (let key of Object.keys(components)) {
  Vue.component(key, components[key]);
}

new Vue({
  router,
  render: h => h(App),
}).$mount('#app');
