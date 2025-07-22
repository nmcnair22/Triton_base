<template>
  <div class="space-y-2">
    <label
      v-if="label"
      :for="inputId"
      class="block text-sm font-medium text-surface-700 dark:text-surface-300"
    >
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <InputText
      :id="inputId"
      v-bind="$attrs"
      :dt="computedTokens"
      :class="computedClasses"
      :placeholder="placeholder"
      :disabled="disabled"
      :invalid="state === 'error'"
      v-model="modelValue"
      @input="handleInput"
      @blur="handleBlur"
      @focus="handleFocus"
    />

    <div v-if="helpText || errorMessage" class="min-h-[1.25rem]">
      <span v-if="state === 'error' && errorMessage" class="text-red-500 text-sm">
        {{ errorMessage }}
      </span>
      <span v-else-if="state === 'success'" class="text-green-500 text-sm">
        <i class="pi pi-check mr-1"></i>Valid
      </span>
      <span v-else-if="helpText" class="text-surface-600 dark:text-surface-400 text-sm">
        {{ helpText }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'
import { TokenFactory } from '@/themes/token-factory'
import { useFormEvents } from '@/composables/forms'
import InputText from 'primevue/inputtext'
import type { InputState } from '@/composables/forms'

interface Props {
  label?: string
  placeholder?: string
  helpText?: string
  errorMessage?: string
  state?: InputState
  required?: boolean
  disabled?: boolean
  fullWidth?: boolean
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

const modelValue = defineModel<string>()
const inputId = useId()

// Use the form events composable
const { handleInput, handleBlur, handleFocus } = useFormEvents(emit, modelValue)

const computedTokens = computed(() => {
  return TokenFactory.input(props.state)
})

const computedClasses = computed(() => [
  props.fullWidth ? 'w-full' : '',
  'transition-all duration-200 ease-smooth',
])
</script>
