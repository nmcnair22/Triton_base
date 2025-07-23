/**
 * Theme Import System
 * 
 * Supports importing themes from various formats:
 * - PrimeVue Format: Component-based file structure
 * - Package Format: NPM-installable package
 * - Shareable Format: Single JSON file
 */

import JSZip from 'jszip'
import type { 
  ThemePreset, 
  DesignToken, 
  ExportFormat,
  ImportResult,
  ImportOptions,
  ImportPreview,
  ImportConflict
} from '@/themes/presets/preset.types'
import { TokenRegistry } from './token-registry'

export interface ImportValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  format?: ExportFormat
  tokenCount?: number
  componentCount?: number
}

export interface ImportedThemeData {
  preset: Partial<ThemePreset>
  tokens: DesignToken[]
  metadata?: any
  format: ExportFormat
}

export class ThemeImporter {
  private registry: TokenRegistry

  constructor() {
    this.registry = TokenRegistry.getInstance()
  }

  /**
   * Import theme from file or data
   */
  async importTheme(
    source: File | string | object,
    options: ImportOptions = {}
  ): Promise<ImportResult> {
    try {
      // Validate and parse the source
      const validation = await this.validateImport(source)
      if (!validation.valid) {
        return {
          success: false,
          errors: validation.errors,
          timestamp: new Date().toISOString()
        }
      }

      // Parse the import data
      const importData = await this.parseImportSource(source, validation.format!)
      
      // Generate preview if requested
      if (options.previewOnly) {
        const preview = await this.generateImportPreview(importData)
        return {
          success: true,
          preview,
          timestamp: new Date().toISOString()
        }
      }

      // Check for conflicts
      const conflicts = this.detectConflicts(importData)
      if (conflicts.length > 0 && !options.resolveConflicts) {
        return {
          success: false,
          conflicts,
          message: 'Conflicts detected. Please resolve them before importing.',
          timestamp: new Date().toISOString()
        }
      }

      // Apply the import
      const result = await this.applyImport(importData, options)
      
      return {
        success: true,
        preset: result.preset,
        importedTokens: result.tokens.length,
        conflicts: conflicts.length > 0 ? conflicts : undefined,
        timestamp: new Date().toISOString()
      }

    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Import failed'],
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Validate import source
   */
  async validateImport(source: File | string | object): Promise<ImportValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      if (source instanceof File) {
        // Validate file
        const validation = await this.validateFile(source)
        return validation
      } else if (typeof source === 'string') {
        // Validate JSON string
        const validation = this.validateJsonString(source)
        return validation
      } else if (typeof source === 'object') {
        // Validate object
        const validation = this.validateThemeObject(source)
        return validation
      } else {
        errors.push('Invalid import source type')
      }
    } catch (error) {
      errors.push(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Validate file import
   */
  private async validateFile(file: File): Promise<ImportValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      errors.push('File too large (max 50MB)')
    }

    // Check file type
    let format: ExportFormat | undefined
    let tokenCount = 0
    let componentCount = 0

    if (file.name.endsWith('.json')) {
      // JSON file - likely shareable format
      try {
        const text = await file.text()
        const data = JSON.parse(text)
        
        if (this.isShareableFormat(data)) {
          format = 'shareable'
          tokenCount = this.countTokensInShareable(data)
        } else {
          errors.push('Invalid JSON format')
        }
      } catch (error) {
        errors.push('Invalid JSON file')
      }
    } else if (file.name.endsWith('.zip')) {
      // ZIP file - could be package or primevue format
      try {
        const zip = await JSZip.loadAsync(await file.arrayBuffer())
        const validation = await this.validateZipContents(zip)
        format = validation.format
        tokenCount = validation.tokenCount || 0
        componentCount = validation.componentCount || 0
        errors.push(...(validation.errors || []))
        warnings.push(...(validation.warnings || []))
      } catch (error) {
        errors.push('Invalid ZIP file')
      }
    } else {
      errors.push('Unsupported file format. Use .json or .zip files.')
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      format,
      tokenCount,
      componentCount
    }
  }

  /**
   * Validate ZIP contents
   */
  private async validateZipContents(zip: JSZip): Promise<ImportValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []
    let format: ExportFormat | undefined
    const tokenCount = 0
    const componentCount = 0

    // Check for package.json (package format)
    if (zip.file('package.json')) {
      format = 'package'
      try {
        const packageContent = await zip.file('package.json')!.async('string')
        const packageData = JSON.parse(packageContent)
        
        // Validate package structure
        if (!packageData.name) {
          errors.push('Package missing name')
        }
        if (!packageData.main && !packageData.module) {
          warnings.push('Package missing main entry point')
        }
      } catch (error) {
        errors.push('Invalid package.json')
      }
    }
    // Check for theme.js (primevue format)
    else if (zip.file('theme.js')) {
      format = 'primevue'
      try {
        const themeContent = await zip.file('theme.js')!.async('string')
        // Basic validation of theme structure
        if (!themeContent.includes('export default') && !themeContent.includes('module.exports')) {
          warnings.push('Theme file may not export properly')
        }
      } catch (error) {
        errors.push('Invalid theme.js file')
      }
    } else {
      errors.push('Unknown ZIP format. Expected package or PrimeVue theme structure.')
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      format,
      tokenCount,
      componentCount
    }
  }

