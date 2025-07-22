import type { Ref } from 'vue'

export interface FormEventHandlers {
  handleInput: (event: Event) => void
  handleBlur: (event: FocusEvent) => void
  handleFocus: (event: FocusEvent) => void
  handleChange: (event: Event) => void
  handleKeydown: (event: KeyboardEvent) => void
  handleKeyup: (event: KeyboardEvent) => void
  handlePaste: (event: ClipboardEvent) => void
}

export interface FormEventOptions {
  onInput?: (event: Event, value: string) => void
  onBlur?: (event: FocusEvent) => void
  onFocus?: (event: FocusEvent) => void
  onChange?: (event: Event, value: string) => void
  onKeydown?: (event: KeyboardEvent) => void
  onKeyup?: (event: KeyboardEvent) => void
  onPaste?: (event: ClipboardEvent, value: string) => void
  preventDefault?: boolean
  stopPropagation?: boolean
}

/**
 * Composable for handling form events in a consistent way
 */
export function useFormEvents(
  emit: ((event: any, ...args: any[]) => void) | ((event: string, ...args: any[]) => void),
  modelValue?: Ref<any>,
  options: FormEventOptions = {}
): FormEventHandlers {
  
  const getInputValue = (event: Event): string => {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    return target.value
  }
  
  const handleInput = (event: Event) => {
    if (options.preventDefault) event.preventDefault()
    if (options.stopPropagation) event.stopPropagation()
    
    const value = getInputValue(event)
    
    // Update model value if provided
    if (modelValue) {
      modelValue.value = value
    }
    
    // Emit v-model event
    emit('update:modelValue', value)
    
    // Emit input event
    emit('input', event)
    
    // Call custom handler if provided
    if (options.onInput) {
      options.onInput(event, value)
    }
  }
  
  const handleBlur = (event: FocusEvent) => {
    if (options.preventDefault) event.preventDefault()
    if (options.stopPropagation) event.stopPropagation()
    
    emit('blur', event)
    
    if (options.onBlur) {
      options.onBlur(event)
    }
  }
  
  const handleFocus = (event: FocusEvent) => {
    if (options.preventDefault) event.preventDefault()
    if (options.stopPropagation) event.stopPropagation()
    
    emit('focus', event)
    
    if (options.onFocus) {
      options.onFocus(event)
    }
  }
  
  const handleChange = (event: Event) => {
    if (options.preventDefault) event.preventDefault()
    if (options.stopPropagation) event.stopPropagation()
    
    const value = getInputValue(event)
    
    emit('change', event)
    
    if (options.onChange) {
      options.onChange(event, value)
    }
  }
  
  const handleKeydown = (event: KeyboardEvent) => {
    if (options.preventDefault) event.preventDefault()
    if (options.stopPropagation) event.stopPropagation()
    
    emit('keydown', event)
    
    if (options.onKeydown) {
      options.onKeydown(event)
    }
  }
  
  const handleKeyup = (event: KeyboardEvent) => {
    if (options.preventDefault) event.preventDefault()
    if (options.stopPropagation) event.stopPropagation()
    
    emit('keyup', event)
    
    if (options.onKeyup) {
      options.onKeyup(event)
    }
  }
  
  const handlePaste = (event: ClipboardEvent) => {
    if (options.preventDefault) event.preventDefault()
    if (options.stopPropagation) event.stopPropagation()
    
    const pastedText = event.clipboardData?.getData('text') || ''
    
    emit('paste', event)
    
    if (options.onPaste) {
      options.onPaste(event, pastedText)
    }
  }
  
  return {
    handleInput,
    handleBlur,
    handleFocus,
    handleChange,
    handleKeydown,
    handleKeyup,
    handlePaste
  }
}

/**
 * Simplified version for basic use cases
 */
export function useSimpleFormEvents(emit: (event: string, ...args: any[]) => void) {
  return {
    onInput: (event: Event) => {
      const target = event.target as HTMLInputElement
      emit('update:modelValue', target.value)
      emit('input', event)
    },
    onBlur: (event: FocusEvent) => emit('blur', event),
    onFocus: (event: FocusEvent) => emit('focus', event),
    onChange: (event: Event) => emit('change', event)
  }
}