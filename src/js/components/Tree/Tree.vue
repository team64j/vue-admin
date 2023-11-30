<template>
  <div class="evo-tree" v-if="!needReload">
    <tree-menu v-if="menu" v-bind="menu" :settings="settings" :loading="loading" @action="action"/>
    <tree-search v-show="propSearch" @action="action"/>
    <div class="evo-tree__body">
      <div class="evo-tree__root">

        <div v-if="!data" class="text-center p-5">
          <evo-layout-loader-icon/>
        </div>

        <ul v-else-if="data?.['data']?.length">
          <tree-node
              v-for="node in data?.['data']"
              :node="node"
              :level="1"
              v-bind="$props"
              @action="action"
          />

          <li v-if="data?.['pagination']?.['next']" @click.stop="more(data['pagination']['next'])">
            <a class="evo-tree__node-more">
              <evo-layout-loader-icon v-if="data.loading"/>
              <span v-else>{{ $store.getters['Lang/get']('paging_next') }}</span>
            </a>
          </li>
        </ul>

        <div v-else class="p-5 text-center">
          {{ $store.getters['Lang/get']('not_set') }}
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import TreeMenu from './TreeMenu.vue'
import TreeNode from './TreeNode.vue'
import TreeMenuItem from './TreeMenuItem.vue'
import TreeSearch from './TreeSearch.vue'

