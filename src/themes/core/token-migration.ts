/**
 * Token Migration Utility
 * Helps migrate from legacy ColorToken to new DesignToken system
 */

import type { 
  ColorToken, 
  DesignToken, 
  ThemePreset,
  TokenCategory,
  ColorOverride 
} from '@/themes/presets/preset.types'

export class TokenMigration {
  /**
   * Convert legacy ColorToken to DesignToken
   */
  static colorTokenToDesignToken(colorToken: ColorToken): DesignToken {
    // Map old category to new categories
    const categoryMap: Record<string, TokenCategory> = {
      'brand': 'semantic',
      'status': 'semantic',
      'surface': 'primitive',
      'text': 'semantic',
      'interaction': 'semantic'
    }
    
    const category = categoryMap[colorToken.category] || 'custom'
    
    return {
      id: colorToken.id,
      label: colorToken.label,
      category,
      subcategory: colorToken.category, // Keep original category as subcategory
      path: colorToken.id.replace(/-/g, '.'),
      value: colorToken.defaultValue,
      type: 'color',
      defaultValue: colorToken.defaultValue,
      description: colorToken.description,
      affects: [], // Will be populated by discovery
      dependencies: [],
      metadata: {
        added: new Date().toISOString()
      }
    }
  }
  
  /**
   * Convert array of ColorTokens to DesignTokens
   */
  static migrateColorTokens(colorTokens: ColorToken[]): DesignToken[] {
    return colorTokens.map(token => this.colorTokenToDesignToken(token))
  }
  
  /**
   * Migrate a ThemePreset to include new token structure
   */
  static migrateThemePreset(preset: ThemePreset): ThemePreset {
    // If already has new structure, return as is
    if (preset.tokens) {
      return preset
    }
    
    // Initialize new token structure
    const migratedPreset: ThemePreset = {
      ...preset,
      tokens: {
        primitive: {},
        semantic: {},
        component: {},
        custom: {}
      }
    }
    
    // Convert color overrides to design tokens
    if (preset.colorOverrides) {
      preset.colorOverrides.forEach(override => {
        const designToken = this.colorOverrideToDesignToken(override)
        
        // Place in appropriate category
        switch (designToken.category) {
          case 'primitive':
            migratedPreset.tokens!.primitive[designToken.id] = designToken
            break
          case 'semantic':
            migratedPreset.tokens!.semantic[designToken.id] = designToken
            break
          case 'custom':
            migratedPreset.tokens!.custom[designToken.id] = designToken
            break
        }
      })
    }
    
    return migratedPreset
  }
  
  /**
   * Convert ColorOverride to DesignToken
   */
  static colorOverrideToDesignToken(override: ColorOverride): DesignToken {
    // Determine category based on token ID
    let category: TokenCategory = 'custom'
    let subcategory = ''
    
    if (override.tokenId.includes('primary') || override.tokenId.includes('secondary')) {
      category = 'semantic'
      subcategory = 'brand'
    } else if (override.tokenId.includes('success') || override.tokenId.includes('warning') || 
               override.tokenId.includes('danger') || override.tokenId.includes('info')) {
      category = 'semantic'
      subcategory = 'status'
    } else if (override.tokenId.includes('surface')) {
      category = 'primitive'
      subcategory = 'surface'
    }
    
    return {
      id: override.tokenId,
      label: this.humanizeTokenId(override.tokenId),
      category,
      subcategory,
      path: override.tokenId.replace(/-/g, '.'),
      value: override.value,
      type: 'color',
      defaultValue: override.value,
      affects: [],
      dependencies: []
    }
  }
  
  /**
   * Create a mapping between old and new token IDs
   */
  static createTokenMapping(oldTokens: ColorToken[]): Map<string, string> {
    const mapping = new Map<string, string>()
    
    oldTokens.forEach(token => {
      const newId = token.id.replace(/-/g, '.')
      mapping.set(token.id, newId)
    })
    
    return mapping
  }
  
  /**
   * Validate migration results
   */
  static validateMigration(
    original: ThemePreset, 
    migrated: ThemePreset
  ): { 
    valid: boolean
    errors: string[] 
  } {
    const errors: string[] = []
    
    // Check all color overrides were migrated
    if (original.colorOverrides) {
      const originalCount = original.colorOverrides.length
      const migratedCount = migrated.tokens ? 
        Object.values(migrated.tokens).reduce((sum, category) => 
          sum + Object.keys(category).length, 0
        ) : 0
      
      if (originalCount !== migratedCount) {
        errors.push(`Token count mismatch: ${originalCount} original vs ${migratedCount} migrated`)
      }
    }
    
    // Check metadata preserved
    if (JSON.stringify(original.metadata) !== JSON.stringify(migrated.metadata)) {
      errors.push('Metadata not preserved during migration')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }
  
  /**
   * Helper to humanize token IDs
   */
  private static humanizeTokenId(id: string): string {
    return id
      .split(/[-.]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }
  
  /**
   * Generate migration report
   */
  static generateMigrationReport(
    original: ThemePreset[],
    migrated: ThemePreset[]
  ): {
    totalPresets: number
    successfulMigrations: number
    failedMigrations: number
    tokenCounts: {
      original: number
      migrated: number
    }
    errors: Array<{ presetId: string; errors: string[] }>
  } {
    const report = {
      totalPresets: original.length,
      successfulMigrations: 0,
      failedMigrations: 0,
      tokenCounts: {
        original: 0,
        migrated: 0
      },
      errors: [] as Array<{ presetId: string; errors: string[] }>
    }
    
    original.forEach((preset, index) => {
      const migratedPreset = migrated[index]
      const validation = this.validateMigration(preset, migratedPreset)
      
      if (validation.valid) {
        report.successfulMigrations++
      } else {
        report.failedMigrations++
        report.errors.push({
          presetId: preset.id,
          errors: validation.errors
        })
      }
      
      // Count tokens
      report.tokenCounts.original += preset.colorOverrides?.length || 0
      if (migratedPreset.tokens) {
        report.tokenCounts.migrated += Object.values(migratedPreset.tokens)
          .reduce((sum, category) => sum + Object.keys(category).length, 0)
      }
    })
    
    return report
  }
}