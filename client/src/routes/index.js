import Admin from '../components/Admin/index';
import User from '../components/User/index';
import PraticeCN from '../components/User/Pratice/chinese';
import PraticeEN from '../components/User/Pratice/english';
import MatchCN from '../components/User/Match/chinese';
import MatchEN from '../components/User/Match/english';

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
        {
          path: '/match/cn',
          component: MatchCN,
        },
        {
          path: '/match/en',
          component: MatchEN,
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
