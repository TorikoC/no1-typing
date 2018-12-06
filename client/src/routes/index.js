import Admin from '../components/Admin/index';
import User from '../components/User/index';
import PraticeCN from '../components/User/Pratice/chinese';
import PraticeEN from '../components/User/Pratice/english';

import VueRouter from 'vue-router';

const router = new VueRouter({
  routes: [
    {
      path: '/',
      component: User,
      children: [
        { path: '/pratice/cn', component: PraticeCN },
        {
          path: '/pratice/en',
          component: PraticeEN,
        },
      ],
    },
    {
      path: '/admin',
      component: Admin,
    },
  ],
});

export default router;
