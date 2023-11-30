<script setup>
import { compile, computed, getCurrentInstance, h, nextTick, onMounted, reactive } from 'vue'
import Frame from './Layout/Frame.vue'

const instance = getCurrentInstance()
const $props = defineProps(['currentRoute'])
const $emit = defineEmits(['action', 'update:modelValue'])
const $data = reactive({
  url: $props.currentRoute?.['meta']?.['url'] ? $props.currentRoute['meta']['url'] : $props.currentRoute['path'],
  data: null,
  meta: null,
  layout: null,
  errors: null
})

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

  $emit('update:modelValue', ...arguments)
}

function action () {
  $emit('action', ...arguments)
}

function setValue (key, value) {
  if (~key.indexOf('.')) {
    if ($data.data[key] !== undefined) {
      $data.data[key] = value
    } else {
      setData(key.split('.'), value, $data, true)
    }
  } else {
    $data.data[key] = value
  }
}

function findData (keys, data) {
  let obj = {}

  data = data || $data

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

  attrs.key = data['model'] || data.component.name || ''
  attrs['onUpdate:modelValue'] = updateModelValue
  attrs.modelValue = attrs.value

  if (component.props?.['error'] || component?.extends?.props?.['error']) {
    attrs.error = $data['errors']?.[attrs.key]
  }

  if (component.props?.['currentRoute'] || component?.extends?.props?.['currentRoute']) {
    attrs.currentRoute = $data['currentRoute']
  }

  if (setAction || component.props?.['modelValue'] || component?.extends?.props?.['modelValue']) {
    attrs.onAction = action
  }

  if ($data.data?.[attrs.key] !== undefined) {
    attrs.modelValue = $data.data[attrs.key]
  } else if (~attrs.key.indexOf('.')) {
    attrs.modelValue = findData(attrs.key.split('.'))
  }

  return h(component, attrs, slots)
}

function setLayoutData (data) {
  data = data || $data['layout']

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
  if (typeof $data.layout === 'string') {
    return h(Frame, { url: $data.url, currentRoute: $props.currentRoute })
  }

  return h('div', {
    class: 'flex w-full h-full flex-wrap flex-col overflow-hidden'
  }, initData(null, true))
}

function loadData () {
  $emit('action', 'setTab', {
    key: instance.vnode.key,
    changed: false,
    loading: true,
    saving: false,
    meta: { title: $props.currentRoute?.['meta']?.title !== undefined ? $props.currentRoute['meta'].title : '...' }
  })

  $data.data = null
  $data.meta = null
  $data.errors = null

  if (!$props.currentRoute['meta']['group']) {
    $data.layout = null
  }

  axios.get($data.url, {
    urlParams: $props.currentRoute['params'],
    params: $props.currentRoute['query']
  }).then(({ data: data }) => {
    if (typeof data === 'string') {
      $data.layout = data
    } else {
      Object.assign($data, data)

      if ($data?.meta?.['title'] !== undefined || $data?.meta?.['icon'] !== undefined) {
        $emit('action', 'setTab', {
          key: instance.vnode.key,
          meta: { title: $data.meta['title'] ?? '', icon: $data.meta['icon'] ?? '' }
        })
      }
    }
  }).finally(() => {
    $emit('action', 'setTab', {
      key: instance.vnode.key,
      changed: false,
      loading: false,
      saving: false
    })
  })
}

onMounted(loadData)
</script>

<template>
  <component v-if="$data.layout" :is="renderLayout" @action="action"/>
</template>
