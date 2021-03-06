import Test from '../components/Test.vue';

import Home from '../components/User/Home/index';
import C404 from '../components/User/404/index';
import Pratice from '../components/User/Pratice/index';
import Match from '../components/User/Match/index';
import Rank from '../components/User/Rank/index';
import Feedback from '../components/User/Feedback/index';
import About from '../components/User/About/index';
import Intro from '../components/User/Intro/index';
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
      component: Home,
      children: [
        {
          path: 'test',
          component: Test,
        },
        {
          path: 'pratice/:lang',

          props: true,
          component: Pratice,
        },
        {
          path: 'match/:lang',

          props: true,
          component: Match,
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
          path: 'rooms/:lang/:id',
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
        {
          path: 'intro',
          component: Intro,
        },
        {
          path: '404',
          component: C404,
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
    {
      path: '*',
      redirect: '/404',
    },
  ],
});

export default router;
