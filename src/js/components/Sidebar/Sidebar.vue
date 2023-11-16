<script>
import store from '../../store'

export default {
  name: 'Sidebar',
  props: {
    data: [null, Object, Array]
  },
  data () {
    return {
      w: store.getters['Storage/get']('sidebarWidth'),
      x: 0
    }
  },
  mounted () {
    this.$el.style.width = this.w ? this.w + 'px' : ''
  },
  methods: {
    resizerDown (event) {
      this.$refs.resizer.classList.add('active')
      this.x = event.clientX
      this.w = this.$root.$refs.sidebar.$el.offsetWidth
    },
    resizerUp () {
      this.$refs.resizer.classList.remove('active')
      store.dispatch('Storage/set', { sidebarWidth: this.$root.$refs.sidebar.$el.offsetWidth })
    },
    resizerMove (event) {
      let w = this.w + (event.clientX - this.x)

      if (w > window.innerWidth / 2 || w < 50) {
        return
      }

      this.$root.$refs.sidebar.$el.style.width = w + 'px'
    }
  }
}
</script>

<template>
  <div class="app-sidebar relative overflow-hidden" :class="[ $root.sidebarShow ? '' : '!w-0']">
    <div class="text-gray-800 bg-white dark:text-gray-50 dark:bg-gray-800 h-full flex border-r">Sidebar</div>
    <div class="sidebar-resizer absolute top-0 right-0 h-full w-1"
         ref="resizer"
         @mousedown="resizerDown">
      <div class="sidebar-resizer-bg w-full h-full hover:bg-blue-600 cursor-col-resize transition"/>
      <div class="sidebar-resizer-overlay fixed z-50 left-0 top-0 right-0 bottom-0 hidden"
           @mouseup="resizerUp"
           @mousemove="resizerMove"/>
    </div>
  </div>
</template>

<style scoped>
.sidebar-resizer.active .sidebar-resizer-overlay {
  @apply block cursor-col-resize
}
.sidebar-resizer.active .sidebar-resizer-bg {
  @apply bg-blue-600
}
</style>
