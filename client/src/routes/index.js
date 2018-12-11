import Admin from '../components/Admin/index';
import User from '../components/User/index';
import PraticeCN from '../components/User/Pratice/chinese';
import PraticeEN from '../components/User/Pratice/english';
import MatchCN from '../components/User/Match/chinese';
import MatchEN from '../components/User/Match/english';
import Rank from '../components/User/Rank/index';
import Feedback from '../components/User/Feedback/index';
import About from '../components/User/About/index';

import AdminBook from '../components/Admin/Books/index';
import AdminSnippet from '../components/Admin/Snippets/index';

import VueRouter from 'vue-router';

const router = new VueRouter({
  mode: 'history',
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
        {
          path: '/rank',
          component: Rank,
        },
        {
          path: '/feedback',
          component: Feedback,
        },
        {
          path: '/about',
          component: About,
        },
      ],
    },
    {
      path: '/admin',
      component: Admin,
      children: [
        {
          path: 'books',
          component: AdminBook,
        },
        {
          path: 'snippets',
          component: AdminSnippet,
        },
      ],
    },
  ],
});

export default router;