export default {
  name: 'Tree',
  components: { TreeSearch, TreeMenuItem, TreeMenu, TreeNode },

  props: {
    id: {
      type: String,
      required: true
    },
    url: String,
    route: [String, Object],
    routeList: String,
    currentRoute: Object,
    category: Boolean,
    keyTitle: {
      type: String,
      default: 'title'
    },
    aliases: {
      type: Object,
      default: {
        id: 'id',
        data: 'data',
        date: 'date',
        size: 'size',
        type: 'type',
        title: 'title',
        folder: 'folder',
        parent: 'parent',
        hidden: 'hidden',
        inhidden: 'inhidden',
        unhidden: 'unhidden',
        private: 'private',
        deleted: 'deleted',
        disabled: 'disabled',
        published: 'published',
        visibility: 'visibility',
        unpublished: 'unpublished',
        hideChildren: 'hideChildren'
      }
    },
    icons: {
      type: Object,
      default: {}
    },
    templates: {
      type: Object,
      default: {}
    },
    appends: {
      type: Array,
      default: []
    },
    search: Boolean,
    menu: Object,
    contextMenu: Object,
    settings: Object
  },

  data () {
    this.keyStorage = 'tree.' + this.id.toLowerCase()

    this.iconsDefault = {
      default: 'far fa-file',
      folder: 'far fa-folder',
      folderOpen: 'far fa-folder-open'
    }

    return {
      loading: false,
      data: null,
      needReload: false,
      opened: this.$store.getters['Storage/get'](this.keyStorage)?.['opened'] ?? [],
      propSettings: this.settings || {},
      propSearch: this.search,
      dataRoute: typeof this.route === 'object' ? this.route : {
        name: this.route,
        meta: {}
      },
      hasRoute: this.$router.hasRoute(typeof this.route === 'object' ? this.route.name : this.route),
      filter: ''
    }
  },

  created () {
    window._.forEach(this.iconsDefault, (i, k) => {
      if (!this.icons[k]) {
        this.icons[k] = i
      }
    })

    if (!this.hasRoute) {
      this.$router.addRoute({
        ...this.dataRoute,
        component: () => import('../Component.vue')
      })
    }

    // this.$watch(
    //     () => this.$store.state.tree,
    //     data => {
    //       if (this.id === data?.id && typeof this[data?.action] === 'function') {
    //         this[data.action](data.params)
    //       }
    //     }
    // )
  },

  // updated () {
  //   //this.$store.dispatch('set', { treeSelect: false })
  //   // if (this.$store.state.treeSelect && this.$route['name'] === this.route) {
  //   //   this.$el.classList.add('focus')
  //   // }
  // },

  mounted () {
    Object.assign(this.propSettings, this.$store.getters['Storage/get'](this.keyStorage) || {})
    this.get()
  },

  watch: {
    '$store.state.actionUpdate' () {
      if (this.$store.state.route === this.dataRoute.name) {
        switch (this.$store.state.action) {
          case 'create':
            this.createNode(this.$store.state.data, this.data['data'])
            break

          case 'update':
            this.updateNode(this.$store.state.data, this.data['data'])
            break

          case 'delete':
            this.deleteNode(this.$store.state.data, this.data['data'])
            break
        }
      }
    },
    // '$store.state.treeSelect' (select) {
    //   if (select) {
    //     if (this.$route['name'] === this.route) {
    //       this.$el.classList.add('focus')
    //       if (this.$store.state.event) {
    //         this.$store.state.event.target.classList.add('focus')
    //       }
    //     }
    //   } else {
    //     this.$el.classList.remove('focus')
    //     if (this.$store.state.event) {
    //       this.$store.state.event.target.classList.remove('focus')
    //       setTimeout(() => this.$store.state.event.target.blur())
    //     }
    //   }
    // }
  },

  methods: {
    action () {
      if (typeof this[arguments[0]] === 'function') {
        this[arguments[0]](...Array.from(arguments).splice(1))
      } else {
        this.$emit('action', ...arguments)
      }
    },

    loader (a) {
      this.loading = !!a
    },

    get () {
      this.loader(1)
      axios.get(this.url, {
        params: {
          parent: this.propSettings?.parent ?? null,
          opened: this.opened.length ? this.opened.join(',') : null,
          settings: this.propSettings,
          filter: this.filter
        }
      }).then(r => {
        this.data = r.data.data
      }).finally(() => {
        this.loader(0)
      })
    },

    toggleSearch () {
      this.propSearch = !this.propSearch
    },

    onSearch (value) {
      this.filter = value
      this.data = null

      this.get()
    },

    toggle (node) {
      node['loading'] = true
      this.loader(1)
      if (node['data']) {
        this.removeOpened(node)
        node['data'] = null
        node['loading'] = false

        this.loader(0)
      } else {
        axios.get(this.url, {
          params: {
            parent: node['id'] ?? node['key'],
            settings: this.propSettings
          }
        }).then(r => {
          this.setOpened(node)
          node['data'] = r.data.data
        }).finally(() => {
          this.loader(0)
          node['loading'] = false
        })
      }
    },

    setOpened (node) {
      const id = node['id'] ?? node['key']
      const index = this.opened.indexOf(id)

      if (!~index) {
        this.opened.push(id)
        this.$store.dispatch('Storage/set', [this.keyStorage, { opened: this.opened }])
      }
    },

    removeOpened (node) {
      const id = node['id'] ?? node['key']
      const index = this.opened.indexOf(id)

      if (~index) {
        this.opened.splice(index, 1)
        this.$store.dispatch('Storage/set', [this.keyStorage, { opened: this.opened }])

        this.removeChildOpened(node)
      }
    },

    removeChildOpened (data) {
      for (const node of data.data.data) {
        const id = node['id'] ?? node['key']

        if (node['folder'] && node['data']) {
          const index = this.opened.indexOf(id)

          if (~index) {
            this.opened.splice(index, 1)
            this.$store.dispatch('Storage/set', [this.keyStorage, { opened: this.opened }])

            this.removeChildOpened(node)
          }
        }
      }
    },

    more (url) {
      this.loader(1)
      this.data['loading'] = true
      axios.get(url, {
        params: {
          settings: this.propSettings
        }
      }).then(r => {
        this.data['pagination']['next'] = r.data.data?.pagination?.['next'] || null

        if (r.data.data.data) {
          this.data['data'].push(...r.data.data.data)
        }
      }).finally(() => {
        this.loader(0)
        this.data['loading'] = false
      })
    },

    click (event, node, category) {
      if ((category && node['folder'] || node['category']) && !node['hideChildren']) {
        this.toggle(node)
      }

      if ((this.category && node['folder']) || node['disabled']) {
        return
      }

      if (event.ctrlKey && this.routeList && node['folder']) {
        this.$parent.$emit('action', 'pushRouter', {
          name: this.routeList,
          params: {
            id: node.id
          }
        })
      } else {
        if (this.$store.getters.get('treeSelect') && this.$route['name'] === this.dataRoute.name) {
          const context = this.$store.getters.get('context')
          const event = this.$store.getters.get('event')
          context.model = node['id']
          this.$nextTick(() => event.target.value = node['title'])
        } else {
          this.$parent.$emit('action', 'pushRouter', {
            ...this.dataRoute,
            params: {
              id: node.key || node.id
            }
          })
        }
      }
    },

    createNode (node, data) {

    },

    updateNode (node, data) {
      if (!data) {
        this.loader(1)
      }

      data = data || this.data.data
      node = this.alias(node)

      if (node.id) {
        for (const i in data) {
          if (data[i].id === node.id) {
            if (this.category && data[i]['folder']) {
              continue
            }

            if (data[i]['parent'] !== node['parent']) {
              const el = Object.assign({}, data[i], node)
              data.splice(i, 1)
              this.transfer(el)
            } else {
              for (let j in data[i]) {
                if (node[j] !== undefined) {
                  data[i][j] = node[j]
                }
              }
            }

            this.loader(0)
            break
          } else if (data[i]?.['data']?.['data']) {
            this.updateNode(node, data[i]['data']['data'])
          }
        }
      }
    },

    deleteNode (node, data) {

    },

    transfer (node, data) {
      data = data || this.data.data

      // for (const i in data) {
      //   if (data[i].id === node['parent'] && data[i].folder) {
      //     data[i].data.data.push(node)
      //     console.log(node)
      //   } else if (data[i].folder && data[i]['data']) {
      //     this.transfer(node, data[i]['data'])
      //     console.log(data[i])
      //   }
      // }

      // for (const i in data) {
      //   if (data[i].id === node['parent'] && data[i].folder) {
      //     data[i].data.data.push(node)
      //   } else if(data[i]?.['data']?.['data']) {
      //     if (!data[i]['data']['data'].length) {
      //       //data.splice(i, 1)
      //     } else {
      //       //this.transfer(node, data[i]['data'])
      //     }
      //   }
      // }
    },

    alias (data) {
      for (const i in data) {
        if (this.aliases[i] && this.aliases[i] !== i) {
          data[this.aliases[i]] = data[i]
          delete data[i]
        }
      }

      if (this.propSettings?.keyTitle && data[this.propSettings.keyTitle] !== undefined) {
        data[this.keyTitle] = data[this.propSettings.keyTitle]
      }

      return data
    },

    reload () {
      this.needReload = true
      this.$nextTick(() => {
        this.needReload = false
      })
    },

    update () {
      this.$store.dispatch('Storage/set', [this.keyStorage, { ...this.propSettings }])
      this.get()
    }
  }
}
</script>

