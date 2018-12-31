import Vue from 'vue';
import VueRouter from 'vue-router';
import axios from 'axios';

import App from './App.vue';
import socket from './socket';
import router from './routes';
import config from './config';
import filters from './filters';
import components from './components/Common';

Vue.config.productionTip = false;

Vue.use(VueRouter);
Vue.prototype.$axios = axios.create({
  baseURL: config.apiServer,
});

Vue.prototype.$bus = new Vue();
Vue.prototype.$config = config;
Vue.prototype.$socket = socket;

Vue.prototype.$roomState = {
  WAITING: 0,
  ONGOING: 1,
};
Vue.prototype.$platformState = {
  WAITING: 0,
  COUNTING: 1,
  WRITING: 2,
};

Vue.prototype.$constant = {
  PRATICE_MODE_CLOCK: 4,
};

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
