<template>
  <div class="space-y-2">
    <label
      v-if="label"
      :for="computedId"
      class="block text-sm font-medium text-surface-700 dark:text-surface-300"
    >
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <InputText
      :id="computedId"
      v-bind="$attrs"
      :dt="computedTokens"
      :class="computedClasses"
      :placeholder="placeholder"
      :disabled="disabled"
      :invalid="isInvalid"
      :name="name"
      v-model="modelValue"
    />

    <div v-if="shouldShowMessage" class="min-h-[1.25rem]">
      <span v-if="isInvalid && displayErrorMessage" class="text-red-500 text-sm">
        {{ displayErrorMessage }}
      </span>
      <span v-else-if="helpText" class="text-surface-600 dark:text-surface-400 text-sm">
        {{ helpText }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, useId } from 'vue'
import { TokenFactory } from '@/themes/token-factory'
import InputText from 'primevue/inputtext'

interface Props {
  name?: string
  label?: string
  placeholder?: string
  helpText?: string
  required?: boolean
  disabled?: boolean
  fullWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  disabled: false,
  fullWidth: true,
})

// Model value for v-model support
const modelValue = defineModel<string>()

// Generate unique ID
const generatedId = useId()
const computedId = computed(() => props.name || generatedId)

// Check if we're in a PrimeVue Form context
const formContext = inject('$pv_form_resolver', null)
const formField = computed(() => {
  if (!formContext || !props.name) return null
  // Access form field state from PrimeVue Forms
  return (inject('$pv_form_state', null) as any)?.[props.name]
})

// State management for PrimeVue Forms
const isInvalid = computed(() => {
  return formField.value?.invalid || false
})

const displayErrorMessage = computed(() => {
  return formField.value?.error?.message || formField.value?.errors?.[0]?.message
})

const shouldShowMessage = computed(() => {
  return props.helpText || displayErrorMessage.value
})

// Styling
const computedTokens = computed(() => {
  return TokenFactory.input(isInvalid.value ? 'error' : 'default')
})

const computedClasses = computed(() => [
  props.fullWidth ? 'w-full' : '',
  'transition-all duration-200 ease-smooth',
])
</script>