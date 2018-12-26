import User from '../components/User/index';
import PraticeCN from '../components/User/Pratice/chinese';
import PraticeEN from '../components/User/Pratice/english';
import MatchCN from '../components/User/Match/chinese';
import MatchEN from '../components/User/Match/english';
import Rank from '../components/User/Rank/index';
import Feedback from '../components/User/Feedback/index';
import About from '../components/User/About/index';
import Register from '../components/User/register.vue';
import Login from '../components/User/login.vue';
import Profile from '../components/User/Profile/index.vue';
import Rooms from '../components/User/Rooms/index.vue';
import Room from '../components/User/Room/index.vue';
import AddRoom from '../components/User/Add/Room/index.vue';

import Admin from '../components/Admin/index';
import AdminBook from '../components/Admin/Books/index';
import AdminSnippet from '../components/Admin/Snippets/index';
import AdminUsers from '../components/Admin/Users/index';

import VueRouter from 'vue-router';

const router = new VueRouter({
  mode: 'history',
  routes: [
    {
      path: '/',
      component: User,
      children: [
        { path: 'pratice/cn', component: PraticeCN },
        {
          path: 'pratice/en',
          component: PraticeEN,
        },
        {
          path: 'match/cn',
          component: MatchCN,
        },
        {
          path: 'match/en',
          component: MatchEN,
        },
        {
          path: 'rank',
          component: Rank,
        },
        {
          path: 'feedback',
          component: Feedback,
        },
        {
          path: 'about',
          component: About,
        },
        {
          path: 'rooms',
          component: Rooms,
        },
        {
          path: 'rooms/:id',
          props: true,
          component: Room,
        },
        {
          path: 'add/room',
          component: AddRoom,
        },
        {
          path: 'profile/:username',
          props: true,
          component: Profile,
        },
        {
          path: 'register',
          component: Register,
        },
        {
          path: 'login',
          component: Login,
        },
      ],
    },
    {
      path: '/admin',
      component: Admin,
      redirect: '/admin/snippets',
      children: [
        {
          path: 'books',
          component: AdminBook,
        },
        {
          path: 'snippets',
          component: AdminSnippet,
        },
        {
          path: 'users',
          component: AdminUsers,
        },
      ],
    },
  ],
});

export default router;
