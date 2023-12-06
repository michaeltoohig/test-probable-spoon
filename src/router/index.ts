import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '@/views/LoginView.vue';
import LogoutView from '@/views/LogoutView.vue';
import BaseLayout from '@/views/BaseLayout.vue';
import HomeView from '@/views/HomeView';
import ProfileView from '@/views/ProfileView';
import AboutView from '@/views/AboutView';
import ReportMovementView from '@/views/ReportMovementView';
import { useAuthStore } from '../stores/authStore';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/logout',
      name: 'logout',
      component: LogoutView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/',
      component: BaseLayout,
      meta: {
        requiresAuth: true,
      },
      children: [
        {
          path: '/',
          name: 'home',
          component: HomeView,
        },
        {
          path: '/profile',
          name: 'profile',
          // route level code-splitting
          // this generates a separate chunk (Profile.[hash].js) for this route
          // which is lazy-loaded when the route is visited.
          component: ProfileView,
        },
        {
          path: '/about',
          name: 'about',
          // route level code-splitting
          // this generates a separate chunk (About.[hash].js) for this route
          // which is lazy-loaded when the route is visited.
          component: AboutView,
        },
        {
          path: '/theme-preview',
          name: 'theme-preview',
          // @ts-ignore
          component: () => import('../views/ThemeView.vue'),
        },
        {
          path: '/movements/new',
          name: 'movements-new',
          component: ReportMovementView,
        },
      ],
    },
  ],
});

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    console.info('[router] beforeEach checking auth');
    const authStore = useAuthStore();
    if (!authStore.isLoggedIn) {
      next({ name: 'login' });
    }
  }
  next();
});

export default router;
