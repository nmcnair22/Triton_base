<template>
  <div v-if="hasError" class="error-boundary">
    <Card class="max-w-2xl mx-auto my-8">
      <template #header>
        <div class="flex items-center gap-3 text-danger">
          <i class="pi pi-exclamation-triangle text-2xl"></i>
          <h3 class="text-xl font-semibold">{{ title }}</h3>
        </div>
      </template>
      
      <template #content>
        <div class="space-y-4">
          <!-- Error Message -->
          <div class="text-surface-600 dark:text-surface-400">
            <p class="mb-2">{{ errorMessage }}</p>
            <p v-if="showDetails && errorDetails" class="text-sm text-surface-500 dark:text-surface-500">
              {{ errorDetails }}
            </p>
          </div>
          
          <!-- Error Stack (Development Only) -->
          <div v-if="isDevelopment && errorStack" class="mt-4">
            <Button 
              label="Show Error Details" 
              icon="pi pi-chevron-down"
              @click="showStack = !showStack"
              text
              size="small"
              class="p-0"
            />
            <pre v-if="showStack" class="mt-2 p-4 bg-surface-100 dark:bg-surface-800 rounded-lg text-xs overflow-auto max-h-64">{{ errorStack }}</pre>
          </div>
          
          <!-- Actions -->
          <div class="flex gap-3 mt-6">
            <Button 
              label="Try Again" 
              icon="pi pi-refresh"
              @click="retry" 
              severity="primary"
            />
            <Button 
              label="Go Home" 
              icon="pi pi-home"
              @click="goHome" 
              severity="secondary"
            />
            <Button 
              v-if="canReport"
              label="Report Issue" 
              icon="pi pi-flag"
              @click="reportError" 
              severity="secondary"
              outlined
            />
          </div>
        </div>
      </template>
    </Card>
  </div>
  
  <slot v-else />
</template>

<script setup lang="ts">
import { ref, computed, onErrorCaptured, provide, inject, type InjectionKey } from 'vue'
import { useRouter } from 'vue-router'
import Card from 'primevue/card'
import Button from 'primevue/button'
import { useErrorHandler } from '@/composables/error'

interface Props {
  title?: string
  fallbackMessage?: string
  showDetails?: boolean
  canReport?: boolean
  onError?: (error: Error, info: string) => void
  onRetry?: () => void
  isolated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Something went wrong',
  fallbackMessage: 'An unexpected error occurred. Please try again.',
  showDetails: true,
  canReport: true,
  isolated: false
})

const emit = defineEmits<{
  error: [error: Error, info: string]
  retry: []
  report: [error: Error]
}>()

// Error boundary key for nested boundaries
const ErrorBoundaryKey: InjectionKey<{ clearError: () => void }> = Symbol('ErrorBoundary')

// State
const hasError = ref(false)
const currentError = ref<Error | null>(null)
const errorInfo = ref('')
const showStack = ref(false)

// Router
const router = useRouter()

// Error handler
const { handleError } = useErrorHandler({
  showToast: false, // We'll show our own UI
  logToConsole: true
})

// Environment
const isDevelopment = computed(() => import.meta.env.DEV)

// Error details
const errorMessage = computed(() => {
  if (currentError.value?.message) {
    return currentError.value.message
  }
  return props.fallbackMessage
})

const errorDetails = computed(() => {
  if (!props.showDetails) return null
  return errorInfo.value || 'No additional details available'
})

const errorStack = computed(() => {
  if (!isDevelopment.value) return null
  return currentError.value?.stack || null
})

// Capture errors from child components
onErrorCaptured((err: Error, instance, info: string) => {
  console.error('Error captured in boundary:', err, info)
  
  hasError.value = true
  currentError.value = err
  errorInfo.value = info
  
  // Handle the error
  handleError(err, {
    context: 'Error Boundary',
    metadata: { componentInfo: info }
  })
  
  // Call custom error handler if provided
  if (props.onError) {
    props.onError(err, info)
  }
  
  // Emit error event
  emit('error', err, info)
  
  // Prevent error from propagating if isolated
  return props.isolated
})

// Clear error and retry
const retry = () => {
  hasError.value = false
  currentError.value = null
  errorInfo.value = ''
  showStack.value = false
  
  // Call custom retry handler if provided
  if (props.onRetry) {
    props.onRetry()
  }
  
  emit('retry')
}

// Go to home page
const goHome = () => {
  hasError.value = false
  router.push('/')
}

// Report error
const reportError = () => {
  if (!currentError.value) return
  
  emit('report', currentError.value)
  
  // In a real app, this would send to an error reporting service
  console.log('Reporting error:', {
    error: currentError.value.message,
    stack: currentError.value.stack,
    info: errorInfo.value,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString()
  })
}

// Provide clear error function for child components
provide(ErrorBoundaryKey, {
  clearError: () => {
    hasError.value = false
    currentError.value = null
    errorInfo.value = ''
  }
})

// Check if we're inside another error boundary
const parentBoundary = inject(ErrorBoundaryKey, null)

// Expose methods for parent components
defineExpose({
  hasError,
  currentError,
  retry,
  clearError: () => {
    hasError.value = false
    currentError.value = null
    errorInfo.value = ''
  }
})
</script>

<style scoped>
.error-boundary {
  @apply min-h-[400px] flex items-center justify-center p-4;
}
</style>