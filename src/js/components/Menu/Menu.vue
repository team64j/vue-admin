<script setup>
import MenuItem from './MenuItem.vue'
import { getCurrentInstance } from 'vue'

const instance = getCurrentInstance()
const $props = defineProps(['data'])

document.addEventListener('click', event => {
  const target = event.target.closest('li')
  if (target && target.closest('.app-menu')) {
    if (target.classList.contains('app-menu__parent') || event.target.closest('a')) {
      instance.root.proxy['menuShow'] = !instance.root.proxy['menuShow']
    }
  } else if (target?.firstElementChild.classList.contains('app-menu__pagination') ||
      target?.firstElementChild.classList.contains('app-menu__filter')) {
    //
  } else {
    instance.root.proxy['menuShow'] = false
  }
})
</script>

<template>
  <div class="app-menu" :class="{ 'app-menu__active' : instance.root.proxy['menuShow']}">
    <ul>
      <component :is="MenuItem" v-for="i in $props.data" :data="i"/>
    </ul>
  </div>
</template>

<style>
.app-menu.app-menu__active {
  @apply z-50
}
.app-menu > ul {
  @apply justify-between px-1 border-b select-none
}
.app-menu ul, .app-menu li {
  @apply flex cursor-default
}
.app-menu > ul > li li {
  @apply flex items-center justify-between grow transition
}
.app-menu > ul > li {
  @apply my-1 rounded
}
.app-menu > ul > li > ul > li > * {
  @apply rounded
}
.app-menu > ul > li li.app-menu__hover > a, .app-menu > ul > li li.app-menu__hover > span {
  @apply bg-slate-100 dark:bg-gray-600
}
.app-menu li > a, .app-menu li > span {
  @apply flex items-center py-2 px-4 w-full h-full
}
.app-menu > ul > li > ul > li li.app-menu__hover > a {
  @apply bg-blue-600 text-white dark:bg-blue-600
}
.app-menu li .app-menu__icon {
  @apply w-5 text-center
}
.app-menu li img {
  @apply -my-1 -mx-1.5 min-w-[2rem] max-w-none max-h-none h-8 w-auto block relative
}
.app-menu li .app-menu__title {
  @apply grow
}
.app-menu > ul > li > ul > li > a .app-menu__title, .app-menu > ul > li > ul > li > span .app-menu__title {
  @apply hidden md:inline-block
}
.app-menu li .app-menu__icon + .app-menu__title {
  @apply ml-3
}
.app-menu li .app-menu__locked {
  @apply text-rose-500 text-sm leading-[0] ml-2
}
.app-menu li .app-menu__id {
  @apply ml-2
}
.app-menu li .app-menu__toggle {
  @apply ml-2 -mr-1 inline-flex items-center justify-center h-full opacity-70
}
.app-menu li .app-menu__toggle i {
  @apply text-sm pointer-events-none transition
}
.app-menu.app-menu__active > ul > li > ul > li.app-menu__hover > * > .app-menu__toggle i {
  @apply rotate-180
}
.app-menu > ul > li li li .app-menu__toggle i {
  @apply -rotate-90
}
.app-menu li .app-menu__pagination {
  @apply flex grow items-center px-3 py-2 select-none
}
.app-menu li .app-menu__pagination .app-menu__prev, .app-menu li .app-menu__pagination .app-menu__next {
  @apply px-2 py-1 rounded text-blue-500 cursor-pointer hover:text-blue-600 hover:bg-white/10
}
.app-menu li .app-menu__pagination .app-menu__prev[disabled], .app-menu li .app-menu__pagination .app-menu__next[disabled] {
  @apply opacity-20 pointer-events-none
}
.app-menu li .app-menu__pagination span {
  @apply grow text-center opacity-80
}
.app-menu li .app-menu__filter {
  @apply relative w-full px-3 py-1
}
.app-menu li .app-menu__filter input {
  @apply pl-2 pr-6 py-0.5 mt-[1px]
}
.app-menu li .app-menu__filter .app-menu__clear {
  @apply text-rose-500 cursor-pointer absolute z-10 top-3 right-6
}
.app-menu > ul > li > ul > li.app-menu__parent {
  @apply md:relative
}
.app-menu > ul > li > ul > li.app-menu__parent > ul {
  @apply mt-1
}
.app-menu > ul > li > ul li.app-menu__parent > ul {
  @apply absolute opacity-0 invisible top-full left-0 flex-col min-w-full md:min-w-[18rem] rounded py-1 shadow-2xl bg-white dark:bg-gray-700 transition;
  max-height: calc(100vh - 3.5rem);
}
.app-menu > ul > li:last-of-type li.app-menu__parent > ul {
  @apply left-auto right-0
}
.app-menu > ul > li > ul li li.app-menu__parent > ul {
  @apply md:left-full top-0
}
.app-menu.app-menu__active li.app-menu__parent.app-menu__hover > ul {
  @apply opacity-100 visible z-10
}
</style>
