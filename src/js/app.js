import './bootstrap'
import '../css/app.css'
import * as vue from 'vue'
import { defineAsyncComponent } from 'vue'
import router from './router'
import store from './store'
import App from './App.vue'
import Component from './components/Component.vue'
import LoaderIcon from './components/LoaderIcon.vue'

window.vue = vue

function login () {
  router.push({ name: 'Login' }).then(() => {
    window.Vue = vue.createApp(defineAsyncComponent(() => import('./pages/Login.vue')))
    window.Vue.mount('#app')
  })
}

if (store.getters['Storage/get']('token')) {
  axios.post('bootstrap').then(r => {
    if (r.data.routes) {
      for (const route of r.data.routes) {
        route.component = Component
        router.addRoute(route)
      }

      window.Vue = vue.createApp(App, {
        layout: r.data.layout
      })

      window.Vue.use(router)
      window.Vue.use(store)

      const components = import.meta.glob('./components/!*!/!*.vue', { eager: true })

      Object.entries(components).forEach(([path, { default: module }]) => {
        const name = path.replace(/\.\/components\/(.*?)\/\w+\.vue/, '$1')

        if (module.name === name) {
          window.Vue.component('Vue' + module.name, module)
        }
      })

      window.Vue.component('LoaderIcon', LoaderIcon)

      window.Vue.mount('#app')
    } else {
      login()
    }
  }).catch(() => {
    login()
  })
} else {
  login()
}
