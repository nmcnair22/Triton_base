/**
 * Discovery Cache System
 * Caches discovered tokens for performance
 */

import type { DesignToken } from '@/themes/presets/preset.types'

export interface CacheEntry {
  tokens: DesignToken[]
  timestamp: number
  version: string
}

export class DiscoveryCache {
  private static readonly CACHE_KEY = 'theme-discovery-cache'
  private static readonly CACHE_VERSION = '1.0.0'
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours
  
  /**
   * Save discovered tokens to cache
   */
  static save(discoveredTokens: Map<string, DesignToken[]>): void {
    try {
      const cacheData: Record<string, CacheEntry> = {}
      
      discoveredTokens.forEach((tokens, key) => {
        cacheData[key] = {
          tokens,
          timestamp: Date.now(),
          version: this.CACHE_VERSION
        }
      })
      
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData))
      console.log('💾 Token discovery cache saved')
    } catch (error) {
      console.warn('Failed to save discovery cache:', error)
    }
  }
  
  /**
   * Load discovered tokens from cache
   */
  static load(): Map<string, DesignToken[]> | null {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY)
      if (!cached) return null
      
      const cacheData = JSON.parse(cached) as Record<string, CacheEntry>
      const result = new Map<string, DesignToken[]>()
      
      // Check cache validity
      const now = Date.now()
      let isValid = true
      
      for (const [key, entry] of Object.entries(cacheData)) {
        // Check version
        if (entry.version !== this.CACHE_VERSION) {
          isValid = false
          break
        }
        
        // Check age
        if (now - entry.timestamp > this.CACHE_DURATION) {
          isValid = false
          break
        }
        
        result.set(key, entry.tokens)
      }
      
      if (!isValid) {
        this.clear()
        return null
      }
      
      console.log('💾 Token discovery loaded from cache')
      return result
    } catch (error) {
      console.warn('Failed to load discovery cache:', error)
      this.clear()
      return null
    }
  }
  
  /**
   * Clear the cache
   */
  static clear(): void {
    try {
      localStorage.removeItem(this.CACHE_KEY)
      console.log('🧹 Token discovery cache cleared')
    } catch (error) {
      console.warn('Failed to clear discovery cache:', error)
    }
  }
  
  /**
   * Check if cache exists and is valid
   */
  static isValid(): boolean {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY)
      if (!cached) return false
      
      const cacheData = JSON.parse(cached) as Record<string, CacheEntry>
      const now = Date.now()
      
      for (const entry of Object.values(cacheData)) {
        if (entry.version !== this.CACHE_VERSION) return false
        if (now - entry.timestamp > this.CACHE_DURATION) return false
      }
      
      return true
    } catch {
      return false
    }
  }
  
  /**
   * Get cache statistics
   */
  static getStats(): {
    exists: boolean
    size: number
    age: number | null
    entries: number
  } {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY)
      if (!cached) {
        return { exists: false, size: 0, age: null, entries: 0 }
      }
      
      const cacheData = JSON.parse(cached) as Record<string, CacheEntry>
      const entries = Object.entries(cacheData)
      
      if (entries.length === 0) {
        return { exists: true, size: cached.length, age: null, entries: 0 }
      }
      
      const oldestTimestamp = Math.min(...entries.map(([_, entry]) => entry.timestamp))
      const age = Date.now() - oldestTimestamp
      
      return {
        exists: true,
        size: cached.length,
        age,
        entries: entries.length
      }
    } catch {
      return { exists: false, size: 0, age: null, entries: 0 }
    }
  }
  
  /**
   * Update specific cache entry
   */
  static updateEntry(key: string, tokens: DesignToken[]): void {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY)
      const cacheData = cached ? JSON.parse(cached) : {}
      
      cacheData[key] = {
        tokens,
        timestamp: Date.now(),
        version: this.CACHE_VERSION
      }
      
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData))
    } catch (error) {
      console.warn('Failed to update cache entry:', error)
    }
  }
}