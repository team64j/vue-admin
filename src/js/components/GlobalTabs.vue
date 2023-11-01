<template>
  <div class="cms-global-tabs">

    <div class="grow-0">
      <div class="cms-global-tabs__tabs" ref="tabs">
        <div class="cms-global-tabs__pane">
          <a v-for="(tab, i) in store.getters['GlobalTabs/tabs']()"
             :key="i"
             :data-to="tab.path"
             :class="[tab.active ? 'cms-global-tabs__active' : '']"
             :title="tab.meta.title"
             @mousedown="clickTab(tab)"
             @dblclick="dblClickTab(tab)">
            <span v-if="tab.loading || tab.meta.icon" class="cms-global-tabs__icon">
              <loader-icon v-if="tab.loading"/>
              <i v-else-if="tab.meta.icon" :class="tab.meta.icon"/>
            </span>
            <span v-if="tab.meta.title" class="cms-global-tabs__title">
              {{ tab.meta.title }}
            </span>
            <i v-if="!tab.meta.fixed" class="fa fa-close cms-global-tabs__close" @mousedown.stop="closeTab(tab)"/>
            <span v-if="tab['changed']" class="cms-global-tabs__change">*</span>
          </a>
        </div>
      </div>
    </div>

    <div class="grow h-0 overflow-hidden">
      <div class="cms-global-tabs__panel" ref="panel">

        <router-view v-slot="{ Component }">
          <keep-alive-component :include="store.getters['GlobalTabs/keys']()">
            <component
                v-if="!route?.meta?.['isIframe']"
                :key="route?.meta?.['group'] && route.name || route.path"
                :is="Component"
                :current-route="route"
                @action="action"/>
          </keep-alive-component>
        </router-view>

        <div
            class="cms-global-tabs__frames"
            v-for="{ path, matched: [{ components: { default: component }}] } in store.getters['GlobalTabs/frames']()"
            v-show="route.path === path">
          <component
              :key="path"
              :is="getComponent(component)"
              :current-route="route"
              @action="action"/>
        </div>

      </div>
    </div>

  </div>
</template>

<script>
import KeepAliveComponent from './KeepAlive'
import { toRaw } from 'vue'
import router from '../router'
import store from '../store'

export default {
  name: 'GlobalTabsComponent',
  components: { KeepAliveComponent },

  watch: {
    $route (route) {
      this.addTab(route)
    }
  },

  computed: {
    store: () => store,
    route: () => router.currentRoute.value
  },

  data () {
    return {
      closing: false
    }
  },

  created () {
    this.init()
  },

  methods: {
    action () {
      if (typeof this[arguments[0]] === 'function') {
        this[arguments[0]](...Array.from(arguments).splice(1))
      } else {
        this.$emit('action', ...arguments)
      }
    },

    getComponent (component) {
      return toRaw(component)
    },

    init () {
      store.dispatch('GlobalTabs/init')
    },

    addTab (data) {
      store.dispatch('GlobalTabs/add', data)
      //this.$root.$refs.layout.$refs.sidebar.selectParent = false
    },

    setTab (data) {
      store.dispatch('GlobalTabs/set', data)
    },

    closeTab (callback) {
      const route = typeof callback === 'object' ? callback : this.route
      const tab = store.getters['GlobalTabs/find'](route)
      if (tab?.changed && !confirm(this.$store.getters['Lang/get']('warning_not_saved'))) {
        return
      }

      this.closing = true
      store.dispatch('GlobalTabs/del', route).then(() => {
        setTimeout(() => this.closing = false, 100)

        if (typeof callback === 'function') {
          callback()
        }
      })
    },

    toTab (data) {
      const tab = store.getters['GlobalTabs/find'](this.route)
      if (tab?.changed && !confirm(this.$store.getters['Lang/get']('warning_not_saved'))) {
        return
      }
      store.dispatch('GlobalTabs/to', data)
    },

    clickTab (tab) {
      if (this.closing) {
        return
      }
      router.currentRoute.value.fullPath !== tab.fullPath && router.push(tab)
    },

    dblClickTab (tab) {
      if (this.closing) {
        return
      }
      store.dispatch('GlobalTabs/reload', tab)
    },

    pushRouter (route, callback) {
      if (typeof route === 'string') {
        route = router.resolve(route)
      }

      router.push(route).then(callback)
    }
  }
}
</script>

<style scoped>
.cms-global-tabs {
  @apply flex flex-col grow w-full
}
.cms-global-tabs__tabs {
  @apply h-9 overflow-hidden relative
}
.cms-global-tabs__pane {
  @apply h-16 flex flex-nowrap overflow-auto relative z-[2] py-0.5
}
.cms-global-tabs__pane a {
  @apply h-8 mx-0.5 rounded inline-flex justify-between items-center relative select-none cursor-pointer transition
}
.cms-global-tabs__pane .cms-global-tabs__active {
  @apply bg-blue-600 text-white
}
.cms-global-tabs__panel {
  @apply h-full overflow-auto
}
.cms-global-tabs__panel > div {
  @apply h-full relative
}
.cms-global-tabs__panel > div > iframe {
  @apply absolute left-0 top-0 right-0 bottom-0 w-full min-h-full overflow-auto border-none
}
.cms-global-tabs__icon {
  @apply grow-0 shrink-0 w-10 inline-flex items-center justify-center pointer-events-none
}
.cms-global-tabs__title {
  @apply grow pl-3 w-32 pointer-events-none truncate
}
.cms-global-tabs__icon + .cms-global-tabs__title {
  @apply pl-0
}
.cms-global-tabs__close {
  @apply inline-flex items-center px-2 h-full hover:text-red-500
}
.cms-global-tabs__change {
  @apply absolute top-0 left-0 px-1 text-yellow-500 text-lg font-mono
}
.cms-global-tabs__frames {
  @apply h-full w-full relative
}
</style>
