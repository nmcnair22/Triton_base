/**
 * Performance monitoring composable for Vue 3 applications
 * 
 * Provides utilities for measuring component performance,
 * tracking render times, and monitoring memory usage.
 */

import { onMounted, onUnmounted, ref, computed } from 'vue'
import { useRafFn } from '@vueuse/core'

export interface PerformanceMetrics {
  renderTime: number
  mountTime: number
  updateCount: number
  lastUpdateTime: number
  averageUpdateTime: number
  memoryUsage?: {
    usedJSHeapSize: number
    totalJSHeapSize: number
    jsHeapSizeLimit: number
  }
}

export interface PerformanceMark {
  name: string
  startTime: number
  duration?: number
}

export function usePerformanceMonitor(componentName: string, options: {
  trackMemory?: boolean
  trackFPS?: boolean
  logToConsole?: boolean
  warnThreshold?: number // milliseconds
} = {}) {
  const {
    trackMemory = false,
    trackFPS = false,
    logToConsole = true,
    warnThreshold = 16 // ~60fps
  } = options
  
  // State
  const metrics = ref<PerformanceMetrics>({
    renderTime: 0,
    mountTime: 0,
    updateCount: 0,
    lastUpdateTime: 0,
    averageUpdateTime: 0
  })
  
  const marks = ref<Map<string, PerformanceMark>>(new Map())
  const fps = ref(0)
  const isMonitoring = ref(false)
  
  let observer: PerformanceObserver | null = null
  let mountStartTime: number = performance.now()
  let updateTimes: number[] = []
  
  // FPS tracking
  if (trackFPS) {
    let frameCount = 0
    let lastTime = performance.now()
    
    useRafFn(() => {
      frameCount++
      const currentTime = performance.now()
      const delta = currentTime - lastTime
      
      if (delta >= 1000) {
        fps.value = Math.round((frameCount * 1000) / delta)
        frameCount = 0
        lastTime = currentTime
      }
    })
  }
  
  // Memory tracking
  const memoryInfo = computed(() => {
    if (!trackMemory || !('memory' in performance)) {
      return null
    }
    
    const memory = (performance as any).memory
    return {
      used: (memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
      total: (memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
      limit: (memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB',
      percentage: ((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(1) + '%'
    }
  })
  
  // Performance marking functions
  function startMark(markName: string) {
    const mark: PerformanceMark = {
      name: markName,
      startTime: performance.now()
    }
    marks.value.set(markName, mark)
    
    if ('mark' in performance) {
      performance.mark(`${componentName}-${markName}-start`)
    }
  }
  
  function endMark(markName: string): number {
    const mark = marks.value.get(markName)
    if (!mark) {
      console.warn(`No start mark found for: ${markName}`)
      return 0
    }
    
    const duration = performance.now() - mark.startTime
    mark.duration = duration
    
    if ('mark' in performance && 'measure' in performance) {
      performance.mark(`${componentName}-${markName}-end`)
      performance.measure(
        `${componentName}-${markName}`,
        `${componentName}-${markName}-start`,
        `${componentName}-${markName}-end`
      )
    }
    
    // Log if threshold exceeded
    if (duration > warnThreshold && logToConsole) {
      console.warn(
        `⚠️ [${componentName}] ${markName} took ${duration.toFixed(2)}ms (threshold: ${warnThreshold}ms)`
      )
    }
    
    return duration
  }
  
  // Measure function execution time
  function measure<T>(name: string, fn: () => T): T {
    startMark(name)
    try {
      const result = fn()
      const duration = endMark(name)
      
      if (logToConsole) {
        console.log(`⏱️ [${componentName}] ${name}: ${duration.toFixed(2)}ms`)
      }
      
      return result
    } catch (error) {
      endMark(name)
      throw error
    }
  }
  
  // Async measure function
  async function measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    startMark(name)
    try {
      const result = await fn()
      const duration = endMark(name)
      
      if (logToConsole) {
        console.log(`⏱️ [${componentName}] ${name}: ${duration.toFixed(2)}ms`)
      }
      
      return result
    } catch (error) {
      endMark(name)
      throw error
    }
  }
  
  // Track component updates
  function trackUpdate() {
    const updateTime = performance.now() - mountStartTime
    updateTimes.push(updateTime)
    
    metrics.value.updateCount++
    metrics.value.lastUpdateTime = updateTime
    metrics.value.averageUpdateTime = 
      updateTimes.reduce((a, b) => a + b, 0) / updateTimes.length
      
    // Keep only last 100 update times to prevent memory leak
    if (updateTimes.length > 100) {
      updateTimes = updateTimes.slice(-100)
    }
  }
  
  // Get performance report
  function getReport() {
    const report = {
      component: componentName,
      metrics: { ...metrics.value },
      marks: Array.from(marks.value.values()).filter(m => m.duration),
      fps: trackFPS ? fps.value : undefined,
      memory: memoryInfo.value
    }
    
    if (logToConsole) {
      console.table({
        Component: componentName,
        'Mount Time': `${metrics.value.mountTime.toFixed(2)}ms`,
        'Update Count': metrics.value.updateCount,
        'Avg Update Time': `${metrics.value.averageUpdateTime.toFixed(2)}ms`,
        'Current FPS': trackFPS ? fps.value : 'N/A',
        'Memory Usage': memoryInfo.value?.percentage || 'N/A'
      })
    }
    
    return report
  }
  
  // Clear all marks and metrics
  function reset() {
    marks.value.clear()
    metrics.value = {
      renderTime: 0,
      mountTime: 0,
      updateCount: 0,
      lastUpdateTime: 0,
      averageUpdateTime: 0
    }
    updateTimes = []
    mountStartTime = performance.now()
  }
  
  // Lifecycle hooks
  onMounted(() => {
    isMonitoring.value = true
    metrics.value.mountTime = performance.now() - mountStartTime
    
    if (logToConsole) {
      console.log(`🚀 [${componentName}] mounted in ${metrics.value.mountTime.toFixed(2)}ms`)
    }
    
    // Set up Performance Observer if available
    if ('PerformanceObserver' in window) {
      try {
        observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.name.startsWith(componentName)) {
              metrics.value.renderTime = entry.duration
            }
          })
        })
        
        observer.observe({ entryTypes: ['measure', 'navigation'] })
      } catch (error) {
        console.warn('PerformanceObserver not supported:', error)
      }
    }
  })
  
  onUnmounted(() => {
    isMonitoring.value = false
    observer?.disconnect()
    
    if (logToConsole) {
      console.log(`🏁 [${componentName}] performance summary:`)
      getReport()
    }
  })
  
  return {
    // State
    metrics: computed(() => metrics.value),
    fps: computed(() => fps.value),
    memoryInfo,
    isMonitoring: computed(() => isMonitoring.value),
    
    // Methods
    startMark,
    endMark,
    measure,
    measureAsync,
    trackUpdate,
    getReport,
    reset
  }
}

/**
 * Global performance monitoring utilities
 */
export const performanceUtils = {
  /**
   * Enable Vue.js performance tracking
   */
  enableVuePerformanceTracking() {
    if (import.meta.env.DEV) {
      const app = getCurrentApp()
      if (app) {
        app.config.performance = true
      }
    }
  },
  
  /**
   * Log all performance entries
   */
  logAllPerformanceEntries() {
    const entries = performance.getEntries()
    console.group('📊 Performance Entries')
    entries.forEach(entry => {
      console.log(`${entry.name}: ${entry.duration?.toFixed(2)}ms`)
    })
    console.groupEnd()
  },
  
  /**
   * Clear all performance marks and measures
   */
  clearAllMarks() {
    performance.clearMarks()
    performance.clearMeasures()
  }
}

// Add missing import
import { getCurrentInstance } from 'vue'

function getCurrentApp() {
  const instance = getCurrentInstance()
  return instance?.appContext.app
}