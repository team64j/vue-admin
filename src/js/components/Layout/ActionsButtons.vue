<template>
  <div class="app-actions-buttons">

    <template v-for="i in actions">
      <button
          v-if="typeof i === 'string'"
          type="button"
          class="btn-sm mx-0.5"
          :class="classes[i]"
          :title="lang[i]"
          @click="click($event, i)"
          :data-action="i"
          :disabled="saving">
        <i class="fa fa-fw" :class="icon[i]"/>
        <span>{{ lang[i] }}</span>
      </button>

      <div v-else class="relative">
        <button v-for="ii in i.data.filter((j, kk) => kk === stay)"
                :title="lang[i.action] + ' + ' + ii.title"
                @click="click($event, i.action, stay)"
                :disabled="saving"
                class="btn-sm btn-green rounded-r-none">
          <i :class="i.icon"/>
          <i class="fa fa-plus fa-fw"/>
          <i :class="ii.icon"/>
          <span>{{ lang[i.action] + ' + ' + ii.title }}</span>
          <i v-if="saving"
             class="btn-sm btn-green cursor-progress absolute flex items-center justify-center left-0 top-0 h-full w-full z-10"
             @click.prevent.stop="() => false">
            <i class="fa fa-circle-notch fa-fw animate-spin"/>
          </i>
        </button>
        <button type="button" class="btn-sm btn-green rounded-l-none relative btn-toggle" @click="isToggle=!isToggle"
                @blur="isToggle=false"
                :disabled="saving">
          <i class="fa-solid fa-angle-down fa-fw evo-toggle transition" :class="{ 'transform rotate-180': isToggle }"/>
        </button>
        <div v-show="isToggle" class="app-actions-buttons__save-buttons shadow">
          <button v-for="ii in i.data.filter((j, kk) => kk !== stay)"
                  :title="lang[i.action] + ' + ' + ii.title"
                  @mousedown.prevent="click($event, i.action, ii.stay)"
                  :disabled="saving"
                  class="btn-sm">
            <i class="fa fa-plus fa-fw"/>
            <i :class="ii.icon"/>
            <span>{{ ii.title }}</span>
          </button>
        </div>
      </div>
    </template>

  </div>
</template>

<script>
export default {
  name: 'ActionsButtons',
  props: {
    actions: {
      type: Array,
      default: ['cancel', 'delete', 'save']
    },
    lang: {
      type: Object,
      default: {
        cancel: 'Cancel',
        delete: 'Delete',
        clear: 'Clear',
        restore: 'Restore',
        copy: 'Copy',
        view: 'View',
        save: 'Save'
      }
    },
    classes: {
      type: Object,
      default: {
        cancel: '',
        delete: 'btn-red',
        clear: '',
        restore: '',
        copy: '',
        view: '',
        save: 'btn-green'
      }
    },
    to: {
      type: Object,
      default: {}
    },
    icon: {
      type: Object,
      default: {
        cancel: 'fa fa-reply',
        delete: 'fa fa-trash-alt',
        clear: 'fa fa-remove',
        restore: 'fa fa-undo',
        copy: 'fa fa-copy',
        view: 'fa fa-eye',
        new: 'fa fa-plus',
        save: 'fa fa-save'
      }
    }
  },

  data () {
    return {
      isToggle: false,
      stay: this.$store.getters['Storage/get']('stay') || 0
    }
  },

  computed: {
    saving () {
      return this.$store.getters['GlobalTabs/active']?.saving ?? undefined
    }
  },

  methods: {
    click (event, action, stay) {
      if (this.to[action]) {
        if (this.to[action].close) {
          this.$emit('action', 'closeTab')
        }

        if (this.to[action].href) {
          window.open(this.to[action].href)
        } else {
          this.$router.push(this.to[action])
        }
      } else if (this[action]) {
        this[action](event, stay)
      } else {
        this.$emit('action', action, event, stay)
      }
    },

    save (event, stay) {
      this.isToggle = false
      this.stay = stay
      this.$emit('action', 'setTab', {
        changed: false,
        saving: true
      })
      this.$emit('action', 'save', stay)
      this.$store.dispatch('Storage/set', ['stay', stay])
    },

    new (event) {
      if (this.to['new']) {
        this.$router.push(this.to['new'])
        return
      }

      this.$emit('action', 'new', event)
    }
  }
}
</script>

<style scoped>
.app-actions-buttons {
  @apply fixed z-30 flex rounded-b bg-gray-500/5 dark:bg-gray-500/20 p-2 right-4
}
.app-actions-buttons > button, .app-actions-buttons > div {
  @apply inline-flex mx-0.5
}
.app-actions-buttons button > i.fa:not(.evo-toggle) {
  @apply md:hidden
}
.app-actions-buttons button span {
  @apply hidden md:inline-block px-1
}
.app-actions-buttons button.btn-toggle::before {
  @apply block absolute left-[-1px] top-[10%] h-[80%] w-[1px] bg-white/20;
  content: "";
}
.app-actions-buttons__save-buttons {
  @apply absolute left-0 top-full mt-0.5 w-full flex flex-col opacity-100 visible transition
}
.app-actions-buttons__save-buttons button {
  @apply border-t-0 rounded-none first:rounded-t last:rounded-b
}
</style>
