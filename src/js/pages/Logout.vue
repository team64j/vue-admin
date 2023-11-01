<script setup>
import store from '../store'

store.dispatch('Storage/del', 'token')
store.dispatch('Storage/del', 'tokenExpiresIn')
location.reload()
</script>

<template></template>
