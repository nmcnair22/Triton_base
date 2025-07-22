/**
 * Error handling composable for Vue 3 applications
 * 
 * Provides utilities for consistent error handling,
 * logging, and user notifications.
 */

import { ref, computed } from 'vue'
import { useToast } from 'primevue/usetoast'

export interface ErrorHandlerOptions {
  showToast?: boolean
  logToConsole?: boolean
  context?: string
  severity?: 'error' | 'warn' | 'info'
  life?: number
  throwError?: boolean
  metadata?: Record<string, any>
}

export interface ErrorRecord {
  id: string
  timestamp: Date
  error: Error | unknown
  context?: string
  message: string
  stack?: string
  metadata?: Record<string, any>
}

export function useErrorHandler(defaultOptions: ErrorHandlerOptions = {}) {
  const toast = useToast()
  const errors = ref<ErrorRecord[]>([])
  const isHandlingError = ref(false)
  
  const defaultConfig: ErrorHandlerOptions = {
    showToast: true,
    logToConsole: true,
    context: 'Application',
    severity: 'error',
    life: 5000,
    throwError: false,
    ...defaultOptions
  }
  
  // Computed properties
  const hasErrors = computed(() => errors.value.length > 0)
  const latestError = computed(() => errors.value[errors.value.length - 1])
  const errorCount = computed(() => errors.value.length)
  
  /**
   * Main error handling function
   */
  const handleError = (
    error: Error | unknown,
    options: ErrorHandlerOptions = {}
  ): ErrorRecord => {
    const opts = { ...defaultConfig, ...options }
    isHandlingError.value = true
    
    try {
      // Extract error information
      const errorMessage = extractErrorMessage(error)
      const errorStack = error instanceof Error ? error.stack : undefined
      
      // Create error record
      const errorRecord: ErrorRecord = {
        id: generateErrorId(),
        timestamp: new Date(),
        error,
        context: opts.context,
        message: errorMessage,
        stack: errorStack,
        metadata: {
          userAgent: navigator.userAgent,
          url: window.location.href,
          ...extractErrorMetadata(error),
          ...opts.metadata
        }
      }
      
      // Store error
      errors.value.push(errorRecord)
      
      // Keep only last 50 errors to prevent memory leak
      if (errors.value.length > 50) {
        errors.value = errors.value.slice(-50)
      }
      
      // Log to console
      if (opts.logToConsole) {
        logError(errorRecord, opts)
      }
      
      // Show toast notification
      if (opts.showToast) {
        showErrorToast(errorMessage, opts)
      }
      
      // Send to error tracking service (if configured)
      if (import.meta.env.PROD) {
        sendToErrorTracking(errorRecord)
      }
      
      // Re-throw if requested
      if (opts.throwError) {
        throw error
      }
      
      return errorRecord
    } finally {
      isHandlingError.value = false
    }
  }
  
  /**
   * Handle async errors with loading state
   */
  const handleAsyncError = async <T>(
    asyncFn: () => Promise<T>,
    options: ErrorHandlerOptions = {}
  ): Promise<T | null> => {
    try {
      return await asyncFn()
    } catch (error) {
      handleError(error, options)
      return null
    }
  }
  
  /**
   * Clear all stored errors
   */
  const clearErrors = () => {
    errors.value = []
  }
  
  /**
   * Clear a specific error by ID
   */
  const clearError = (errorId: string) => {
    errors.value = errors.value.filter(e => e.id !== errorId)
  }
  
  /**
   * Extract error message from various error types
   */
  function extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message
    }
    
    if (typeof error === 'string') {
      return error
    }
    
    if (error && typeof error === 'object') {
      // Handle API error responses
      if ('message' in error) {
        return String(error.message)
      }
      if ('error' in error) {
        return extractErrorMessage(error.error)
      }
      if ('statusText' in error) {
        return String(error.statusText)
      }
    }
    
    return 'An unexpected error occurred'
  }
  
  /**
   * Extract additional metadata from error
   */
  function extractErrorMetadata(error: unknown): Record<string, any> {
    const metadata: Record<string, any> = {}
    
    if (error && typeof error === 'object') {
      // Handle API error responses
      if ('status' in error) {
        metadata.status = error.status
      }
      if ('code' in error) {
        metadata.code = error.code
      }
      if ('response' in error) {
        metadata.response = error.response
      }
    }
    
    return metadata
  }
  
  /**
   * Generate unique error ID
   */
  function generateErrorId(): string {
    return `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
  
  /**
   * Log error to console with formatting
   */
  function logError(errorRecord: ErrorRecord, options: ErrorHandlerOptions) {
    const logFn = options.severity === 'warn' ? console.warn : console.error
    
    console.group(`🚨 ${options.context || 'Error'} [${errorRecord.id}]`)
    logFn('Message:', errorRecord.message)
    logFn('Timestamp:', errorRecord.timestamp.toISOString())
    
    if (errorRecord.stack) {
      logFn('Stack:', errorRecord.stack)
    }
    
    if (errorRecord.metadata && Object.keys(errorRecord.metadata).length > 0) {
      logFn('Metadata:', errorRecord.metadata)
    }
    
    console.groupEnd()
  }
  
  /**
   * Show error toast notification
   */
  function showErrorToast(message: string, options: ErrorHandlerOptions) {
    toast.add({
      severity: options.severity || 'error',
      summary: options.severity === 'error' ? 'Error' : 
               options.severity === 'warn' ? 'Warning' : 'Info',
      detail: message,
      life: options.life || 5000
    })
  }
  
  /**
   * Send error to tracking service
   */
  function sendToErrorTracking(errorRecord: ErrorRecord) {
    // Placeholder for error tracking integration
    // In a real app, you would send to Sentry, LogRocket, etc.
    console.log('Sending error to tracking service:', errorRecord.id)
  }
  
  return {
    // State
    errors: computed(() => errors.value),
    hasErrors,
    latestError,
    errorCount,
    isHandlingError: computed(() => isHandlingError.value),
    
    // Methods
    handleError,
    handleAsyncError,
    clearErrors,
    clearError
  }
}

/**
 * Global error handler instance
 * Can be used across the application for consistent error handling
 */
let globalErrorHandler: ReturnType<typeof useErrorHandler> | null = null

export function useGlobalErrorHandler() {
  if (!globalErrorHandler) {
    globalErrorHandler = useErrorHandler({
      context: 'Global',
      showToast: true,
      logToConsole: true
    })
  }
  return globalErrorHandler
}