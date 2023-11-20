<script setup>
import { computed, getCurrentInstance, onMounted, reactive } from 'vue'
import store from '../../store'

const instance = getCurrentInstance()
const props = defineProps(['data'])
const data = reactive({
  w: store.getters['Storage/get']('sidebarWidth'),
  x: 0
})
const elClass = computed(() => instance.root.proxy['sidebarShow'] ? '' : '!w-0')

onMounted(() => {
  instance.vnode.el.style.width = data.w ? data.w + 'px' : ''
})

const methods = {
  resizerDown (event) {
    instance.refs.resizer.classList.add('app-sidebar__resizer__active')
    data.x = event.clientX
    data.w = instance.vnode.el.offsetWidth
  },
  resizerUp () {
    instance.refs.resizer.classList.remove('app-sidebar__resizer__active')
    store.dispatch('Storage/set', { sidebarWidth: instance.vnode.el.offsetWidth })
  },
  resizerMove (event) {
    let w = data.w + (event.clientX - data.x)

    if (w > window.innerWidth / 2 || w < 50) {
      return
    }

    instance.vnode.el.style.width = w + 'px'
  }
}
</script>

<template>
  <div class="app-sidebar" :class="elClass">
    <div class="app-sidebar__body">
      Sidebar
    </div>
    <div class="app-sidebar__resizer" ref="resizer" @mousedown="methods.resizerDown">
      <div class="app-sidebar__resizer__bg"/>
      <div class="app-sidebar__resizer__overlay" @mouseup="methods.resizerUp" @mousemove="methods.resizerMove"/>
    </div>
  </div>
</template>

<style scoped>
.app-sidebar {
  @apply relative overflow-hidden
}
.app-sidebar__body {
  @apply text-gray-800 bg-white dark:text-gray-50 dark:bg-gray-800 h-full flex border-r
}
.app-sidebar__resizer {
  @apply absolute top-0 right-0 h-full w-1
}
.app-sidebar__resizer__bg {
  @apply w-full h-full hover:bg-blue-600 cursor-col-resize transition
}
.app-sidebar__resizer__active .app-sidebar__resizer__bg {
  @apply bg-blue-600
}
.app-sidebar__resizer__overlay {
  @apply fixed z-50 left-0 top-0 right-0 bottom-0 hidden
}
.app-sidebar__resizer__active .app-sidebar__resizer__overlay {
  @apply block cursor-col-resize
}
</style>
