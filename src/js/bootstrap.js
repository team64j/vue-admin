import _ from 'lodash'
import axios from 'axios'
import store from './store'
import router from './router'

navigator.mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 769

if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
  document.documentElement.classList.add('ios')
}

if (navigator.mobile) {
  document.documentElement.classList.add('mobile')
}

axios.defaults.headers.common['Accept'] = 'application/json'
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'

axios.interceptors['request'].use(config => {
  config.baseURL = (store.getters['Storage/get']('hostname') || location.origin).replace(/\/$/g, '')

  config.headers['Authorization'] = 'Bearer ' + store.getters['Storage/get']('token', '')
  config.headers['Accept-Language'] = store.getters['Storage/get']('lang', 'en')

  if (!config.url) {
    return config
  }

  if (/^(http|https):\/\/[^ "]+$/.test(config.url)) {
    const url = new URL(config.url)
    config.baseURL = url.origin
    config.url = url.href.replace(url.origin, '')
  }

  //config.headers['Referer'] = (new URL(config.baseURL)).origin + '/'

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

window._ = _
window.axios = axios
