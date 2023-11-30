<template>
  <div :id="id+`Pane`" class="evo-tab-pane" :class="{ 'evo-tab-pane-vertical': vertical }">

    <div v-if="data.length > 1" class="evo-tab-row-container"
         :class="[navigation ? 'evo-tab-row-with-navigation' : '', smallTabs ? 'evo-tab-pane-small-tabs' : '']">

      <div class="evo-tab-row" ref="row">
        <div v-for="(tab, index) in data" :key="index" :title="tab.title" class="evo-tab" :class="{ 'active' : tab.id === active }"
             @mousedown="select(tab, index)">
          <i v-if="tab.icon" class="evo-icon" :class="tab.icon"/>
          <span v-if="tab.name">{{ tab.name }}</span>
        </div>
      </div>

      <template v-if="navigation">
        <i class="fa fa-angle-left evo-prev disabled" @mousedown="prev" ref="prev"></i>
        <i class="fa fa-angle-right evo-next disabled" @mousedown="next" ref="next"></i>
      </template>
    </div>

    <template v-if="history">
      <template v-for="tab in data" :key="tab.id">
        <div v-show="tab.id === active"
             :id="`tab-`+tab.id"
             :class="tab.class"
             class="evo-tab-page">
          <slot v-if="$slots[tab.id]" :name="tab.id"/>
          <div v-else class="text-center p-5 w-full">
            <evo-layout-loader-icon/>
          </div>
        </div>
      </template>
    </template>

    <template v-else-if="loadOnce">
      <template v-for="tab in data" :key="tab.id">
        <template v-if="tab['needUpdate']">
          <div v-if="tab.id === active"
               :id="`tab-`+tab.id"
               :class="tab.class"
               class="evo-tab-page">
            <slot v-if="$slots[tab.id]" :name="tab.id"/>
            <div v-else class="text-center p-5 w-full">
              <evo-layout-loader-icon/>
            </div>
          </div>
        </template>
        <template v-else>
          <div v-if="tab.loaded || tab.id === active" v-show="tab.id === active"
               :id="`tab-`+tab.id"
               :class="tab.class"
               class="evo-tab-page">
            <slot v-if="$slots[tab.id]" :name="tab.id"/>
            <div v-else class="text-center p-5 w-full">
              <evo-layout-loader-icon/>
            </div>
          </div>
        </template>
      </template>
    </template>

    <template v-else>
      <template v-for="tab in data" :key="tab.id">
        <template v-if="tab['needUpdate']">
          <div v-if="tab.id === active"
               :id="`tab-`+tab.id"
               :class="tab.class"
               class="evo-tab-page">
            <slot v-if="$slots[tab.id]" :name="tab.id"/>
            <div v-else class="text-center p-5 w-full">
              <evo-layout-loader-icon/>
            </div>
          </div>
        </template>
        <template v-else>
          <div v-show="tab.id === active"
               :id="`tab-`+tab.id"
               :class="tab.class"
               class="evo-tab-page">
            <slot v-if="$slots[tab.id]" :name="tab.id"/>
            <div v-else class="text-center p-5 w-full">
              <evo-layout-loader-icon/>
            </div>
          </div>
        </template>
      </template>
    </template>

  </div>
</template>

