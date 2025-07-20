import type { ThemePreset, PresetExport } from './preset.types'
import { createThemePresetFromCustom } from '../custom-preset'
import { palette } from '@primeuix/themes'

export class PresetManager {
  private readonly STORAGE_KEY = 'triton-user-presets'
  private readonly MAX_PRESETS = 20
  
  /**
   * Load built-in presets that come with the application
   */
  async loadBuiltInPresets(): Promise<ThemePreset[]> {
    console.log('📦 Loading built-in presets...')
    
    const presets: ThemePreset[] = []
    
    // 1. Triton Default (based on existing custom preset)
    const tritonDefault = createThemePresetFromCustom()
    tritonDefault.metadata.isDefault = true
    presets.push(tritonDefault)
    
    // 2. High Contrast (WCAG AAA compliant)
    const highContrast: ThemePreset = {
      id: 'triton-high-contrast',
      name: 'High Contrast',
      description: 'WCAG AAA compliant high contrast theme for maximum accessibility',
      baseTheme: 'Material',
      colorOverrides: [
        {
          tokenId: 'primary',
          value: '#000000',
          palette: palette('#000000')
        },
        {
          tokenId: 'secondary',
          value: '#0066CC',
          palette: palette('#0066CC')
        },
        {
          tokenId: 'success',
          value: '#008000',
          palette: palette('#008000')
        },
        {
          tokenId: 'warning',
          value: '#FF8C00',
          palette: palette('#FF8C00')
        },
        {
          tokenId: 'danger',
          value: '#CC0000',
          palette: palette('#CC0000')
        },
        {
          tokenId: 'info',
          value: '#0066CC',
          palette: palette('#0066CC')
        },
        {
          tokenId: 'surface-0',
          value: '#FFFFFF'
        },
        {
          tokenId: 'surface-50',
          value: '#F5F5F5'
        },
        {
          tokenId: 'text-color',
          value: '#000000'
        },
        {
          tokenId: 'border-color',
          value: '#000000'
        }
      ],
      metadata: {
        created: '2024-01-01T00:00:00Z',
        modified: '2024-01-01T00:00:00Z',
        author: 'Triton Team',
        version: '1.0.0',
        tags: ['accessibility', 'high-contrast', 'wcag', 'aaa'],
        isBuiltIn: true
      }
    }
    presets.push(highContrast)
    
    // 3. Ocean Theme (Light teal variant)
    const oceanTheme: ThemePreset = {
      id: 'triton-ocean',
      name: 'Ocean',
      description: 'Light ocean-inspired theme with teal and blue tones',
      baseTheme: 'Aura',
      colorOverrides: [
        {
          tokenId: 'primary',
          value: '#0891B2',
          palette: palette('#0891B2')
        },
        {
          tokenId: 'secondary',
          value: '#06B6D4',
          palette: palette('#06B6D4')
        },
        {
          tokenId: 'success',
          value: '#059669',
          palette: palette('#059669')
        },
        {
          tokenId: 'info',
          value: '#0284C7',
          palette: palette('#0284C7')
        },
        {
          tokenId: 'warning',
          value: '#D97706',
          palette: palette('#D97706')
        },
        {
          tokenId: 'danger',
          value: '#DC2626',
          palette: palette('#DC2626')
        }
      ],
      metadata: {
        created: '2024-01-01T00:00:00Z',
        modified: '2024-01-01T00:00:00Z',
        author: 'Triton Team',
        version: '1.0.0',
        tags: ['ocean', 'teal', 'light', 'modern'],
        isBuiltIn: true
      }
    }
    presets.push(oceanTheme)
    
    // 4. Sunset Theme (Warm colors)
    const sunsetTheme: ThemePreset = {
      id: 'triton-sunset',
      name: 'Sunset',
      description: 'Warm sunset colors with orange and red tones',
      baseTheme: 'Lara',
      colorOverrides: [
        {
          tokenId: 'primary',
          value: '#EA580C',
          palette: palette('#EA580C')
        },
        {
          tokenId: 'secondary',
          value: '#F97316',
          palette: palette('#F97316')
        },
        {
          tokenId: 'success',
          value: '#16A34A',
          palette: palette('#16A34A')
        },
        {
          tokenId: 'info',
          value: '#0EA5E9',
          palette: palette('#0EA5E9')
        },
        {
          tokenId: 'warning',
          value: '#EAB308',
          palette: palette('#EAB308')
        },
        {
          tokenId: 'danger',
          value: '#DC2626',
          palette: palette('#DC2626')
        }
      ],
      metadata: {
        created: '2024-01-01T00:00:00Z',
        modified: '2024-01-01T00:00:00Z',
        author: 'Triton Team',
        version: '1.0.0',
        tags: ['sunset', 'warm', 'orange', 'vibrant'],
        isBuiltIn: true
      }
    }
    presets.push(sunsetTheme)
    
    // 5. Corporate Theme (Professional grays and blues)
    const corporateTheme: ThemePreset = {
      id: 'triton-corporate',
      name: 'Corporate',
      description: 'Professional corporate theme with subtle grays and blues',
      baseTheme: 'Material',
      colorOverrides: [
        {
          tokenId: 'primary',
          value: '#1F2937',
          palette: palette('#1F2937')
        },
        {
          tokenId: 'secondary',
          value: '#374151',
          palette: palette('#374151')
        },
        {
          tokenId: 'success',
          value: '#10B981',
          palette: palette('#10B981')
        },
        {
          tokenId: 'info',
          value: '#3B82F6',
          palette: palette('#3B82F6')
        },
        {
          tokenId: 'warning',
          value: '#F59E0B',
          palette: palette('#F59E0B')
        },
        {
          tokenId: 'danger',
          value: '#EF4444',
          palette: palette('#EF4444')
        }
      ],
      metadata: {
        created: '2024-01-01T00:00:00Z',
        modified: '2024-01-01T00:00:00Z',
        author: 'Triton Team',
        version: '1.0.0',
        tags: ['corporate', 'professional', 'gray', 'business'],
        isBuiltIn: true
      }
    }
    presets.push(corporateTheme)
    
    console.log(`✅ Loaded ${presets.length} built-in presets`)
    return presets
  }
  
