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
let bus = new Vue();
Vue.prototype.$bus = bus;
Vue.prototype.$io = io;
Vue.prototype.$config = config;

let socket = io.connect(config.server);
socket.on('user-join', username => {
  bus.$emit('user-join', username);
});
socket.on('user-leave', username => {
  console.log('got user leavae');
  bus.$emit('user-leave', username);
});
socket.on('user-done', username => {
  bus.$emit('user-done', username);
});
socket.on('update-progress', data => {
  bus.$emit('update-progress', data);
});
socket.on('update-snippet', snippet => {
  bus.$emit('update-snippet', snippet);
});
socket.on('update-users', users => {
  bus.$emit('update-users', users);
});
socket.on('update-id', id => {
  bus.$emit('update-id', id);
});
socket.on('test', msg => {
  bus.$emit('test', msg);
});
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
