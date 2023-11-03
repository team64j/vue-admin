<script>
import { h } from 'vue'

export default {
  name: 'MenuItem',
  props: {
    data: [Object, Array],
    level: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      active: false
    }
  },
  computed: {
    icon () {
      let icon = null
      if (this.data['icons'] && this.$root[this.data['key']] !== undefined) {
        const key = this.$root[this.data['key']].toString()
        for (const i in this.data['icons']) {
          if (i === key) {
            icon = this.data['icons'][i]['key']
            break
          }
        }
      }

      icon = this.data['icon'] ?? null

      if (icon) {
        return h('i', {
          class: icon
        })
      }
    },
    title () {
      return this.data['name'] && h('span', this.data['name']) || null
    },
    toggle () {
      return this.data['data'] && this.level && h('i', {
        class: 'ml-1 text-sm'
      }, h('i', { class: 'fa fa-chevron-down fa-fw' }))
    }
  },
  methods: {
    onClick () {
      if (this.data['icons'] && this.$root[this.data['key']] !== undefined) {
        const key = this.$root[this.data['key']].toString()
        for (const i in this.data['icons']) {
          if (i === key) {
            this.$root[this.data['key']] = this.data['icons'][i]['value']
          }
        }
      }

      if (this.data['click'] && this.$root[this.data['click']]) {
        return this.$root[this.data['click']]()
      }
    }
  }
}
</script>

<template>
  <li :data-level="level">
    <a v-if="data['href']" :href="data['href']" target="_blank">
      <component :is="icon"/>
      <component :is="title"/>
      <component :is="toggle"/>
    </a>

    <router-link v-else-if="data['to']" :to="data['to']">
      <component :is="icon"/>
      <component :is="title"/>
      <component :is="toggle"/>
    </router-link>

    <span v-else @click="onClick(data)" :class="[ data['click'] || data['icons'] ? 'cursor-pointer' : '' ]">
      <component :is="icon"/>
      <component :is="title"/>
      <component :is="toggle"/>
    </span>

    <ul v-if="data['data']">
      <menu-item v-for="i in data['data']" :data="i" :level="level + 1"/>
    </ul>
  </li>
</template>

<style scoped>
ul, li {
  @apply flex relative cursor-default
}
li > a, li > span {
  @apply flex items-center grow rounded
}
li > span > i + span, li > a > i + span {
  @apply ml-2
}
li[data-level="0"]:last-of-type > ul > li > ul {
  @apply left-auto right-0
}
li[data-level="0"] li > ul {
  @apply absolute hidden top-full left-0 flex-col min-w-[15rem] bg-white dark:bg-gray-700 rounded py-0.5 px-0.5 shadow-lg
}
li[data-level="0"] li:hover > ul {
  @apply flex shadow-lg
}
li[data-level="0"] li > a:hover, li[data-level="0"] li:hover > a, li[data-level="0"] li > span:hover, li[data-level="0"] li:hover > span {
  @apply bg-slate-50 dark:bg-gray-600
}
li[data-level="1"] > a, li[data-level="1"] > span {
  @apply py-2 px-4 my-1
}
li[data-level="1"] li > a, li[data-level="1"] li > span {
  @apply py-1.5 px-3
}
li[data-level="1"] li > a:hover {
  @apply bg-blue-600 text-white dark:bg-blue-600
}
</style>
