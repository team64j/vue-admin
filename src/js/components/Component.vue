<script setup>
import { compile, computed, h, nextTick } from 'vue'

const props = defineProps(['data', 'meta', 'layout', 'errors', 'loaderDelay', 'currentRoute', 'class'])
const emit = defineEmits(['action', 'update:modelValue'])

const loaderDelay = props['loaderDelay'] || 0
let renderLayout = computed(init)

function updateModelValue (value, instance) {
  if (!instance) {
    return
  }

  const key = typeof instance === 'object' ? instance._.vnode.key : instance

  setValue(key, value)

  if (instance?.relation?.['key']) {
    const empty = !(Array.isArray(value) ? value.length : (!isNaN(parseFloat(value))
        && !isNaN(value - 0)) ? parseFloat(value) : value)

    setValue(instance.relation['key'], empty ? instance.relation['falseValue'] : instance.relation['trueValue'])

    if (empty && instance.relation['notEmpty']) {
      nextTick(() => setValue(key, instance.trueValue))
    }
  }

  emit('update:modelValue', ...arguments)
}

function action () {
  emit('action', ...arguments)
}

function setValue (key, value) {
  if (~key.indexOf('.')) {
    if (props['data'][key] !== undefined) {
      props['data'][key] = value
    } else {
      setData(key.split('.'), value, props, true)
    }
  } else {
    props['data'][key] = value
  }
}

function findData (keys, data) {
  let obj = {}

  data = data || props

  keys.forEach((key, index) => {
    if (data[key] !== undefined) {
      if (keys[index + 1] !== undefined) {
        keys.shift()
        obj = findData(keys, data[key])
      } else {
        obj = data[key]
      }
    }
  })

  return obj
}

function setData (keys, value, data, first) {
  if (!first && data && data[keys[0]] === undefined) {
    data[keys[0]] = {}
  }

  keys.forEach((key, index) => {
    if (data[key] !== undefined) {
      if (keys[index + 1] !== undefined) {
        keys.shift()
        setData(keys, value, data[key])
      } else {
        data[key] = value
      }
    }
  })
}

function initData (data, setAction) {
  data = data || setLayoutData()

  if (!data) {
    return
  }

  if (data.component) {
    return createComponent(data, setAction)
  }

  if (typeof data === 'string') {
    data = data.replace(/href=/g, 'to=').replace(/<a(.*?)>/g, '<router-link$1>').replace(/(<\/a>)/g, '</router-link>')
    return h(compile(data))
  }

  if (typeof data === 'object') {
    let obj
    if (Array.isArray(data)) {
      obj = []
      data.forEach(i => obj.push(initData(i, setAction)))
    } else {
      obj = Object.create(null)
      for (let i in data) {
        const slots = initData(data[i])
        obj[i] = () => slots
      }
    }
    return obj
  }

  return data
}

function createComponent (data, setAction) {
  let component = window.Vue._context?.components[data.component]
  const attrs = data.attrs || {}
  let slots

  if (data.slots) {
    slots = initData(data.slots)
  }

  if (!component && data.component) {
    component = (new Function('return ' + data.component + '')).call(this)
  }

  if (!component) {
    return
  }

  attrs.key = data.model || data.component.name || ''
  attrs['onUpdate:modelValue'] = updateModelValue
  attrs.modelValue = attrs.value

  if (component.props?.['error'] || component?.extends?.props?.['error']) {
    attrs.error = props['errors']?.[attrs.key]
  }

  if (component.props?.['currentRoute'] || component?.extends?.props?.['currentRoute']) {
    attrs.currentRoute = props['currentRoute']
  }

  if (setAction || component.props?.['modelValue'] || component?.extends?.props?.['modelValue']) {
    attrs.onAction = action
  }

  if (props['data']?.[attrs.key] !== undefined) {
    attrs.modelValue = props['data'][attrs.key]
  } else if (~attrs.key.indexOf('.')) {
    attrs.modelValue = findData(attrs.key.split('.'))
  }

  return h(component, attrs, slots)
}

function setLayoutData (data) {
  data = data || props['layout']

  for (let i in data) {
    if (typeof data[i]?.data === 'string') {
      const keys = data[i].data.split('.')

      if (!data[i].attrs) {
        data[i].attrs = {}
      }

      data[i].attrs.data = findData(keys)
      data[i].attrs.onAction = action
    } else if (data[i]?.slots) {
      data[i].slots = setLayoutData(data[i].slots)
    } else if (Array.isArray(data[i])) {
      data[i] = setLayoutData(data[i])
    }
  }

  return data
}

function init () {
  return h('div', { class: 'layout' }, initData(null, true))
}
</script>

<template>
  <component v-if="layout" :is="renderLayout"/>
</template>

<style>
.layout {
  @apply flex w-full h-full flex-wrap flex-col overflow-hidden
}
</style>
