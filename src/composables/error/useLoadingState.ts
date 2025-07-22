/**
 * Loading state management composable
 *
 * Provides utilities for managing loading states
 * with support for multiple concurrent operations.
 */

import { ref, computed } from 'vue'

export interface LoadingTask {
  id: string
  name: string
  startTime: number
  progress?: number
  message?: string
}

export function useLoadingState(defaultMessage = 'Loading...') {
  // Track multiple loading tasks
  const loadingTasks = ref(new Map<string, LoadingTask>())
  const globalMessage = ref(defaultMessage)

  // Computed properties
  const isLoading = computed(() => loadingTasks.value.size > 0)
  const loadingCount = computed(() => loadingTasks.value.size)
  const currentTasks = computed(() => Array.from(loadingTasks.value.values()))

  // Get the most recent task
  const currentTask = computed(() => {
    const tasks = currentTasks.value
    return tasks.length > 0 ? tasks[tasks.length - 1] : null
  })

  // Get loading message
  const loadingMessage = computed(() => {
    if (currentTask.value?.message) {
      return currentTask.value.message
    }
    if (loadingCount.value > 1) {
      return `${loadingCount.value} operations in progress...`
    }
    return globalMessage.value
  })

  // Get overall progress (average of all tasks with progress)
  const progress = computed(() => {
    const tasksWithProgress = currentTasks.value.filter(t => t.progress !== undefined)
    if (tasksWithProgress.length === 0) return undefined

    const totalProgress = tasksWithProgress.reduce((sum, t) => sum + (t.progress || 0), 0)
    return Math.round(totalProgress / tasksWithProgress.length)
  })

  /**
   * Start a loading task
   */
  const startLoading = (taskId: string, taskName?: string, message?: string): void => {
    loadingTasks.value.set(taskId, {
      id: taskId,
      name: taskName || taskId,
      startTime: Date.now(),
      message,
    })
  }

  /**
   * Stop a loading task
   */
  const stopLoading = (taskId: string): void => {
    loadingTasks.value.delete(taskId)
  }

  /**
   * Update task progress
   */
  const updateProgress = (taskId: string, progress: number, message?: string): void => {
    const task = loadingTasks.value.get(taskId)
    if (task) {
      task.progress = Math.max(0, Math.min(100, progress))
      if (message !== undefined) {
        task.message = message
      }
      loadingTasks.value.set(taskId, task)
    }
  }

  /**
   * Update task message
   */
  const updateMessage = (taskId: string, message: string): void => {
    const task = loadingTasks.value.get(taskId)
    if (task) {
      task.message = message
      loadingTasks.value.set(taskId, task)
    }
  }

  /**
   * Execute a function with loading state
   */
  const withLoading = async <T>(
    taskId: string,
    fn: () => Promise<T>,
    options?: {
      taskName?: string
      message?: string
      onProgress?: (progress: number) => void
    }
  ): Promise<T> => {
    startLoading(taskId, options?.taskName, options?.message)

    try {
      // If progress callback is provided, create a wrapper
      if (options?.onProgress) {
        const progressWrapper = (p: number) => {
          updateProgress(taskId, p)
          options.onProgress?.(p)
        }
        // Pass progress wrapper to the function if it accepts it
        const result = await (fn as any)(progressWrapper)
        return result
      }

      return await fn()
    } finally {
      stopLoading(taskId)
    }
  }

  /**
   * Execute multiple functions with combined loading state
   */
  const withBatchLoading = async <T>(
    tasks: Array<{
      id: string
      name?: string
      fn: () => Promise<T>
    }>
  ): Promise<T[]> => {
    // Start all loading tasks
    tasks.forEach(task => {
      startLoading(task.id, task.name)
    })

    try {
      // Execute all tasks in parallel
      const results = await Promise.all(
        tasks.map(async task => {
          try {
            return await task.fn()
          } finally {
            stopLoading(task.id)
          }
        })
      )

      return results
    } catch (error) {
      // Stop all remaining tasks on error
      tasks.forEach(task => stopLoading(task.id))
      throw error
    }
  }

  /**
   * Clear all loading tasks
   */
  const clearAll = (): void => {
    loadingTasks.value.clear()
  }

  /**
   * Get duration of a loading task
   */
  const getTaskDuration = (taskId: string): number | null => {
    const task = loadingTasks.value.get(taskId)
    if (!task) return null
    return Date.now() - task.startTime
  }

  /**
   * Check if a specific task is loading
   */
  const isTaskLoading = (taskId: string): boolean => {
    return loadingTasks.value.has(taskId)
  }

  return {
    // State
    isLoading,
    loadingCount,
    loadingMessage,
    progress,
    currentTasks,
    currentTask,

    // Methods
    startLoading,
    stopLoading,
    updateProgress,
    updateMessage,
    withLoading,
    withBatchLoading,
    clearAll,
    getTaskDuration,
    isTaskLoading,
  }
}

/**
 * Global loading state for app-wide operations
 */
let globalLoadingState: ReturnType<typeof useLoadingState> | null = null

export function useGlobalLoadingState() {
  if (!globalLoadingState) {
    globalLoadingState = useLoadingState('Processing...')
  }
  return globalLoadingState
}
