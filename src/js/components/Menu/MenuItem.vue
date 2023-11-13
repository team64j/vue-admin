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
      active: false,
      timer: 0,
      loading: false,
      propData: this.data['data'] || []
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

      icon = icon ?? this.data['icon'] ?? null

      if (icon) {
        return h('i', {
          class: icon
        })
      }
    },
    title () {
      return this.data['name'] && h('span', this.data['name']) || null
    },
    locked () {
      return this.data['locked'] && h('i', { class: 'fa fa-lock text-rose-500 text-sm leading-[0]' }) || null
    },
    id () {
      return this.data['id'] !== undefined ? h('span', this.data['id']) : null
    },
    toggle () {
      if (this.loading) {
        return h('i', {
          class: 'fa fa-circle-notch fa-fw animate-spin'
        })
      }

      return this.propData.length && this.level && h('i', {
        class: 'inline-flex items-center justify-center ml-1 text-sm opacity-70 toggle'
      }, h('i', { class: 'fa fa-chevron-down fa-fw leading-[0] transition' }))
    }
  },
  methods: {
    mouseenter () {
      if (this.$el.classList.contains('hover')) {
        return
      }

      this.$el.parentElement.parentElement.querySelectorAll('li.hover').forEach(i => {
        this.$el !== i && i.classList.remove('hover')
      })

      if (this.data['url']) {
        clearTimeout(this.timer)

        this.timer = setTimeout(() => {
          this.loading = true

          this.propData = []

          axios.get(this.data['url']).then(r => {
            this.propData = this.propData.concat(this.data['data'], (r.data['data'] || []).map(i => {
              i.to = {
                name: this.data['name'],
                params: {
                  id: i.id
                }
              }

              return i
            }))

            this.$el.classList.add('hover')
          }).finally(() => {
            this.loading = false
          })
        }, 200)
      } else {
        this.$el.classList.add('hover')
      }
    },
    mouseout () {
      clearTimeout(this.timer)
    },
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
  <li :data-level="level" :class="{ parent: this.data['data']?.length }" @mouseenter="mouseenter" @mouseleave="mouseout">

    <a v-if="data['href']" :href="data['href']" target="_blank" class="transition">
      <component :is="icon"/>
      <component :is="title"/>
      <component :is="locked"/>
      <component :is="id"/>
      <component :is="toggle"/>
    </a>

    <router-link v-else-if="data['to']" :to="data['to']" class="transition">
      <component :is="icon"/>
      <component :is="title"/>
      <component :is="locked"/>
      <component :is="id"/>
      <component :is="toggle"/>
    </router-link>

    <span v-else @click="onClick(data)" :class="[ data['click'] || data['icons'] ? 'cursor-pointer' : '' ]"
          class="transition">
      <component :is="icon"/>
      <component :is="title"/>
      <component :is="locked"/>
      <component :is="id"/>
      <component :is="toggle"/>
    </span>

    <ul v-if="propData.length">
      <menu-item v-for="i in propData" :data="i" :level="level + 1"/>
    </ul>
  </li>
</template>

<style scoped>
ul, li {
  @apply flex cursor-default
}
li > a, li > span {
  @apply flex items-center justify-between grow
}
li > a > *, li > span > * {
  @apply pointer-events-none select-none
}
li > a span, li > span span {
  @apply grow truncate
}
li > a span ~ span, li > span span ~ span {
  @apply grow-0 opacity-70
}
li > span > i + span, li > a > i + span {
  @apply ml-2
}
li[data-level="0"] {
  @apply px-1 relative
}
li[data-level="0"]:last-of-type > ul > li ul {
  @apply left-auto right-0
}
li[data-level="1"] > a, li[data-level="1"] > span {
  @apply rounded
}
li[data-level="1"] > ul {
  @apply mt-1
}
li[data-level="1"] ul {
  @apply absolute hidden top-full left-0 flex-col min-w-[18rem] rounded py-1 shadow-lg bg-white dark:bg-gray-700
}
.active li[data-level="0"] li.hover > ul {
  @apply flex shadow-lg
}
li[data-level="2"] ul {
  @apply left-full top-0
}
.active li[data-level="1"].hover > a .toggle i, .active li[data-level="1"].hover > span .toggle i {
  @apply rotate-180
}
li[data-level="2"] > a .toggle i, li[data-level="2"] > span .toggle i {
  @apply !-rotate-90
}
li[data-level="0"] li.hover > a, li[data-level="0"] li.hover > span {
  @apply bg-slate-100 dark:bg-gray-600
}
li[data-level="1"] {
  @apply relative
}
li[data-level="1"] > a, li[data-level="1"] > span {
  @apply py-2 px-4 my-1
}
li[data-level="1"] li > a, li[data-level="1"] li > span {
  @apply py-2 px-4
}
li[data-level="1"] li > a:hover {
  @apply bg-blue-600 text-white dark:bg-blue-600
}
li[data-level="2"] ul {
  @apply overflow-hidden overflow-y-auto;
  max-height: calc(100vh - 3.5rem);
}
</style>
