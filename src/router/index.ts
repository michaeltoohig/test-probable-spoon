import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '@/views/LoginView.vue';
import BaseLayout from '@/views/BaseLayout.vue';
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
      component: () => import('../views/LogoutView.vue'),
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
          component: () => import('../views/HomeView.vue'),
        },
        {
          path: '/profile',
          name: 'profile',
          // route level code-splitting
          // this generates a separate chunk (Profile.[hash].js) for this route
          // which is lazy-loaded when the route is visited.
          component: () => import('../views/ProfileView.vue'),
        },
        {
          path: '/about',
          name: 'about',
          // route level code-splitting
          // this generates a separate chunk (About.[hash].js) for this route
          // which is lazy-loaded when the route is visited.
          component: () => import('../views/AboutView.vue'),
        },
        {
          path: '/theme-preview',
          name: 'theme-preview',
          component: () => import('../views/ThemeView.vue'),
        },
        {
          path: '/movements/new',
          name: 'movements-new',
          component: () => import('../views/ReportMovementView.vue'),
        },
      ],
    },
  ],
});

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    console.log('check auth');
    const authStore = useAuthStore();
    if (!authStore.isLoggedIn) {
      next({ name: 'login' });
    }
  }
  next();
});

export default router;
