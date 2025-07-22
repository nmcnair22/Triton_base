/**
 * Centralized storage utilities for theme system
 * Handles localStorage with error handling and quota management
 */

export interface StorageOptions {
  compress?: boolean
  validateData?: boolean
  maxSize?: number // in bytes
}

export class ThemeStorage {
  private static readonly DEFAULT_OPTIONS: StorageOptions = {
    compress: false,
    validateData: true,
    maxSize: 1024 * 1024, // 1MB
  }

  /**
   * Save data to localStorage with error handling
   */
  static save<T>(key: string, data: T, options: StorageOptions = {}): boolean {
    const opts = { ...this.DEFAULT_OPTIONS, ...options }

    try {
      const serialized = JSON.stringify(data)

      // Check size limits
      if (opts.maxSize && serialized.length > opts.maxSize) {
        console.warn(
          `Data too large for key ${key}: ${serialized.length} bytes > ${opts.maxSize} bytes`
        )
        throw new Error(`Data exceeds maximum size limit of ${opts.maxSize} bytes`)
      }

      // Check localStorage quota
      this.checkQuota(serialized.length)

      localStorage.setItem(key, serialized)
      console.log(`✅ Saved data to localStorage: ${key} (${serialized.length} bytes)`)
      return true
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.error('localStorage quota exceeded')
        throw new Error('Storage quota exceeded. Please clear some data.')
      }

      console.error(`Failed to save to localStorage: ${key}`, error)
      throw error instanceof Error ? error : new Error('Unknown storage error')
    }
  }

  /**
   * Load data from localStorage with validation
   */
  static load<T>(key: string, options: StorageOptions = {}): T | null {
    const opts = { ...this.DEFAULT_OPTIONS, ...options }

    try {
      const stored = localStorage.getItem(key)
      if (!stored) {
        console.log(`No data found for key: ${key}`)
        return null
      }

      const parsed = JSON.parse(stored) as T

      if (opts.validateData) {
        // Basic validation - could be extended with schemas
        if (typeof parsed !== 'object' || parsed === null) {
          throw new Error('Invalid data format')
        }
      }

      console.log(`✅ Loaded data from localStorage: ${key}`)
      return parsed
    } catch (error) {
      console.error(`Failed to load from localStorage: ${key}`, error)

      // Try to recover by removing corrupted data
      try {
        localStorage.removeItem(key)
        console.log(`Removed corrupted data for key: ${key}`)
      } catch {
        // Ignore cleanup errors
      }

      return null
    }
  }

  /**
   * Remove data from localStorage
   */
  static remove(key: string): boolean {
    try {
      localStorage.removeItem(key)
      console.log(`✅ Removed data from localStorage: ${key}`)
      return true
    } catch (error) {
      console.error(`Failed to remove from localStorage: ${key}`, error)
      return false
    }
  }

  /**
   * Check if a key exists in localStorage
   */
  static exists(key: string): boolean {
    try {
      return localStorage.getItem(key) !== null
    } catch {
      return false
    }
  }

  /**
   * Get storage usage statistics
   */
  static getUsageStats() {
    try {
      let totalSize = 0
      let itemCount = 0
      const items: Array<{ key: string; size: number }> = []

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          const value = localStorage.getItem(key)
          if (value) {
            const size = new Blob([value]).size
            totalSize += size
            itemCount++
            items.push({ key, size })
          }
        }
      }

      // Estimate remaining space (rough approximation)
      const estimatedQuota = 5 * 1024 * 1024 // 5MB typical limit
      const remainingSpace = Math.max(0, estimatedQuota - totalSize)

      return {
        totalSize,
        totalSizeKB: (totalSize / 1024).toFixed(2),
        itemCount,
        estimatedQuota,
        remainingSpace,
        remainingSpaceKB: (remainingSpace / 1024).toFixed(2),
        items: items.sort((a, b) => b.size - a.size), // Largest first
      }
    } catch (error) {
      console.error('Failed to get storage stats:', error)
      return {
        totalSize: 0,
        totalSizeKB: '0.00',
        itemCount: 0,
        estimatedQuota: 0,
        remainingSpace: 0,
        remainingSpaceKB: '0.00',
        items: [],
      }
    }
  }

  /**
   * Clear all theme-related data
   */
  static clearThemeData(): boolean {
    try {
      const themeKeys = []

      // Find all theme-related keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.startsWith('triton-') || key.includes('theme'))) {
          themeKeys.push(key)
        }
      }

      // Remove theme keys
      themeKeys.forEach(key => localStorage.removeItem(key))

      console.log(`✅ Cleared ${themeKeys.length} theme-related items`)
      return true
    } catch (error) {
      console.error('Failed to clear theme data:', error)
      return false
    }
  }

  /**
   * Check localStorage quota and warn if getting full
   */
  private static checkQuota(additionalSize: number) {
    try {
      const stats = this.getUsageStats()
      const afterSize = stats.totalSize + additionalSize
      const usagePercent = (afterSize / stats.estimatedQuota) * 100

      if (usagePercent > 90) {
        console.warn(`localStorage usage high: ${usagePercent.toFixed(1)}%`)
      }

      if (afterSize > stats.estimatedQuota) {
        throw new DOMException('Quota exceeded', 'QuotaExceededError')
      }
    } catch (error) {
      // If we can't check quota, let the actual operation fail
      if (error instanceof DOMException) {
        throw error
      }
    }
  }

  /**
   * Backup localStorage data
   */
  static backupData(keys?: string[]): string {
    try {
      const backup: Record<string, string> = {}
      const keysToBackup = keys || Object.keys(localStorage)

      keysToBackup.forEach(key => {
        const value = localStorage.getItem(key)
        if (value !== null) {
          backup[key] = value
        }
      })

      return JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          data: backup,
        },
        null,
        2
      )
    } catch (error) {
      console.error('Failed to backup data:', error)
      throw error
    }
  }

  /**
   * Restore localStorage data from backup
   */
  static restoreData(backupData: string): boolean {
    try {
      const parsed = JSON.parse(backupData)

      if (!parsed.data || typeof parsed.data !== 'object') {
        throw new Error('Invalid backup format')
      }

      Object.entries(parsed.data).forEach(([key, value]) => {
        if (typeof value === 'string') {
          localStorage.setItem(key, value)
        }
      })

      console.log('✅ Data restored from backup')
      return true
    } catch (error) {
      console.error('Failed to restore data:', error)
      return false
    }
  }
}
