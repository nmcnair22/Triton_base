import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ThemeImporter } from '@/themes/core/theme-importer'
import { TokenRegistry } from '@/themes/core/token-registry'
import type { DesignToken } from '@/themes/presets/preset.types'

// Mock external dependencies
vi.mock('jszip', () => ({
  default: class MockJSZip {
    private files: Record<string, any> = {}
    
    static async loadAsync(data: ArrayBuffer) {
      const instance = new MockJSZip()
      // Simulate different file types based on test context
      if (global.mockZipType === 'package') {
        instance.files['package.json'] = {
          async: () => Promise.resolve(JSON.stringify({
            name: 'test-theme-package',
            version: '1.0.0',
            description: 'Test theme package',
            main: 'index.js'
          }))
        }
        instance.files['src/theme.js'] = {
          async: () => Promise.resolve(`
            export default {
              primitive: {
                blue: { 500: '#007bff' }
              },
              semantic: {
                primary: { 500: '{blue.500}' }
              },
              components: {
                button: {
                  background: '{primary.500}',
                  color: '#ffffff'
                }
              }
            }
          `)
        }
      } else if (global.mockZipType === 'primevue') {
        instance.files['theme.js'] = {
          async: () => Promise.resolve(`
            /**
             * Test Theme
             * Generated theme
             */
            export default {
              primitive: {
                blue: { 500: '#007bff' }
              },
              components: {
                button: {
                  background: '#007bff'
                }
              }
            }
          `)
        }
      }
      return instance
    }
    
    file(name: string) {
      return this.files[name] || null
    }
  }
}))

