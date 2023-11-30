<template>
  <li
      :class="this.class"
      :data-level="level">
    <div :style="{ paddingLeft: (level * 18) + 8 + 'px' }" class="evo-tree__node">
      <div v-if="node['loading']" class="evo-tree__node__toggle">
        <evo-layout-loader-icon/>
      </div>
      <div v-else-if="node['folder'] && !node['hideChildren']"
           class="evo-tree__node__toggle"
           @click.stop="$emit('action', 'toggle', node)">
        <i v-if="node?.['data']" class="fa fa-angle-down fa-fw"/>
        <i v-else class="fa fa-angle-right fa-fw"/>
      </div>

      <i class="evo-tree__node-icon" :class="icon" @mousedown="contextmenu">
        <i v-if="node['private']" class="fa fa-lock evo-tree__node-lock"/>
      </i>

      <div @click="$emit('action', 'click', $event, node, category)"
           @contextmenu="contextmenu"
           @mouseenter="mouseenter"
           @mousemove="mousemove"
           @mouseleave="mouseleave"
           class="evo-tree__node-title"
           :title="title">
        {{ name }}
      </div>

      <component :is="append"/>

      <div v-if="help" v-html="help" class="evo-tree__node-help"/>
      <button ref="menuBtn" class="absolute opacity-0 w-0 h-0 p-0" @click="menuOpen" @blur="menuClose"/>

      <transition>
        <div v-if="menuActive"
             :class="menuData.class"
             class="evo-tree__node__menu">
          <div class="py-1 px-4 w-72 text-white/90 truncate" :title="node.title">
            {{ node.title }}
          </div>
          <template v-for="action in actions">
            <div v-if="action.title && Object.values(action).length === 1" class="py-1 px-4 text-white/80">
              {{ action.title }}
            </div>
            <div v-else-if="action.split" class="evo-tree__node-split py-1 px-3">
              <div class="border-b"></div>
            </div>
            <div v-else class="px-4 py-0.5 whitespace-nowrap hover:text-white hover:bg-blue-500"
                 @mousedown="clickAction(action)">
              <i v-if="action.icon" :class="action.icon" class="fa fa-fw"/>
              {{ action.title }}
            </div>
          </template>
        </div>
      </transition>
    </div>

    <ul v-if="node?.['data']?.['data'] && node['data']?.['data'].length">
      <tree-node
          v-for="child in node['data']['data']"
          v-bind="Object.assign({}, $props, { node: child, level: level + 1 })"
          @action="action"/>

      <li v-if="node['data']?.['pagination']?.['next']" @click.stop="more(node['data']['pagination']['next'])">
        <a class="evo-tree__node-more">
          <evo-layout-loader-icon v-if="node['loading']"/>
          <span v-else>{{ $store.getters['Lang/get']('paging_next') }}</span>
        </a>
      </li>
    </ul>
  </li>
</template>

<script>
import { compile } from 'vue'

