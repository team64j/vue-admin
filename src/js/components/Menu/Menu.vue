<script>
import MenuItem from './MenuItem.vue'

export default {
  name: 'Menu',
  components: { MenuItem },
  props: {
    data: [null, Object, Array]
  },
  created () {
    document.addEventListener('click', event => {
      const target = event.target.closest('li')
      if (target && target.closest('.app-refs-menu')) {
        if (target.classList.contains('parent') || event.target.closest('a')) {
          this.$el.classList.toggle('active')
        }
      } else {
        this.$el.classList.contains('active') && this.$el.classList.remove('active')
      }
    })
  },
  methods: {
    click (event) {
      const target = event.target.closest('li')

      if (target) {
        target.dataset['level'] === '1' && target.classList.contains('parent') && this.$el.classList.toggle('active')
      } else {
        this.$el.classList.remove('active')
      }
    }
  }
}
</script>

<template>
  <div>
    <ul class="flex justify-between border-b text-gray-800 bg-white dark:text-gray-50 dark:bg-gray-800">
      <menu-item v-for="i in data" :data="i"/>
    </ul>
  </div>
</template>
