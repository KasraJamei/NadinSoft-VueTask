// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';

// Import views
import DashboardView from '@/views/DashboardView.vue';
import TodosView from '@/views/TodosView.vue';
import WeatherView from '@/views/WeatherView.vue';
import ProfileView from '@/views/ProfileView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
    },
    {
      path: '/todos',
      name: 'todos',
      component: TodosView,
    },
    {
      path: '/weather',
      name: 'weather',
      component: WeatherView,
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
    },
    // Catch-all → redirect to dashboard
    {
      path: '/:catchAll(.*)',
      redirect: '/',
    },
  ],
});

export default router;