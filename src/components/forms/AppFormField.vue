<template>
  <FormField
    v-slot="$field"
    v-bind="fieldProps"
  >
    <div class="app-form-field" :class="fieldClasses">
      <label 
        v-if="label" 
        :for="computedId"
        class="app-form-field__label"
      >
        {{ label }}
        <span v-if="required" class="app-form-field__required">*</span>
      </label>
      
      <div class="app-form-field__input">
        <slot 
          :field="$field"
          :id="computedId"
          :invalid="$field?.invalid"
          :error="$field?.error"
          :props="$field?.props"
        />
      </div>
      
      <AppFormError
        v-if="showError && $field?.invalid"
        :message="$field.error?.message || $field.errors?.[0]?.message"
        :fieldName="name"
      />
      
      <div v-else-if="helpText" class="app-form-field__help">
        {{ helpText }}
      </div>
    </div>
  </FormField>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'
import { FormField } from '@primevue/forms'
import AppFormError from './AppFormError.vue'

interface Props {
  name: string
  label?: string
  helpText?: string
  required?: boolean
  showError?: boolean
  initialValue?: any
  resolver?: any
  as?: string
  asChild?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showError: true,
  initialValue: ''
})

const generatedId = useId()
const computedId = computed(() => `field-${props.name}-${generatedId}`)

const fieldProps = computed(() => ({
  name: props.name,
  initialValue: props.initialValue,
  resolver: props.resolver,
  as: props.as,
  asChild: props.asChild
}))

const fieldClasses = computed(() => [
  props.required && 'app-form-field--required'
])
</script>

<style scoped>
.app-form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.app-form-field__label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(var(--p-surface-700));
}

:global(.dark) .app-form-field__label {
  color: rgb(var(--p-surface-300));
}

.app-form-field__required {
  color: rgb(239 68 68);
  margin-left: 0.25rem;
}

.app-form-field__input {
  position: relative;
}

.app-form-field__help {
  font-size: 0.875rem;
  color: rgb(var(--p-surface-600));
}

:global(.dark) .app-form-field__help {
  color: rgb(var(--p-surface-400));
}

.app-form-field--required {
  /* Additional styling for required fields if needed */
}
</style>