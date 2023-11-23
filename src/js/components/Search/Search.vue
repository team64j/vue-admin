<script setup>
import { getCurrentInstance, nextTick, onMounted, reactive, watchEffect } from 'vue'

const instance = getCurrentInstance()

const data = reactive({
  search: '',
  result: null,
  timer: 0,
  searching: false
})

onMounted(() => {
  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.code === 'KeyF') {
      instance.root.proxy['search'] = 1
      event.preventDefault()
    }

    if (event.code === 'Escape' && instance.root.proxy['search']) {
      instance.root.proxy['search'] = 0
      event.preventDefault()
    }
  })
})

watchEffect(() => {
  if (instance.root.proxy['search']) {
    nextTick(() => instance.vnode.el.querySelector('.app-search__input input').focus())
  }
})

const methods = {
  onClose () {
    instance.root.proxy['search'] = instance.root.proxy['search'] ? 0 : 1
  },
  onInput (event) {
    data.search = event.target.value
    clearTimeout(data.timer)
    data.timer = setTimeout(methods.onSearch, 500)
  },
  onSearch () {
    if (data.search === '') {
      data.result = null
    } else {
      data.search = data.search.trim()
      data.result = []
      console.log(data.search)
    }
  },
  onClear () {
    data.search = ''
    data.result = null
    nextTick(() => instance.vnode.el.querySelector('.app-search__input input').focus())
  }
}
</script>

<template>
  <transition name="fade">
    <div v-show="instance.root.proxy['search']" class="app-search">
      <div class="app-search__back" @click="methods.onClose"/>
      <div class="app-search__main">
        <div class="app-search__input">
          <input type="text" name="search" placeholder="Enter to Search, Ctr+F to show or Escape to close"
                 class="input-lg text-2xl border-0 border-b-2 rounded-none"
                 :value="data.search"
                 @input="methods.onInput">
          <i v-if="data.search !== ''" class="app-search__clear fa fa-times" @click="methods.onClear"/>
        </div>
        <div class="app-search__result">
          <template v-if="data.searching">
            <div class="text-center p-4"><loader-icon/></div>
          </template>

          <template v-else-if="data.result">
            <div v-if="data.result.length" v-for="i in data.result">
              {{ i }}
            </div>
            <div v-else class="text-center p-4">Not Found</div>
          </template>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.app-search {
  @apply flex justify-center items-baseline absolute z-30 left-0 top-0 right-0 bottom-0 p-5
}
.app-search__back {
  @apply absolute left-0 top-0 right-0 bottom-0
}
.app-search__main {
  @apply relative flex flex-col bg-white dark:bg-gray-800 border w-full h-auto max-w-screen-md max-h-full shadow-2xl
}
.app-search__input {
  @apply -mb-0.5 relative
}
.app-search__input input {
  @apply w-full
}
.app-search__clear {
  @apply absolute top-4 right-4 text-lg cursor-pointer opacity-75 hover:opacity-100 transition
}
.app-search__result {
  @apply grow h-full overflow-auto
}
</style>