describe('ThemeImporter', () => {
  let importer: ThemeImporter
  let registry: TokenRegistry
  let sampleJsonData: any
  let sampleTokens: DesignToken[]

  beforeEach(() => {
    // Clear registry and create fresh instances
    TokenRegistry.clearInstance()
    registry = TokenRegistry.getInstance()
    importer = new ThemeImporter()
    
    // Clear mock globals
    global.mockZipType = undefined

    // Create sample data
    sampleJsonData = {
      name: 'Imported Test Theme',
      description: 'A theme imported for testing',
      version: '1.0.0',
      tokens: {
        primitive: {
          colors: {
            'blue.500': {
              value: '#007bff',
              type: 'color',
              description: 'Primary blue color'
            }
          }
        },
        semantic: {
          primary: {
            '500': {
              value: '{blue.500}',
              type: 'color',
              description: 'Primary brand color'
            }
          }
        },
        component: {
          button: {
            'background': {
              value: '{primary.500}',
              type: 'color',
              description: 'Button background'
            },
            'padding.x': {
              value: '1rem',
              type: 'spacing',
              description: 'Button horizontal padding'
            }
          }
        }
      }
    }

    sampleTokens = [
      {
        id: 'existing_token',
        label: 'Existing Token',
        category: 'primitive',
        path: 'existing.token',
        value: '#existing',
        type: 'color',
        defaultValue: '#existing'
      }
    ]

    // Register existing tokens
    sampleTokens.forEach(token => {
      registry.register(token)
    })
  })

  afterEach(() => {
    global.mockZipType = undefined
  })

  describe('Validation', () => {
    it('should validate valid JSON object', async () => {
      const result = await importer.validateImport(sampleJsonData)
      
      expect(result.valid).toBe(true)
      expect(result.format).toBe('shareable')
      expect(result.tokenCount).toBeGreaterThan(0)
      expect(result.errors).toHaveLength(0)
    })

    it('should validate valid JSON string', async () => {
      const jsonString = JSON.stringify(sampleJsonData)
      const result = await importer.validateImport(jsonString)
      
      expect(result.valid).toBe(true)
      expect(result.format).toBe('shareable')
      expect(result.tokenCount).toBeGreaterThan(0)
    })

    it('should reject invalid JSON string', async () => {
      const invalidJson = '{ invalid json }'
      const result = await importer.validateImport(invalidJson)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Invalid JSON format')
    })

    it('should validate package ZIP file', async () => {
      global.mockZipType = 'package'
      
      const mockFile = new File(['mock content'], 'theme.zip', { type: 'application/zip' })
      const result = await importer.validateImport(mockFile)
      
      expect(result.valid).toBe(true)
      expect(result.format).toBe('package')
    })

    it('should validate PrimeVue ZIP file', async () => {
      global.mockZipType = 'primevue'
      
      const mockFile = new File(['mock content'], 'theme.zip', { type: 'application/zip' })
      const result = await importer.validateImport(mockFile)
      
      expect(result.valid).toBe(true)
      expect(result.format).toBe('primevue')
    })

    it('should reject oversized files', async () => {
      // Create a file larger than 50MB
      const largeContent = 'x'.repeat(51 * 1024 * 1024)
      const largeFile = new File([largeContent], 'large.json', { type: 'application/json' })
      
      const result = await importer.validateImport(largeFile)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('File too large (max 50MB)')
    })

    it('should reject unsupported file types', async () => {
      const unsupportedFile = new File(['content'], 'theme.txt', { type: 'text/plain' })
      const result = await importer.validateImport(unsupportedFile)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Unsupported file format. Use .json or .zip files.')
    })

    it('should validate theme object structure', async () => {
      const invalidTheme = { invalidStructure: true }
      const result = await importer.validateImport(invalidTheme)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Unknown theme format')
    })

    it('should require theme name', async () => {
      const themeWithoutName = { tokens: { test: {} } } // Valid tokens but no name
      const result = await importer.validateImport(themeWithoutName)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Theme name is required')
    })

    it('should require theme tokens', async () => {
      const themeWithoutTokens = { name: 'Test Theme' } // Valid name but no tokens
      const result = await importer.validateImport(themeWithoutTokens)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Theme tokens are required')
    })
  })

  describe('Import Process', () => {
    it('should import theme successfully', async () => {
      const result = await importer.importTheme(sampleJsonData)
      
      expect(result.success).toBe(true)
      expect(result.preset).toBeDefined()
      expect(result.preset!.name).toBe('Imported Test Theme')
      expect(result.importedTokens).toBeGreaterThan(0)
      expect(result.timestamp).toBeDefined()
    })

    it('should generate preview when requested', async () => {
      const result = await importer.importTheme(sampleJsonData, { previewOnly: true })
      
      expect(result.success).toBe(true)
      expect(result.preview).toBeDefined()
      expect(result.preview!.preset.name).toBe('Imported Test Theme')
      expect(result.preview!.tokenCount).toBeGreaterThan(0)
      expect(result.preview!.format).toBe('shareable')
      expect(result.preview!.categories).toContain('primitive')
      expect(result.preview!.categories).toContain('component')
    })

    it('should detect conflicts', async () => {
      // Add a conflicting token to the import data
      const conflictingData = {
        ...sampleJsonData,
        tokens: {
          ...sampleJsonData.tokens,
          primitive: {
            existing: {
              'token': {
                value: '#conflict',
                type: 'color'
              }
            }
          }
        }
      }
      
      const result = await importer.importTheme(conflictingData)
      
      // Should succeed but report conflicts
      expect(result.success).toBe(true)
      expect(result.conflicts).toBeDefined()
    })

    it('should handle conflict resolution - skip', async () => {
      const conflictingData = {
        ...sampleJsonData,
        tokens: {
          primitive: {
            existing: {
              'token': {
                value: '#conflict',
                type: 'color'
              }
            }
          }
        }
      }
      
      const result = await importer.importTheme(conflictingData, {
        conflictResolution: 'skip'
      })
      
      expect(result.success).toBe(true)
      // The conflicting token should have been skipped
      const existingToken = registry.getToken('existing_token')
      expect(existingToken?.value).toBe('#existing') // Original value preserved
    })

    it('should handle conflict resolution - replace', async () => {
      const conflictingData = {
        ...sampleJsonData,
        tokens: {
          primitive: {
            existing: {
              'token': {
                value: '#replaced',
                type: 'color'
              }
            }
          }
        }
      }
      
      const result = await importer.importTheme(conflictingData, {
        conflictResolution: 'replace'
      })
      
      expect(result.success).toBe(true)
    })

    it('should import from JSON file', async () => {
      const jsonFile = new File([JSON.stringify(sampleJsonData)], 'theme.json', {
        type: 'application/json'
      })
      
      const result = await importer.importTheme(jsonFile)
      
      expect(result.success).toBe(true)
      expect(result.preset!.name).toBe('Imported Test Theme')
    })

    it('should import from package ZIP', async () => {
      global.mockZipType = 'package'
      
      const zipFile = new File(['mock zip content'], 'theme.zip', {
        type: 'application/zip'
      })
      
      const result = await importer.importTheme(zipFile)
      
      expect(result.success).toBe(true)
      expect(result.preset!.name).toBe('test-theme-package')
    })

    it('should import from PrimeVue ZIP', async () => {
      global.mockZipType = 'primevue'
      
      const zipFile = new File(['mock zip content'], 'theme.zip', {
        type: 'application/zip'
      })
      
      const result = await importer.importTheme(zipFile)
      
      expect(result.success).toBe(true)
      expect(result.preset!.name).toBe('Test Theme')
    })
  })

  describe('Token Processing', () => {
    it('should correctly count tokens in shareable format', async () => {
      const importer = new ThemeImporter()
      const count = (importer as any).countTokensInShareable(sampleJsonData)
      
      expect(count).toBe(4) // blue.500, 500, background, padding.x
    })

    it('should parse shareable tokens correctly', async () => {
      const importer = new ThemeImporter()
      const tokens: DesignToken[] = []
      
      ;(importer as any).parseShareableTokens(sampleJsonData.tokens, tokens)
      
      expect(tokens.length).toBeGreaterThan(0)
      expect(tokens.some(t => t.type === 'color')).toBe(true)
      expect(tokens.some(t => t.type === 'spacing')).toBe(true)
      expect(tokens.some(t => t.category === 'primitive')).toBe(true)
      expect(tokens.some(t => t.category === 'component')).toBe(true)
    })

    it('should infer token types correctly', async () => {
      const importer = new ThemeImporter()
      
      expect((importer as any).inferTokenType('color', '#ff0000')).toBe('color')
      expect((importer as any).inferTokenType('background', '#ff0000')).toBe('color')
      expect((importer as any).inferTokenType('padding', '1rem')).toBe('spacing')
      expect((importer as any).inferTokenType('width', '100px')).toBe('size')
      expect((importer as any).inferTokenType('radius', '4px')).toBe('borderRadius')
      expect((importer as any).inferTokenType('shadow', '0 2px 4px rgba(0,0,0,0.1)')).toBe('shadow')
      expect((importer as any).inferTokenType('font', 'Arial')).toBe('typography')
    })

    it('should humanize token names', async () => {
      const importer = new ThemeImporter()
      
      expect((importer as any).humanizeTokenName('primary_color')).toBe('Primary Color')
      expect((importer as any).humanizeTokenName('button-background')).toBe('Button Background')
      expect((importer as any).humanizeTokenName('fontSize')).toBe('FontSize')
    })

    it('should determine token categories', async () => {
      const importer = new ThemeImporter()
      
      expect((importer as any).determineTokenCategory('primitive.blue.500')).toBe('primitive')
      expect((importer as any).determineTokenCategory('semantic.primary.500')).toBe('semantic')
      expect((importer as any).determineTokenCategory('button.background')).toBe('component')
      expect((importer as any).determineTokenCategory('custom.token')).toBe('component') // Default for paths with dots
    })

    it('should determine token subcategories', async () => {
      const importer = new ThemeImporter()
      
      expect((importer as any).determineTokenSubcategory('primitive.colors.blue')).toBe('colors')
      expect((importer as any).determineTokenSubcategory('semantic.primary.500')).toBe('primary')
      expect((importer as any).determineTokenSubcategory('button.background')).toBe('button')
      expect((importer as any).determineTokenSubcategory('simple')).toBeUndefined()
    })
  })

  describe('Error Handling', () => {
    it('should handle import errors gracefully', async () => {
      const invalidData = null
      const result = await importer.importTheme(invalidData as any)
      
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors!.length).toBeGreaterThan(0)
    })

    it('should handle malformed ZIP files', async () => {
      // Mock JSZip to throw an error
      vi.doMock('jszip', () => ({
        default: {
          loadAsync: () => Promise.reject(new Error('Invalid ZIP'))
        }
      }))
      
      const zipFile = new File(['invalid zip'], 'theme.zip', { type: 'application/zip' })
      const result = await importer.importTheme(zipFile)
      
      expect(result.success).toBe(false)
      expect(result.errors).toContain('Import failed')
    })

    it('should handle theme.js parsing errors', async () => {
      global.mockZipType = 'primevue'
      
      // Mock theme.js with invalid JavaScript
      vi.doMock('jszip', () => ({
        default: class {
          static async loadAsync() {
            return {
              file: () => ({
                async: () => Promise.resolve('invalid javascript {{{')
              })
            }
          }
        }
      }))
      
      const zipFile = new File(['mock content'], 'theme.zip', { type: 'application/zip' })
      const result = await importer.importTheme(zipFile)
      
      // Should still succeed but with fewer tokens
      expect(result.success).toBe(true)
    })
  })

  describe('Format Detection', () => {
    it('should detect shareable format', async () => {
      const importer = new ThemeImporter()
      
      expect((importer as any).isShareableFormat(sampleJsonData)).toBe(true)
      expect((importer as any).isShareableFormat({ name: 'test' })).toBe(false) // Missing tokens
      expect((importer as any).isShareableFormat(null)).toBe(false)
      expect((importer as any).isShareableFormat('string')).toBe(false)
    })
  })
})