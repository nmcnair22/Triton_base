# Architecture Improvements Implementation Plan

## Overview
This document outlines the implementation plan for architecture improvements to the Triton project, focusing on component patterns, performance optimization, and error handling.

## 1. Component Patterns - Form Composables

### Priority: High | Timeline: Week 1-2

#### 1.1 Create Core Form Composables

**File Structure:**
```
src/composables/forms/
├── useForm.ts          # Complete form management
├── useFormField.ts     # Individual field management
├── useFormValidation.ts # Validation logic
├── useFormEvents.ts    # Event handling
└── validators.ts       # Common validators
```

**Implementation Steps:**

1. **Create `useFormField` composable:**
```typescript
// src/composables/forms/useFormField.ts
import { ref, computed, watch } from 'vue'
import type { Ref } from 'vue'

export interface FormFieldOptions<T = string> {
  validators?: Array<(value: T) => string | true>
  validateOn?: 'input' | 'blur' | 'change'
  debounce?: number
}

export function useFormField<T = string>(
  initialValue: T,
  options: FormFieldOptions<T> = {}
) {
  const value = ref<T>(initialValue) as Ref<T>
  const error = ref('')
  const touched = ref(false)
  const dirty = computed(() => value.value !== initialValue)
  
  const state = computed(() => {
    if (!touched.value && !dirty.value) return 'default'
    if (error.value) return 'error'
    if (dirty.value && !error.value) return 'success'
    return 'default'
  })
  
  const validate = async () => {
    error.value = ''
    if (!options.validators) return true
    
    for (const validator of options.validators) {
      const result = await validator(value.value)
      if (result !== true) {
        error.value = result
        return false
      }
    }
    return true
  }
  
  const reset = () => {
    value.value = initialValue
    error.value = ''
    touched.value = false
  }
  
  // Auto-validate based on options
  if (options.validateOn) {
    watch(value, () => {
      if (options.validateOn === 'input' || 
          (options.validateOn === 'change' && dirty.value)) {
        validate()
      }
    }, { flush: 'post' })
  }
  
  return {
    value,
    error: computed(() => error.value),
    state: computed(() => state.value),
    touched: computed(() => touched.value),
    dirty,
    validate,
    reset,
    setTouched: () => { touched.value = true }
  }
}
```

2. **Create `useForm` composable:**
```typescript
// src/composables/forms/useForm.ts
import { reactive, computed, ref } from 'vue'
import type { UnwrapRef } from 'vue'

export interface FormOptions<T> {
  validateOn?: 'submit' | 'blur' | 'change'
  onSubmit?: (values: T) => void | Promise<void>
}

export function useForm<T extends Record<string, any>>(
  initialValues: T,
  options: FormOptions<T> = {}
) {
  const values = reactive({ ...initialValues }) as UnwrapRef<T>
  const errors = reactive<Record<string, string>>({})
  const touched = reactive<Record<string, boolean>>({})
  const isSubmitting = ref(false)
  
  const isValid = computed(() => 
    Object.keys(errors).every(key => !errors[key])
  )
  
  const isDirty = computed(() => 
    Object.keys(values).some(key => 
      values[key] !== initialValues[key]
    )
  )
  
  const validateField = async (
    fieldName: string, 
    validators?: Array<(value: any) => string | true>
  ) => {
    if (!validators) return true
    
    errors[fieldName] = ''
    for (const validator of validators) {
      const result = await validator(values[fieldName])
      if (result !== true) {
        errors[fieldName] = result
        return false
      }
    }
    return true
  }
  
  const handleSubmit = async (e?: Event) => {
    e?.preventDefault()
    isSubmitting.value = true
    
    try {
      // Validate all fields
      const validationPromises = Object.keys(values).map(key => 
        validateField(key)
      )
      await Promise.all(validationPromises)
      
      if (isValid.value && options.onSubmit) {
        await options.onSubmit(values as T)
      }
    } finally {
      isSubmitting.value = false
    }
  }
  
  const reset = () => {
    Object.assign(values, initialValues)
    Object.keys(errors).forEach(key => delete errors[key])
    Object.keys(touched).forEach(key => delete touched[key])
  }
  
  const register = (fieldName: keyof T, fieldOptions?: {
    validators?: Array<(value: any) => string | true>
  }) => ({
    modelValue: computed({
      get: () => values[fieldName],
      set: (val) => { 
        values[fieldName] = val
        if (options.validateOn === 'change' && touched[fieldName as string]) {
          validateField(fieldName as string, fieldOptions?.validators)
        }
      }
    }),
    error: computed(() => errors[fieldName as string]),
    onBlur: () => { 
      touched[fieldName as string] = true
      if (options.validateOn === 'blur') {
        validateField(fieldName as string, fieldOptions?.validators)
      }
    }
  })
  
  return {
    values: computed(() => values),
    errors: computed(() => errors),
    touched: computed(() => touched),
    isSubmitting: computed(() => isSubmitting.value),
    isValid,
    isDirty,
    handleSubmit,
    reset,
    register,
    validateField
  }
}
```

