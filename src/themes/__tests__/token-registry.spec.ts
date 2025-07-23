import { describe, it, expect, beforeEach } from 'vitest'
import { TokenRegistry } from '@/themes/core/token-registry'
import type { DesignToken } from '@/themes/presets/preset.types'

describe('TokenRegistry', () => {
  let registry: TokenRegistry
  
  // Sample tokens for testing
  const sampleTokens: DesignToken[] = [
    {
      id: 'color.primary',
      label: 'Primary Color',
      category: 'primitive',
      path: 'color.primary',
      value: '#007bff',
      type: 'color',
      defaultValue: '#007bff',
      description: 'Main brand color',
      affects: ['button', 'link']
    },
    {
      id: 'button.background',
      label: 'Button Background',
      category: 'component',
      subcategory: 'button',
      path: 'button.background',
      value: '{color.primary}',
      type: 'color',
      defaultValue: '{color.primary}',
      dependencies: ['color.primary']
    },
    {
      id: 'button.padding',
      label: 'Button Padding',
      category: 'component',
      subcategory: 'button',
      path: 'button.padding',
      value: '8px 16px',
      type: 'spacing',
      defaultValue: '8px 16px',
      validation: {
        pattern: /^\d+px(\s+\d+px)*$/
      }
    },
    {
      id: 'semantic.success',
      label: 'Success Color',
      category: 'semantic',
      path: 'semantic.success',
      value: '#28a745',
      type: 'color',
      defaultValue: '#28a745'
    }
  ]
  
  beforeEach(() => {
    registry = TokenRegistry.getInstance()
    registry.clear()
  })
  
  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = TokenRegistry.getInstance()
      const instance2 = TokenRegistry.getInstance()
      expect(instance1).toBe(instance2)
    })
  })
  
  describe('Token Registration', () => {
    it('should register a single token', () => {
      const token = sampleTokens[0]
      registry.register(token)
      
      expect(registry.getToken(token.id)).toEqual(token)
    })
    
    it('should register multiple tokens', () => {
      registry.registerBatch(sampleTokens)
      
      expect(registry.getAllTokens()).toHaveLength(sampleTokens.length)
      sampleTokens.forEach(token => {
        expect(registry.getToken(token.id)).toEqual(token)
      })
    })
    
    it('should update category index when registering', () => {
      registry.registerBatch(sampleTokens)
      
      const primitiveTokens = registry.getTokensByCategory('primitive')
      expect(primitiveTokens).toHaveLength(1)
      expect(primitiveTokens[0].id).toBe('color.primary')
      
      const componentTokens = registry.getTokensByCategory('component')
      expect(componentTokens).toHaveLength(2)
    })
    
    it('should update component index for component tokens', () => {
      registry.registerBatch(sampleTokens)
      
      const buttonTokens = registry.getTokensByComponent('button')
      expect(buttonTokens).toHaveLength(2)
      expect(buttonTokens.map(t => t.id)).toContain('button.background')
      expect(buttonTokens.map(t => t.id)).toContain('button.padding')
    })
  })
  
  describe('Token Retrieval', () => {
    beforeEach(() => {
      registry.registerBatch(sampleTokens)
    })
    
    it('should get token by ID', () => {
      const token = registry.getToken('color.primary')
      expect(token).toBeDefined()
      expect(token?.label).toBe('Primary Color')
    })
    
    it('should return undefined for non-existent token', () => {
      const token = registry.getToken('non.existent')
      expect(token).toBeUndefined()
    })
    
    it('should get tokens by type', () => {
      const colorTokens = registry.getTokensByType('color')
      expect(colorTokens).toHaveLength(3)
      
      const spacingTokens = registry.getTokensByType('spacing')
      expect(spacingTokens).toHaveLength(1)
      expect(spacingTokens[0].id).toBe('button.padding')
    })
  })
  
  describe('Token Search', () => {
    beforeEach(() => {
      registry.registerBatch(sampleTokens)
    })
    
    it('should search by ID', () => {
      const results = registry.searchTokens('button')
      expect(results).toHaveLength(2)
      expect(results.map(t => t.id)).toContain('button.background')
      expect(results.map(t => t.id)).toContain('button.padding')
    })
    
    it('should search by label', () => {
      const results = registry.searchTokens('primary')
      expect(results).toHaveLength(1)
      expect(results[0].id).toBe('color.primary')
    })
    
    it('should search by description', () => {
      const results = registry.searchTokens('brand')
      expect(results).toHaveLength(1)
      expect(results[0].id).toBe('color.primary')
    })
    
    it('should be case insensitive', () => {
      const results = registry.searchTokens('PRIMARY')
      expect(results).toHaveLength(1)
      expect(results[0].id).toBe('color.primary')
    })
  })
  
  describe('Token Relationships', () => {
    beforeEach(() => {
      registry.registerBatch(sampleTokens)
    })
    
    it('should track token dependencies', () => {
      const dependents = registry.getDependentTokens('color.primary')
      expect(dependents).toHaveLength(1)
      expect(dependents[0].id).toBe('button.background')
    })
    
    it('should get token relationships', () => {
      const relationships = registry.getRelationships('color.primary')
      expect(relationships).toBeDefined()
      expect(relationships?.affects).toContain('button')
      expect(relationships?.affects).toContain('link')
    })
  })
  
  describe('Token Validation', () => {
    beforeEach(() => {
      registry.registerBatch(sampleTokens)
    })
    
    it('should validate token with pattern', () => {
      const valid = registry.validateTokenValue('button.padding', '10px 20px')
      expect(valid).toBe(true)
      
      const invalid = registry.validateTokenValue('button.padding', 'invalid')
      expect(invalid).toContain('does not match required pattern')
    })
    
    it('should return true for tokens without validation', () => {
      const result = registry.validateTokenValue('color.primary', '#123456')
      expect(result).toBe(true)
    })
    
    it('should validate with custom validator', () => {
      const token: DesignToken = {
        id: 'test.custom',
        label: 'Test Custom',
        category: 'custom',
        path: 'test.custom',
        value: 5,
        type: 'size',
        defaultValue: 5,
        validation: {
          validator: (value) => value > 0 ? true : 'Value must be positive'
        }
      }
      
      registry.register(token)
      
      expect(registry.validateTokenValue('test.custom', 10)).toBe(true)
      expect(registry.validateTokenValue('test.custom', -5)).toBe('Value must be positive')
    })
  })
  
  describe('Token Updates', () => {
    beforeEach(() => {
      registry.registerBatch(sampleTokens)
    })
    
    it('should update token value', () => {
      registry.updateTokenValue('color.primary', '#ff0000')
      
      const token = registry.getToken('color.primary')
      expect(token?.value).toBe('#ff0000')
    })
    
    it('should not update non-existent token', () => {
      registry.updateTokenValue('non.existent', 'value')
      expect(registry.getToken('non.existent')).toBeUndefined()
    })
  })
  
  describe('Registry Statistics', () => {
    beforeEach(() => {
      registry.registerBatch(sampleTokens)
    })
    
    it('should provide accurate statistics', () => {
      const stats = registry.getStats()
      
      expect(stats.totalTokens).toBe(4)
      expect(stats.byCategory.primitive).toBe(1)
      expect(stats.byCategory.component).toBe(2)
      expect(stats.byCategory.semantic).toBe(1)
      expect(stats.byType.color).toBe(3)
      expect(stats.byType.spacing).toBe(1)
      expect(stats.components).toBe(1) // Only 'button'
    })
  })
  
  describe('Import/Export', () => {
    it('should export registry data', () => {
      registry.registerBatch(sampleTokens)
      
      const exported = registry.export()
      expect(exported.tokens).toHaveLength(4)
      expect(exported.relationships).toHaveLength(4)
    })
    
    it('should import registry data', () => {
      const data = {
        tokens: sampleTokens
      }
      
      registry.import(data)
      
      expect(registry.getAllTokens()).toHaveLength(4)
      expect(registry.getToken('color.primary')).toBeDefined()
    })
    
    it('should clear existing data before import', () => {
      registry.register(sampleTokens[0])
      expect(registry.getAllTokens()).toHaveLength(1)
      
      registry.import({ tokens: [sampleTokens[1]] })
      expect(registry.getAllTokens()).toHaveLength(1)
      expect(registry.getToken('color.primary')).toBeUndefined()
      expect(registry.getToken('button.background')).toBeDefined()
    })
  })
})