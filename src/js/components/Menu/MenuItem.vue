<script setup>
import { computed, getCurrentInstance, h, ref } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  data: {
    type: Object,
    default: {}
  },
  level: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['loadData'])

const instance = getCurrentInstance()['ctx']

let timer = 0
let filter
let loading = ref(false)
let propData = ref(props.data?.['url'] ? [] : (props.data?.['data'] || []))

function loadData (url, params = {}, f) {
  url ??= props.data['url']
  loading.value = true
  propData.value = []

  if (f !== undefined) {
    filter = f
  }

  if (filter !== undefined) {
    params.filter = filter
  }

  axios.get(url, {
    params: params
  }).then(({ data: data }) => {
    const filterData = []
    const pagination = data['meta']['pagination'] ?? {}

    if (pagination?.['total'] > pagination?.['page'] || filter) {
      filterData.push({ filter: filter || '' })
    }

    propData.value = [].concat(props.data['data'], filterData, (data['data'] || []).map(i => {
      i.to = {
        name: props.data['name'],
        params: {
          id: i.id
        }
      }

      return i
    }))

    if (pagination?.['prev'] || pagination?.['next']) {
      propData.value.push({
        total: pagination['total'] ?? null,
        info: pagination['info'] ?? null,
        prev: pagination['prev'] ?? null,
        next: pagination['next'] ?? null
      })
    }

    instance.$nextTick(() => {
      const input = instance.$el.querySelector('input')
      if (input) {
        input.focus()
      }
    })
  }).finally(() => {
    loading.value = false
  })
}

function onEnter () {
  instance.$parent.$el.querySelectorAll(':scope > ul > li.hover').forEach(i => {
    if (instance.$el !== i) {
      i.classList.remove('hover')
      i.querySelectorAll('li.hover').forEach(j => j.classList.remove('hover'))
    }
  })

  if (instance.$el.classList.contains('hover')) {
    return
  }

  if (props.data['url']) {
    propData.value = []
    clearTimeout(timer)
    timer = setTimeout(() => loadData(props.data['url']), 200)
  }

  instance.$el.classList.add('hover')
}

function onOut () {
  if (props.data['url']) {
    clearTimeout(timer)
  }
}

function onClick () {
  if (props.data['icons'] && instance.$root[props.data['key']] !== undefined) {
    const key = instance.$root[props.data['key']].toString()
    for (const i in props.data['icons']) {
      if (i === key) {
        instance.$root[props.data['key']] = props.data['icons'][i]['value']
      }
    }
  }

  if (props.data['click'] && instance.$root[props.data['click']]) {
    return instance.$root[props.data['click']]()
  }
}

const classLI = computed(() => {
  let c = ''
  if (props.data?.['data']?.length || props.data?.['url']) {
    c += 'parent'
  }

  return c
})

const node = computed(() => {
  let node
  let slots = []

  let icon = null
  if (props.data['icons'] && instance.$root[props.data['key']] !== undefined) {
    const key = instance.$root[props.data['key']].toString()
    for (const i in props.data['icons']) {
      if (i === key) {
        icon = props.data['icons'][i]['key']
        break
      }
    }
  }

  icon = icon ?? props.data['icon'] ?? null

  // icon
  if (icon) {
    if (/^http/.test(icon)) {
      slots.push(h('img', {
        src: icon
      }))
    } else {
      slots.push(h('i', {
        class: 'icon ' + icon
      }))
    }
  }

  // title
  if (props.data['name']) {
    slots.push(h('span', {
      class: 'title',
      innerText: props.data['name']
    }))
  }

  // locked
  if (props.data['locked']) {
    slots.push(h('i', { class: 'locked fa fa-lock' }))
  }

  // id
  if (props.data['id'] !== undefined) {
    slots.push(h('span', {
      class: 'id',
      innerText: props.data['id']
    }))
  }

  if (loading.value) {
    slots.push(h('span', {
      class: 'toggle'
    }, h('i', { class: 'fa fa-circle-notch fa-fw animate-spin' })))
  } else if ((props.data['data']?.length && props.level) || props.data['url']) {
    slots.push(h('span', {
      class: 'toggle'
    }, h('i', { class: 'fa fa-chevron-down fa-fw' })))
  }

  if (props.data['href']) {
    node = h('a', {
      href: props.data['href'],
      target: '_blank'
    }, [slots])
  } else if (props.data['to']) {
    node = h(RouterLink, {
      to: props.data['to']
    }, () => slots)
  } else if (props.data['prev'] || props.data['next']) {
    slots = []

    // prev
    slots.push(h('i', {
      class: 'fa fa-chevron-left prev',
      disabled: props.data['prev'] ? undefined : 'disabled',
      onClick: () => {
        if (props.data['prev']) {
          emit('loadData', props.data['prev'])
        }
      }
    }))

    // total info
    slots.push(h('span', props.data['info'] ?? props.data['total']))

    // next
    slots.push(h('i', {
      class: 'fa fa-chevron-right next',
      disabled: props.data['next'] ? undefined : 'disabled',
      onClick: () => {
        if (props.data['next']) {
          emit('loadData', props.data['next'])
        }
      }
    }))

    node = h('div', {
      class: 'pagination'
    }, [slots])
  } else if (props.data['filter'] !== undefined) {
    slots = []

    slots.push(h('input', {
      type: 'text',
      name: 'filter',
      value: props.data['filter'],
      onInput: (event) => {
        clearTimeout(timer)
        timer = setTimeout(() => {
          emit('loadData', null, {}, event.target.value)
        }, 500)
      }
    }))

    if (props.data['filter']) {
      slots.push(h('i', {
        class: 'fa fa-remove clear',
        onClick: () => {
          emit('loadData', null, {}, '')
        }
      }))
    }

    node = h('div', {
      class: 'filter'
    }, [slots])
  } else if (slots.length) {
    node = h('span', {
      onClick: () => onClick(props.data)
    }, [slots])
  }

  return node
})
</script>

<template>
  <li :data-level="level" :class="classLI" @mouseenter="onEnter" @mouseleave="onOut">

    <component :is="node"/>

    <ul v-if="propData?.length">
      <menu-item v-for="i in propData" :data="i" :level="level + 1" @loadData="loadData"/>
    </ul>
  </li>
</template>