3. **Create common validators:**
```typescript
// src/composables/forms/validators.ts
export const validators = {
  required: (message = 'This field is required') => 
    (value: any) => (value && value.toString().trim()) || message,
    
  email: (message = 'Invalid email address') => 
    (value: string) => {
      const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return !value || pattern.test(value) || message
    },
    
  minLength: (min: number, message?: string) => 
    (value: string) => {
      const msg = message || `Must be at least ${min} characters`
      return !value || value.length >= min || msg
    },
    
  maxLength: (max: number, message?: string) => 
    (value: string) => {
      const msg = message || `Must be no more than ${max} characters`
      return !value || value.length <= max || msg
    },
    
  pattern: (regex: RegExp, message = 'Invalid format') => 
    (value: string) => !value || regex.test(value) || message,
    
  numeric: (message = 'Must be a number') => 
    (value: any) => !value || !isNaN(Number(value)) || message,
    
  match: (otherValue: () => any, message = 'Values must match') => 
    (value: any) => value === otherValue() || message
}
```

#### 1.2 Refactor Existing Components

1. Update `AppInput.vue` to use `useFormEvents`
2. Update `FormsDemo.vue` to use `useForm`
3. Create examples demonstrating all patterns

### 2. Theme Store Splitting

### Priority: High | Timeline: Week 2-3

#### 2.1 Create Focused Stores

**File Structure:**
```
src/stores/theme/
├── config.store.ts    # Application-level config
├── ui.store.ts        # UI state management
├── preset.store.ts    # Preset management
├── editor.store.ts    # Real-time editing
└── index.ts           # Re-exports for compatibility
```

**Implementation Steps:**

1. **Create Theme Config Store:**
```typescript
// src/stores/theme/config.store.ts
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeConfigStore = defineStore('theme-config', () => {
  const config = ref({
    activePresetId: '',
    baseTheme: 'light' as 'light' | 'dark',
    darkMode: false,
    autoSave: true,
    syncAcrossTabs: true,
    smoothTransitions: true,
    storageKey: 'triton-theme-config'
  })
  
  function toggleDarkMode() {
    config.value.darkMode = !config.value.darkMode
    applyDarkMode(config.value.darkMode)
    saveConfig()
  }
  
  function applyDarkMode(isDark: boolean) {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
  
  function loadSavedConfig() {
    try {
      const saved = localStorage.getItem(config.value.storageKey)
      if (saved) {
        Object.assign(config.value, JSON.parse(saved))
      }
    } catch (error) {
      console.warn('Failed to load saved config:', error)
    }
  }
  
  function saveConfig() {
    try {
      localStorage.setItem(
        config.value.storageKey, 
        JSON.stringify(config.value)
      )
    } catch (error) {
      console.warn('Failed to save config:', error)
    }
  }
  
  // Cross-tab sync
  if (typeof window !== 'undefined' && config.value.syncAcrossTabs) {
    window.addEventListener('storage', (e) => {
      if (e.key === config.value.storageKey && e.newValue) {
        try {
          Object.assign(config.value, JSON.parse(e.newValue))
          applyDarkMode(config.value.darkMode)
        } catch (error) {
          console.warn('Failed to sync config:', error)
        }
      }
    })
  }
  
  return {
    config,
    toggleDarkMode,
    loadSavedConfig,
    saveConfig
  }
})
```

2. **Create Theme UI Store:**
```typescript
// src/stores/theme/ui.store.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useThemeUIStore = defineStore('theme-ui', () => {
  const configSidebarVisible = ref(false)
  const isDirty = ref(false)
  const isLoading = ref(false)
  
  const isConfigOpen = computed(() => configSidebarVisible.value)
  
  function toggleConfig() {
    configSidebarVisible.value = !configSidebarVisible.value
  }
  
  function setConfigVisible(visible: boolean) {
    configSidebarVisible.value = visible
  }
  
  function setDirty(dirty: boolean) {
    isDirty.value = dirty
  }
  
  function setLoading(loading: boolean) {
    isLoading.value = loading
  }
  
  return {
    configSidebarVisible,
    isDirty,
    isLoading,
    isConfigOpen,
    toggleConfig,
    setConfigVisible,
    setDirty,
    setLoading
  }
})
```

