import { describe, it, expect } from 'vitest'
import { TokenMigration } from '@/themes/core/token-migration'
import type { ColorToken, DesignToken, ThemePreset, ColorOverride } from '@/themes/presets/preset.types'

describe('TokenMigration', () => {
  describe('ColorToken to DesignToken conversion', () => {
    it('should convert brand color token', () => {
      const colorToken: ColorToken = {
        id: 'primary-color',
        label: 'Primary Color',
        category: 'brand',
        description: 'Main brand color',
        cssVariable: '--p-primary',
        defaultValue: '#007bff'
      }
      
      const designToken = TokenMigration.colorTokenToDesignToken(colorToken)
      
      expect(designToken).toMatchObject({
        id: 'primary-color',
        label: 'Primary Color',
        category: 'semantic',
        subcategory: 'brand',
        path: 'primary.color',
        value: '#007bff',
        type: 'color',
        defaultValue: '#007bff',
        description: 'Main brand color'
      })
    })
    
    it('should convert surface color token', () => {
      const colorToken: ColorToken = {
        id: 'surface-100',
        label: 'Surface 100',
        category: 'surface',
        cssVariable: '--p-surface-100',
        defaultValue: '#f8f9fa'
      }
      
      const designToken = TokenMigration.colorTokenToDesignToken(colorToken)
      
      expect(designToken.category).toBe('primitive')
      expect(designToken.subcategory).toBe('surface')
    })
    
    it('should handle tokens with no description', () => {
      const colorToken: ColorToken = {
        id: 'text-color',
        label: 'Text Color',
        category: 'text',
        cssVariable: '--p-text',
        defaultValue: '#333333'
      }
      
      const designToken = TokenMigration.colorTokenToDesignToken(colorToken)
      
      expect(designToken.description).toBeUndefined()
    })
  })
  
  describe('Batch migration', () => {
    it('should migrate multiple color tokens', () => {
      const colorTokens: ColorToken[] = [
        {
          id: 'primary',
          label: 'Primary',
          category: 'brand',
          cssVariable: '--p-primary',
          defaultValue: '#007bff'
        },
        {
          id: 'success',
          label: 'Success',
          category: 'status',
          cssVariable: '--p-success',
          defaultValue: '#28a745'
        }
      ]
      
      const designTokens = TokenMigration.migrateColorTokens(colorTokens)
      
      expect(designTokens).toHaveLength(2)
      expect(designTokens[0].category).toBe('semantic')
      expect(designTokens[1].category).toBe('semantic')
      expect(designTokens[0].subcategory).toBe('brand')
      expect(designTokens[1].subcategory).toBe('status')
    })
  })
  
  describe('ThemePreset migration', () => {
    it('should migrate preset with color overrides', () => {
      const preset: ThemePreset = {
        id: 'custom-theme',
        name: 'Custom Theme',
        description: 'A custom theme',
        baseTheme: 'Material',
        colorOverrides: [
          {
            tokenId: 'primary',
            value: '#ff0000',
            palette: {
              50: '#ffe5e5',
              500: '#ff0000',
              900: '#990000'
            }
          },
          {
            tokenId: 'surface-100',
            value: '#f5f5f5'
          }
        ],
        metadata: {
          created: '2024-01-01',
          modified: '2024-01-01',
          version: '1.0.0'
        }
      }
      
      const migrated = TokenMigration.migrateThemePreset(preset)
      
      expect(migrated.tokens).toBeDefined()
      expect(Object.keys(migrated.tokens!.semantic)).toContain('primary')
      expect(Object.keys(migrated.tokens!.primitive)).toContain('surface-100')
      expect(migrated.colorOverrides).toEqual(preset.colorOverrides) // Preserved for backward compat
    })
    
    it('should not re-migrate already migrated preset', () => {
      const preset: ThemePreset = {
        id: 'migrated-theme',
        name: 'Migrated Theme',
        baseTheme: 'Material',
        colorOverrides: [],
        tokens: {
          primitive: {},
          semantic: {},
          component: {},
          custom: {}
        },
        metadata: {
          created: '2024-01-01',
          modified: '2024-01-01',
          version: '1.0.0'
        }
      }
      
      const result = TokenMigration.migrateThemePreset(preset)
      expect(result).toBe(preset) // Should return the same object
    })
  })
  
  describe('ColorOverride to DesignToken conversion', () => {
    it('should convert brand color override', () => {
      const override: ColorOverride = {
        tokenId: 'primary',
        value: '#007bff'
      }
      
      const token = TokenMigration.colorOverrideToDesignToken(override)
      
      expect(token.category).toBe('semantic')
      expect(token.subcategory).toBe('brand')
      expect(token.label).toBe('Primary')
    })
    
    it('should convert status color override', () => {
      const override: ColorOverride = {
        tokenId: 'success-color',
        value: '#28a745'
      }
      
      const token = TokenMigration.colorOverrideToDesignToken(override)
      
      expect(token.category).toBe('semantic')
      expect(token.subcategory).toBe('status')
      expect(token.label).toBe('Success Color')
    })
    
    it('should handle unknown tokens as custom', () => {
      const override: ColorOverride = {
        tokenId: 'my-custom-token',
        value: '#123456'
      }
      
      const token = TokenMigration.colorOverrideToDesignToken(override)
      
      expect(token.category).toBe('custom')
      expect(token.subcategory).toBe('')
    })
  })
  
  describe('Token mapping', () => {
    it('should create ID mapping', () => {
      const oldTokens: ColorToken[] = [
        {
          id: 'primary-color',
          label: 'Primary',
          category: 'brand',
          cssVariable: '--p-primary',
          defaultValue: '#007bff'
        },
        {
          id: 'secondary-color',
          label: 'Secondary',
          category: 'brand',
          cssVariable: '--p-secondary',
          defaultValue: '#6c757d'
        }
      ]
      
      const mapping = TokenMigration.createTokenMapping(oldTokens)
      
      expect(mapping.get('primary-color')).toBe('primary.color')
      expect(mapping.get('secondary-color')).toBe('secondary.color')
    })
  })
  
  describe('Migration validation', () => {
    it('should validate successful migration', () => {
      const original: ThemePreset = {
        id: 'test',
        name: 'Test',
        baseTheme: 'Material',
        colorOverrides: [
          { tokenId: 'primary', value: '#007bff' }
        ],
        metadata: {
          created: '2024-01-01',
          modified: '2024-01-01',
          version: '1.0.0'
        }
      }
      
      const migrated = TokenMigration.migrateThemePreset(original)
      const validation = TokenMigration.validateMigration(original, migrated)
      
      expect(validation.valid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })
    
    it('should detect token count mismatch', () => {
      const original: ThemePreset = {
        id: 'test',
        name: 'Test',
        baseTheme: 'Material',
        colorOverrides: [
          { tokenId: 'primary', value: '#007bff' },
          { tokenId: 'secondary', value: '#6c757d' }
        ],
        metadata: {
          created: '2024-01-01',
          modified: '2024-01-01',
          version: '1.0.0'
        }
      }
      
      const migrated: ThemePreset = {
        ...original,
        tokens: {
          primitive: {},
          semantic: {
            'primary': {
              id: 'primary',
              label: 'Primary',
              category: 'semantic',
              path: 'primary',
              value: '#007bff',
              type: 'color',
              defaultValue: '#007bff'
            }
          },
          component: {},
          custom: {}
        }
      }
      
      const validation = TokenMigration.validateMigration(original, migrated)
      
      expect(validation.valid).toBe(false)
      expect(validation.errors).toContain('Token count mismatch: 2 original vs 1 migrated')
    })
  })
  
  describe('Migration report', () => {
    it('should generate comprehensive report', () => {
      const original: ThemePreset[] = [
        {
          id: 'theme1',
          name: 'Theme 1',
          baseTheme: 'Material',
          colorOverrides: [
            { tokenId: 'primary', value: '#007bff' }
          ],
          metadata: {
            created: '2024-01-01',
            modified: '2024-01-01',
            version: '1.0.0'
          }
        },
        {
          id: 'theme2',
          name: 'Theme 2',
          baseTheme: 'Material',
          colorOverrides: [
            { tokenId: 'primary', value: '#ff0000' },
            { tokenId: 'secondary', value: '#00ff00' }
          ],
          metadata: {
            created: '2024-01-01',
            modified: '2024-01-01',
            version: '1.0.0'
          }
        }
      ]
      
      const migrated = original.map(preset => TokenMigration.migrateThemePreset(preset))
      const report = TokenMigration.generateMigrationReport(original, migrated)
      
      expect(report.totalPresets).toBe(2)
      expect(report.successfulMigrations).toBe(2)
      expect(report.failedMigrations).toBe(0)
      expect(report.tokenCounts.original).toBe(3)
      expect(report.tokenCounts.migrated).toBe(3)
      expect(report.errors).toHaveLength(0)
    })
  })
})