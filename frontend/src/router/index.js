import { defineRouter } from '#q-app'
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router'
import axios from 'axios'

import routes from './routes.js'
import { API_URL } from '../services/api.js'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter((/* { store, ssrContext } */) => {
  const createHistory = import.meta.env.QUASAR_SERVER
    ? createMemoryHistory
    : import.meta.env.QUASAR_VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(import.meta.env.QUASAR_VUE_ROUTER_BASE),
  })

  Router.beforeEach(async (to) => {
    if (!to.path.startsWith('/admin')) return true

    const token = localStorage.getItem('glow_token')

    if (!token) {
      return to.path === '/admin/login' ? true : '/admin/login'
    }

    try {
      const respuesta = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const usuario = respuesta.data.user

      localStorage.setItem('glow_user', JSON.stringify(usuario))

      if (usuario.role !== 'admin') {
        return to.path === '/admin/login' ? '/' : '/'
      }

      return to.path === '/admin/login' ? '/admin' : true
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('glow_token')
        localStorage.removeItem('glow_user')
        return to.path === '/admin/login' ? true : '/admin/login'
      }

      if (error.response?.status === 403) {
        localStorage.removeItem('glow_token')
        localStorage.removeItem('glow_user')
        return '/'
      }

      if (to.path === '/admin/login') return true
      return '/admin/login'
    }
  })

  return Router
})
