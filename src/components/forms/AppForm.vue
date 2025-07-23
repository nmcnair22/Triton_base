<template>
  <Form
    v-slot="$form"
    v-bind="formProps"
    @submit="handleSubmit"
  >
    <slot :form="$form" />
  </Form>
</template>

<script setup lang="ts">
import { computed, provide } from 'vue'
import { Form } from '@primevue/forms'
import type { ZodTypeAny } from 'zod'

interface Props {
  initialValues?: Record<string, any>
  resolver?: any
  validateOnValueUpdate?: boolean
  validateOnBlur?: boolean
  validateOnMount?: boolean | string[]
  validateOnSubmit?: boolean
}

interface Emits {
  (e: 'submit', event: {
    originalEvent: Event
    valid: boolean
    values: Record<string, any>
    states: Record<string, any>
    errors: Record<string, any[]>
    reset: () => void
  }): void
}

const props = withDefaults(defineProps<Props>(), {
  initialValues: () => ({}),
  validateOnValueUpdate: true,
  validateOnBlur: false,
  validateOnSubmit: true
})

const emit = defineEmits<Emits>()

// Provide form context for child components
provide('app-form', true)

const formProps = computed(() => ({
  initialValues: props.initialValues,
  resolver: props.resolver,
  validateOnValueUpdate: props.validateOnValueUpdate,
  validateOnBlur: props.validateOnBlur,
  validateOnMount: props.validateOnMount,
  validateOnSubmit: props.validateOnSubmit
}))

const handleSubmit = (event: any) => {
  emit('submit', event)
}
</script>

<style scoped>
/* Form wrapper doesn't need any special styles */
</style>