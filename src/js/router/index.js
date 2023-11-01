import { createRouter, createWebHashHistory } from 'vue-router'
import store from '../store'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../pages/Login.vue'),
      meta: {
        hidden: true
      }
    },
    {
      path: '/logout',
      name: 'Logout',
      component: () => import('../pages/Logout.vue'),
      meta: {
        hidden: true
      }
    },
    {
      path: '/redirect',
      name: 'Redirect',
      component: () => import('../pages/Redirect.vue'),
      children: [
        {
          path: '/redirect/:path(.*)',
          name: 'RedirectChild',
          component: () => import('../pages/Redirect.vue')
        }
      ],
      meta: {
        hidden: true
      }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('../pages/NotFound.vue'),
      meta: {
        icon: ''
      }
    }
  ]
})

router.beforeEach((to, from, next) => {
  const token = store.getters['Storage/get']('token')

  if ((!token && to.name !== 'Login') || (token && to.name === 'Login' && from.path === '/')) {
    store.dispatch('Storage/del', 'token')
    next({ name: 'Login' })
  } else if (token && to.name === 'Login') {
    next('/')
  } else {
    next()
  }
})

export default router
