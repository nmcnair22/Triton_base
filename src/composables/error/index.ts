/**
 * Error handling and async state management composables
 * 
 * This module exports utilities for consistent error handling,
 * loading states, and asynchronous data management.
 */

export { useErrorHandler, useGlobalErrorHandler } from './useErrorHandler'
export type { ErrorHandlerOptions, ErrorRecord } from './useErrorHandler'

export { useLoadingState, useGlobalLoadingState } from './useLoadingState'
export type { LoadingTask } from './useLoadingState'

export { useAsyncData, usePaginatedAsyncData } from './useAsyncData'
export type { AsyncDataOptions, AsyncDataResult } from './useAsyncData'