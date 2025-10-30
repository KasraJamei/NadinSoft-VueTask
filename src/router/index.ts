
import { createRouter, createWebHistory } from 'vue-router';

// توجه: باید مطمئن شوید که تمام View ها در مسیرهای درست وجود دارند.

import DashboardView from '../views/DashboardView.vue';

import TodosView from '../views/TodosView.vue';

import WeatherView from '../views/WeatherView.vue';

import ProfileView from '../views/ProfileView.vue';



const router = createRouter({

  // استفاده از import.meta.env.BASE_URL که توسط Vite تنظیم می‌شود

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

    // مسیر Catch-All برای هدایت آدرس‌های اشتباه به داشبورد

    {

      path: '/:catchAll(.*)',

      redirect: '/',

    }

  ],

});


export default router;


