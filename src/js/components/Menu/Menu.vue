<script>
import MenuItem from './MenuItem.vue'

export default {
  name: 'Menu',
  components: { MenuItem },
  props: {
    data: [null, Object, Array]
  },
  created () {
    document.addEventListener('click', event => {
      const target = event.target.closest('li')
      if (target && target.closest('.app-menu')) {
        if (target.classList.contains('parent') || event.target.closest('a')) {
          this.$el.classList.toggle('active')
        }
      } else if (target?.firstElementChild.classList.contains('pagination') ||
          target?.firstElementChild.classList.contains('filter')) {

      } else {
        this.$el.classList.contains('active') && this.$el.classList.remove('active')
      }
    })
  },
  methods: {
    click (event) {
      const target = event.target.closest('li')

      if (target) {
        target.dataset['level'] === '1' && target.classList.contains('parent') && this.$el.classList.toggle('active')
      } else {
        this.$el.classList.remove('active')
      }
    }
  }
}
</script>

<template>
  <div class="app-menu">
    <ul>
      <menu-item v-for="i in data" :data="i"/>
    </ul>
  </div>
</template>

<style>
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
.app-menu > ul > li li.hover > a, .app-menu > ul > li li.hover > span {
  @apply bg-slate-100 dark:bg-gray-600
}
.app-menu li > a, .app-menu li > span {
  @apply flex items-center py-2 px-4 w-full h-full
}
.app-menu > ul > li > ul > li li.hover > a {
  @apply bg-blue-600 text-white dark:bg-blue-600
}
.app-menu li .icon {
  @apply w-5 text-center
}
.app-menu li img {
  @apply -my-1 -mx-1.5 min-w-[2rem] max-w-none max-h-none h-8 w-auto block relative
}
.app-menu li .title {
  @apply grow
}
.app-menu > ul > li > ul > li > a .title, .app-menu > ul > li > ul > li > span .title {
  @apply hidden md:inline-block
}
.app-menu li .icon + .title {
  @apply ml-3
}
.app-menu li .locked {
  @apply text-rose-500 text-sm leading-[0] ml-2
}
.app-menu li .id {
  @apply ml-2
}
.app-menu li .toggle {
  @apply ml-2 -mr-1 inline-flex items-center justify-center h-full opacity-70
}
.app-menu li .toggle i {
  @apply text-sm pointer-events-none transition
}
.app-menu.active > ul > li > ul > li.hover > * > .toggle i {
  @apply rotate-180
}
.app-menu > ul > li li li .toggle i {
  @apply -rotate-90
}
.app-menu li .pagination {
  @apply flex grow items-center px-3 py-2 select-none
}
.app-menu li .pagination .prev, .app-menu li .pagination .next {
  @apply px-2 py-1 rounded text-blue-500 cursor-pointer hover:text-blue-600 hover:bg-white/10
}
.app-menu li .pagination .prev[disabled], .app-menu li .pagination .next[disabled] {
  @apply opacity-20 pointer-events-none
}
.app-menu li .pagination span {
  @apply grow text-center opacity-80
}
.app-menu li .filter {
  @apply relative w-full px-3 py-1
}
.app-menu li .filter input {
  @apply pl-2 pr-6 py-0.5 mt-[1px]
}
.app-menu li .filter .clear {
  @apply text-rose-500 cursor-pointer absolute z-10 top-3 right-6
}
.app-menu > ul > li > ul > li.parent {
  @apply md:relative
}
.app-menu > ul > li > ul > li.parent > ul {
  @apply mt-1
}
.app-menu > ul > li > ul li.parent > ul {
  @apply absolute opacity-0 invisible top-full left-0 flex-col min-w-full md:min-w-[18rem] rounded py-1 shadow-2xl bg-white dark:bg-gray-700 transition;
  max-height: calc(100vh - 3.5rem);
}
.app-menu > ul > li:last-of-type li.parent > ul {
  @apply left-auto right-0
}
.app-menu > ul > li > ul li li.parent > ul {
  @apply md:left-full top-0
}
.app-menu.active li.parent.hover > ul {
  @apply opacity-100 visible z-10
}
</style>
