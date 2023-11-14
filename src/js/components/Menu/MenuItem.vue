<script>
import { h } from 'vue'
import { RouterLink } from 'vue-router'

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
    node () {
      let node
      let slots = []

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

      // icon
      if (icon) {
        slots.push(h('i', {
          class: icon
        }))
      }

      // title
      if (this.data['name']) {
        slots.push(h('span', this.data['name']))
      }

      // locked
      if (this.data['locked']) {
        slots.push(h('i', { class: 'fa fa-lock text-rose-500 text-sm leading-[0]' }))
      }

      // id
      if (this.data['id'] !== undefined) {
        slots.push(h('span', this.data['id']))
      }

      // toggle
      if (this.loading) {
        slots.push(h('i', { class: 'fa fa-circle-notch fa-fw animate-spin' }))
      } else if (this.propData.length && this.level) {
        slots.push(h('i', {
          class: 'inline-flex items-center justify-center ml-1 text-sm opacity-70 toggle'
        }, h('i', { class: 'fa fa-chevron-down fa-fw leading-[0] transition' })))
      }

      if (this.data['href']) {
        node = h('a', {
          class: 'transition',
          href: this.data['href'],
          target: '_blank'
        }, slots)
      } else if (this.data['to']) {
        node = h(RouterLink, {
          class: 'transition',
          to: this.data['to']
        }, () => slots)
      } else if (this.data['prev'] || this.data['next']) {
        slots = []

        // prev
        slots.push(h('i', {
          class: 'fa fa-chevron-left px-2 py-1 rounded text-blue-500' + (!this.data['prev']
              ? ' opacity-20 pointer-events-none'
              : ' cursor-pointer hover:text-blue-600 hover:bg-white/10'),
          onClick: () => {
            if (this.data['prev']) {
              this.$parent.get(this.data['prev'])
            }
          }
        }))

        // total info
        slots.push(h('span', {
          class: 'grow text-center opacity-80',
          innerHTML: this.data['info'] ?? this.data['total']
        }))

        // next
        slots.push(h('i', {
          class: 'fa fa-chevron-right px-2 py-1 rounded text-blue-500' + (!this.data['next']
              ? ' opacity-20 pointer-events-none'
              : ' cursor-pointer hover:text-blue-600 hover:bg-white/10'),
          onClick: () => {
            if (this.data['next']) {
              this.$parent.get(this.data['next'])
            }
          }
        }))

        node = h('div', {
          class: 'pagination flex justify-between items-center w-full px-3 py-2 select-none'
        }, slots)
      } else if (this.data['filter'] !== undefined) {
        slots = []

        slots.push(h('input', {
          type: 'text',
          class: 'px-2 pt-1 pb-0.5 mx-3 my-1',
          value: this.data['filter'],
          onInput: (event) => {
            clearTimeout(this.timer)
            this.timer = setTimeout(() => this.$parent.get(null, { filter: event.target.value }), 500)
          }
        }))

        if (this.data['filter']) {
          slots.push(h('i', {
            class: 'fa fa-remove text-rose-500 cursor-pointer absolute z-10 top-3 right-5',
            onClick: () => this.$parent.get()
          }))
        }

        node = h('div', {
          class: 'filter flex w-full relative'
        }, slots)
      } else {
        node = h('span', {
          class: 'transition' + (this.data['click'] || this.data['icons'] ? ' cursor-pointer' : ''),
          onClick: () => this.onClick(this.data)
        }, slots)
      }

      return node
    }
  },
  methods: {
    mouseenter () {
      this.$el.parentElement.querySelectorAll(':scope > li.hover').forEach(i => {
        this.$el !== i && i.classList.remove('hover')
      })

      if (this.$el.classList.contains('hover')) {
        return
      }

      if (this.data['url']) {
        clearTimeout(this.timer)
        this.timer = setTimeout(() => this.get(this.data['url']), 200)
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
    },
    get (url = null, params = {}) {
      const filter = [{ filter: params.filter ?? '' }]
      url ??= this.data['url']
      this.loading = true
      this.propData = this.data['data']

      axios.get(url, {
        params: params
      }).then(r => {
        this.propData = this.propData.concat(filter, (r.data['data'] || []).map(i => {
          i.to = {
            name: this.data['name'],
            params: {
              id: i.id
            }
          }

          return i
        }))

        if (r.data['meta']?.['pagination']?.['prev'] || r.data['meta']?.['pagination']?.['next']) {
          this.propData.push({
            total: r.data['meta']['pagination']['total'] ?? null,
            info: r.data['meta']['pagination']['info'] ?? null,
            prev: r.data['meta']['pagination']['prev'] ?? null,
            next: r.data['meta']['pagination']['next'] ?? null
          })
        }

        this.$el.classList.add('hover')
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>

<template>
  <li :data-level="level" :class="{ parent: this.data['data']?.length }" @mouseenter="mouseenter"
      @mouseleave="mouseout">

    <component :is="node"/>

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