3. **Create migration helpers and backward compatibility layer**

### 3. Performance Optimization

### Priority: Medium | Timeline: Week 3-4

#### 3.1 Color Calculation Memoization

**Implementation Steps:**

1. **Create memoized color utilities:**
```typescript
// src/utils/color-utils-optimized.ts
import { memoize } from '@vueuse/core'
import { getLuminance, getContrastRatio as wcagContrast } from '@/utils/color-utils'

// Memoize expensive color calculations
export const getMemoizedLuminance = memoize(getLuminance)
export const getMemoizedContrastRatio = memoize(
  (color1: string, color2: string) => wcagContrast(color1, color2)
)

// Memoize palette generation
export const generatePalette = memoize(async (baseColor: string) => {
  const { palette } = await import('@primeuix/themes')
  return palette(baseColor)
})
```

2. **Update theme store to use memoized functions**

#### 3.2 Performance Monitoring

1. **Create performance monitoring composable:**
```typescript
// src/composables/usePerformanceMonitor.ts
import { onMounted, onUnmounted } from 'vue'

export function usePerformanceMonitor(componentName: string) {
  let observer: PerformanceObserver | null = null
  
  onMounted(() => {
    if ('PerformanceObserver' in window) {
      observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          console.log(`[${componentName}] ${entry.name}: ${entry.duration}ms`)
        })
      })
      
      observer.observe({ entryTypes: ['measure', 'navigation'] })
    }
  })
  
  onUnmounted(() => {
    observer?.disconnect()
  })
  
  return {
    measure: (name: string, fn: () => void) => {
      const startMark = `${componentName}-${name}-start`
      const endMark = `${componentName}-${name}-end`
      
      performance.mark(startMark)
      fn()
      performance.mark(endMark)
      performance.measure(name, startMark, endMark)
    }
  }
}
```

2. **Add bundle analyzer script:**
```json
// package.json
{
  "scripts": {
    "analyze": "vite build --mode analyze",
    "analyze:preview": "vite preview --open"
  }
}
```

3. **Configure Vite for bundle analysis:**
```typescript
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    // ... existing plugins
    process.env.ANALYZE && visualizer({
      open: true,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true
    })
  ]
})
```

### 4. Error Handling

### Priority: High | Timeline: Week 4

#### 4.1 Global Error Handler

1. **Create error handling composable:**
```typescript
// src/composables/useErrorHandler.ts
import { useToast } from 'primevue/usetoast'

export interface ErrorHandlerOptions {
  showToast?: boolean
  logToConsole?: boolean
  context?: string
}

export function useErrorHandler(defaultOptions: ErrorHandlerOptions = {}) {
  const toast = useToast()
  
  const handleError = (
    error: Error | unknown, 
    options: ErrorHandlerOptions = {}
  ) => {
    const opts = { ...defaultOptions, ...options }
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'An unexpected error occurred'
    
    if (opts.logToConsole) {
      console.error(`[${opts.context || 'Error'}]:`, error)
    }
    
    if (opts.showToast) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: errorMessage,
        life: 5000
      })
    }
    
    return errorMessage
  }
  
  return { handleError }
}
```

2. **Create error boundary component:**
```vue
<!-- src/components/ErrorBoundary.vue -->
<template>
  <div v-if="hasError" class="error-boundary">
    <Card>
      <template #header>
        <div class="flex items-center gap-2">
          <i class="pi pi-exclamation-triangle text-danger"></i>
          <h3>Something went wrong</h3>
        </div>
      </template>
      <template #content>
        <p class="text-surface-600 dark:text-surface-400">
          {{ errorMessage }}
        </p>
        <Button 
          label="Try Again" 
          @click="reset" 
          class="mt-4"
          severity="secondary"
        />
      </template>
    </Card>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'

const hasError = ref(false)
const errorMessage = ref('')

onErrorCaptured((err) => {
  hasError.value = true
  errorMessage.value = err instanceof Error 
    ? err.message 
    : 'An unexpected error occurred'
  
  // Prevent error from propagating
  return false
})

const reset = () => {
  hasError.value = false
  errorMessage.value = ''
}
</script>
```

