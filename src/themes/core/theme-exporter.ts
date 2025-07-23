/**
 * Theme Export System
 * 
 * Supports multiple export formats:
 * - PrimeVue Format: Component-based file structure
 * - Package Format: NPM-installable package
 * - Shareable Format: Single JSON file
 */

import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import type { 
  ThemePreset, 
  DesignToken, 
  ExportFormat,
  ExportOptions,
  ExportResult 
} from '@/themes/presets/preset.types'
import { TokenRegistry } from './token-registry'

export interface ThemeExportData {
  preset: ThemePreset
  tokens: DesignToken[]
  metadata: ExportMetadata
}

export interface ExportMetadata {
  exportedAt: string
  exportedBy: string
  version: string
  format: ExportFormat
  description?: string
  tags?: string[]
}

export interface PrimeVueExportOptions {
  includeTypeDefinitions?: boolean
  includeDocumentation?: boolean
  componentSeparation?: boolean
  minified?: boolean
}

export interface PackageExportOptions {
  packageName: string
  version?: string
  description?: string
  author?: string
  license?: string
  includeExample?: boolean
  includeTests?: boolean
}

export interface ShareableExportOptions {
  includeMetadata?: boolean
  includeHistory?: boolean
  compressed?: boolean
}

export class ThemeExporter {
  private registry: TokenRegistry

  constructor() {
    this.registry = TokenRegistry.getInstance()
  }

