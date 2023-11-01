<script>
import MenuItem from './MenuItem.vue'

export default {
  name: 'Menu',
  components: { MenuItem },
  props: {
    data: [null, Object, Array]
  }
}
</script>

<template>
  <ul class="flex justify-between">
    <menu-item v-for="i in data" :data="i"/>
  </ul>
</template>
