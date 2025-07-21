import type { ThemePreset, ColorOverride, ThemeConfig, BaseTheme } from '../presets/preset.types'
import { editableColorTokens, baseThemes } from '../config/theme.config'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export class ThemeValidator {
  /**
   * Validate a complete theme preset
   */
  static validatePreset(preset: unknown): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    }

    // Type guard
    if (!preset || typeof preset !== 'object') {
      result.errors.push('Preset must be an object')
      result.isValid = false
      return result
    }

    const p = preset as Partial<ThemePreset>

    // Required fields
    if (!p.id || typeof p.id !== 'string') {
      result.errors.push('Preset must have a valid ID')
    }

    if (!p.name || typeof p.name !== 'string') {
      result.errors.push('Preset must have a valid name')
    }

    if (!p.baseTheme || !baseThemes.includes(p.baseTheme as BaseTheme)) {
      result.errors.push(`Base theme must be one of: ${baseThemes.join(', ')}`)
    }

    if (!Array.isArray(p.colorOverrides)) {
      result.errors.push('Color overrides must be an array')
    } else {
      // Validate each color override
      p.colorOverrides.forEach((override, index) => {
        const overrideResult = this.validateColorOverride(override)
        if (!overrideResult.isValid) {
          result.errors.push(...overrideResult.errors.map((e) => `Color override ${index}: ${e}`))
          result.warnings.push(
            ...overrideResult.warnings.map((w) => `Color override ${index}: ${w}`),
          )
        }
      })
    }

    // Validate metadata
    if (!p.metadata || typeof p.metadata !== 'object') {
      result.errors.push('Preset must have metadata')
    } else {
      const metaResult = this.validateMetadata(p.metadata)
      result.errors.push(...metaResult.errors)
      result.warnings.push(...metaResult.warnings)
    }

    // Preset-specific warnings
    if (p.name && p.name.length > 50) {
      result.warnings.push('Preset name is very long (>50 characters)')
    }

    if (p.colorOverrides && p.colorOverrides.length === 0) {
      result.warnings.push('Preset has no color overrides')
    }

    result.isValid = result.errors.length === 0
    return result
  }

  /**
   * Validate a color override
   */
  static validateColorOverride(override: unknown): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    }

    if (!override || typeof override !== 'object') {
      result.errors.push('Color override must be an object')
      result.isValid = false
      return result
    }

    const o = override as Partial<ColorOverride>

    // Required fields
    if (!o.tokenId || typeof o.tokenId !== 'string') {
      result.errors.push('Token ID is required')
    } else {
      // Check if token ID is known
      const validToken = editableColorTokens.find((t) => t.id === o.tokenId)
      if (!validToken) {
        result.warnings.push(`Unknown token ID: ${o.tokenId}`)
      }
    }

    if (!o.value || typeof o.value !== 'string') {
      result.errors.push('Color value is required')
    } else {
      const colorResult = this.validateColor(o.value)
      result.errors.push(...colorResult.errors)
      result.warnings.push(...colorResult.warnings)
    }

    // Optional palette validation
    if (o.palette && typeof o.palette !== 'object') {
      result.warnings.push('Palette should be an object')
    }

    result.isValid = result.errors.length === 0
    return result
  }

  /**
   * Validate a color value (hex, rgb, hsl, etc.)
   */
  static validateColor(color: string): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    }

    if (!color || typeof color !== 'string') {
      result.errors.push('Color must be a string')
      result.isValid = false
      return result
    }

    const trimmed = color.trim()

    // Hex colors
    if (trimmed.startsWith('#')) {
      if (!/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/.test(trimmed)) {
        result.errors.push('Invalid hex color format')
      }
    }
    // RGB/RGBA colors
    else if (trimmed.startsWith('rgb')) {
      if (!/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*(0|1|0?\.\d+))?\s*\)$/.test(trimmed)) {
        result.errors.push('Invalid RGB/RGBA color format')
      }
    }
    // HSL/HSLA colors
    else if (trimmed.startsWith('hsl')) {
      if (!/^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(,\s*(0|1|0?\.\d+))?\s*\)$/.test(trimmed)) {
        result.errors.push('Invalid HSL/HSLA color format')
      }
    }
    // Named colors (basic check)
    else if (!/^[a-zA-Z]+$/.test(trimmed)) {
      result.warnings.push('Unrecognized color format - prefer hex colors for consistency')
    }

    // Additional color warnings
    if (trimmed.length > 30) {
      result.warnings.push('Color value is unusually long')
    }

    result.isValid = result.errors.length === 0
    return result
  }

  /**
   * Validate preset metadata
   */
  static validateMetadata(metadata: unknown): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    }

    if (!metadata || typeof metadata !== 'object') {
      result.errors.push('Metadata must be an object')
      result.isValid = false
      return result
    }

    const m = metadata as any

    // Required fields
    if (!m.created || typeof m.created !== 'string') {
      result.errors.push('Created date is required')
    } else if (!this.isValidDate(m.created)) {
      result.errors.push('Created date must be a valid ISO string')
    }

    if (!m.modified || typeof m.modified !== 'string') {
      result.errors.push('Modified date is required')
    } else if (!this.isValidDate(m.modified)) {
      result.errors.push('Modified date must be a valid ISO string')
    }

    if (!m.version || typeof m.version !== 'string') {
      result.warnings.push('Version is recommended')
    } else if (!/^\d+\.\d+\.\d+/.test(m.version)) {
      result.warnings.push('Version should follow semantic versioning (e.g., 1.0.0)')
    }

    // Optional fields validation
    if (m.author && typeof m.author !== 'string') {
      result.warnings.push('Author should be a string')
    }

    if (m.tags && !Array.isArray(m.tags)) {
      result.warnings.push('Tags should be an array')
    }

    if (m.isBuiltIn && typeof m.isBuiltIn !== 'boolean') {
      result.warnings.push('isBuiltIn should be a boolean')
    }

    if (m.isDefault && typeof m.isDefault !== 'boolean') {
      result.warnings.push('isDefault should be a boolean')
    }

    result.isValid = result.errors.length === 0
    return result
  }

  /**
   * Validate theme configuration
   */
  static validateConfig(config: unknown): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    }

    if (!config || typeof config !== 'object') {
      result.errors.push('Config must be an object')
      result.isValid = false
      return result
    }

    const c = config as Partial<ThemeConfig>

    // Required fields
    if (!c.activePresetId || typeof c.activePresetId !== 'string') {
      result.errors.push('Active preset ID is required')
    }

    if (!c.baseTheme || !baseThemes.includes(c.baseTheme as BaseTheme)) {
      result.errors.push(`Base theme must be one of: ${baseThemes.join(', ')}`)
    }

    // Boolean fields
    if (typeof c.darkMode !== 'boolean') {
      result.warnings.push('darkMode should be a boolean')
    }

    if (typeof c.autoSave !== 'boolean') {
      result.warnings.push('autoSave should be a boolean')
    }

    if (typeof c.syncAcrossTabs !== 'boolean') {
      result.warnings.push('syncAcrossTabs should be a boolean')
    }

    if (typeof c.smoothTransitions !== 'boolean') {
      result.warnings.push('smoothTransitions should be a boolean')
    }

    // Numeric fields
    if (c.maxSavedPresets && (typeof c.maxSavedPresets !== 'number' || c.maxSavedPresets < 1)) {
      result.warnings.push('maxSavedPresets should be a positive number')
    }

    result.isValid = result.errors.length === 0
    return result
  }

  /**
   * Check color contrast ratio (basic implementation)
   */
  static checkContrast(foreground: string, background: string): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    }

    try {
      // This is a simplified implementation
      // In production, you'd use a proper color contrast library

      const fgResult = this.validateColor(foreground)
      const bgResult = this.validateColor(background)

      if (!fgResult.isValid || !bgResult.isValid) {
        result.errors.push('Cannot check contrast for invalid colors')
        result.isValid = false
        return result
      }

      // Basic checks
      if (foreground.toLowerCase() === background.toLowerCase()) {
        result.warnings.push('Foreground and background colors are the same')
      }

      // Could implement actual contrast ratio calculation here
      result.warnings.push('Contrast ratio check not fully implemented')
    } catch (error) {
      result.warnings.push('Failed to check color contrast')
    }

    return result
  }

  /**
   * Validate file for import
   */
  static validateImportFile(file: File): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    }

    // Check file type
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      result.errors.push('File must be a JSON file')
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      result.errors.push(`File too large (${(file.size / 1024 / 1024).toFixed(2)}MB > 10MB)`)
    }

    // Check for empty file
    if (file.size === 0) {
      result.errors.push('File is empty')
    }

    result.isValid = result.errors.length === 0
    return result
  }

  /**
   * Helper: Check if string is a valid ISO date
   */
  private static isValidDate(dateString: string): boolean {
    try {
      const date = new Date(dateString)
      return date.toISOString() === dateString
    } catch {
      return false
    }
  }

  /**
   * Get validation summary
   */
  static getValidationSummary(results: ValidationResult[]): {
    totalErrors: number
    totalWarnings: number
    isAllValid: boolean
    summary: string
  } {
    const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0)
    const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0)
    const isAllValid = results.every((r) => r.isValid)

    let summary = ''
    if (totalErrors === 0 && totalWarnings === 0) {
      summary = 'All validations passed ✅'
    } else {
      const parts = []
      if (totalErrors > 0) parts.push(`${totalErrors} error${totalErrors > 1 ? 's' : ''}`)
      if (totalWarnings > 0) parts.push(`${totalWarnings} warning${totalWarnings > 1 ? 's' : ''}`)
      summary = parts.join(', ')
    }

    return {
      totalErrors,
      totalWarnings,
      isAllValid,
      summary,
    }
  }
}
