import type { ComputedRef } from 'vue'

export type InputState = 'default' | 'error' | 'success'

export interface Validator {
  (value: any): string | true | Promise<string | true>
}

export interface FormValues {
  [key: string]: any
}

export interface FormOptions<T = FormValues> {
  validateOn?: 'submit' | 'blur' | 'change' | 'input'
  onSubmit?: (values: T) => void | Promise<void>
  initialValues?: T
}

export interface FormField {
  modelValue: ComputedRef<any>
  errorMessage: ComputedRef<string>
  state: ComputedRef<InputState>
  onBlur: () => void
  onChange: (value: any) => void
}

export interface FormFieldOptions {
  validators?: Validator[]
  validateOn?: 'blur' | 'change' | 'input'
  debounce?: number
}

export interface FormState<T = FormValues> {
  values: T
  errors: Record<string, string>
  touched: Record<string, boolean>
  isSubmitting: boolean
  isValid: boolean
  isDirty: boolean
}