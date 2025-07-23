import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DiscoveryCache } from '@/themes/core/discovery-cache'
import type { DesignToken } from '@/themes/presets/preset.types'

describe('DiscoveryCache', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllTimers()
  })
  
  const sampleTokens: DesignToken[] = [
    {
      id: 'test.token',
      label: 'Test Token',
      category: 'primitive',
      path: 'test.token',
      value: '#000000',
      type: 'color',
      defaultValue: '#000000'
    }
  ]
  
  describe('Cache Operations', () => {
    it('should save tokens to cache', () => {
      const tokens = new Map([['test', sampleTokens]])
      
      DiscoveryCache.save(tokens)
      
      const cached = localStorage.getItem('theme-discovery-cache')
      expect(cached).toBeTruthy()
      
      const parsed = JSON.parse(cached!)
      expect(parsed.test).toBeDefined()
      expect(parsed.test.tokens).toHaveLength(1)
      expect(parsed.test.version).toBe('1.0.0')
    })
    
    it('should load tokens from cache', () => {
      const tokens = new Map([['test', sampleTokens]])
      DiscoveryCache.save(tokens)
      
      const loaded = DiscoveryCache.load()
      expect(loaded).toBeTruthy()
      expect(loaded!.size).toBe(1)
      expect(loaded!.get('test')).toEqual(sampleTokens)
    })
    
    it('should return null for empty cache', () => {
      const loaded = DiscoveryCache.load()
      expect(loaded).toBeNull()
    })
    
    it('should clear cache', () => {
      const tokens = new Map([['test', sampleTokens]])
      DiscoveryCache.save(tokens)
      
      expect(localStorage.getItem('theme-discovery-cache')).toBeTruthy()
      
      DiscoveryCache.clear()
      
      expect(localStorage.getItem('theme-discovery-cache')).toBeNull()
    })
  })
  
  describe('Cache Validation', () => {
    it('should validate cache version', () => {
      // Save with wrong version
      const cacheData = {
        test: {
          tokens: sampleTokens,
          timestamp: Date.now(),
          version: '0.9.0' // Wrong version
        }
      }
      
      localStorage.setItem('theme-discovery-cache', JSON.stringify(cacheData))
      
      const loaded = DiscoveryCache.load()
      expect(loaded).toBeNull()
      expect(localStorage.getItem('theme-discovery-cache')).toBeNull() // Should be cleared
    })
    
    it('should validate cache age', () => {
      // Save with old timestamp
      const cacheData = {
        test: {
          tokens: sampleTokens,
          timestamp: Date.now() - (25 * 60 * 60 * 1000), // 25 hours ago
          version: '1.0.0'
        }
      }
      
      localStorage.setItem('theme-discovery-cache', JSON.stringify(cacheData))
      
      const loaded = DiscoveryCache.load()
      expect(loaded).toBeNull()
    })
    
    it('should accept valid cache', () => {
      const tokens = new Map([['test', sampleTokens]])
      DiscoveryCache.save(tokens)
      
      expect(DiscoveryCache.isValid()).toBe(true)
    })
  })
  
  describe('Cache Statistics', () => {
    it('should provide cache statistics', () => {
      const tokens = new Map([
        ['test1', sampleTokens],
        ['test2', sampleTokens]
      ])
      
      DiscoveryCache.save(tokens)
      
      const stats = DiscoveryCache.getStats()
      expect(stats.exists).toBe(true)
      expect(stats.size).toBeGreaterThan(0)
      expect(stats.age).toBeLessThan(1000) // Less than 1 second old
      expect(stats.entries).toBe(2)
    })
    
    it('should handle missing cache in stats', () => {
      const stats = DiscoveryCache.getStats()
      expect(stats.exists).toBe(false)
      expect(stats.size).toBe(0)
      expect(stats.age).toBeNull()
      expect(stats.entries).toBe(0)
    })
  })
  
  describe('Cache Updates', () => {
    it('should update specific cache entry', () => {
      const tokens = new Map([['test', sampleTokens]])
      DiscoveryCache.save(tokens)
      
      const newTokens: DesignToken[] = [
        ...sampleTokens,
        {
          id: 'test.token2',
          label: 'Test Token 2',
          category: 'primitive',
          path: 'test.token2',
          value: '#ffffff',
          type: 'color',
          defaultValue: '#ffffff'
        }
      ]
      
      DiscoveryCache.updateEntry('test', newTokens)
      
      const loaded = DiscoveryCache.load()
      expect(loaded!.get('test')).toHaveLength(2)
    })
    
    it('should create new entry if not exists', () => {
      DiscoveryCache.updateEntry('new', sampleTokens)
      
      const loaded = DiscoveryCache.load()
      expect(loaded!.has('new')).toBe(true)
      expect(loaded!.get('new')).toEqual(sampleTokens)
    })
  })
  
  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw error
      const originalSetItem = localStorage.setItem
      localStorage.setItem = vi.fn(() => {
        throw new Error('Storage quota exceeded')
      })
      
      const tokens = new Map([['test', sampleTokens]])
      
      // Should not throw
      expect(() => DiscoveryCache.save(tokens)).not.toThrow()
      
      // Restore
      localStorage.setItem = originalSetItem
    })
    
    it('should handle corrupted cache data', () => {
      localStorage.setItem('theme-discovery-cache', 'invalid json')
      
      const loaded = DiscoveryCache.load()
      expect(loaded).toBeNull()
      
      // Cache should be cleared
      expect(localStorage.getItem('theme-discovery-cache')).toBeNull()
    })
  })
})