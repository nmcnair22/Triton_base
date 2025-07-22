/**
 * Async data fetching composable with error handling and loading states
 *
 * Provides a consistent pattern for handling asynchronous operations
 * with automatic error handling, loading states, and retry logic.
 */

import { ref, computed, watch, type Ref } from 'vue'
import { useErrorHandler } from './useErrorHandler'
import { useLoadingState } from './useLoadingState'

export interface AsyncDataOptions<T> {
  immediate?: boolean
  defaultValue?: T
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  retryCount?: number
  retryDelay?: number
  cacheTime?: number
  transform?: (data: any) => T
  validateData?: (data: T) => boolean | string
}

export interface AsyncDataResult<T> {
  data: Ref<T | null>
  error: Ref<Error | null>
  loading: Ref<boolean>
  execute: (params?: any) => Promise<T | null>
  refresh: () => Promise<T | null>
  reset: () => void
  retry: () => Promise<T | null>
  isSuccess: Ref<boolean>
  isError: Ref<boolean>
  isIdle: Ref<boolean>
}

export function useAsyncData<T = any>(
  fetcher: (params?: any) => Promise<T>,
  options: AsyncDataOptions<T> = {}
): AsyncDataResult<T> {
  const {
    immediate = false,
    defaultValue = null,
    onSuccess,
    onError,
    retryCount = 0,
    retryDelay = 1000,
    cacheTime = 0,
    transform,
    validateData,
  } = options

  // State
  const data = ref<T | null>(defaultValue as T | null)
  const error = ref<Error | null>(null)
  const loading = ref(false)
  const lastFetchTime = ref<number>(0)
  const lastParams = ref<any>(undefined)
  const currentRetries = ref(0)

  // Error and loading handlers
  const { handleError } = useErrorHandler({ showToast: true })
  const { withLoading } = useLoadingState()

  // Computed states
  const isSuccess = computed(() => data.value !== null && error.value === null)
  const isError = computed(() => error.value !== null)
  const isIdle = computed(() => !loading.value && data.value === null && error.value === null)

  // Check if cache is still valid
  const isCacheValid = computed(() => {
    if (cacheTime <= 0) return false
    return Date.now() - lastFetchTime.value < cacheTime
  })

  /**
   * Execute the async operation
   */
  const execute = async (params?: any): Promise<T | null> => {
    // Return cached data if still valid
    if (isCacheValid.value && data.value !== null && params === lastParams.value) {
      return data.value
    }

    // Reset state
    error.value = null
    currentRetries.value = 0
    lastParams.value = params

    // Execute with retries
    return executeWithRetry(params)
  }

  /**
   * Execute with retry logic
   */
  const executeWithRetry = async (params?: any): Promise<T | null> => {
    loading.value = true

    try {
      // Fetch data
      const rawData = await fetcher(params)

      // Transform data if transformer is provided
      const processedData = transform ? transform(rawData) : rawData

      // Validate data if validator is provided
      if (validateData) {
        const validationResult = validateData(processedData)
        if (validationResult !== true) {
          throw new Error(
            typeof validationResult === 'string' ? validationResult : 'Data validation failed'
          )
        }
      }

      // Success
      data.value = processedData
      error.value = null
      lastFetchTime.value = Date.now()

      // Call success callback
      if (onSuccess) {
        onSuccess(processedData)
      }

      return processedData
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err))

      // Check if we should retry
      if (currentRetries.value < retryCount) {
        currentRetries.value++
        console.warn(
          `Retrying operation (${currentRetries.value}/${retryCount}) after ${retryDelay}ms...`
        )

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, retryDelay))

        // Retry
        return executeWithRetry(params)
      }

      // Final failure
      error.value = errorObj
      data.value = defaultValue as T | null

      // Handle error
      handleError(errorObj, {
        context: 'Async Data Fetch',
        showToast: !onError, // Show toast only if no custom error handler
      })

      // Call error callback
      if (onError) {
        onError(errorObj)
      }

      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Refresh data (re-execute with last params)
   */
  const refresh = (): Promise<T | null> => {
    lastFetchTime.value = 0 // Invalidate cache
    return execute(lastParams.value)
  }

  /**
   * Retry last failed operation
   */
  const retry = (): Promise<T | null> => {
    if (!error.value) {
      console.warn('No error to retry')
      return Promise.resolve(data.value)
    }
    currentRetries.value = 0 // Reset retry count
    return execute(lastParams.value)
  }

  /**
   * Reset all state
   */
  const reset = (): void => {
    data.value = defaultValue as T | null
    error.value = null
    loading.value = false
    lastFetchTime.value = 0
    lastParams.value = undefined
    currentRetries.value = 0
  }

  // Execute immediately if requested
  if (immediate) {
    execute()
  }

  return {
    data: computed(() => data.value),
    error: computed(() => error.value),
    loading: computed(() => loading.value),
    execute,
    refresh,
    reset,
    retry,
    isSuccess,
    isError,
    isIdle,
  }
}

/**
 * Composable for handling paginated async data
 */
export function usePaginatedAsyncData<T = any>(
  fetcher: (
    page: number,
    pageSize: number,
    params?: any
  ) => Promise<{
    data: T[]
    total: number
    page: number
    pageSize: number
  }>,
  options: AsyncDataOptions<T[]> & {
    pageSize?: number
  } = {}
) {
  const currentPage = ref(1)
  const pageSize = ref(options.pageSize || 10)
  const totalItems = ref(0)
  const totalPages = computed(() => Math.ceil(totalItems.value / pageSize.value))

  // Use async data composable
  const asyncData = useAsyncData(async (params?: any) => {
    const result = await fetcher(currentPage.value, pageSize.value, params)
    totalItems.value = result.total
    return result.data
  }, options)

  // Pagination methods
  const goToPage = async (page: number) => {
    currentPage.value = Math.max(1, Math.min(page, totalPages.value))
    await asyncData.refresh()
  }

  const nextPage = () => goToPage(currentPage.value + 1)
  const prevPage = () => goToPage(currentPage.value - 1)
  const firstPage = () => goToPage(1)
  const lastPage = () => goToPage(totalPages.value)

  return {
    ...asyncData,
    currentPage: computed(() => currentPage.value),
    pageSize: computed(() => pageSize.value),
    totalItems: computed(() => totalItems.value),
    totalPages,
    hasNextPage: computed(() => currentPage.value < totalPages.value),
    hasPrevPage: computed(() => currentPage.value > 1),
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
  }
}
