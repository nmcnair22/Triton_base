import { ref, computed, watch } from 'vue'
import type { Ref } from 'vue'

export type InputState = 'default' | 'error' | 'success'

export interface FormFieldOptions<T = string> {
  validators?: Array<(value: T) => string | true | Promise<string | true>>
  validateOn?: 'input' | 'blur' | 'change'
  debounce?: number
}

export function useFormField<T = string>(initialValue: T, options: FormFieldOptions<T> = {}) {
  const value = ref<T>(initialValue) as Ref<T>
  const error = ref('')
  const touched = ref(false)
  const isValidating = ref(false)
  const dirty = computed(() => value.value !== initialValue)

  const state = computed((): InputState => {
    if (!touched.value && !dirty.value) return 'default'
    if (error.value) return 'error'
    if (dirty.value && !error.value) return 'success'
    return 'default'
  })

  const validate = async (): Promise<boolean> => {
    error.value = ''
    if (!options.validators || options.validators.length === 0) return true

    isValidating.value = true

    try {
      for (const validator of options.validators) {
        const result = await validator(value.value)
        if (result !== true) {
          error.value = result
          return false
        }
      }
      return true
    } finally {
      isValidating.value = false
    }
  }

  const reset = () => {
    value.value = initialValue
    error.value = ''
    touched.value = false
  }

  const setTouched = () => {
    touched.value = true
  }

  const setError = (errorMessage: string) => {
    error.value = errorMessage
  }

  // Auto-validate based on options
  if (options.validateOn) {
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    watch(
      value,
      () => {
        if (options.validateOn === 'input' || (options.validateOn === 'change' && dirty.value)) {
          // Handle debounce
          if (options.debounce && options.debounce > 0) {
            if (timeoutId) clearTimeout(timeoutId)
            timeoutId = setTimeout(() => {
              validate()
            }, options.debounce)
          } else {
            validate()
          }
        }
      },
      { flush: 'post' }
    )
  }

  return {
    value,
    error: computed(() => error.value),
    state: computed(() => state.value),
    touched: computed(() => touched.value),
    dirty,
    isValidating: computed(() => isValidating.value),
    validate,
    reset,
    setTouched,
    setError,
  }
}
