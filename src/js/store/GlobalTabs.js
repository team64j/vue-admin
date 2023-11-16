import router from '../router'

const state = {
  tabs: [],
  keys: [],
  data: {},
  active: {}
}

const mutations = {
  init () {
    const fixed = router.getRoutes().filter(i => i?.meta?.fixed).map(i => router.resolve(i))
    for (const data of fixed) {
      this.dispatch('GlobalTabs/add', data)
    }

    if (router.currentRoute.value.path !== '/') {
      this.dispatch('GlobalTabs/add', router.currentRoute.value)
    }
  },

  add (state, data) {
    if (!data) {
      return
    }

    data = router.resolve(data)

    if (data.meta['title'] === undefined) {
      data.meta['title'] = data.name + (data?.params?.id ? ' ' + data.params.id : '')
    }

    let is = false

    state.tabs.map(i => {
      i.active = data.meta.group ? i.name === data.name : i.path === data.path

      if (i.active) {
        is = true
        data.meta = i.meta
        Object.assign(i, data)
      }
    })

    if (!is && !data.meta['hidden']) {
      data.active = true
      state.tabs.push(data)
    }

    state.keys = state.tabs.map(i => i.meta.group ? i.name : i.path)
    state.active = state.tabs.filter(i => i.active)[0]
  },

  set (state, data) {
    if (data.key) {
      const index = state.keys.indexOf(data.key)
      index > -1 && window._.mergeWith(state.tabs[index], data)
    } else {
      state.tabs.map(i => i.active && window._.mergeWith(i, data))
    }
    state.active = state.tabs.filter(i => i.active)[0]
  },

  del (state, data, callback) {
    if (!data) {
      return
    }

    data = state.tabs.filter(i => i.meta.group ? i.name === data.name : i.path === data.path)[0]

    if (!data) {
      return
    }

    if (data?.meta.fixed) {
      return
    }

    const index = state.tabs.indexOf(data)

    if (data.active && index > 0 && state.tabs[index - 1]) {
      state.tabs[index - 1].active = true
      state.active = state.tabs[index - 1]
      router.push(state.tabs[index - 1]).then(() => {
        if (typeof callback === 'function') {
          callback()
        }
      })
    }

    if (state.data[data.path]) {
      delete state.data[data.path]
    }

    this.commit('set', { treeSelect: false })

    index > -1 && state.tabs.splice(index, 1) && state.keys.splice(index, 1)
    state.active = state.tabs.filter(i => i.active)[0]

    return index
  },

  destroy (state) {
    state.tabs = []
    state.keys = []
    state.data = {}
    state.active = {}
  },

  to (state, data) {
    this.commit('GlobalTabs/del', router.currentRoute.value)
    router.push(data).then(() => {})
  },

  reload (state, data) {
    const route = router.resolve({ path: '/redirect' + data.path, query: data.query })

    router.replace(route).then(() => {
      const index = state.keys.indexOf(data.meta.group ? data.name : data.path)
      index > -1 && state.keys.splice(index, 1)
    })
  },

  setFullData (state, data) {
    const storeKey = data.storeKey || router.resolve({}).path

    state.data[storeKey] = data
  },

  updateData (state, data) {
    const storeKey = data.storeKey || router.resolve({}).path
    state.data[storeKey].data[data.key] = data.value
  },

  updateMeta (state, data) {
    const storeKey = data.storeKey || router.resolve({}).path
    state.data[storeKey].meta[data.key] = data.value
  }
}

const actions = {
  init ({ commit }) {
    commit('init')
  },

  add ({ commit }, data) {
    commit('add', data)
  },

  set ({ commit }, data) {
    commit('set', data)
  },

  del ({ commit, dispatch }, data, callback) {
    return commit('del', data, callback)
  },

  destroy ({ commit }) {
    return commit('destroy')
  },

  to ({ commit }, data) {
    return commit('to', data)
  },

  reload ({ commit }, data) {
    commit('reload', data)
  },

  setFullData ({ commit }, data) {
    commit('setFullData', data)
  },

  updateData ({ commit }, data) {
    commit('updateData', data)
  },

  updateMeta ({ commit }, data) {
    commit('updateMeta', data)
  }
}

const getters = {
  tabs: (state) => () => state.tabs,

  keys: (state) => () => state.keys,

  frames: (state) => () => state.tabs.filter(i => i?.meta?.isIframe),

  get: (state) => (data) => {
    const tab = state.tabs.filter(i => i.meta.group ? i.name === data.name : i.path === data.path)[0] || null

    return tab && !Object.values(data.query).length && Object.values(tab.query).length && tab || false
  },

  active: (state) => state.active,

  find: (state) => (data) => {
    return state.tabs.filter(i => i.meta.group ? i.name === data.name : i.path === data.path)[0] ||
      null
  },

  findData: (state) => (keys, data) => {
    let obj = {}
    data = data || getters.fullData(state)() || {}

    keys.forEach((key, index) => {
      if (data[key]) {
        if (keys[index + 1]) {
          keys.shift()
          obj = getters.findData(state)(keys, data[key])
        } else {
          obj = data[key]
        }
      }
    })

    return obj
  },

  fullData: (state) => (key) => {
    const storeKey = router.resolve({}).path
    return state.data?.[storeKey]?.[key] || state.data?.[storeKey]
  },

  data: (state) => (key) => {
    const storeKey = router.resolve({}).path
    return state.data?.[storeKey]?.data?.[key]
  },

  meta: (state) => (key) => {
    const storeKey = router.resolve({}).path
    return state.meta?.[storeKey]?.meta?.[key]
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