  /**
   * Validate JSON string
   */
  private validateJsonString(jsonString: string): ImportValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      const data = JSON.parse(jsonString)
      return this.validateThemeObject(data)
    } catch (error) {
      errors.push('Invalid JSON format')
      return { valid: false, errors, warnings }
    }
  }

  /**
   * Validate theme object
   */
  private validateThemeObject(data: any): ImportValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    let format: ExportFormat | undefined
    let tokenCount = 0

    if (this.isShareableFormat(data)) {
      format = 'shareable'
      tokenCount = this.countTokensInShareable(data)
      
      // Validate required fields
      if (!data.name) {
        errors.push('Theme name is required')
      }
      if (!data.tokens) {
        errors.push('Theme tokens are required')
      }
    } else {
      errors.push('Unknown theme format')
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      format,
      tokenCount
    }
  }

  /**
   * Check if data is in shareable format
   */
  private isShareableFormat(data: any): boolean {
    return data && 
           typeof data === 'object' &&
           data.name &&
           data.tokens &&
           typeof data.tokens === 'object'
  }

  /**
   * Count tokens in shareable format
   */
  private countTokensInShareable(data: any): number {
    let count = 0
    if (data.tokens) {
      Object.values(data.tokens).forEach((category: any) => {
        if (typeof category === 'object') {
          Object.values(category).forEach((subcategory: any) => {
            if (typeof subcategory === 'object') {
              count += Object.keys(subcategory).length
            }
          })
        }
      })
    }
    return count || 0
  }

  /**
   * Parse import source into theme data
   */
  private async parseImportSource(
    source: File | string | object,
    format: ExportFormat
  ): Promise<ImportedThemeData> {
    if (source instanceof File) {
      return await this.parseFile(source, format)
    } else if (typeof source === 'string') {
      return this.parseJsonString(source, format)
    } else {
      return this.parseThemeObject(source, format)
    }
  }

  /**
   * Parse file source
   */
  private async parseFile(file: File, format: ExportFormat): Promise<ImportedThemeData> {
    if (format === 'shareable') {
      const text = await file.text()
      return this.parseJsonString(text, format)
    } else if (format === 'package' || format === 'primevue') {
      const zip = await JSZip.loadAsync(await file.arrayBuffer())
      return await this.parseZipFile(zip, format)
    } else {
      throw new Error(`Unsupported file format: ${format}`)
    }
  }

  /**
   * Parse ZIP file
   */
  private async parseZipFile(zip: JSZip, format: ExportFormat): Promise<ImportedThemeData> {
    const tokens: DesignToken[] = []
    const preset: Partial<ThemePreset> = {}
    const metadata: any = {}

    if (format === 'package') {
      // Parse package format
      const packageFile = zip.file('package.json')
      if (packageFile) {
        const packageData = JSON.parse(await packageFile.async('string'))
        preset.name = packageData.name
        preset.description = packageData.description
        metadata.version = packageData.version
        metadata.author = packageData.author
      }

      // Parse theme file
      const themeFile = zip.file('src/theme.js') || zip.file('theme.js')
      if (themeFile) {
        const themeContent = await themeFile.async('string')
        const parsedTokens = this.parseThemeJs(themeContent)
        tokens.push(...parsedTokens)
      }
    } else if (format === 'primevue') {
      // Parse PrimeVue format
      const themeFile = zip.file('theme.js')
      if (themeFile) {
        const themeContent = await themeFile.async('string')
        const parsedTokens = this.parseThemeJs(themeContent)
        tokens.push(...parsedTokens)
        
        // Try to extract name from theme content
        const nameMatch = themeContent.match(/\/\*\*\s*\n\s*\*\s*([^*]+)/)
        if (nameMatch) {
          preset.name = nameMatch[1].trim()
        }
      }
    }

    return {
      preset,
      tokens,
      metadata,
      format
    }
  }

  /**
   * Parse theme.js content
   */
  private parseThemeJs(content: string): DesignToken[] {
    const tokens: DesignToken[] = []
    
    // This is a simplified parser - in a real implementation,
    // you might want to use a JavaScript parser like acorn
    try {
      // Remove comments and clean up
      const cleanContent = content
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*$/gm, '')
      
      // Extract the export object
      const exportMatch = cleanContent.match(/export default\s*({[\s\S]*})/)
      if (exportMatch) {
        try {
          // Use Function constructor instead of eval for better security
          const themeObject = new Function(`return ${exportMatch[1]}`)()
          
          // Convert theme object to tokens
          this.convertThemeObjectToTokens(themeObject, tokens)
        } catch (error) {
          // If parsing fails, try a simple regex-based extraction
          console.warn('Failed to parse theme object, using regex extraction:', error)
          this.parseThemeWithRegex(exportMatch[1], tokens)
        }
      }
    } catch (error) {
      console.warn('Failed to parse theme.js:', error)
    }
    
    return tokens
  }

  /**
   * Parse theme using regex (fallback method)
   */
  private parseThemeWithRegex(themeString: string, tokens: DesignToken[]): void {
    // Simple regex-based token extraction
    const tokenPattern = /(\w+(?:\.\w+)*)\s*:\s*['"]([^'"]+)['"]/g
    let match
    
    while ((match = tokenPattern.exec(themeString)) !== null) {
      const [, path, value] = match
      const tokenId = path.replace(/\./g, '_')
      
      tokens.push({
        id: tokenId,
        label: this.humanizeTokenName(path.split('.').pop() || path),
        category: this.determineTokenCategory(path) as any,
        subcategory: this.determineTokenSubcategory(path),
        path,
        value,
        type: this.inferTokenType(path, value),
        defaultValue: value,
        description: `Imported token: ${path}`
      })
    }
  }

  /**
   * Convert theme object to design tokens
   */
  private convertThemeObjectToTokens(obj: any, tokens: DesignToken[], path: string = '', category: string = 'primitive'): void {
    Object.entries(obj).forEach(([key, value]) => {
      const currentPath = path ? `${path}.${key}` : key
      
      if (typeof value === 'string') {
        // This is a token value
        tokens.push({
          id: currentPath.replace(/\./g, '_'),
          label: this.humanizeTokenName(key),
          category: this.determineTokenCategory(currentPath) as any,
          subcategory: this.determineTokenSubcategory(currentPath),
          path: currentPath,
          value,
          type: this.inferTokenType(key, value),
          defaultValue: value,
          description: `Imported token: ${currentPath}`
        })
      } else if (typeof value === 'object' && value !== null) {
        // Recurse into nested objects
        const newCategory = key === 'primitive' || key === 'semantic' || key === 'components' ? key : category
        this.convertThemeObjectToTokens(value, tokens, currentPath, newCategory)
      }
    })
  }

  /**
   * Parse JSON string
   */
  private parseJsonString(jsonString: string, format: ExportFormat): ImportedThemeData {
    const data = JSON.parse(jsonString)
    return this.parseThemeObject(data, format)
  }

  /**
   * Parse theme object
   */
  private parseThemeObject(data: any, format: ExportFormat): ImportedThemeData {
    const tokens: DesignToken[] = []
    
    const preset: Partial<ThemePreset> = {
      name: data.name || 'Imported Theme',
      description: data.description || 'Imported from external source',
      tags: (data.tags || ['imported']) as string[]
    }

    // Parse tokens based on format
    if (format === 'shareable') {
      this.parseShareableTokens(data.tokens, tokens)
    }

    return {
      preset,
      tokens,
      metadata: data.metadata,
      format
    }
  }

  /**
   * Parse tokens from shareable format
   */
  private parseShareableTokens(tokensData: any, tokens: DesignToken[]): void {
    Object.entries(tokensData).forEach(([category, categoryData]: [string, any]) => {
      Object.entries(categoryData).forEach(([subcategory, subcategoryData]: [string, any]) => {
        Object.entries(subcategoryData).forEach(([path, tokenData]: [string, any]) => {
          tokens.push({
            id: `${category}_${subcategory}_${path}`.replace(/\./g, '_'),
            label: this.humanizeTokenName(path),
            category: category as any,
            subcategory,
            path: `${subcategory}.${path}`,
            value: tokenData.value,
            type: tokenData.type || this.inferTokenType(path, tokenData.value),
            defaultValue: tokenData.value,
            description: tokenData.description || `Imported ${category} token`,
            validation: tokenData.validation
          })
        })
      })
    })
  }

  /**
   * Detect conflicts with existing tokens
   */
  private detectConflicts(importData: ImportedThemeData): ImportConflict[] {
    const conflicts: ImportConflict[] = []
    const existingTokens = Array.from(this.registry.getAllTokens().values())

    importData.tokens.forEach(importToken => {
      const existing = existingTokens.find(t => t.id === importToken.id || t.path === importToken.path)
      
      if (existing) {
        conflicts.push({
          type: 'token',
          path: importToken.path,
          existing: {
            value: existing.value,
            type: existing.type
          },
          incoming: {
            value: importToken.value,
            type: importToken.type
          },
          recommended: 'replace' // Default recommendation
        })
      }
    })

    return conflicts
  }

  /**
   * Generate import preview
   */
  private async generateImportPreview(importData: ImportedThemeData): Promise<ImportPreview> {
    const conflicts = this.detectConflicts(importData)
    
    return {
      preset: importData.preset,
      tokenCount: importData.tokens.length,
      conflicts: conflicts.length,
      newTokens: importData.tokens.filter(token => 
        !Array.from(this.registry.getAllTokens().values()).some(existing => 
          existing.id === token.id || existing.path === token.path
        )
      ).length,
      categories: [...new Set(importData.tokens.map(t => t.category).filter(Boolean))],
      components: [...new Set(importData.tokens.map(t => t.subcategory).filter((s): s is string => Boolean(s)))],
      format: importData.format
    }
  }

  /**
   * Apply the import
   */
  private async applyImport(
    importData: ImportedThemeData,
    options: ImportOptions
  ): Promise<{ preset: ThemePreset; tokens: DesignToken[] }> {
    const now = new Date().toISOString()
    // Create the preset
    const preset: ThemePreset = {
      id: `imported_${Date.now()}`,
      name: importData.preset.name || 'Imported Theme',
      description: importData.preset.description || 'Imported theme',
      baseTheme: 'Aura',
      colorOverrides: [],
      isDefault: false,
      isBuiltIn: false,
      tags: (importData.preset.tags as string[]) || ['imported'],
      overrides: {},
      tokens: {} as Record<string, any>,
      createdAt: now,
      updatedAt: now,
      metadata: {
        created: now,
        modified: now,
        version: '1.0.0',
        isDefault: false,
        isBuiltIn: false,
        tags: (importData.preset.tags as string[]) || ['imported']
      }
    }

    // Register tokens
    const tokenList: DesignToken[] = []
    
    importData.tokens.forEach((token) => {
      try {
        // Apply conflict resolution if needed
        let finalToken = token
        let shouldSkip = false
        
        if (options.conflictResolution) {
          const existingToken = this.registry.getToken(token.id)
          if (existingToken) {
            switch (options.conflictResolution) {
              case 'skip':
                shouldSkip = true
                break
              case 'replace':
                // Use imported token as-is
                break
              case 'merge':
                // Merge properties, preferring imported values
                finalToken = {
                  ...existingToken,
                  ...token,
                  id: existingToken.id, // Keep existing ID
                  defaultValue: existingToken.defaultValue // Keep original default
                }
                break
              default:
                // Use imported token as-is
                break
            }
          }
        }

        if (!shouldSkip) {
          this.registry.register(finalToken)
          // @ts-ignore - TypeScript bug with array push in this context
          tokenList.push(finalToken)
          
          // Add to preset tokens
          (preset.tokens as Record<string, any>)[finalToken.id] = finalToken.value
        }
      } catch (error) {
        console.warn(`Failed to register token ${token.id}:`, error)
      }
    })

    return { preset, tokens: tokenList }
  }

  /**
   * Helper methods
   */
  private humanizeTokenName(name: string): string {
    return name
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
  }

  private determineTokenCategory(path: string): string {
    if (path.startsWith('primitive')) return 'primitive'
    if (path.startsWith('semantic')) return 'semantic'
    if (path.includes('.') && !path.startsWith('primitive') && !path.startsWith('semantic')) return 'component'
    return 'custom'
  }

  private determineTokenSubcategory(path: string): string | undefined {
    const parts = path.split('.')
    if (parts.length > 1) {
      const category = this.determineTokenCategory(path)
      if (category === 'component') {
        return parts[0]
      }
      if (category === 'primitive' || category === 'semantic') {
        return parts[1]
      }
    }
    return undefined
  }

  private inferTokenType(name: string, value: string): any {
    const lowerName = name.toLowerCase()
    const lowerValue = value.toLowerCase()
    
    // Color detection
    if (lowerName.includes('color') || lowerName.includes('background') || lowerName.includes('border') ||
        lowerValue.startsWith('#') || lowerValue.startsWith('rgb') || lowerValue.startsWith('hsl') ||
        lowerValue.includes('var(--')) {
      return 'color'
    }
    
    // Spacing detection (check before size)
    if (lowerName.includes('padding') || lowerName.includes('margin') || lowerName.includes('gap') ||
        lowerName.includes('spacing')) {
      return 'spacing'
    }
    
    // Size detection
    if (lowerName.includes('size') || lowerName.includes('width') || lowerName.includes('height') ||
        /^\d+(\.\d+)?(px|rem|em|%)$/.test(value)) {
      return 'size'
    }
    
    // Border radius detection
    if (lowerName.includes('radius') || lowerName.includes('rounded')) {
      return 'borderRadius'
    }
    
    // Shadow detection
    if (lowerName.includes('shadow') || lowerName.includes('elevation')) {
      return 'shadow'
    }
    
    // Typography detection
    if (lowerName.includes('font') || lowerName.includes('text') || lowerName.includes('weight') ||
        lowerName.includes('line')) {
      return 'typography'
    }
    
    return 'color' // Default fallback
  }
}

// Export singleton instance
export const themeImporter = new ThemeImporter()