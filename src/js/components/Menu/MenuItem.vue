<script setup>
import { computed, getCurrentInstance, h, nextTick, ref } from 'vue'
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

const instance = getCurrentInstance()

let timer = 0
let filter
let loading = ref(false)
let propData = ref(props.data?.['url'] ? [] : (props.data?.['data'] || []))

const methods = {
  loadData (url, params = {}, f) {
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

      nextTick(() => {
        const input = instance.vnode.el.querySelector('input')
        if (input) {
          input.focus()
        }
      })

      loading.value = false
    }).catch(() => {
      loading.value = false
    })
  },
  onEnter () {
    instance.parent.vnode.el.querySelectorAll(':scope > ul > li.app-menu__hover').forEach(i => {
      if (instance.vnode.el !== i) {
        i['classList'].remove('app-menu__hover')
        i['querySelectorAll']('li.app-menu__hover').forEach(j => j.classList.remove('app-menu__hover'))
      }
    })

    if (instance.vnode.el.classList.contains('app-menu__hover')) {
      return
    }

    if (props.data['url']) {
      propData.value = []
      clearTimeout(timer)
      timer = setTimeout(() => methods.loadData(props.data['url']), 200)
    }

    instance.vnode.el.classList.add('app-menu__hover')
  },
  onOut () {
    if (props.data['url']) {
      clearTimeout(timer)
    }
  },
  onClick () {
    if (props.data['icons'] && instance.root.proxy[props.data['key']] !== undefined) {
      const key = instance.root.proxy[props.data['key']].toString()
      let isset = false
      for (const i in props.data['icons']) {
        if (i === key) {
          instance.root.proxy[props.data['key']] = props.data['icons'][i]['value']
          isset = true
          break
        }
      }
      if (!isset) {
        instance.root.proxy[props.data['key']] = undefined
      }
    }

    if (props.data['click'] && instance.root.proxy[props.data['click']]) {
      return instance.root.proxy[props.data['click']]()
    }
  }
}

const classLI = computed(() => {
  let c = ''
  if (props.data?.['data']?.length || props.data?.['url']) {
    c += 'app-menu__parent'
  }

  return c
})

const node = computed(() => {
  let node
  let slots = []

  let icon = null
  if (props.data['icons'] && instance.root.proxy[props.data['key']] !== undefined) {
    const key = instance.root.proxy[props.data['key']].toString()
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
    if (/^https?:\/\/?/.test(icon)) {
      slots.push(h('img', {
        src: icon
      }))
    } else {
      slots.push(h('i', {
        class: 'app-menu__icon ' + icon
      }))
    }
  }

  // title
  if (props.data['name']) {
    slots.push(h('span', {
      class: 'app-menu__title',
      innerText: props.data['name']
    }))
  }

  // locked
  if (props.data['locked']) {
    slots.push(h('i', { class: 'app-menu__locked fa fa-lock' }))
  }

  // id
  if (props.data['id'] !== undefined) {
    slots.push(h('span', {
      class: 'app-menu__id',
      innerText: props.data['id']
    }))
  }

  if (loading.value) {
    slots.push(h('span', {
      class: 'app-menu__toggle'
    }, h('i', { class: 'fa fa-circle-notch fa-fw animate-spin' })))
  } else if ((props.data['data']?.length && props.level) || props.data['url']) {
    slots.push(h('span', {
      class: 'app-menu__toggle'
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
      class: 'fa fa-chevron-left app-menu__prev',
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
      class: 'fa fa-chevron-right app-menu__next',
      disabled: props.data['next'] ? undefined : 'disabled',
      onClick: () => {
        if (props.data['next']) {
          emit('loadData', props.data['next'])
        }
      }
    }))

    node = h('div', {
      class: 'app-menu__pagination'
    }, [slots])
  } else if (props.data['filter'] !== undefined) {
    slots = []

    slots.push(h('input', {
      type: 'text',
      name: 'filter',
      value: props.data['filter'],
      placeholder: 'filter ...',
      onInput: (event) => {
        clearTimeout(timer)
        timer = setTimeout(() => {
          emit('loadData', null, {}, event.target.value)
        }, 500)
      }
    }))

    if (props.data['filter']) {
      slots.push(h('i', {
        class: 'fa fa-remove app-menu__clear',
        onClick: () => {
          emit('loadData', null, {}, '')
        }
      }))
    }

    node = h('div', {
      class: 'app-menu__filter'
    }, [slots])
  } else if (slots.length) {
    node = h('span', {
      onClick: () => methods.onClick(props.data)
    }, [slots])
  }

  return node
})
</script>

<template>
  <li :data-level="level" :class="classLI" @mouseenter="methods.onEnter" @mouseleave="methods.onOut">

    <component :is="node"/>

    <ul v-if="propData?.length">
      <menu-item v-for="i in propData" :data="i" :level="level + 1" @loadData="methods.loadData"/>
    </ul>
  </li>
</template>
