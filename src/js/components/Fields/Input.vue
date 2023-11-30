<template>
  <div v-if="label" class="w-full mb-3" :class="$props.class">
    <div class="mb-1">
      <label :for="ID" class="font-bold cursor-pointer">
        {{ label }}
        <span v-if="required" class="text-rose-500">*</span>
        <evo-layout-help-icon v-if="help" :data="help"/>
      </label>
      <span v-if="requiredText" class="text-rose-500 ml-3 text-sm font-normal">{{ requiredText }}</span>
      <slot name="label"/>
    </div>
    <div class="relative" :class="{ 'evo-input__number': type === 'number' }">
      <div v-if="loading" class="absolute left-0 top-0 my-1 mx-2 flex items-center justify-center"
           :class="[type === 'button' ? 'right-0 bottom-0' : '']">
        <evo-layout-loader-icon/>
      </div>
      <input v-model="model"
             :id="ID"
             :type="type"
             :placeholder="placeholder"
             :class="[inputClass, error ? '!border-rose-500 focus:ring-rose-500' : '', loading ? '!text-transparent' : '']"
             :readonly="readonly"
             :required="required"
             :disabled="disabled"
             @mousedown="onMousedown">
      <template v-if="type === 'number'">
        <i class="fa fa-angle-up evo-input__plus" @click="onClickPlus"/>
        <i class="fa fa-angle-down evo-input__minus" @click="onClickMinus"/>
      </template>
      <i v-if="clear"
         class="fa fa-circle-xmark absolute block right-0 top-0 my-4 mx-3 cursor-pointer text-gray-300 dark:text-gray-500 hover:text-rose-500 dark:hover:text-rose-600 transition"
         @click="onClear"/>
    </div>
    <div v-if="description" v-html="description" class="opacity-75 text-sm"/>
    <div v-if="error" class="absolute text-xs text-rose-600" :class="errorClass">{{ errorMessage }}</div>
    <slot name="item"/>
  </div>
  <div v-else class="relative" :class="[$props.class, type === 'number' ? 'evo-input__number' : '']">
    <div v-if="loading" class="absolute left-0 top-0 my-1 mx-2 flex items-center justify-center"
         :class="[type === 'button' ? 'right-0 bottom-0' : '']">
      <evo-layout-loader-icon/>
    </div>
    <input v-model="model"
           :id="ID"
           :type="type"
           :placeholder="placeholder"
           :class="[inputClass, error ? '!border-rose-500' : '', loading ? '!text-transparent' : '']"
           :readonly="readonly"
           :required="required"
           :disabled="disabled"
           @mousedown="onMousedown">
    <template v-if="type === 'number'">
      <i class="fa fa-angle-up evo-input__plus" @click="onClickPlus"/>
      <i class="fa fa-angle-down evo-input__minus" @click="onClickMinus"/>
    </template>
    <i v-if="clear"
       class="fa fa-circle-xmark absolute block right-0 top-0 my-4 mx-3 cursor-pointer text-gray-300 dark:text-gray-500 hover:text-rose-500 dark:hover:text-rose-600 transition"
       @click="onClear"/>
    <div v-if="description" v-html="description" class="opacity-75 text-sm"/>
    <div v-if="error" class="absolute text-xs text-rose-600" :class="errorClass">{{ errorMessage }}</div>
  </div>
</template>

<script>
import Field from './Field.vue'

export default {
  extends: Field,

  props: {
    type: {
      type: String,
      default: 'text',
      validator: (type) => ['text', 'number', 'password', 'email', 'tel', 'date', 'datetime-local', 'button'].includes(
          type)
    }
  },

  computed: {
    model: {
      get () {
        return this.value || this.modelValue || ''
      },
      set (value) {
        this.$emit('update:modelValue', value, this)
      }
    }
  },

  methods: {
    onMousedown (event) {
      this.$emit('action', this.emitClick || 'mousedown:input', event, this)
    },

    onClear (event) {
      this.$emit('action', 'clear:input', event, this)
    },

    onClickPlus () {
      this.$el.querySelector('input').focus()
      this.model++
    },

    onClickMinus () {
      this.$el.querySelector('input').focus()
      this.model--
    }
  }
}
</script>

<style scoped>
.evo-input__number input::-webkit-outer-spin-button,
.evo-input__number input::-webkit-inner-spin-button {
  @apply appearance-none m-0
}
.evo-input__number {
  @apply relative
}
.evo-input__number .evo-input__plus, .evo-input__number .evo-input__minus {
  @apply absolute hidden cursor-default md:flex justify-center items-center right-0 w-8 h-1/2 text-gray-300 hover:text-blue-600
}
.evo-input__number .evo-input__plus {
  @apply top-0 pt-1
}
.evo-input__number .evo-input__minus {
  @apply bottom-0 pb-1
}
.evo-input__number input[type="number"] {
  @apply pr-8
}
</style>
