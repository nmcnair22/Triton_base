import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TokenDiscovery } from '@/themes/core/token-discovery'
import { DiscoveryCache } from '@/themes/core/discovery-cache'
import type { DesignToken } from '@/themes/presets/preset.types'

// Mock the imports
vi.mock('@primeuix/themes/material', () => ({
  default: {
    primitive: {
      borderRadius: {
        xs: '2px',
        sm: '4px',
        md: '6px',
        lg: '8px'
      }
    },
    semantic: {
      primary: {
        50: '{navy.50}',
        500: '{navy.500}',
        900: '{navy.900}'
      }
    }
  }
}))

vi.mock('@/themes/custom-preset', () => ({
  CustomPreset: {
    components: {
      button: {
        background: '{primary.500}',
        color: '#ffffff',
        padding: {
          x: '1rem',
          y: '0.5rem'
        }
      }
    }
  }
}))

describe('TokenDiscovery', () => {
  beforeEach(() => {
    // Clear cache before each test
    TokenDiscovery.clearCache()
    localStorage.clear()
  })
  
  describe('Token Discovery', () => {
    it('should discover all token types', async () => {
      const tokens = await TokenDiscovery.discoverAllTokens()
      
      expect(tokens.size).toBeGreaterThan(0)
      expect(tokens.has('primitive')).toBe(true)
      expect(tokens.has('semantic')).toBe(true)
      expect(tokens.has('button')).toBe(true)
      expect(tokens.has('datatable')).toBe(true)
    })
    
    it('should discover primitive tokens', async () => {
      const tokens = await TokenDiscovery.discoverAllTokens()
      const primitiveTokens = tokens.get('primitive')
      
      expect(primitiveTokens).toBeDefined()
      expect(primitiveTokens!.length).toBeGreaterThan(0)
      
      // Check for border radius tokens
      const borderRadiusTokens = primitiveTokens!.filter(t => t.type === 'borderRadius')
      expect(borderRadiusTokens.length).toBeGreaterThan(0)
    })
    
    it('should discover semantic tokens', async () => {
      const tokens = await TokenDiscovery.discoverAllTokens()
      const semanticTokens = tokens.get('semantic')
      
      expect(semanticTokens).toBeDefined()
      expect(semanticTokens!.length).toBeGreaterThan(0)
      
      // Check for primary color tokens
      const primaryTokens = semanticTokens!.filter(t => t.path.includes('primary'))
      expect(primaryTokens.length).toBeGreaterThan(0)
    })
    
    it('should discover component tokens', async () => {
      const tokens = await TokenDiscovery.discoverAllTokens()
      const buttonTokens = tokens.get('button')
      
      expect(buttonTokens).toBeDefined()
      expect(buttonTokens!.length).toBeGreaterThan(0)
      
      // Check for specific button tokens
      const backgroundToken = buttonTokens!.find(t => t.path === 'background')
      expect(backgroundToken).toBeDefined()
      expect(backgroundToken?.type).toBe('color')
      expect(backgroundToken?.value).toBe('{primary.500}')
    })
  })
  
  describe('Token Type Inference', () => {
    it('should correctly infer color tokens', async () => {
      const tokens = await TokenDiscovery.discoverAllTokens()
      const allTokens = Array.from(tokens.values()).flat()
      
      const colorTokens = allTokens.filter(t => t.type === 'color')
      expect(colorTokens.length).toBeGreaterThan(0)
      
      // Check specific color patterns
      const backgroundTokens = allTokens.filter(t => t.path.includes('background'))
      expect(backgroundTokens.every(t => t.type === 'color')).toBe(true)
    })
    
    it('should correctly infer spacing tokens', async () => {
      const tokens = await TokenDiscovery.discoverAllTokens()
      const buttonTokens = tokens.get('button') || []
      
      const paddingTokens = buttonTokens.filter(t => t.path.includes('padding'))
      expect(paddingTokens.length).toBeGreaterThan(0)
      expect(paddingTokens.every(t => t.type === 'spacing')).toBe(true)
    })
    
    it('should correctly infer border radius tokens', async () => {
      const tokens = await TokenDiscovery.discoverAllTokens()
      const primitiveTokens = tokens.get('primitive') || []
      
      const radiusTokens = primitiveTokens.filter(t => t.path.includes('radius') || t.path.includes('borderRadius'))
      expect(radiusTokens.length).toBeGreaterThan(0)
      
      // Check that at least some are correctly typed
      const borderRadiusTokens = radiusTokens.filter(t => t.type === 'borderRadius')
      expect(borderRadiusTokens.length).toBeGreaterThan(0)
    })
  })
  
  describe('Component Token Discovery', () => {
    it('should discover tokens for specific component', async () => {
      const buttonTokens = await TokenDiscovery.discoverComponentTokens('button')
      
      expect(buttonTokens.length).toBeGreaterThan(0)
      expect(buttonTokens.every(t => t.subcategory === 'button')).toBe(true)
    })
    
    it('should return empty array for unknown component', async () => {
      const tokens = await TokenDiscovery.discoverComponentTokens('nonexistent')
      expect(tokens).toEqual([])
    })
  })
  
  describe('Caching', () => {
    it('should cache discovered tokens', async () => {
      // First discovery
      const tokens1 = await TokenDiscovery.discoverAllTokens()
      const size1 = tokens1.size
      expect(size1).toBeGreaterThan(0)
      
      // Check cache was saved
      const cacheStats = DiscoveryCache.getStats()
      expect(cacheStats.exists).toBe(true)
      expect(cacheStats.entries).toBe(size1)
      
      // Clear in-memory cache but not localStorage
      TokenDiscovery['tokenCache'].clear()
      TokenDiscovery['discoveryComplete'] = false
      
      // Second discovery should load from cache
      const tokens2 = await TokenDiscovery.discoverAllTokens()
      expect(tokens2.size).toBe(size1)
    })
    
    it('should clear cache when requested', () => {
      TokenDiscovery.clearCache()
      
      const cacheStats = DiscoveryCache.getStats()
      expect(cacheStats.exists).toBe(false)
    })
  })
  
  describe('Statistics', () => {
    it('should provide accurate discovery statistics', async () => {
      await TokenDiscovery.discoverAllTokens()
      const stats = TokenDiscovery.getDiscoveryStats()
      
      expect(stats.totalComponents).toBeGreaterThan(0)
      expect(stats.discoveredComponents).toBeGreaterThan(0)
      expect(stats.totalTokens).toBeGreaterThan(0)
      expect(stats.tokensByCategory.primitive).toBeGreaterThan(0)
      expect(stats.tokensByCategory.semantic).toBeGreaterThan(0)
      expect(stats.tokensByCategory.component).toBeGreaterThan(0)
    })
  })
  
  describe('Token Metadata', () => {
    it('should generate appropriate descriptions', async () => {
      const tokens = await TokenDiscovery.discoverAllTokens()
      const buttonTokens = tokens.get('button') || []
      
      const hoverToken = buttonTokens.find(t => t.path.includes('hover'))
      if (hoverToken) {
        expect(hoverToken.description.toLowerCase()).toContain('hover')
      }
      
      const backgroundToken = buttonTokens.find(t => t.path === 'background')
      if (backgroundToken) {
        expect(backgroundToken.description.toLowerCase()).toContain('background')
      }
    })
    
    it('should set affects property for component tokens', async () => {
      const tokens = await TokenDiscovery.discoverAllTokens()
      const buttonTokens = tokens.get('button') || []
      
      expect(buttonTokens.every(t => t.affects?.includes('button'))).toBe(true)
    })
    
    it('should humanize token names', async () => {
      const tokens = await TokenDiscovery.discoverAllTokens()
      const allTokens = Array.from(tokens.values()).flat()
      
      // Check that labels don't contain underscores or hyphens
      expect(allTokens.every(t => !t.label.includes('_'))).toBe(true)
      expect(allTokens.every(t => !t.label.includes('-'))).toBe(true)
      
      // Check that most tokens have proper capitalization (allow for numbers)
      const tokensWithLetters = allTokens.filter(t => /[a-zA-Z]/.test(t.label))
      const properlyCapitalized = tokensWithLetters.filter(t => /^[A-Z0-9]/.test(t.label))
      expect(properlyCapitalized.length).toBeGreaterThan(tokensWithLetters.length * 0.9) // 90% should be capitalized
    })
  })
})