export default {
  name: 'TreeNode',

  props: [
    'node',
    'id',
    'url',
    'route',
    'category',
    'keyTitle',
    'level',
    'aliases',
    'icons',
    'templates',
    'appends',
    'contextMenu',
    'currentRoute',
    'settings',
    'menu'
  ],

  computed: {
    class () {
      const classes = []

      if (this.node['class']) {
        this.node['class'].split(' ').forEach(i => {
          classes.push(i)
        })
      }

      if (this.node['folder'] !== undefined || !!this.node['data']) {
        classes.push('evo-tree__node-folder')
      }

      if (!!this.node['data']) {
        classes.push('evo-tree__node-opened')
      }

      if (this.node['hidden']) {
        classes.push('evo-tree__node-hide')
      }

      if (this.node['unhidden'] || (this.node['inhidden'] !== undefined && !this.node['inhidden'])) {
        classes.push('evo-tree__node-inhidden')
      }

      if (this.node['unpublished'] || this.node['published'] !== undefined && !this.node['published']) {
        classes.push('evo-tree__node-unpublished')
      }

      if (this.node['deleted']) {
        classes.push('evo-tree__node-deleted')
      }

      if (this.current) {
        classes.push('evo-tree__node-active')
      }

      if (this.menuActive) {
        classes.push('evo-tree__node-menu-active')
      }

      return classes
    },
    icon () {
      let icon = ''

      switch (true) {
        case !!this.icons[this.node['id']]:
          icon = this.icons[this.node['id']]
          break

        case !!this.icons[this.node['type']]:
          icon = this.icons[this.node['type']]
          break

        case !!this.node['folder']:
          if (this.node?.['data']?.['data']?.length) {
            icon = this.icons.folderOpen
          } else {
            icon = this.icons.folder
          }
          break

        default:
          icon = this.icons.default
      }

      return icon
    },
    title () {
      if (this.templates?.title) {
        let data = this.templates.title
        let cleanKeys = true

        return data.replace(/\{([\w.]*)}/g, (str, key) => {
          const value = typeof this.node[key] !== undefined ? this.node[key] : ''
          return (value === null || value === undefined) ? (cleanKeys ? '' : str) : value
        })
      }
    },
    help () {
      if (this.templates?.help) {
        let data = this.templates.help
        let cleanKeys = true

        return (data.replace(/\{([\w.]*)}/g, (str, key) => {
          const value = typeof this.node[key] !== undefined ? this.node[key] : ''
          return new Option((value === null || value === undefined) ? (cleanKeys ? '' : str) : value).innerHTML
        })).replace(/\r\n+/g, '<br>')
      }
    },
    name () {
      return this.node[this.keyTitle]
    },
    actions () {
      return this.menuData.actions.filter(i => {
        if (i.hidden) {
          for (const j in i.hidden) {
            if (this.node?.[j] === i.hidden[j]) {
              return false
            }
          }
        }

        return true
      })
    },
    current () {
      return this.currentRoute['name'] === this.route
          && (parseInt(this.currentRoute['params']?.id?.toString()) === this.node?.['id'] ||
              (this.currentRoute['params']?.['id'] && this.currentRoute['params']['id'] === this.node?.['key']))
          && (!this.node['folder'] && this.category || !this.category)
    },
    append () {
      const appends = []

      this.appends.map(i => {
        if (this.node[i] !== undefined) {
          appends.push(`<div class="pl-2 text-sm">` + this.node[i] + `</div>`)
        }
      })

      return compile(appends.join(' '))
    }
  },

  data () {
    this.timer = 0

    return {
      menuData: this.node['contextMenu'] ?? this.contextMenu,
      menuActive: false
    }
  },

  created () {
    this.alias(this.node)
  },

  updated () {
    this.alias(this.node)
  },

  methods: {
    action () {
      if (typeof this[arguments[0]] === 'function') {
        this[arguments[0]](...Array.from(arguments).splice(1))
      } else {
        this.$emit('action', ...arguments)
      }
    },

    alias (data) {
      for (const i in data) {
        if (this.aliases[i] && this.aliases[i] !== i) {
          data[this.aliases[i]] = data[i]
          delete data[i]
        }
      }

      return data
    },

    more (url) {
      this.$emit('action', 'loader', 1)
      this.node.loading = true
      axios.get(url).then(r => {
        this.node['data']['pagination']['next'] = r.data.data?.pagination?.['next'] || null

        if (r.data.data.data) {
          this.node['data']['data'].push(...r.data.data.data)
        }

        this.$emit('action', 'loader', 0)
        this.node.loading = false
      })
    },

    contextmenu (event) {
      if (this.menuData) {
        event.preventDefault()
        this.$refs.menuBtn.click()
      }
    },

    menuOpen (event) {
      if (this.menuActive) {
        this.menuActive = !this.menuActive
        return
      }

      this.menuActive = true
      event.target.focus()

      this.$nextTick(() => {
        let menu = this.$el.querySelector('.evo-tree__node__menu'),
            position = this.$el.firstElementChild.getBoundingClientRect()

        menu.classList.add(
            (position.top + position.height + menu.offsetHeight > window.innerHeight ? 'bottom-full' : 'top-full')
        )
      })
    },

    menuClose () {
      this.$nextTick(() => this.menuActive = false)
    },

    clickAction (action) {
      if (action.to) {
        const to = window._.mergeWith({
          params: { id: this.node['id'] },
          query: { parent: this.node['id'] }
        }, action.to)

        if (to.params.id === this.node['id']) {
          delete to.query.parent
        }

        this.$router.push(to)
      }
    },

    mouseenter () {
      if (this.templates?.help) {
        this.timer = setTimeout(() => {
          clearTimeout(this.timer)
          this.$el.classList.add('evo-tree__node-hover')
        }, 1000)
      }
    },

    mousemove (event) {
      if (this.templates?.help) {
        const help = this.$el.querySelector('.evo-tree__node-help')
        help.style.left = event.clientX + 16 + 'px'
        help.style.top = event.clientY + 16 + 'px'

        if (event.clientY + 16 + help.offsetHeight > window.innerHeight) {
          help.style.top = event.clientY - help.offsetHeight + 'px'
        }
      }
    },

    mouseleave () {
      if (this.templates?.help) {
        clearTimeout(this.timer)
        this.$el.classList.remove('evo-tree__node-hover')
      }
    }
  }
}
</script>
