<script>
import SearchComponent from './components/Search/Search.vue'
import MenuComponent from './components/Menu/Menu.vue'
import GlobalTabs from './components/GlobalTabs.vue'
import Sidebar from './components/Sidebar/Sidebar.vue'
import store from './store'

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
    search: {
      set (value) {
        store.dispatch('Storage/set', { search: value })
      },
      get () {
        return store.getters['Storage/get']('search', 0)
      }
    },
  }
}
</script>

<template>
  <div class="w-full h-full flex flex-col">
    <search-component ref="search"/>
    <menu-component ref="menu" :data="layout['menu']" class="grow-0 relative z-20"/>
    <div class="grow-1 flex flex-row h-full overflow-hidden relative z-10">
      <sidebar ref="sidebar" :data="layout['sidebar']" class="grow-0 shrink-0 w-72 flex flex-col"/>
      <global-tabs class="flex grow basis-0 overflow-hidden"/>
    </div>
  </div>
</template>

<style scoped>

</style>
