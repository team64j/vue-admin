<script>
import { getCurrentInstance, h, watch } from 'vue'
import store from '../../store'
import router from '../../router'

export default {
  props: {
    currentRoute: Object,
    url: String,
    data: String
  },

  setup (props, { emit }) {
    const instance = getCurrentInstance()

    emit('action', 'setTab', {
      key: instance.vnode.key,
      loading: true,
      meta: { title: '...' }
    })

    watch(
        () => store.state['Storage']['theme'],
        () => {
          if (instance.vnode.el.contentDocument) {
            instance.vnode.el.contentDocument.documentElement.className = store.state['Storage']['theme']
            const style = getComputedStyle(document.body)
            instance.vnode.el.contentDocument.body.style.font = style.font
            instance.vnode.el.contentDocument.body.style.background = style.background
            instance.vnode.el.contentDocument.body.style.color = style.color
          }
        }
    )

    const attrs = {
      onload: (event) => {
        const title = (props.currentRoute?.meta?.title || props.currentRoute.name) + ' ' +
            (props.currentRoute?.params?.id || '')

        console.log(event.target?.contentDocument?.title || title)

        emit('action', 'setTab', {
          key: instance.vnode.key,
          loading: false,
          meta: { title: title }
        })

        if (instance.vnode.el.contentDocument) {
          instance.vnode.el.contentDocument.documentElement.className = store.state['Storage']['theme']
          const style = getComputedStyle(document.body)
          instance.vnode.el.contentDocument.body.style.font = style.font
          instance.vnode.el.contentDocument.body.style.background = style.background
          instance.vnode.el.contentDocument.body.style.color = style.color
        }
      }
    }

    if (props.data !== undefined) {
      attrs.srcdoc = props.data
    } else {
      let query = props.currentRoute.query || {}
      let url = (store.getters['Storage/get']('hostname') || document.baseURI).replace(/\/$/g, '')

      query.token = store.getters['Storage/get']('token')

      if (props.currentRoute.meta['url']) {
        url += props.currentRoute.meta['url'] +
            (props.currentRoute.params.id ? '/' + props.currentRoute.params.id : '')
      } else {
        url += props.currentRoute.path
      }

      const params = Object.assign(
          {},
          Object.values(props.currentRoute.params || {}).length && props.currentRoute.params,
          Object.values(router.currentRoute.value.params).length && router.currentRoute.value.params
      )

      Object.entries(params).forEach(([k, v]) => {
        if (!(v === undefined || v === null)) {
          const re = new RegExp(':' + k, 'g')

          if (re.test(url)) {
            //delete params[k]
          }

          url = url.replace(re, encodeURIComponent(v.toString())).replace(/\/$/, '')
        }
      })

      if (Object.values(query).length) {
        url += (~url.indexOf('?') ? '&' : '?') + new URLSearchParams(query)
      }

      attrs.src = url
    }

    attrs.class = 'w-full h-full'

    return () => h('iframe', attrs)
  }
}
</script>
