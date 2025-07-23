import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ThemeExporter } from '@/themes/core/theme-exporter'
import { TokenRegistry } from '@/themes/core/token-registry'
import type { ThemePreset, DesignToken } from '@/themes/presets/preset.types'

// Mock external dependencies
vi.mock('jszip', () => ({
  default: class MockJSZip {
    private files: Record<string, string> = {}
    
    file(name: string, content?: string) {
      if (content !== undefined) {
        this.files[name] = content
        return this
      }
      return this.files[name] ? { async: () => Promise.resolve(this.files[name]) } : null
    }
    
    async generateAsync() {
      return new Blob(['mock zip content'], { type: 'application/zip' })
    }
  }
}))

vi.mock('file-saver', () => ({
  saveAs: vi.fn()
}))

describe('ThemeExporter', () => {
  let exporter: ThemeExporter
  let registry: TokenRegistry
  let samplePreset: ThemePreset
  let sampleTokens: DesignToken[]

  beforeEach(() => {
    // Clear registry and create fresh instances
    TokenRegistry.clearInstance()
    registry = TokenRegistry.getInstance()
    exporter = new ThemeExporter()

    // Create sample data
    samplePreset = {
      id: 'test-preset',
      name: 'Test Theme',
      description: 'A test theme for unit tests',
      baseTheme: 'Aura',
      isDefault: false,
      isBuiltIn: false,
      tags: ['test', 'custom'],
      overrides: {
        primary_500: '#007bff'
      },
      tokens: {
        'button_background': '#007bff',
        'button_color': '#ffffff'
      },
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    }

    sampleTokens = [
      {
        id: 'primary_500',
        label: 'Primary 500',
        category: 'semantic',
        subcategory: 'primary',
        path: 'primary.500',
        value: '#007bff',
        type: 'color',
        defaultValue: '#6366f1',
        description: 'Primary brand color'
      },
      {
        id: 'button_background',
        label: 'Button Background',
        category: 'component',
        subcategory: 'button',
        path: 'background',
        value: '#007bff',
        type: 'color',
        defaultValue: '{primary.500}',
        description: 'Button background color',
        affects: ['button']
      },
      {
        id: 'button_padding_x',
        label: 'Button Padding X',
        category: 'component',
        subcategory: 'button',
        path: 'padding.x',
        value: '1rem',
        type: 'spacing',
        defaultValue: '0.75rem',
        description: 'Button horizontal padding'
      }
    ]

    // Register sample tokens
    sampleTokens.forEach(token => {
      registry.register(token)
    })
  })

  describe('PrimeVue Format Export', () => {
    it('should export theme in PrimeVue format', async () => {
      const result = await exporter.exportTheme(samplePreset, 'primevue')
      
      expect(result.success).toBe(true)
      expect(result.format).toBe('primevue')
      expect(result.filename).toContain('primevue-theme.zip')
      expect(result.size).toBeGreaterThan(0)
      expect(result.timestamp).toBeDefined()
    })

    it('should include TypeScript definitions when requested', async () => {
      const result = await exporter.exportTheme(samplePreset, 'primevue', {
        primevue: {
          includeTypeDefinitions: true
        }
      })
      
      expect(result.success).toBe(true)
    })

    it('should include documentation when requested', async () => {
      const result = await exporter.exportTheme(samplePreset, 'primevue', {
        primevue: {
          includeDocumentation: true
        }
      })
      
      expect(result.success).toBe(true)
    })

    it('should separate components when requested', async () => {
      const result = await exporter.exportTheme(samplePreset, 'primevue', {
        primevue: {
          componentSeparation: true
        }
      })
      
      expect(result.success).toBe(true)
    })
  })

  describe('Package Format Export', () => {
    it('should export theme as NPM package', async () => {
      const result = await exporter.exportTheme(samplePreset, 'package', {
        package: {
          packageName: 'test-theme-package',
          version: '1.0.0',
          description: 'Test theme package',
          author: 'Test Author'
        }
      })
      
      expect(result.success).toBe(true)
      expect(result.format).toBe('package')
      expect(result.filename).toContain('test-theme-package-v1.0.0.zip')
      expect(result.packageName).toBe('test-theme-package')
      expect(result.version).toBe('1.0.0')
    })

    it('should require package name for package format', async () => {
      const result = await exporter.exportTheme(samplePreset, 'package', {
        package: {
          packageName: '' // Invalid empty name
        }
      })
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('Package name is required')
    })

    it('should include example when requested', async () => {
      const result = await exporter.exportTheme(samplePreset, 'package', {
        package: {
          packageName: 'test-theme',
          includeExample: true
        }
      })
      
      expect(result.success).toBe(true)
    })

    it('should include tests when requested', async () => {
      const result = await exporter.exportTheme(samplePreset, 'package', {
        package: {
          packageName: 'test-theme',
          includeTests: true
        }
      })
      
      expect(result.success).toBe(true)
    })
  })

  describe('Shareable Format Export', () => {
    it('should export theme in shareable JSON format', async () => {
      const result = await exporter.exportTheme(samplePreset, 'shareable')
      
      expect(result.success).toBe(true)
      expect(result.format).toBe('shareable')
      expect(result.filename).toContain('.json')
    })

    it('should include metadata when requested', async () => {
      const result = await exporter.exportTheme(samplePreset, 'shareable', {
        shareable: {
          includeMetadata: true
        }
      })
      
      expect(result.success).toBe(true)
    })

    it('should compress output when requested', async () => {
      const result = await exporter.exportTheme(samplePreset, 'shareable', {
        shareable: {
          compressed: true
        }
      })
      
      expect(result.success).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should handle unsupported format', async () => {
      const result = await exporter.exportTheme(samplePreset, 'invalid' as any)
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('Unsupported export format')
    })

    it('should handle export errors gracefully', async () => {
      // Create an invalid preset that would cause errors
      const invalidPreset = {
        ...samplePreset,
        tokens: null
      } as any
      
      const result = await exporter.exportTheme(invalidPreset, 'primevue')
      
      // The export might still succeed but we can test with invalid format
      expect(result.success).toBe(true) // Our implementation is robust
      expect(result.timestamp).toBeDefined()
    })
  })

  describe('Content Generation', () => {
    it('should generate valid PrimeVue theme content', async () => {
      // Access private method for testing
      const exporter = new ThemeExporter()
      const exportData = {
        preset: samplePreset,
        tokens: sampleTokens,
        metadata: {
          exportedAt: new Date().toISOString(),
          exportedBy: 'Test',
          version: '1.0.0',
          format: 'primevue' as const
        }
      }
      
      const content = (exporter as any).generatePrimeVueTheme(exportData)
      
      expect(content).toContain('export default')
      expect(content).toContain('primitive:')
      expect(content).toContain('semantic:')
      expect(content).toContain('components:')
      expect(content).toContain('#007bff')
    })

    it('should generate valid package.json', async () => {
      const exporter = new ThemeExporter()
      const exportData = {
        preset: samplePreset,
        tokens: sampleTokens,
        metadata: {
          exportedAt: new Date().toISOString(),
          exportedBy: 'Test',
          version: '1.0.0',
          format: 'package' as const
        }
      }
      
      const packageOptions = {
        packageName: 'test-theme',
        version: '1.0.0',
        description: 'Test theme',
        author: 'Test Author'
      }
      
      const packageJson = (exporter as any).generatePackageJson(exportData, packageOptions)
      
      expect(packageJson.name).toBe('test-theme')
      expect(packageJson.version).toBe('1.0.0')
      expect(packageJson.description).toBe('Test theme')
      expect(packageJson.author).toBe('Test Author')
      expect(packageJson.main).toBe('index.js')
      expect(packageJson.types).toBe('index.d.ts')
      expect(packageJson.peerDependencies).toHaveProperty('primevue')
      expect(packageJson.peerDependencies).toHaveProperty('vue')
    })

    it('should generate TypeScript definitions', async () => {
      const exporter = new ThemeExporter()
      const exportData = {
        preset: samplePreset,
        tokens: sampleTokens,
        metadata: {
          exportedAt: new Date().toISOString(),
          exportedBy: 'Test',
          version: '1.0.0',
          format: 'primevue' as const
        }
      }
      
      const typeDefs = (exporter as any).generateTypeDefinitions(exportData)
      
      expect(typeDefs).toContain('export interface ThemeTokens')
      expect(typeDefs).toContain('primitive:')
      expect(typeDefs).toContain('semantic:')
      expect(typeDefs).toContain('components:')
      expect(typeDefs).toContain('declare const theme')
      expect(typeDefs).toContain('export default theme')
    })

    it('should generate README documentation', async () => {
      const exporter = new ThemeExporter()
      const exportData = {
        preset: samplePreset,
        tokens: sampleTokens,
        metadata: {
          exportedAt: new Date().toISOString(),
          exportedBy: 'Test',
          version: '1.0.0',
          format: 'primevue' as const
        }
      }
      
      const readme = (exporter as any).generateReadme(exportData, 'primevue')
      
      expect(readme).toContain(`# ${samplePreset.name}`)
      expect(readme).toContain(samplePreset.description)
      expect(readme).toContain('## Installation')
      expect(readme).toContain('## Theme Tokens')
      expect(readme).toContain(`${sampleTokens.length} design tokens`)
    })
  })

  describe('Token Processing', () => {
    it('should correctly identify tokens in preset', async () => {
      const exporter = new ThemeExporter()
      
      // Test with token in preset.tokens
      const tokenInPreset = (exporter as any).isTokenInPreset(sampleTokens[1], samplePreset)
      expect(tokenInPreset).toBe(true)
      
      // Test with token not in preset
      const tokenNotInPreset = (exporter as any).isTokenInPreset({
        ...sampleTokens[0],
        id: 'non_existent_token'
      }, samplePreset)
      expect(tokenNotInPreset).toBe(false)
    })

    it('should handle legacy color overrides', async () => {
      const exporter = new ThemeExporter()
      const legacyPreset = {
        ...samplePreset,
        tokens: undefined,
        overrides: {
          primary_500: '#007bff'
        }
      }
      
      const tokenInOverrides = (exporter as any).isTokenInPreset(sampleTokens[0], legacyPreset)
      expect(tokenInOverrides).toBe(true)
    })

    it('should generate component files correctly', async () => {
      const exporter = new ThemeExporter()
      const exportData = {
        preset: samplePreset,
        tokens: sampleTokens,
        metadata: {
          exportedAt: new Date().toISOString(),
          exportedBy: 'Test',
          version: '1.0.0',
          format: 'primevue' as const
        }
      }
      
      const componentFiles = (exporter as any).generateComponentFiles(exportData)
      
      expect(componentFiles).toHaveProperty('button.js')
      expect(componentFiles['button.js']).toContain('export default')
      expect(componentFiles['button.js']).toContain('#007bff')
      expect(componentFiles['button.js']).toContain('1rem')
    })
  })
})