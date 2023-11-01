<template>
  <div class="p-8">
    <h1 class="text-2xl text-center">{{ message }}</h1>
  </div>
</template>

<script>
export default {
  name: 'NotFoundPage',
  props: {
    message: {
      type: String,
      default: 'Page not found'
    }
  },
  created () {
    this.$emit('action', 'setTab', {
      meta: { title: this.message },
      changed: false
    })
  }
}
</script>
