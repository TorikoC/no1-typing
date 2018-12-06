import Admin from '../components/Admin/index';
import User from '../components/User/index';

import VueRouter from 'vue-router';

const router = new VueRouter({
  routes: [
    {
      path: '/',
      component: User,
    },
    {
      path: '/admin',
      component: Admin,
    },
  ],
});

export default router;
