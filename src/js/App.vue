<script>
import SearchComponent from './components/Search/Search.vue'
import MenuComponent from './components/Menu/Menu.vue'
import GlobalTabs from './components/GlobalTabs.vue'
import Sidebar from './components/Sidebar/Sidebar.vue'
import store from './store'
import router from './router'

export default {
  name: 'App',
  components: { Sidebar, GlobalTabs, MenuComponent, SearchComponent },
  props: {
    layout: Object
  },
  data () {
    return {}
  },
  computed: {
    dark: {
      set (key) {
        store.dispatch('Storage/set', { dark: key })
      },
      get () {
        const key = store.getters['Storage/get']('dark', 0)
        document.documentElement.classList.toggle('dark', !parseInt(key))
        return key
      }
    },
    menuShow: {
      set (value) {
        store.dispatch('Storage/set', { menuShow: value })
      },
      get () {
        return store.getters['Storage/get']('menuShow', false)
      }
    },
    sidebarShow: {
      set (value) {
        store.dispatch('Storage/set', { sidebarShow: value })
      },
      get () {
        return store.getters['Storage/get']('sidebarShow', 1)
      }
    },
    searchShow: {
      set (value) {
        store.dispatch('Storage/set', { searchShow: value })
      },
      get () {
        return store.getters['Storage/get']('searchShow', 0)
      }
    },
  },
  methods: {
    action () {
      if (typeof this[arguments[0]] === 'function') {
        this[arguments[0]](...Array.from(arguments).splice(1))
      } else {
        this.$emit('action', ...arguments)
      }
    },
    pushRouter (route, callback) {
      if (typeof route === 'string') {
        route = router.resolve(route)
      }

      router.push(route).then(callback)
    }
  }
}
</script>

<template>
  <div class="w-full h-full flex flex-col">
    <search-component ref="search"/>
    <menu-component ref="menu" :data="layout['menu']" class="grow-0 relative" @action="action"/>
    <div class="grow-1 flex flex-row h-full overflow-hidden relative">
      <sidebar ref="sidebar" :data="layout['sidebar']" class="grow-0 shrink-0 w-72 flex flex-col" @action="action"/>
      <global-tabs class="flex grow basis-0 overflow-hidden" @action="action"/>
    </div>
  </div>
</template>

<style scoped>

</style>
