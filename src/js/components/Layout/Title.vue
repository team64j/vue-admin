<script setup>
import { computed, reactive } from 'vue'

const $props = defineProps({
  id: [String, Number],
  modelValue: String,
  title: String,
  icon: String,
  help: String,
  currentRoute: Object
})

const $data = reactive({
  id: $props.id ?? $props.currentRoute.params['id'] ?? null,
  icon: $props.icon ?? $props.currentRoute.meta['icon'] ?? null,
  show: false
})

const $methods = {
  show () {
    $data.show = !$data.show
  }
}

const title = computed(() => $props.modelValue || $props.title || $props.currentRoute.meta.title)
</script>

<template>
  <div class="w-full py-4 px-5">
    <h1 class="m-0 whitespace-nowrap flex items-center">
      <i v-if="$data.icon" class="mr-2 w-6 text-center text-lg opacity-60" :class="$data.icon"/>
      <span class="text-2xl font-bold truncate">{{ title }}</span>
      <span v-if="$data.id" class="ml-2">({{ $data.id }})</span>
      <i v-if="$props.help" class="fa fa-question-circle ml-3 text-sm opacity-40 hover:opacity-75 cursor-pointer"
         @click="$methods.show()"/>
    </h1>
    <transition>
      <div v-if="$props.help" v-show="$data.show" v-html="$props.help" class="bg-blue-500/30 mt-3 p-3 rounded"/>
    </transition>
  </div>
</template>
