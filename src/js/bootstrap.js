import _ from 'lodash'
import axios from 'axios'
import store from './store'
import router from './router'

window._ = _
window.axios = axios

window.axios.defaults.headers.common['Accept'] = 'application/json'
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'

window.axios.interceptors['request'].use(function (config) {
  config.baseURL = (store.getters['Storage/get']('hostname') || location.origin).replace(/\/$/g, '')

  const token = store.getters['Storage/get']('token')
  const lang = store.getters['Storage/get']('lang')

  if (token) {
    config.headers['Authorization'] = 'Bearer ' + token
  }

  if (lang) {
    config.headers['Accept-Language'] = lang
  }

  if (!config.url) {
    return config
  }

  if (/^(http|https):\/\/[^ "]+$/.test(config.url)) {
    const url = new URL(config.url)
    config.baseURL = url.origin
    config.url = url.href.replace(url.origin, '')
  }

  const params = Object.assign(
    {},
    Object.values(config.params || {}).length && config.params,
    Object.values(router.currentRoute.value.params).length && router.currentRoute.value.params
  )

  Object.entries(params).forEach(([k, v]) => {
    if (!(v === undefined || v === null)) {
      const re = new RegExp(':' + k, 'g')

      if (re.test(config.url)) {
        //delete params[k]
      }

      config.url = config.url.replace(re, encodeURIComponent(v.toString())).replace(/\/\//g, '/').replace(/\/$/, '')
    }
  })

  config.url = config.url.replace(/(:\w+)/, '').replace(/^\w+:\/\/[^\/]+/, '')

  return config
}, error => {
  return Promise.reject(error)
})

axios.interceptors['response'].use(response => response, error => {
  const status = error.response?.status ?? 500

  if (status === 401) {
    store.dispatch('Storage/del', 'token')
    return router.push({ name: 'Login' })
  }

  if (error.response?.data?.message) {
    if (status === 422) {
      // notify({
      //   text: error.response.data.message,
      //   type: 'error'
      // })
    } else {
      // store.dispatch('GlobalTabs/del', router.currentRoute.value).then(() => notify({
      //   text: error.response.data.message,
      //   type: 'error'
      // }))
    }
  } else if (error.message) {
    // notify({
    //   text: error.message,
    //   type: 'error'
    // })

    if (!status) {
      store.dispatch('Storage/del', 'token')
      return router.push({ name: 'Login' })
    }
  }

  return Promise.reject(error)
})
