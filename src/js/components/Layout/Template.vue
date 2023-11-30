<script>
export default {
  name: 'Template',
  props: {
    class: [Array, Object, String]
  }
}
</script>

<template>
  <div class="vue-template" :class="$props.class">
    <slot name="default"/>
  </div>
</template>

<style scoped>

</style>
