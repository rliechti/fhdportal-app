import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth'

import MainRoutes from './MainRoutes';

export const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/:pathMatch(.*)*',
            component: () => import('@/views/Error404.vue')
        },
        MainRoutes
    ]
});
router.beforeEach(async (to) => {
  const store = useAuthStore()

  if (!store.authenticated && !to.meta.allowAnonymous) {
    store.login()
    return false
  }
})