  /**
   * Export theme in specified format
   */
  async exportTheme(
    preset: ThemePreset,
    format: ExportFormat,
    options: ExportOptions = {}
  ): Promise<ExportResult> {
    try {
      const exportData = this.prepareExportData(preset, format)
      
      switch (format) {
        case 'primevue':
          return await this.exportPrimeVueFormat(exportData, options.primevue)
        case 'package':
          if (!options.package) {
            throw new Error('Package options are required for package format')
          }
          return await this.exportPackageFormat(exportData, options.package)
        case 'shareable':
          return await this.exportShareableFormat(exportData, options.shareable)
        default:
          throw new Error(`Unsupported export format: ${format}`)
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Export failed',
        format,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Prepare export data from preset
   */
  private prepareExportData(
    preset: ThemePreset,
    format: ExportFormat
  ): ThemeExportData {
    // Get all tokens for this preset
    const tokens: DesignToken[] = []
    
    // Add tokens from registry that belong to this preset
    const allTokens = Array.from(this.registry.getAllTokens().values())
    allTokens.forEach(token => {
      if (this.isTokenInPreset(token, preset)) {
        tokens.push(token)
      }
    })

    const metadata: ExportMetadata = {
      exportedAt: new Date().toISOString(),
      exportedBy: 'Triton Theme System',
      version: '1.0.0',
      format,
      description: preset.description,
      tags: preset.tags || []
    }

    return {
      preset,
      tokens,
      metadata
    }
  }

  /**
   * Check if token belongs to preset
   */
  private isTokenInPreset(token: DesignToken, preset: ThemePreset): boolean {
    // Check if token ID exists in preset's token definitions
    if (preset.tokens && (preset.tokens as Record<string, any>)[token.id]) {
      return true
    }

    // Check color overrides (legacy support)
    if (preset.overrides) {
      const colorKey = token.id.replace(/\./g, '_')
      return Object.keys(preset.overrides).includes(colorKey)
    }

    return false
  }

  /**
   * Export in PrimeVue component-based format
   */
  private async exportPrimeVueFormat(
    data: ThemeExportData,
    options: PrimeVueExportOptions = {}
  ): Promise<ExportResult> {
    const zip = new JSZip()

    // Generate main theme file
    const themeContent = this.generatePrimeVueTheme(data, options)
    zip.file('theme.js', themeContent)

    // Generate component files if requested
    if (options.componentSeparation) {
      const componentFiles = this.generateComponentFiles(data)
      Object.entries(componentFiles).forEach(([filename, content]) => {
        zip.file(`components/${filename}`, content)
      })
    }

    // Generate TypeScript definitions
    if (options.includeTypeDefinitions) {
      const typeDefs = this.generateTypeDefinitions(data)
      zip.file('theme.d.ts', typeDefs)
    }

    // Generate documentation
    if (options.includeDocumentation) {
      const readme = this.generateReadme(data, 'primevue')
      zip.file('README.md', readme)
      
      const tokenDocs = this.generateTokenDocumentation(data)
      zip.file('TOKENS.md', tokenDocs)
    }

    // Generate and download zip
    const blob = await zip.generateAsync({ type: 'blob' })
    const filename = `${data.preset.name}-primevue-theme.zip`
    saveAs(blob, filename)

    return {
      success: true,
      format: 'primevue',
      filename,
      size: blob.size,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Export as NPM package
   */
  private async exportPackageFormat(
    data: ThemeExportData,
    options: PackageExportOptions
  ): Promise<ExportResult> {
    if (!options.packageName) {
      throw new Error('Package name is required for package format')
    }

    const zip = new JSZip()

    // Generate package.json
    const packageJson = this.generatePackageJson(data, options)
    zip.file('package.json', JSON.stringify(packageJson, null, 2))

    // Generate main theme files
    const themeContent = this.generatePrimeVueTheme(data)
    zip.file('src/theme.js', themeContent)
    zip.file('dist/theme.js', themeContent)

    // Generate index file
    const indexContent = this.generatePackageIndex(data)
    zip.file('index.js', indexContent)
    zip.file('src/index.js', indexContent)

    // Generate TypeScript definitions
    const typeDefs = this.generateTypeDefinitions(data)
    zip.file('index.d.ts', typeDefs)
    zip.file('dist/theme.d.ts', typeDefs)

    // Generate README
    const readme = this.generateReadme(data, 'package', options)
    zip.file('README.md', readme)

    // Generate example if requested
    if (options.includeExample) {
      const example = this.generatePackageExample(data)
      zip.file('example/index.html', example.html)
      zip.file('example/main.js', example.js)
    }

    // Generate tests if requested
    if (options.includeTests) {
      const tests = this.generatePackageTests(data)
      zip.file('test/theme.test.js', tests)
    }

    // Generate and download zip
    const blob = await zip.generateAsync({ type: 'blob' })
    const filename = `${options.packageName}-v${options.version || '1.0.0'}.zip`
    saveAs(blob, filename)

    return {
      success: true,
      format: 'package',
      filename,
      size: blob.size,
      timestamp: new Date().toISOString(),
      packageName: options.packageName,
      version: options.version || '1.0.0'
    }
  }

  /**
   * Export as shareable JSON
   */
  private async exportShareableFormat(
    data: ThemeExportData,
    options: ShareableExportOptions = {}
  ): Promise<ExportResult> {
    const shareableData: any = {
      name: data.preset.name,
      description: data.preset.description,
      version: '1.0.0',
      tokens: {}
    }

    // Include metadata if requested
    if (options.includeMetadata) {
      shareableData.metadata = data.metadata
      shareableData.preset = {
        ...data.preset,
        // Remove sensitive or unnecessary data
        id: undefined,
        isDefault: undefined,
        isBuiltIn: undefined
      }
    }

    // Organize tokens by category and component
    data.tokens.forEach(token => {
      const category = token.category || 'custom'
      const subcategory = token.subcategory || 'general'
      
      if (!shareableData.tokens[category]) {
        shareableData.tokens[category] = {}
      }
      
      if (!shareableData.tokens[category][subcategory]) {
        shareableData.tokens[category][subcategory] = {}
      }
      
      shareableData.tokens[category][subcategory][token.path] = {
        value: token.value,
        type: token.type,
        description: token.description,
        ...(token.validation && { validation: token.validation })
      }
    })

    // Convert to JSON
    const jsonContent = JSON.stringify(
      shareableData, 
      null, 
      options.compressed ? 0 : 2
    )

    // Create blob and download
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const filename = `${data.preset.name}-theme.json`
    saveAs(blob, filename)

    return {
      success: true,
      format: 'shareable',
      filename,
      size: blob.size,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Generate PrimeVue theme content
   */
  private generatePrimeVueTheme(
    data: ThemeExportData,
    options: PrimeVueExportOptions = {}
  ): string {
    const { preset, tokens } = data
    
    // Group tokens by component
    const tokensByComponent: Record<string, DesignToken[]> = {}
    tokens.forEach(token => {
      const component = token.subcategory || 'base'
      if (!tokensByComponent[component]) {
        tokensByComponent[component] = []
      }
      tokensByComponent[component].push(token)
    })

    let themeContent = `/**
 * ${preset.name} Theme
 * Generated by Triton Theme System
 * ${data.metadata.exportedAt}
 */

export default {
  primitive: {
`

    // Add primitive tokens
    const primitiveTokens = tokens.filter(t => t.category === 'primitive')
    primitiveTokens.forEach(token => {
      const path = token.path.split('.')
      themeContent += `    ${path.join('.')}: '${token.value}',\n`
    })

    themeContent += `  },
  semantic: {
`

    // Add semantic tokens
    const semanticTokens = tokens.filter(t => t.category === 'semantic')
    semanticTokens.forEach(token => {
      const path = token.path.split('.')
      themeContent += `    ${path.join('.')}: '${token.value}',\n`
    })

    themeContent += `  },
  components: {
`

    // Add component tokens
    Object.entries(tokensByComponent).forEach(([component, componentTokens]) => {
      if (component === 'base' || component === 'primitive' || component === 'semantic') return
      
      themeContent += `    ${component}: {\n`
      componentTokens.forEach(token => {
        if (token.category === 'component') {
          const path = token.path.split('.')
          themeContent += `      ${path.slice(1).join('.')}: '${token.value}',\n`
        }
      })
      themeContent += `    },\n`
    })

    themeContent += `  }
}`

    return themeContent
  }

  /**
   * Generate component-specific files
   */
  private generateComponentFiles(data: ThemeExportData): Record<string, string> {
    const files: Record<string, string> = {}
    const componentGroups: Record<string, DesignToken[]> = {}

    // Group tokens by component
    data.tokens.forEach(token => {
      if (token.category === 'component') {
        const component = token.subcategory || 'base'
        if (!componentGroups[component]) {
          componentGroups[component] = []
        }
        componentGroups[component].push(token)
      }
    })

    // Generate file for each component
    Object.entries(componentGroups).forEach(([component, tokens]) => {
      let content = `/**
 * ${component} Component Theme
 * Part of ${data.preset.name}
 */

export default {
`
      
      tokens.forEach(token => {
        const path = token.path.split('.').slice(1) // Remove component name
        content += `  ${path.join('.')}: '${token.value}',\n`
      })

      content += `}`
      
      files[`${component}.js`] = content
    })

    return files
  }

  /**
   * Generate TypeScript definitions
   */
  private generateTypeDefinitions(data: ThemeExportData): string {
    return `/**
 * ${data.preset.name} Theme Types
 * Generated by Triton Theme System
 */

export interface ThemeTokens {
  primitive: {
    [key: string]: string
  }
  semantic: {
    [key: string]: string
  }
  components: {
    [componentName: string]: {
      [tokenName: string]: string
    }
  }
}

declare const theme: ThemeTokens
export default theme
`
  }

  /**
   * Generate package.json for NPM package
   */
  private generatePackageJson(
    data: ThemeExportData,
    options: PackageExportOptions
  ): any {
    return {
      name: options.packageName,
      version: options.version || '1.0.0',
      description: options.description || `${data.preset.name} theme for PrimeVue`,
      main: 'index.js',
      types: 'index.d.ts',
      files: [
        'dist/',
        'src/',
        'index.js',
        'index.d.ts',
        'README.md'
      ],
      keywords: [
        'primevue',
        'theme',
        'css',
        'vue',
        'design-tokens',
        data.preset.name.toLowerCase()
      ],
      author: options.author || 'Generated by Triton Theme System',
      license: options.license || 'MIT',
      peerDependencies: {
        'primevue': '^4.0.0',
        'vue': '^3.0.0'
      },
      repository: {
        type: 'git',
        url: 'https://github.com/your-org/your-repo.git'
      },
      bugs: {
        url: 'https://github.com/your-org/your-repo/issues'
      },
      homepage: 'https://github.com/your-org/your-repo#readme'
    }
  }

  /**
   * Generate package index file
   */
  private generatePackageIndex(data: ThemeExportData): string {
    return `/**
 * ${data.preset.name} Theme Package
 * Generated by Triton Theme System
 */

import theme from './src/theme.js'

export default theme
export { theme }

// Named exports for individual components
${data.tokens
  .filter(t => t.category === 'component')
  .map(t => t.subcategory)
  .filter((value, index, self) => self.indexOf(value) === index)
  .map(component => `export { default as ${component} } from './src/components/${component}.js'`)
  .join('\n')}
`
  }

  /**
   * Generate README documentation
   */
  private generateReadme(
    data: ThemeExportData,
    format: ExportFormat,
    options?: any
  ): string {
    const { preset } = data
    
    let readme = `# ${preset.name}

${preset.description || 'A custom theme for PrimeVue applications.'}

Generated by Triton Theme System on ${data.metadata.exportedAt}

## Installation

`

    if (format === 'package') {
      readme += `\`\`\`bash
npm install ${options?.packageName}
\`\`\`

## Usage

\`\`\`javascript
import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import theme from '${options?.packageName}'

const app = createApp(App)
app.use(PrimeVue, {
    theme: {
        preset: theme
    }
})
\`\`\`
`
    } else {
      readme += `1. Extract the theme files to your project
2. Import the theme in your application:

\`\`\`javascript
import theme from './path/to/theme.js'
import PrimeVue from 'primevue/config'

app.use(PrimeVue, {
    theme: {
        preset: theme
    }
})
\`\`\`
`
    }

    readme += `
## Theme Tokens

This theme includes ${data.tokens.length} design tokens organized into:

- **Primitive tokens**: Base color, size, and spacing values
- **Semantic tokens**: Contextual tokens like primary, secondary colors
- **Component tokens**: Component-specific styling tokens

## Customization

You can override any token value by modifying the theme object before applying it to PrimeVue.

## Support

Generated with Triton Theme System - Advanced Theme Configuration Tool
`

    return readme
  }

  /**
   * Generate token documentation
   */
  private generateTokenDocumentation(data: ThemeExportData): string {
    let docs = `# Token Documentation

## ${data.preset.name} Theme Tokens

Total tokens: ${data.tokens.length}

`

    // Group tokens by category
    const categories = ['primitive', 'semantic', 'component', 'custom']
    
    categories.forEach(category => {
      const categoryTokens = data.tokens.filter(t => t.category === category)
      if (categoryTokens.length === 0) return

      docs += `## ${category.charAt(0).toUpperCase() + category.slice(1)} Tokens (${categoryTokens.length})\n\n`
      
      categoryTokens.forEach(token => {
        docs += `### ${token.label}\n`
        docs += `- **Path**: \`${token.path}\`\n`
        docs += `- **Type**: ${token.type}\n`
        docs += `- **Value**: \`${token.value}\`\n`
        if (token.description) {
          docs += `- **Description**: ${token.description}\n`
        }
        if (token.affects && token.affects.length > 0) {
          docs += `- **Affects**: ${token.affects.join(', ')}\n`
        }
        docs += '\n'
      })
    })

    return docs
  }

  /**
   * Generate package example
   */
  private generatePackageExample(data: ThemeExportData): { html: string; js: string } {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.preset.name} Theme Example</title>
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    <script src="https://unpkg.com/primevue@4/dist/primevue.min.js"></script>
    <link rel="stylesheet" href="https://unpkg.com/primevue@4/resources/themes/aura-light-green/theme.css">
</head>
<body>
    <div id="app">
        <h1>${data.preset.name} Theme Demo</h1>
        <p-button label="Primary Button" class="p-mr-2"></p-button>
        <p-button label="Secondary" severity="secondary" class="p-mr-2"></p-button>
        <p-input-text placeholder="Input field" class="p-mr-2"></p-input-text>
    </div>
    <script src="main.js"></script>
</body>
</html>`

    const js = `const { createApp } = Vue
const app = createApp({})

// Register PrimeVue components
app.component('p-button', primevue.button)
app.component('p-input-text', primevue.inputtext)

app.mount('#app')`

    return { html, js }
  }

  /**
   * Generate package tests
   */
  private generatePackageTests(data: ThemeExportData): string {
    return `/**
 * ${data.preset.name} Theme Tests
 */

const assert = require('assert')
const theme = require('../index.js')

describe('${data.preset.name} Theme', () => {
  it('should export theme object', () => {
    assert(typeof theme === 'object')
    assert(theme.primitive)
    assert(theme.semantic)
    assert(theme.components)
  })

  it('should have primitive tokens', () => {
    assert(Object.keys(theme.primitive).length > 0)
  })

  it('should have semantic tokens', () => {
    assert(Object.keys(theme.semantic).length > 0)
  })

  it('should have component tokens', () => {
    assert(Object.keys(theme.components).length > 0)
  })
})
`
  }
}

// Export singleton instance
export const themeExporter = new ThemeExporter()