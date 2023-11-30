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

function assets (assets) {
  if (assets.length) {
    assets.forEach(i => {
      switch (i.rel) {
        case 'plugin':
          import(/* @vite-ignore */i.src).then(j => {
            Vue.use(j.default)
          })
          break

        case 'component':
          import(/* @vite-ignore */i.src).then(j => {
            Vue.component(j.default.name, j.default)
          })
          break

        case 'manifest':
          const fragment = document.createRange().createContextualFragment(i.source)
          document.head.appendChild(fragment)
          break

        case 'module':
          const script = document.createElement('script')
          script.setAttribute('src', i.src)
          script.setAttribute('type', 'module')
          script.setAttribute('crossorigin', 'anonymous')
          document.head.appendChild(script)
          break

        case 'css':
          document.head.innerHTML += `<link rel="stylesheet" href="${i.src}">`
          break
      }
    })
  }
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

      data.assets && assets(data.assets)

      const components = import.meta.glob('./components/*/*.vue', { eager: true })
      const loadedComponents = []

      Object.entries(components).forEach(([path, { default: module }]) => {
        const name = path.replace(/\.\/components\/(.*?)\/\w+\.vue/, '$1')
        const moduleName = module.name ?? module.__name ?? path.replace(/\.\/components\/.*?\/(\w+)\.vue/, '$1')
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

      store.dispatch('Storage/set', { config: data['config'] || {} })

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