<script>
export default {
  name: 'Tabs',
  props: {
    id: {
      type: String,
      required: true
    },
    data: {
      type: [null, Array],
      required: true
    },
    uid: String,
    history: [Boolean, String],
    loadOnce: Boolean,
    watch: Boolean,
    vertical: {
      type: Boolean,
      default: false
    },
    navigation: {
      type: Boolean,
      default: true
    },
    smallTabs: Boolean,
    currentRoute: Object
  },

  data () {
    this.keyStorage = this.$store.getters['Storage/get']('config')['remember_last_tab'] ? 'tabs.' + this.id.toLowerCase() : null

    return {
      active: null
    }
  },

  created () {
    if (this.history) {
      this.active = this.currentRoute['params'][this.history]
      this.$watch(
          () => this.currentRoute['params'][this.history],
          active => {
            if (!active) {
              return
            }

            if (this.active !== active) {
              this.active = active
            }
          }
      )
    } else if (this.keyStorage) {
      const active = this.$store.getters['Storage/get'](this.keyStorage)?.['active']

      if (this.data.some(i => i.id === active)) {
        this.active = active
      } else {
        this.active = this.data[0]?.id
      }

      this.data.forEach(tab => {
        if (this.loadOnce) {
          tab.loaded = tab.id === this.active
        }
      })
    } else {
      this.data.forEach(tab => {
        if (tab.active) {
          this.active = tab.id
        }

        tab.loaded = tab.active
      })
    }

    if (this.watch) {
      this.$watch(
          () => this.currentRoute['name'],
          active => {
            if (!active) {
              return
            }

            this.data.forEach((tab, index) => {
              if (typeof tab.route === 'object') {
                tab.active = tab.route.some(i => i === active)
              } else {
                tab.active = tab.route === active
              }

              if (tab.active) {
                this.select(tab, index)
              }
            })
          }
      )
    }
  },

  mounted () {
    this.init(this.data.findIndex(tab => tab.id === this.active))
  },

  updated () {
    if (!this.data.some(tab => tab.id === this.active)) {
      this.active = this.data[0].id
    }
  },

  methods: {
    action () {
      if (typeof this[arguments[0]] === 'function') {
        this[arguments[0]](...Array.from(arguments).splice(1))
      } else {
        this.$emit('action', ...arguments)
      }
    },

    select (tab, index) {
      this.active = tab.id

      this.init(index)

      if (this.history) {
        const route = {
          params: {}
        }

        route.params[this.history] = tab.id
        this.$emit('action', 'pushRouter', route)

      } else if (this.keyStorage) {
        this.$store.dispatch('Storage/set', [this.keyStorage, { active: this.active }])
      }

      if (this.loadOnce) {
        tab.loaded = true
      }
    },

    init (index) {
      let right = 0,
          width = 0

      if (this.$refs.row) {
        this.$refs.row.styles = getComputedStyle(this.$refs.row)

        this.$refs.row.querySelectorAll('.evo-tab').forEach((t, i) => {
          t.styles = getComputedStyle(t)

          if (i <= index) {
            width += t.offsetWidth + parseFloat(t.styles.marginLeft) + parseFloat(t.styles.marginRight)

            if (i < index) {
              right += t.offsetWidth + parseFloat(t.styles.marginLeft)
            }
          }
        })

        if (this.$refs.row.scrollLeft > right) {
          this.$refs.row.scrollLeft = right
        }

        if (this.$refs.row.offsetWidth < width) {
          this.$refs.row.scrollLeft = width - this.$refs.row.offsetWidth
        }
      }

      if (this.$refs.prev) {
        if (index) {
          this.$refs.prev.classList.remove('disabled')
        } else {
          this.$refs.prev.classList.add('disabled')
        }
      }

      if (this.$refs.next) {
        if (this.data[index + 1]) {
          this.$refs.next.classList.remove('disabled')
        } else {
          this.$refs.next.classList.add('disabled')
        }
      }
    },

    prev () {
      const index = this.data.findIndex(tab => tab.id === this.active) - 1

      if (this.data[index]) {
        this.select(this.data[index], index)
      }
    },

    next () {
      const index = this.data.findIndex(tab => tab.id === this.active) + 1

      if (this.data[index]) {
        this.select(this.data[index], index)
      }
    }
  }
}
</script>

