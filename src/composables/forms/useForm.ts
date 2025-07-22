import { reactive, computed, ref, readonly } from 'vue'
import type { UnwrapRef, ComputedRef } from 'vue'
import type { InputState } from './useFormField'

export interface FormFieldConfig {
  validators?: Array<(value: any) => string | true | Promise<string | true>>
}

export interface FormOptions<T> {
  validateOn?: 'submit' | 'blur' | 'change'
  onSubmit?: (values: T) => void | Promise<void>
}

export interface FormFieldBinding {
  modelValue: ComputedRef<any>
  error: ComputedRef<string | undefined>
  onBlur: () => void
  onChange?: () => void
}

export function useForm<T extends Record<string, any>>(
  initialValues: T,
  options: FormOptions<T> = {}
) {
  const values = reactive({ ...initialValues })
  const errors = reactive<Record<string, string>>({})
  const touched = reactive<Record<string, boolean>>({})
  const validating = reactive<Record<string, boolean>>({})
  const isSubmitting = ref(false)
  
  // Field configurations stored for validation
  const fieldConfigs = new Map<string, FormFieldConfig>()
  
  const isValid = computed(() => 
    Object.keys(errors).every(key => !errors[key]) &&
    Object.keys(validating).every(key => !validating[key])
  )
  
  const isDirty = computed(() => 
    Object.keys(values).some(key => 
      (values as any)[key] !== initialValues[key as keyof T]
    )
  )
  
  const hasErrors = computed(() => 
    Object.keys(errors).some(key => !!errors[key])
  )
  
  const validateField = async (
    fieldName: string
  ): Promise<boolean> => {
    const fieldConfig = fieldConfigs.get(fieldName)
    if (!fieldConfig?.validators || fieldConfig.validators.length === 0) {
      delete errors[fieldName]
      return true
    }
    
    validating[fieldName] = true
    errors[fieldName] = ''
    
    try {
      for (const validator of fieldConfig.validators) {
        const result = await validator((values as any)[fieldName])
        if (result !== true) {
          errors[fieldName] = result
          return false
        }
      }
      delete errors[fieldName]
      return true
    } finally {
      delete validating[fieldName]
    }
  }
  
  const validateAllFields = async (): Promise<boolean> => {
    const validationPromises = Object.keys(values).map(key => 
      validateField(key)
    )
    const results = await Promise.all(validationPromises)
    return results.every(result => result)
  }
  
  const handleSubmit = async (e?: Event): Promise<void> => {
    e?.preventDefault()
    
    // Touch all fields
    Object.keys(values).forEach(key => {
      touched[key] = true
    })
    
    isSubmitting.value = true
    
    try {
      const isFormValid = await validateAllFields()
      
      if (isFormValid && options.onSubmit) {
        await options.onSubmit({ ...values } as T)
      }
    } finally {
      isSubmitting.value = false
    }
  }
  
  const reset = (newValues?: Partial<T>) => {
    const resetValues = newValues ? { ...initialValues, ...newValues } : initialValues
    Object.assign(values, resetValues)
    Object.keys(errors).forEach(key => delete errors[key])
    Object.keys(touched).forEach(key => delete touched[key])
    Object.keys(validating).forEach(key => delete validating[key])
  }
  
  const setFieldValue = (fieldName: keyof T, value: any) => {
    (values as any)[fieldName] = value
  }
  
  const setFieldError = (fieldName: string, error: string) => {
    errors[fieldName] = error
  }
  
  const setFieldTouched = (fieldName: string, isTouched = true) => {
    touched[fieldName] = isTouched
  }
  
  const register = (fieldName: keyof T, fieldConfig?: FormFieldConfig): FormFieldBinding => {
    // Store field configuration
    if (fieldConfig) {
      fieldConfigs.set(fieldName as string, fieldConfig)
    }
    
    return {
      modelValue: computed({
        get: () => (values as any)[fieldName],
        set: (val) => { 
          (values as any)[fieldName] = val
          
          // Validate on change if configured
          if (options.validateOn === 'change' && touched[fieldName as string]) {
            validateField(fieldName as string)
          }
        }
      }),
      error: computed(() => errors[fieldName as string]),
      onBlur: () => { 
        touched[fieldName as string] = true
        
        // Validate on blur if configured
        if (options.validateOn === 'blur') {
          validateField(fieldName as string)
        }
      },
      onChange: options.validateOn === 'change' ? () => {
        if (touched[fieldName as string]) {
          validateField(fieldName as string)
        }
      } : undefined
    }
  }
  
  const getFieldProps = (fieldName: keyof T, fieldConfig?: FormFieldConfig) => {
    const binding = register(fieldName, fieldConfig)
    return {
      modelValue: binding.modelValue,
      errorMessage: binding.error,
      state: computed(() => {
        const fieldTouched = touched[fieldName as string]
        const hasError = !!errors[fieldName as string]
        const fieldValue = (values as any)[fieldName]
        const fieldDirty = fieldValue !== initialValues[fieldName]
        
        if (!fieldTouched && !fieldDirty) return 'default' as const
        if (hasError) return 'error' as const
        if (fieldDirty && !hasError) return 'success' as const
        return 'default' as const
      }),
      onBlur: binding.onBlur,
      onChange: binding.onChange
    }
  }
  
  return {
    // State
    values: readonly(values),
    errors: readonly(errors),
    touched: readonly(touched),
    isSubmitting: readonly(isSubmitting),
    
    // Computed
    isValid,
    isDirty,
    hasErrors,
    
    // Methods
    handleSubmit,
    reset,
    register,
    getFieldProps,
    validateField,
    validateAllFields,
    setFieldValue,
    setFieldError,
    setFieldTouched
  }
}