  /**
   * Load user-created presets from localStorage
   */
  async loadUserPresets(): Promise<ThemePreset[]> {
    console.log('👤 Loading user presets...')
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) {
        console.log('No user presets found')
        return []
      }
      
      const presets = JSON.parse(stored) as ThemePreset[]
      
      // Validate and migrate if needed
      const validatedPresets = presets.map(preset => this.validateAndMigrate(preset))
      
      console.log(`✅ Loaded ${validatedPresets.length} user presets`)
      return validatedPresets
    } catch (error) {
      console.error('❌ Failed to load user presets:', error)
      return []
    }
  }
  
  /**
   * Save a user preset to localStorage
   */
  async saveUserPreset(preset: ThemePreset): Promise<void> {
    console.log(`💾 Saving user preset: ${preset.name}`)
    
    try {
      const userPresets = await this.loadUserPresets()
      
      // Find and update or add new
      const index = userPresets.findIndex(p => p.id === preset.id)
      if (index >= 0) {
        userPresets[index] = preset
        console.log(`Updated existing preset: ${preset.name}`)
      } else {
        // Check max limit
        if (userPresets.length >= this.MAX_PRESETS) {
          throw new Error(`Maximum preset limit (${this.MAX_PRESETS}) reached. Please delete some presets first.`)
        }
        userPresets.push(preset)
        console.log(`Added new preset: ${preset.name}`)
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userPresets))
      console.log('✅ Preset saved successfully')
    } catch (error) {
      console.error('❌ Failed to save preset:', error)
      throw error
    }
  }
  
  /**
   * Delete a user preset
   */
  async deleteUserPreset(presetId: string): Promise<void> {
    console.log(`🗑️ Deleting user preset: ${presetId}`)
    
    try {
      const userPresets = await this.loadUserPresets()
      const preset = userPresets.find(p => p.id === presetId)
      
      if (!preset) {
        throw new Error(`Preset with ID ${presetId} not found`)
      }
      
      if (preset.metadata.isBuiltIn) {
        throw new Error('Cannot delete built-in presets')
      }
      
      const filtered = userPresets.filter(p => p.id !== presetId)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered))
      
      console.log(`✅ Deleted preset: ${preset.name}`)
    } catch (error) {
      console.error('❌ Failed to delete preset:', error)
      throw error
    }
  }
  
  /**
   * Export a preset as JSON
   */
  async exportPreset(preset: ThemePreset): Promise<Blob> {
    console.log(`📤 Exporting preset: ${preset.name}`)
    
    try {
      const exportData: PresetExport = {
        preset: {
          ...preset,
          // Remove internal IDs for export and ensure it's not marked as built-in
          id: `exported-${Date.now()}`,
          metadata: {
            ...preset.metadata,
            isDefault: false,
            isBuiltIn: false
          }
        },
        exportDate: new Date().toISOString(),
        appVersion: '1.0.0'
      }
      
      const json = JSON.stringify(exportData, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      
      console.log('✅ Preset exported successfully')
      return blob
    } catch (error) {
      console.error('❌ Failed to export preset:', error)
      throw error
    }
  }
  
  /**
   * Import a preset from JSON file
   */
  async importPreset(file: File): Promise<ThemePreset> {
    console.log(`📥 Importing preset from file: ${file.name}`)
    
    try {
      const text = await file.text()
      const data = JSON.parse(text) as PresetExport
      
      // Validate structure
      if (!data.preset || !data.preset.name || !Array.isArray(data.preset.colorOverrides)) {
        throw new Error('Invalid preset file format. Missing required fields.')
      }
      
      // Generate new ID and metadata
      const imported: ThemePreset = {
        ...data.preset,
        id: `user-${Date.now()}`,
        metadata: {
          ...data.preset.metadata,
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          isBuiltIn: false,
          isDefault: false
        }
      }
      
      // Regenerate palettes for colors that need them
      imported.colorOverrides = imported.colorOverrides.map(override => {
        if (this.shouldHavePalette(override.tokenId)) {
          return {
            ...override,
            palette: palette(override.value)
          }
        }
        return override
      })
      
      // Save the imported preset
      await this.saveUserPreset(imported)
      
      console.log(`✅ Successfully imported preset: ${imported.name}`)
      return imported
    } catch (error) {
      console.error('❌ Failed to import preset:', error)
      throw new Error(`Failed to import preset: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  
  /**
   * Duplicate an existing preset
   */
  async duplicatePreset(preset: ThemePreset, newName: string): Promise<ThemePreset> {
    console.log(`📋 Duplicating preset: ${preset.name} -> ${newName}`)
    
    try {
      const duplicated: ThemePreset = {
        ...preset,
        id: `user-${Date.now()}`,
        name: newName,
        description: `${preset.description} (Copy)`,
        metadata: {
          ...preset.metadata,
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          author: 'User',
          isBuiltIn: false,
          isDefault: false
        }
      }
      
      await this.saveUserPreset(duplicated)
      console.log(`✅ Successfully duplicated preset: ${newName}`)
      return duplicated
    } catch (error) {
      console.error('❌ Failed to duplicate preset:', error)
      throw error
    }
  }
  
  /**
   * Validate and migrate preset to current format
   */
  private validateAndMigrate(preset: ThemePreset): ThemePreset {
    // Ensure all required fields exist
    const migrated: ThemePreset = {
      ...preset,
      metadata: {
        ...preset.metadata,
        version: preset.metadata.version || '1.0.0',
        created: preset.metadata.created || new Date().toISOString(),
        modified: preset.metadata.modified || new Date().toISOString()
      }
    }
    
    // Regenerate palettes if missing
    migrated.colorOverrides = migrated.colorOverrides.map(override => {
      if (this.shouldHavePalette(override.tokenId) && !override.palette) {
        return {
          ...override,
          palette: palette(override.value)
        }
      }
      return override
    })
    
    return migrated
  }
  
  /**
   * Check if a token should have a palette
   */
  private shouldHavePalette(tokenId: string): boolean {
    const paletteTokens = ['primary', 'secondary', 'success', 'info', 'warning', 'danger']
    return paletteTokens.includes(tokenId)
  }
  
  /**
   * Get storage statistics
   */
  getStorageStats() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      const size = stored ? new Blob([stored]).size : 0
      const sizeKB = (size / 1024).toFixed(2)
      
      return {
        size,
        sizeKB,
        maxPresets: this.MAX_PRESETS
      }
    } catch {
      return {
        size: 0,
        sizeKB: '0.00',
        maxPresets: this.MAX_PRESETS
      }
    }
  }
  
  /**
   * Clear all user presets (with confirmation)
   */
  async clearAllUserPresets(): Promise<void> {
    console.log('🧹 Clearing all user presets...')
    
    try {
      localStorage.removeItem(this.STORAGE_KEY)
      console.log('✅ All user presets cleared')
    } catch (error) {
      console.error('❌ Failed to clear presets:', error)
      throw error
    }
  }
} 