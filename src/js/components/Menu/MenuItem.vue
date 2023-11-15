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
      propData: this.data['data'] || [],
      filter: ''
    }
  },
  computed: {
    node () {
      let node
      let slots = []
      let nodeClass = 'flex items-center justify-between grow transition'

      if (this.level) {
        nodeClass += ' py-2 px-4'
      }

      if (this.level === 1) {
        nodeClass += ' my-1 rounded'
      }

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
        slots.push(h('span', {
          class: 'grow truncate' + (icon ? ' ml-2' : ''),
          innerText: this.data['name']
        }))
      }

      // locked
      if (this.data['locked']) {
        slots.push(h('i', { class: 'fa fa-lock text-rose-500 text-sm leading-[0] ml-1' }))
      }

      // id
      if (this.data['id'] !== undefined) {
        slots.push(h('span', {
          class: 'ml-1 grow-0 opacity-70',
          innerText: this.data['id']
        }))
      }

      // toggle
      if (this.loading) {
        slots.push(h('i', { class: 'fa fa-circle-notch fa-fw animate-spin ml-2' }))
      } else if (this.propData.length && this.level) {
        slots.push(h('span', {
          class: 'inline-flex items-center justify-center ml-2 h-full text-sm opacity-70 toggle',
          onClick: (event) => {
            if (window.innerWidth < 769) {
              //event.preventDefault()
            }
          }
        }, h('i', { class: 'fa fa-chevron-down fa-fw leading-[0] pointer-events-none transition' })))
      }

      if (this.data['href']) {
        node = h('a', {
          class: nodeClass,
          href: this.data['href'],
          target: '_blank'
        }, slots)
      } else if (this.data['to']) {
        node = h(RouterLink, {
          class: nodeClass,
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

        nodeClass += ' pagination px-3 py-2 select-none'

        node = h('div', {
          class: nodeClass
        }, slots)
      } else if (this.data['filter'] !== undefined) {
        slots = []

        slots.push(h('input', {
          type: 'text',
          class: '-my-1 pl-2 pr-6 pt-1 pb-0.5',
          value: this.data['filter'],
          onInput: (event) => {
            this.$parent.filter = event.target.value
            clearTimeout(this.timer)
            this.timer = setTimeout(() => {
              this.$parent.get()
            }, 500)
          }
        }))

        if (this.data['filter']) {
          slots.push(h('i', {
            class: 'fa fa-remove text-rose-500 cursor-pointer absolute z-10 top-3 right-6',
            onClick: () => {
              this.$parent.filter = ''
              this.$parent.get()
            }
          }))
        }

        nodeClass += ' filter relative'

        node = h('div', {
          class: nodeClass
        }, slots)
      } else {
        if (this.data['click'] || this.data['icons']) {
          nodeClass += ' cursor-pointer'
        }

        node = h('span', {
          class: nodeClass,
          onClick: () => this.onClick(this.data)
        }, slots)
      }

      return node
    },
    classLI () {
      let c = 'flex cursor-default'

      if (this.data['data']?.length) {
        c += ' parent'
      }

      if (this.level === 1) {
        c += ' md:relative'
      }

      return c
    },
    classUL () {
      let c = 'flex cursor-default'

      if (this.level === 1) {
        c += ' mt-1'
      }

      if (this.level) {
        c += ' absolute opacity-0 invisible top-full left-0 flex-col min-w-full md:min-w-[18rem] rounded py-1 shadow-lg bg-white dark:bg-gray-700 transition'
      }

      if (this.level > 1) {
        c += ' left-full !top-0 overflow-hidden overflow-y-auto'
      }

      return c
    }
  },
  methods: {
    mouseenter () {
      this.$parent.$el.querySelectorAll(':scope > ul > li.hover').forEach(i => {
        if (this.$el !== i) {
          i.classList.remove('hover')
          i.querySelectorAll('li.hover').forEach(j => j.classList.remove('hover'))
        }
      })

      if (this.$el.classList.contains('hover')) {
        return
      }

      if (this.data['url']) {
        if (window.innerWidth > 768) {
          clearTimeout(this.timer)
          this.timer = setTimeout(() => this.get(this.data['url']), 200)
        }
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
      url ??= this.data['url']
      this.loading = true
      this.propData = this.data['data']

      if (this.filter) {
        params.filter = this.filter
      }

      axios.get(url, {
        params: params
      }).then(({ data: data }) => {
        const filter = []

        if (data['meta']?.['pagination']['total'] > data['meta']?.['pagination']['page'] || this.filter) {
          filter.push({ filter: this.filter || '' })
        }

        this.propData = this.propData.concat(filter, (data['data'] || []).map(i => {
          i.to = {
            name: this.data['name'],
            params: {
              id: i.id
            }
          }

          return i
        }))

        if (data['meta']?.['pagination']?.['prev'] || data['meta']?.['pagination']?.['next']) {
          this.propData.push({
            total: data['meta']['pagination']['total'] ?? null,
            info: data['meta']['pagination']['info'] ?? null,
            prev: data['meta']['pagination']['prev'] ?? null,
            next: data['meta']['pagination']['next'] ?? null
          })
        }

        this.$el.classList.add('hover')

        setTimeout(() => {
          const input = this.$el.querySelector('input')
          if (input) {
            input.focus()
          }
        }, 100)
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>

<template>
  <li :data-level="level" :class="classLI" @mouseenter="mouseenter" @mouseleave="mouseout">

    <component :is="node"/>

    <ul v-if="propData.length" :class="classUL">
      <menu-item v-for="i in propData" :data="i" :level="level + 1"/>
    </ul>
  </li>
</template>

<style scoped>
/*li > a > *, li > span > * {
  @apply pointer-events-none select-none
}*/
li[data-level="0"]:last-of-type > ul > li ul {
  @apply left-auto right-0
}
.active li[data-level="0"] li.hover > ul {
  @apply opacity-100 visible
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
li[data-level="1"] li > a:hover {
  @apply bg-blue-600 text-white dark:bg-blue-600
}
ul {
  max-height: calc(100vh - 3.5rem);
}
</style>
