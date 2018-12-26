import Vue from 'vue';
import VueRouter from 'vue-router';
import axios from 'axios';
import io from 'socket.io-client';

import App from './App.vue';
import router from './routes';
import config from './config';
import filters from './filters/index';
import components from './components/common/index';

Vue.config.productionTip = false;

Vue.use(VueRouter);

Vue.prototype.$axios = axios.create({
  baseURL: config.apiServer,
});
Vue.prototype.$bus = new Vue();
Vue.prototype.$config = config;
Vue.prototype.$io = io;
Vue.prototype.$roomState = {
  WAITTING: 0,
  ONGOING: 1,
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