<style scoped>
.evo-tab-row-container {
  @apply overflow-hidden relative h-12 w-full
}
.evo-tab-row {
  @apply relative z-20 overflow-hidden overflow-x-auto h-20 px-0 mx-0 pt-1 flex flex-nowrap
}
.evo-tab-row-container.evo-tab-row-with-navigation > .evo-tab-row {
  @apply mx-5
}
.evo-tab-pane {
  @apply flex flex-wrap flex-col grow content-start
}
.evo-tab-pane .evo-tab {
  @apply py-3 px-4 h-12 relative shrink-0 cursor-pointer whitespace-nowrap rounded-t select-none text-center font-medium text-gray-600 hover:bg-slate-200/40 dark:hover:bg-gray-700/50 dark:text-gray-300 transition
}
.evo-tab-pane .evo-tab.active {
  @apply bg-white border-inherit text-gray-800 dark:bg-gray-700 dark:text-gray-50 shadow-md dark:shadow-black/20
}
.evo-tab-pane .evo-tab .evo-icon + span {
  @apply ml-2
}
.evo-tab-pane .evo-tab-pane-small-tabs {
  @apply h-auto
}
.evo-tab-pane .evo-tab-pane-small-tabs .evo-tab-row {
  @apply py-0.5 mx-0.5 h-auto
}
.evo-tab-pane .evo-tab-pane-small-tabs .evo-tab {
  @apply px-2 py-1 mx-0.5 h-auto w-10 hover:bg-gray-700 text-gray-200 rounded
}
.evo-tab-pane .evo-tab-pane-small-tabs .evo-tab.active {
  @apply bg-blue-600 text-white/90
}
.evo-tab-pane .evo-prev, .evo-tab-pane .evo-next {
  @apply absolute h-11 w-5 top-1 pt-1 flex items-center justify-center cursor-pointer select-none hover:text-blue-500 transition
}
.evo-tab-pane .evo-prev {
  @apply left-0
}
.evo-tab-pane .evo-next {
  @apply right-0
}
.evo-tab-pane .evo-prev.disabled, .evo-tab-pane .evo-next.disabled {
  @apply opacity-0 scale-0
}
.evo-tab-page {
  @apply w-full basis-0 content-start items-start grow bg-white dark:bg-gray-700 shadow
}
.evo-tab-pane.evo-tab-pane-vertical {
  @apply flex-row
}
.evo-tab-pane-vertical > .evo-tab-row-container {
  @apply grow-0 h-auto w-auto pl-4 pr-0 mb-0 -mr-[1px]
}
.evo-tab-pane-vertical > .evo-tab-row-container::after {
  @apply left-auto top-0
}
.evo-tab-pane-vertical > .evo-tab-row-container .evo-tab-row {
  @apply flex-col h-auto pl-1 pr-0 py-4 m-0
}
.evo-tab-pane-vertical > .evo-tab-row-container .evo-tab {
  @apply rounded-l rounded-r-none truncate max-w-[15rem]
}
.evo-tab-pane-vertical > .evo-tab-row-container .evo-prev::before, .evo-tab-pane-vertical > .evo-tab-row-container .evo-next::before {
  @apply rotate-90
}
.evo-tab-pane-vertical > .evo-tab-row-container .evo-prev {
  @apply h-auto w-full py-1
}
.evo-tab-pane-vertical > .evo-tab-row-container .evo-next {
  @apply h-auto w-full py-1 top-auto bottom-0
}
.evo-tab-pane-vertical > .evo-tab-page {
  @apply h-full grow basis-0 rounded-l
}
.evo-tab-pane-vertical.evo-tab-pane .evo-prev, .evo-tab-pane-vertical.evo-tab-pane .evo-next {
  @apply hidden
}
</style>

<style>
.evo-panel > .evo-tab-pane > .evo-tab-row-container::before, .evo-panel > .layout > .evo-tab-pane > .evo-tab-row-container::before {
  @apply absolute left-0 top-0 right-0 bottom-[1px];
  content: "";
}
.evo-panel > .evo-tab-pane.evo-tab-pane-vertical > .evo-tab-row-container::before, .evo-panel > .layout > .evo-tab-pane.evo-tab-pane-vertical > .evo-tab-row-container::before {
  @apply bottom-0 right-[1px]
}
.evo-tab-page .evo-tab-pane-vertical {
  @apply overflow-hidden
}
.evo-tab-page .evo-tab-pane-vertical > .evo-tab-page {
  @apply border-t-0 rounded-none rounded-l shadow-none border-l
}
.evo-tab-page .evo-tab-pane-vertical > .evo-tab-row-container {
  @apply mr-[-1px]
}
.evo-tab-page .evo-tab-pane-vertical > .evo-tab-row-container .evo-tab {
  @apply shadow-none border border-transparent
}
.evo-tab-page .evo-tab-pane-vertical > .evo-tab-row-container .evo-tab.active {
  @apply border-inherit border-r-white dark:border-r-gray-700
}
.evo-tab-pane-vertical > .evo-tab-page .evo-tab-page {
  @apply px-8
}
</style>
