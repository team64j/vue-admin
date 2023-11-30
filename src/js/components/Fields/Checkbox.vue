<template>
  <div v-if="label" class="w-full mb-3" :class="$props.class">
    <template v-if="!data">
      <label class="inline-flex items-center " :class="[ disabled ? 'cursor-no-drop' : 'cursor-pointer' ]">
        <input v-model="model"
               :id="ID"
               :value="value"
               :true-value="trueValue"
               :false-value="falseValue"
               :disabled="disabled"
               :class="inputClass"
               type="checkbox"
               class="mr-2">
        {{ label }}
        <span v-if="required" class="text-rose-500">*</span>
        <evo-layout-help-icon v-if="help" :data="help"/>
      </label>
      <div v-if="description" v-html="description" class="opacity-75 text-sm"/>
      <div v-if="error" class="absolute text-xs text-rose-600" :class="errorClass">{{ errorMessage }}</div>
    </template>
    <template v-else>
      <label for="" class="block font-bold mb-1">
        {{ label }}
        <span v-if="required" class="text-rose-500">*</span>
        <evo-layout-help-icon v-if="help" :data="help"/>
      </label>
      <div v-for="(i, k) in data">
        <label :key="k" class="inline-flex items-center cursor-pointer">
          <input v-model="model"
                 :id="ID+`_`+i.key"
                 :class="inputClass"
                 :value="i.key"
                 :true-value="i.key"
                 :false-value="falseValue"
                 type="checkbox"
                 class="mr-2">
          <span>{{ i.value }}</span>
        </label>
      </div>
    </template>
  </div>
  <template v-else>
    <template v-if="!data">
      <input v-model="model"
             :id="ID"
             :class="inputClass"
             :value="value"
             :true-value="trueValue"
             :false-value="falseValue"
             type="checkbox">
      <div v-if="description" v-html="description" class="opacity-75 text-sm"/>
      <div v-if="error" class="absolute text-xs text-rose-600" :class="errorClass">{{ errorMessage }}</div>
    </template>
    <div v-for="(i, k) in data" v-else :class="$props.class">
      <label :key="k" class="inline-flex items-center cursor-pointer">
        <input v-model="model"
               :id="ID+`_`+i.key"
               :class="inputClass"
               :value="i.key"
               :true-value="i.key"
               :false-value="falseValue"
               type="checkbox"
               class="mr-2">
        <span>{{ i.value }}</span>
      </label>
    </div>
  </template>
</template>

<script>
import Field from './Field.vue'

export default {
  extends: Field,

  props: {
    modelValue: { default: true },
    value: { default: true }
  }
}
</script>
