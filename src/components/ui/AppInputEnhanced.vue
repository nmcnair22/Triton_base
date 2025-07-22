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
      v-bind="inputProps"
      :dt="computedTokens"
      :class="computedClasses"
      :placeholder="placeholder"
      :disabled="disabled"
      :invalid="isInvalid"
      :name="name"
      v-model="internalValue"
      @input="handleInput"
      @blur="handleBlur"
      @focus="handleFocus"
    />

    <div v-if="shouldShowMessage" class="min-h-[1.25rem]">
      <span v-if="isInvalid && displayErrorMessage" class="text-red-500 text-sm">
        {{ displayErrorMessage }}
      </span>
      <span v-else-if="computedState === 'success'" class="text-green-500 text-sm">
        <i class="pi pi-check mr-1"></i>Valid
      </span>
      <span v-else-if="helpText" class="text-surface-600 dark:text-surface-400 text-sm">
        {{ helpText }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, useId, ref, watch } from 'vue'
import { TokenFactory } from '@/themes/token-factory'
import { useFormEvents } from '@/composables/forms'
import InputText from 'primevue/inputtext'
import type { InputState } from '@/composables/forms'

interface Props {
  // Common props
  label?: string
  placeholder?: string
  helpText?: string
  required?: boolean
  disabled?: boolean
  fullWidth?: boolean

  // Legacy form system props
  errorMessage?: string
  state?: InputState

  // PrimeVue Forms props
  name?: string
  formControl?: {
    validateOnValueUpdate?: boolean
    validateOnBlur?: boolean
  }
}

interface Emits {
  'update:modelValue': [value: string]
  input: [event: Event]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}

const props = withDefaults(defineProps<Props>(), {
  state: 'default',
  required: false,
  disabled: false,
  fullWidth: true,
})

const emit = defineEmits<Emits>()

// Model value handling
const modelValue = defineModel<string>()
const internalValue = ref(modelValue.value || '')

// Watch for external changes
watch(modelValue, newValue => {
  internalValue.value = newValue || ''
})

// Watch for internal changes
watch(internalValue, newValue => {
  modelValue.value = newValue
})

// Check if we're in a PrimeVue Form context
const formContext = inject('$pv_form_resolver', null)
const formField = computed(() => {
  if (!formContext || !props.name) return null
  // Access form field state from PrimeVue Forms
  return (inject('$pv_form_state', null) as any)?.[props.name]
})

// Generate unique ID
const generatedId = useId()
const computedId = computed(() => props.name || generatedId)

// Determine if using PrimeVue Forms or legacy system
const isUsingPrimeVueForms = computed(() => !!formField.value && !!props.name)

// State management
const computedState = computed(() => {
  if (isUsingPrimeVueForms.value) {
    return formField.value?.invalid ? 'error' : 'default'
  }
  return props.state
})

const isInvalid = computed(() => {
  if (isUsingPrimeVueForms.value) {
    return formField.value?.invalid || false
  }
  return props.state === 'error'
})

const displayErrorMessage = computed(() => {
  if (isUsingPrimeVueForms.value) {
    return formField.value?.error?.message || formField.value?.errors?.[0]?.message
  }
  return props.errorMessage
})

const shouldShowMessage = computed(() => {
  return props.helpText || displayErrorMessage.value || computedState.value === 'success'
})

// Event handlers - work with both systems
const {
  handleInput: legacyHandleInput,
  handleBlur: legacyHandleBlur,
  handleFocus: legacyHandleFocus,
} = useFormEvents(emit, modelValue)

const handleInput = (event: Event) => {
  if (!isUsingPrimeVueForms.value) {
    legacyHandleInput(event)
  }
  emit('input', event)
}

const handleBlur = (event: FocusEvent) => {
  if (!isUsingPrimeVueForms.value) {
    legacyHandleBlur(event)
  }
  emit('blur', event)
}

const handleFocus = (event: FocusEvent) => {
  if (!isUsingPrimeVueForms.value) {
    legacyHandleFocus(event)
  }
  emit('focus', event)
}

// Input props for v-bind
const inputProps = computed(() => {
  const baseProps = { ...props }
  // Remove custom props that shouldn't be passed to InputText
  delete baseProps.label
  delete baseProps.helpText
  delete baseProps.errorMessage
  delete baseProps.state
  delete baseProps.fullWidth
  delete baseProps.formControl
  return baseProps
})

// Styling
const computedTokens = computed(() => {
  return TokenFactory.input(computedState.value)
})

const computedClasses = computed(() => [
  props.fullWidth ? 'w-full' : '',
  'transition-all duration-200 ease-smooth',
])
</script>
