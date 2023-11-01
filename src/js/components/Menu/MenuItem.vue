<script>
export default {
  name: 'MenuItem',
  props: {
    data: [Object, Array],
    level: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      active: false
    }
  },
  methods: {
    onClick (data) {
      if (data.click && this.$root[data.click]) {
        this.$root[data.click]()
      }
    }
  }
}
</script>

<template>
  <li :data-level="level">
    <a v-if="data['href']" :href="data['href']" target="_blank">
      <i v-if="data['icon']" :class="data['icon']"/>
      <span v-if="data['name']">{{ data['name'] }}</span>
    </a>

    <router-link v-else-if="data['to']" :to="data['to']">
      <i v-if="data['icon']" :class="data['icon']"/>
      <span v-if="data['name']">{{ data['name'] }}</span>
    </router-link>

    <span v-else @click="onClick(data)" :class="[ data['click'] ? 'cursor-pointer' : '' ]">
      <i v-if="data['icon']" :class="data['icon']"/>
      <span v-if="data['name']">{{ data['name'] }}</span>
    </span>

    <ul v-if="data['data']">
      <menu-item v-for="i in data['data']" :data="i" :level="level + 1"/>
    </ul>

  </li>
</template>

<style scoped>
ul, li {
  @apply flex relative cursor-default
}

li > a, li > span {
  @apply h-full flex items-center grow
}

li > span > i + span, li > a > i + span {
  @apply ml-2
}

li[data-level="0"]:last-of-type > ul > li > ul {
  @apply left-auto right-0
}

li[data-level="0"] li > ul {
  @apply absolute hidden top-full left-0 flex-col min-w-[15rem] border bg-white dark:bg-gray-700 rounded-b py-2 shadow-lg
}

li[data-level="0"] li:hover > ul {
  @apply flex shadow-lg
}

li[data-level="0"] li > a:hover, li[data-level="0"] li:hover > a, li[data-level="0"] li > span:hover, li[data-level="0"] li:hover > span {
  @apply bg-slate-50 dark:bg-gray-700
}

li[data-level="1"] > a, li[data-level="1"] > span {
  @apply py-3 px-4
}

li[data-level="1"] li > a, li[data-level="1"] li > span {
  @apply py-1 px-3
}

li[data-level="1"] li > a:hover {
  @apply bg-blue-600 text-white dark:bg-blue-600
}
</style>
