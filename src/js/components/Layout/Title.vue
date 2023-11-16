<script setup>
import { reactive } from 'vue'
import router from '../../router'

const props = defineProps({
  id: [String, Number],
  modelValue: String,
  title: String,
  icon: String,
  help: String
})

const data = reactive({
  show: false,
  id: props.id ?? router.currentRoute.value.params['id'] ?? null,
  icon: props.icon ?? router.currentRoute.value.meta['icon'] ?? null
})
</script>

<template>
  <div class="w-full py-4 px-5">
    <h1 class="m-0 whitespace-nowrap flex items-center">
      <i v-if="data.icon" class="mr-2 w-6 text-center text-lg opacity-60" :class="data.icon"/>
      <span class="text-2xl font-bold truncate">
        {{ modelValue || title || $route.meta.title }}
      </span>
      <span v-if="data.id" class="ml-2">({{ data.id }})</span>
      <i v-if="props.help" class="fa fa-question-circle ml-3 text-sm opacity-40 hover:opacity-75 cursor-pointer"
         @click="data.show=!data.show"/>
    </h1>
    <transition mode="out-in">
      <div v-if="props.help" v-show="data.show" v-html="props.help" class="bg-blue-500/30 mt-3 p-3 rounded"/>
    </transition>
  </div>
</template>
