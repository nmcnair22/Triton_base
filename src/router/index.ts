import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        title: 'Dashboard - Triton Design System',
      },
    },
    {
      path: '/components',
      name: 'components',
      component: () => import('../views/ComponentsDemo.vue'),
      meta: {
        title: 'Components - Triton Design System',
      },
    },
    {
      path: '/forms',
      name: 'forms',
      component: () => import('../views/FormsDemo.vue'),
      meta: {
        title: 'Forms - Triton Design System',
      },
    },
    {
      path: '/tables',
      name: 'tables',
      component: () => import('../views/TablesDemo.vue'),
      meta: {
        title: 'Tables - Triton Design System',
      },
    },
    // Redirect old routes
    {
      path: '/about',
      redirect: '/components',
    },
    // Catch-all 404 route
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      redirect: '/',
    },
  ],
})

// Update document title on route change
router.beforeEach(to => {
  if (to.meta?.title) {
    document.title = to.meta.title as string
  }
})

export default router
