<template>
  <div class="relative flex items-center mx-0.5">
    <button
        v-if="icon"
        class="app-tree__menu__item"
        @mousedown="clickItem"
        @blur="blur">
      <template v-if="loader">
        <evo-layout-loader-icon v-if="loading" class="inline-flex"/>
        <i v-else :class="icon" class="fa-fw w-5 h-5"/>
      </template>
      <i v-else :class="icon" class="fa-fw w-5 h-5"/>
    </button>

    <div v-else-if="component === 'search'" class="relative -my-0.5">
      <input type="text" class="px-2 py-0 text-base" :value="this.searchValue" @input="searchInput"
             :placeholder="$store.getters['Lang/get']('search')">
      <i v-if="this.searchValue" class="far fa-times-circle text-rose-600 absolute top-1.5 right-1.5 cursor-pointer"
         @click="searchClear"/>
    </div>

    <transition>
      <div v-if="active"
           class="absolute z-20 mt-1.5 py-1 bg-gray-700 top-full rounded shadow border cursor-default"
           :class="[position !== 'right' ? 'left-0' : 'right-0']">
        <template v-for="action in actions">
          <div v-if="action.title && Object.values(action).length === 1" class="py-1 px-4 text-white/80">
            {{ action.title }}
          </div>
          <div v-else-if="action.split" class="py-1 px-3">
            <div class="border-b"></div>
          </div>
          <div v-else
               class="px-4 py-0.5 whitespace-nowrap text-gray-100 hover:text-white hover:bg-blue-500"
               @mousedown="clickAction(action)">
            <i v-if="check(action)" class="fa fa-check w-4"/>
            <i v-else class="fa w-4"/>
            {{ action.title }}
          </div>
        </template>
      </div>
    </transition>
  </div>
</template>

<script>
import LoaderIcon from '../../components/Layout/LoaderIcon.vue'

export default {
  name: 'TreeMenuItem',
  components: { LoaderIcon },
  props: {
    icon: String,
    component: String,
    position: String,
    actions: Array,
    click: String,
    settings: Object,
    loader: Boolean,
    loading: Boolean
  },

  data () {
    return {
      active: false,
      searchValue: '',
      searchCounter: 0
    }
  },

  methods: {
    blur () {
      this.$nextTick(() => this.active = false)
    },

    clickItem () {
      if (this.actions) {
        this.active = !this.active
      }

      if (this.click) {
        this.$emit('action', this.click)
      }
    },

    clickAction (action) {
      this.active = !this.active

      if (action.toggle) {
        if (Array.isArray(this.settings[action.key])) {
          const index = this.settings[action.key].indexOf(action.value)
          if (~index) {
            this.settings[action.key].splice(index, 1)
          } else {
            this.settings[action.key].push(action.value)
          }
        } else {
          this.settings[action.key] = action.value
        }
        this.$emit('action', 'update')
      }
    },

    check (action) {
      if (this.settings[action.key] !== undefined) {
        if (Array.isArray(this.settings[action.key])) {
          return ~this.settings[action.key].indexOf(action.value)
        } else {
          return this.settings[action.key] === action.value
        }
      }

      return false
    },

    searchInput (event) {
      this.searchValue = event.target.value
      clearTimeout(this.searchCounter)

      this.searchCounter = setTimeout(() => {
        this.$emit('action', 'onSearch', this.searchValue)
      }, 200)
    },

    searchClear () {
      this.searchValue = ''

      this.$emit('action', 'onSearch', this.searchValue)
    }
  }
}
</script>