3. **Configure global error handler:**
```typescript
// main.ts
import { useErrorHandler } from '@/composables/useErrorHandler'

app.config.errorHandler = (err, instance, info) => {
  const { handleError } = useErrorHandler({
    showToast: true,
    logToConsole: true,
    context: 'Global'
  })
  
  handleError(err)
  
  // Send to error tracking service in production
  if (import.meta.env.PROD) {
    // errorTrackingService.log(err, { instance, info })
  }
}
```

#### 4.2 Loading States

1. **Create loading state composable:**
```typescript
// src/composables/useLoadingState.ts
import { ref, computed } from 'vue'

export function useLoadingState() {
  const loadingTasks = ref(new Set<string>())
  
  const isLoading = computed(() => loadingTasks.value.size > 0)
  
  const startLoading = (taskId: string) => {
    loadingTasks.value.add(taskId)
  }
  
  const stopLoading = (taskId: string) => {
    loadingTasks.value.delete(taskId)
  }
  
  const withLoading = async <T>(
    taskId: string, 
    fn: () => Promise<T>
  ): Promise<T> => {
    startLoading(taskId)
    try {
      return await fn()
    } finally {
      stopLoading(taskId)
    }
  }
  
  return {
    isLoading,
    startLoading,
    stopLoading,
    withLoading
  }
}
```

2. **Create async data composable:**
```typescript
// src/composables/useAsyncData.ts
import { ref, computed, watch } from 'vue'
import { useErrorHandler } from './useErrorHandler'

export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  options: {
    immediate?: boolean
    onError?: (error: Error) => void
  } = {}
) {
  const data = ref<T | null>(null)
  const error = ref<Error | null>(null)
  const loading = ref(false)
  const { handleError } = useErrorHandler()
  
  const execute = async () => {
    loading.value = true
    error.value = null
    
    try {
      data.value = await fetcher()
    } catch (err) {
      error.value = err as Error
      if (options.onError) {
        options.onError(err as Error)
      } else {
        handleError(err, { showToast: true })
      }
    } finally {
      loading.value = false
    }
  }
  
  if (options.immediate) {
    execute()
  }
  
  return {
    data: computed(() => data.value),
    error: computed(() => error.value),
    loading: computed(() => loading.value),
    execute,
    refresh: execute
  }
}
```

## Implementation Schedule

### Week 1-2: Form Composables
- [ ] Create core form composables
- [ ] Create validators library
- [ ] Refactor existing form components
- [ ] Create documentation and examples

### Week 2-3: Theme Store Splitting
- [ ] Create focused theme stores
- [ ] Implement migration helpers
- [ ] Update components to use new stores
- [ ] Test cross-store communication

### Week 3-4: Performance Optimization
- [ ] Implement color calculation memoization
- [ ] Add performance monitoring
- [ ] Set up bundle analysis
- [ ] Create performance budget

### Week 4: Error Handling
- [ ] Create error handling composables
- [ ] Implement error boundary component
- [ ] Add global error handler
- [ ] Create loading state management

## Success Metrics

1. **Code Quality**
   - Reduced code duplication by 40%
   - Improved type safety coverage to 100%
   - All new code has unit tests

2. **Performance**
   - Color calculations 10x faster with memoization
   - Bundle size reduced by 15%
   - Initial load time improved by 20%

3. **Developer Experience**
   - Form creation time reduced by 50%
   - Clear error messages and stack traces
   - Consistent patterns across codebase

4. **Maintainability**
   - Theme store split into 4 focused modules
   - Each module < 150 lines
   - Clear separation of concerns

## Migration Guide

### For Form Components
```typescript
// Before
const email = ref('')
const emailError = ref('')
const validateEmail = () => { /* ... */ }

// After
const { value: email, error: emailError, validate } = useFormField('', {
  validators: [validators.required(), validators.email()]
})
```

### For Theme Store
```typescript
// Before
import { useThemeStore } from '@/stores/theme.store'
const theme = useThemeStore()
theme.toggleConfig()

// After
import { useThemeUIStore } from '@/stores/theme/ui.store'
const themeUI = useThemeUIStore()
themeUI.toggleConfig()
```

## Next Steps

1. Review plan with team
2. Set up feature branches
3. Begin implementation with form composables
4. Create comprehensive tests for each module
5. Document all new patterns in Storybook