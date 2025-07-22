/**
 * Form composables for Triton
 * 
 * This module exports all form-related composables and utilities
 * for building reactive, validated forms in Vue 3.
 */

export { useForm } from './useForm'
export type { FormFieldConfig, FormOptions, FormFieldBinding } from './useForm'

export { useFormField } from './useFormField'
export type { InputState, FormFieldOptions } from './useFormField'

export { useFormEvents, useSimpleFormEvents } from './useFormEvents'
export type { FormEventHandlers, FormEventOptions } from './useFormEvents'

export { validators } from './validators'
export type { ValidatorFn } from './validators'

// Re-export individual validators for convenience
export {
  required,
  email,
  minLength,
  maxLength,
  pattern,
  numeric,
  integer,
  min,
  max,
  between,
  match,
  url,
  phone,
  alpha,
  alphanumeric,
  custom,
  compose,
  when
} from './validators'