<style>
.evo-tree {
  @apply relative h-full w-full overflow-hidden flex flex-col flex-wrap cursor-default
}
.evo-tree .evo-tree__body {
  @apply h-0 grow w-full relative transition-all duration-200
}
.evo-tree .evo-tree__root {
  @apply h-full overflow-hidden overflow-y-auto py-2
}
.evo-tree.focus .evo-tree__root {
  @apply outline outline-2 -outline-offset-2 outline-blue-600
}
.evo-tree li .evo-tree__node-more {
  @apply block relative cursor-pointer text-center text-amber-400 hover:text-amber-300 pr-8
}
.evo-tree .evo-tree__menu {
  @apply w-full p-1 flex border-b
}
.evo-tree .evo-tree__menu a {
  @apply px-1.5 h-8 w-9 m-0.5 rounded inline-flex items-center justify-center shrink-0 bg-gray-700 hover:bg-gray-600 cursor-pointer
}
.evo-tree .evo-tree__menu__item {
  @apply inline-flex items-center justify-center p-0.5 cursor-pointer !ring-0 text-slate-600 dark:text-gray-200 dark:hover:text-gray-200 hover:bg-gray-600 active:bg-gray-400 rounded border-0 transition
}
.evo-tree .evo-tree__menu__item > * {
  @apply inline-flex items-center justify-center
}
.evo-tree li .evo-tree__node {
  @apply flex items-center whitespace-nowrap relative pl-8 pr-2 py-0.5 h-8 text-gray-400
}
.evo-tree li > .evo-tree__node::after {
  @apply z-10 absolute left-0.5 top-0 right-0.5 bottom-0 rounded pointer-events-none transition;
  content: "";
}
.evo-tree li > .evo-tree__node:hover::after {
  @apply bg-white/5
}
.evo-tree li.evo-tree__node-active > .evo-tree__node::after {
  @apply bg-white/10
}
.evo-tree .evo-tree__node__toggle {
  @apply w-5 h-5 -ml-6 mr-1 inline-flex items-center text-gray-400 text-center rounded hover:text-blue-400 hover:bg-gray-400/10
}
.evo-tree .evo-tree__node__toggle i {
  @apply cursor-pointer
}
.evo-tree .evo-tree__node-icon {
  @apply w-7 h-5 grow-0 shrink-0 text-center;
  font-size: 1.25rem;
}
.evo-tree .evo-tree__node-icon > .evo-tree__node-lock {
  @apply text-rose-600 text-sm relative -ml-2 w-2
}
.evo-tree .evo-tree__node .evo-tree__node-title {
  @apply grow block items-center pl-1 pt-0.5 h-full text-gray-700 hover:text-gray-800 dark:text-gray-100 dark:hover:text-gray-50 truncate cursor-pointer
}
.evo-tree .evo-tree__node .evo-tree__node-size {
  @apply text-gray-200/50
}
.evo-tree .evo-tree__node .evo-tree__node-date {
  @apply text-gray-200/80
}
.evo-tree .evo-tree__node-help {
  @apply fixed z-50 w-72 p-4 text-sm text-left font-normal font-sans whitespace-normal rounded text-white bg-gray-800 dark:text-gray-800 dark:bg-white shadow-lg opacity-0 invisible transition
}
.evo-tree .evo-tree__node-hover > .evo-tree__node > .evo-tree__node-help {
  @apply opacity-90 visible
}
.evo-tree .evo-tree__node-hide > .evo-tree__node > .evo-tree__node-title {
  @apply text-gray-500 hover:text-gray-400
}
.evo-tree .evo-tree__node-inhidden > .evo-tree__node > .evo-tree__node-title {
  @apply text-blue-300 hover:text-blue-200
}
.evo-tree .evo-tree__node-unpublished > .evo-tree__node > .evo-tree__node-title {
  @apply italic text-rose-500 hover:text-rose-400
}
.evo-tree .evo-tree__node-deleted > .evo-tree__node > .evo-tree__node-title {
  @apply not-italic line-through text-rose-800 hover:text-rose-700
}
.evo-tree .evo-tree__node-split + .evo-tree__node-split {
  @apply hidden
}
.evo-tree .evo-tree__node__menu {
  @apply absolute z-20 mt-1 py-1 bg-gray-700 rounded shadow border text-white/70 cursor-default
}
.evo-tree .evo-tree__node__menu i {
  @apply opacity-70
}
</style>
