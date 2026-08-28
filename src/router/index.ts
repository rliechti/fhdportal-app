import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth'
import { notify } from '@kyvg/vue3-notification'

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

  if (to.meta.requiresRole && !store.user.roles?.includes(to.meta.requiresRole)) {
    notify({ type: 'warning', text: 'You do not have permission to access this page.' })
    return { name: 'Home' }
  }
})
