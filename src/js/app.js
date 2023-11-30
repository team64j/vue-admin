import './bootstrap'
import '../css/app.css'
import * as vue from 'vue'
import { defineAsyncComponent } from 'vue'
import router from './router'
import store from './store'
import App from './App.vue'
import Component from './components/Component.vue'
import IconLoader from './components/Layout/IconLoader.vue'

window.vue = vue

function login () {
  router.push({ name: 'Login' }).then(() => {
    window.Vue = vue.createApp(defineAsyncComponent(() => import('./pages/Login.vue')))
    window.Vue.mount('#app')
  })
}

if (store.getters['Storage/get']('token')) {
  axios.post('bootstrap').then(r => {
    const data = r.data?.['meta'] ?? {}

    if (data.routes) {
      for (const route of data.routes) {
        route.component = Component
        router.addRoute(route)
      }

      window.Vue = vue.createApp(App, {
        layout: r.data?.['layout'] ?? {}
      })

      window.Vue.use(router)
      window.Vue.use(store)

      const components = import.meta.glob('./components/*/*.vue', { eager: true })
      const loadedComponents = []

      Object.entries(components).forEach(([path, { default: module }]) => {
        const name = path.replace(/\.\/components\/(.*?)\/\w+\.vue/, '$1')
        const moduleName = module.name ?? module.__name
        let componentName = ``

        if (moduleName === name) {
          componentName = `Evo` + name
        } else if (moduleName && !~moduleName.indexOf(name)) {
          componentName = `Evo` + name + moduleName
        }

        if (componentName) {
          window.Vue.component(componentName, module)
          loadedComponents.push(componentName)
        }
      })

      console.log(loadedComponents)

      window.Vue.component('IconLoader', IconLoader)

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
