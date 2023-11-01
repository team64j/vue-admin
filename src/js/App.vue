<script>
import MenuComponent from './components/Menu/Menu.vue'
import GlobalTabs from './components/GlobalTabs.vue'
import Sidebar from './components/Sidebar/Sidebar.vue'
import store from './store'

export default {
  name: 'App',
  components: { Sidebar, GlobalTabs, MenuComponent },
  props: {
    layout: Object
  },
  created () {
    document.documentElement.classList.toggle('dark', !store.getters['Storage/get']('dark'))
  },
  methods: {
    toggleTheme () {
      store.dispatch('Storage/set', { dark: !store.getters['Storage/get']('dark') })
      document.documentElement.classList.toggle('dark')
    }
  }
}
</script>

<template>
  <div class="w-full h-full flex flex-col">
    <menu-component :data="layout['menu']" class="grow-0 relative z-20"/>
    <div class="grow-1 flex flex-row h-full overflow-hidden relative z-10">
      <sidebar :data="layout['sidebar']" class="grow-0 shrink-0 w-72 flex flex-col border"/>
      <global-tabs class="flex grow basis-0 overflow-hidden border"/>
    </div>
  </div>
</template>

<style scoped>

</style>
