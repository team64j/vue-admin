<template>
  <div class="w-full mb-3" :class="props.class">
    <label v-if="label" class="block font-bold mb-1">
      {{ label }}
      <evo-layout-help-icon v-if="help" :data="help"/>
    </label>

    <div class="relative evo-editor">
      <div class="evo-settings">
        <i class="fas fa-expand fa-compress evo-fullscreen" @click="onClickFullscreen"/>
        <i class="fa fa-gear select" v-if="config.length > 1">
          <span class="evo-menu">
            <span v-for="i in config" :class="{ 'active': i.active }" @click="onClickSelect"
                  :data-component="i.component">{{ i.name }}</span>
          </span>
        </i>
      </div>

      <component
          v-model="model"
          :is="component"
          :extensions="extensions"
          :style="{ height }"
          class="w-full"/>
    </div>
    <div v-if="description" v-html="description" class="opacity-75 text-sm"/>
  </div>
</template>

<script setup>
import { computed, getCurrentInstance, h, markRaw, reactive } from 'vue'
import { Codemirror } from 'vue-codemirror'
import { oneDark } from '@codemirror/theme-one-dark'
import { javascript } from '@codemirror/lang-javascript'
import { markdown } from '@codemirror/lang-markdown'
import { json } from '@codemirror/lang-json'
import { html } from '@codemirror/lang-html'
import { php } from '@codemirror/lang-php'
import { xml } from '@codemirror/lang-xml'
import { css } from '@codemirror/lang-css'
import { vue } from '@codemirror/lang-vue'
import { sql } from '@codemirror/lang-sql'
import store from '../../store'

const instance = getCurrentInstance()

const props = defineProps({
  modelValue: {
    type: [String, Object, Number]
  },
  config: {
    type: Array,
    default: [{ component: 'Codemirror', name: 'Codemirror' }]
  },
  rows: {
    type: [String, Number],
    default: 3
  },
  class: [Array, Object, String],
  label: String,
  help: String,
  description: String,
  lang: String
})

const emit = defineEmits(['update:modelValue'])

const defaultConfig = [
  {
    active: true,
    component: 'Textarea',
    name: store.getters['Lang/get']('none')
  },
  {
    component: 'Codemirror',
    name: 'Codemirror'
  }
]

const data = reactive({
  currentConfig: props.config.length > 1
      ? props.config.filter(i => i.active)[0] || defaultConfig[0]
      : props.config[0]
})

const languages = {
  javascript,
  markdown,
  html,
  json,
  css,
  xml,
  php,
  vue,
  sql
}

const component = computed(() => {
  if (!data.currentConfig) {
    return
  }

  if (data.currentConfig['component'] === 'Textarea') {
    data.currentConfig['_component'] = () => h('textarea', {
      value: model.value,
      rows: props.rows,
      class: 'block w-full px-3 py-1 rounded resize-none',
      onInput: event => {
        emit('update:modelValue', event.target.value, instance['ctx'])
      }
    })
  } else {
    data.currentConfig['component'] = 'Codemirror'
    data.currentConfig['_component'] = markRaw(Codemirror)
  }

  return data.currentConfig['_component']
})

const model = computed({
  get () {
    return props.modelValue
  },
  set (value) {
    emit('update:modelValue', value, instance['ctx'])
  }
})

const extensions = computed(() => {
  if (!data.currentConfig) {
    return
  }

  const extensions = []

  if (!data.currentConfig?.['lang'] && props.lang) {
    data.currentConfig['lang'] = props.lang
  }

  if (languages[data.currentConfig?.['lang']]) {
    extensions.push(languages[data.currentConfig['lang']]())
  }

  if (!instance.root.proxy['dark'] || data.currentConfig?.['dark']) {
    extensions.push(oneDark)
  }

  return extensions
})

const height = computed(() => {
  if (props.rows === 'auto') {
    return props.rows
  }

  const fs = parseFloat(window.getComputedStyle(document.documentElement, null).getPropertyValue('font-size'))

  return ((fs * 0.375) * 2) + (props.rows * 1.5 * fs) + 2 + 'px'
})

function onClickSelect (event) {
  props.config.map(i => {
    if (i.component === event.currentTarget.dataset['component']) {
      i.active = true
      data.currentConfig = { ...i }
    } else {
      i.active = false
    }
  })
}

function onClickFullscreen () {
  const target = instance.vnode.el.querySelector('.evo-fullscreen')

  if (target.classList.contains('fa-expand')) {
    target.classList.remove('fa-expand')
  } else {
    target.classList.add('fa-expand')
  }

  instance.vnode.el.querySelector('.evo-editor').classList.toggle('evo-editor-fullscreen')
}

</script>

<style scoped>
.evo-settings {
  @apply absolute z-10 top-1.5 right-2 w-5
}

.evo-settings i {
  @apply relative mb-2 opacity-80 hover:opacity-100
}

.evo-settings i:hover > * {
  @apply opacity-100 visible
}

.evo-settings .evo-menu {
  @apply block opacity-0 invisible absolute right-0 top-full py-1 rounded shadow-md font-sans font-normal text-base text-white bg-gray-800 dark:text-gray-800 dark:bg-white transition
}

.evo-settings .evo-menu span:hover, .evo-settings .evo-menu span.active {
  @apply bg-blue-600 text-white
}

.evo-settings .evo-menu span {
  @apply block px-4 py-1 cursor-pointer hover:bg-blue-500
}

.evo-settings .evo-fullscreen {
  @apply cursor-pointer
}

.evo-editor-fullscreen {
  @apply fixed z-50 left-0 top-0 right-0 bottom-0 bg-slate-100 dark:bg-gray-800;
  z-index: 90099;
}
</style>

<style>
.evo-editor-fullscreen > textarea, .evo-editor-fullscreen .v-codemirror, .evo-editor-fullscreen .v-codemirror .cm-editor {
  @apply !h-full text-lg
}
/**
 * Codemirror
 */
.v-codemirror {
  @apply !flex
}
.editor-fullscreen .v-codemirror {
  @apply text-lg
}
.v-codemirror .ͼ1.cm-editor {
  @apply w-full border bg-white rounded-sm transition
}
.v-codemirror .ͼo.ͼ1.cm-editor {
  @apply border-inherit bg-gray-800
}
.v-codemirror.border-r-0 .ͼ1.cm-editor {
  border-right: 0;
}
.v-codemirror.border-l-0 .ͼ1.cm-editor {
  border-left: 0;
}
.v-codemirror .ͼ1.cm-editor.cm-focused {
  @apply outline outline-1 outline-blue-600 outline-offset-0 border-blue-600
}
.v-codemirror .ͼ1 .cm-scroller {
  @apply flex-nowrap flex-row rounded
}
.v-codemirror .ͼ1 .cm-gutters {
  @apply grow-0 basis-0 rounded
}
.v-codemirror .ͼ1 .cm-content {
  @apply whitespace-pre-line grow basis-0 max-w-full break-words
}
</style>

