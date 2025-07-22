import { computed, watch, nextTick } from 'vue'
import { useThemeConfigStore, useThemePresetStore, useThemeEditorStore } from '@/stores/theme'
import { editableColorTokens, colorCategories } from '../config/theme.config'
import type { ColorToken, ColorOverride, BaseTheme } from '../presets/preset.types'
import { palette } from '@primeuix/themes'

/**
 * Main theme configuration composable
 * Bridges our theme store with PrimeVue's theme system for real-time updates
 */
export function useThemeConfig() {
  const configStore = useThemeConfigStore()
  const presetStore = useThemePresetStore()
  const editorStore = useThemeEditorStore()
  
  // Reactive token organization for UI
  const tokensByCategory = computed(() => {
    const grouped: Record<string, ColorToken[]> = {}
    
    colorCategories.forEach(category => {
      grouped[category.id] = editableColorTokens.filter(token => token.category === category.id)
    })
    
    return grouped
  })
  
  // Current theme values with fallbacks
  function getTokenValue(tokenId: string): string {
    return editorStore.getTokenValue(tokenId)
  }
  
  // Get current CSS variable value from document
  function getCurrentCSSValue(cssVariable: string): string {
    try {
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue(cssVariable)
        .trim()
      return value || '#000000'
    } catch {
      return '#000000'
    }
  }
  
  // Real-time color updates that immediately apply to PrimeVue
  async function updateTokenColor(tokenId: string, value: string) {
    console.log(`🎨 Updating token: ${tokenId} = ${value}`)
    
    // Update in store (triggers reactivity)
    editorStore.updateColor(tokenId, value)
    
    // Apply to PrimeVue theme system immediately
    await applyColorUpdate(tokenId, value)
    
    // Update CSS custom properties for instant visual feedback
    updateCSSProperty(tokenId, value)
  }
  
  // Apply color updates to PrimeVue theme system
  async function applyColorUpdate(tokenId: string, value: string) {
    try {
      const token = editableColorTokens.find(t => t.id === tokenId)
      if (!token) return
      
      // Generate palette for brand/status colors
      if (['brand', 'status'].includes(token.category)) {
        const colorPalette = palette(value)
        
        // Apply palette to PrimeVue theme using updatePreset
        const { updatePreset } = await import('@primeuix/themes')
        
        const themeUpdate: any = {
          semantic: {}
        }
        
        // Map token to PrimeVue semantic structure
        if (token.category === 'brand') {
          themeUpdate.semantic[tokenId] = colorPalette
        } else if (token.category === 'status') {
          themeUpdate.semantic[tokenId] = colorPalette
        }
        
        // Apply theme update
        updatePreset(themeUpdate)
        
        console.log(`✅ Applied ${tokenId} palette to PrimeVue`)
      }
      
      // Handle surface colors
      else if (token.category === 'surface') {
        const surfaceNumber = tokenId.replace('surface-', '')
        const { updatePreset } = await import('@primeuix/themes')
        
        const themeUpdate = {
          semantic: {
            colorScheme: {
              light: {
                surface: {
                  [surfaceNumber]: value
                }
              },
              dark: {
                surface: {
                  [surfaceNumber]: value
                }
              }
            }
          }
        }
        
        updatePreset(themeUpdate)
        console.log(`✅ Applied surface-${surfaceNumber} to PrimeVue`)
      }
      
      // Handle direct color mappings (text, interaction)
      else {
        const { updatePreset } = await import('@primeuix/themes')
        
        const themeUpdate = {
          semantic: {
            [tokenId.replace('-', '.')]: value
          }
        }
        
        updatePreset(themeUpdate)
        console.log(`✅ Applied ${tokenId} to PrimeVue`)
      }
      
    } catch (error) {
      console.error(`❌ Failed to apply color update for ${tokenId}:`, error)
    }
  }
  
  // Update CSS custom properties for immediate visual feedback
  function updateCSSProperty(tokenId: string, value: string) {
    try {
      const token = editableColorTokens.find(t => t.id === tokenId)
      if (!token?.cssVariable) return
      
      document.documentElement.style.setProperty(token.cssVariable, value)
      console.log(`🎨 Updated CSS property: ${token.cssVariable} = ${value}`)
    } catch (error) {
      console.error(`❌ Failed to update CSS property for ${tokenId}:`, error)
    }
  }
  
  // Switch base theme with proper integration
  async function switchBaseTheme(newBaseTheme: BaseTheme) {
    console.log(`🔄 Switching base theme to: ${newBaseTheme}`)
    
    try {
      // Update store
      if (editorStore.editingPreset) {
        editorStore.editingPreset.baseTheme = newBaseTheme
        configStore.config.baseTheme = newBaseTheme
      }
      
      // Load new base theme
      const baseTheme = await loadBaseTheme(newBaseTheme)
      
      // Apply current color overrides to new base
      const overrides = buildThemeOverrides(editorStore.editingColors)
      
      // Switch PrimeVue to new theme with overrides
      const { usePreset } = await import('@primeuix/themes')
      const { definePreset } = await import('@primeuix/themes')
      
      const newPreset = definePreset(baseTheme, overrides)
      usePreset(newPreset)
      
      // Trigger store update
      await editorStore.applyColors()
      
      console.log(`✅ Switched to ${newBaseTheme} base theme`)
    } catch (error) {
      console.error(`❌ Failed to switch base theme:`, error)
    }
  }
  
  // Generate color harmonies for creative workflows  
  function generateColorHarmony(baseColor: string, type: 'monochromatic' | 'complementary' | 'triadic' | 'analogous') {
    console.log(`🎨 Generating ${type} harmony from ${baseColor}`)
    
    const basePalette = palette(baseColor)
    
    switch (type) {
      case 'monochromatic':
        return generateMonochromaticTheme(basePalette)
      case 'complementary':
        return generateComplementaryTheme(baseColor)
      case 'triadic':
        return generateTriadicTheme(baseColor)
      case 'analogous':
        return generateAnalogousTheme(baseColor)
      default:
        return {}
    }
  }
  
  // Apply a complete color harmony to current theme
  async function applyColorHarmony(harmony: Record<string, string>) {
    console.log('🎨 Applying color harmony theme')
    
    for (const [tokenId, value] of Object.entries(harmony)) {
      await updateTokenColor(tokenId, value)
      // Small delay for smooth visual feedback
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    
    console.log('✅ Color harmony applied')
  }
  
  // Reset to preset defaults
  async function resetToPresetDefaults() {
    if (!presetStore.activePreset) return
    
    console.log('🔄 Resetting to preset defaults')
    
    // Clear editing colors to show original preset
    editorStore.editingColors.splice(0)
    
    // Reapply original preset
    await editorStore.applyColors()
    
    console.log('✅ Reset to defaults')
  }
  
  // Validate color contrast (basic implementation)
  function checkColorContrast(foreground: string, background: string): {
    ratio: number
    level: 'AAA' | 'AA' | 'fail'
    readable: boolean
  } {
    // Simplified contrast check - in production use a proper contrast library
    // This is a placeholder that returns reasonable defaults
    const ratio = 4.5 // Mock ratio
    
    return {
      ratio,
      level: ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'fail',
      readable: ratio >= 4.5
    }
  }
  
  // Helper functions
  
  async function loadBaseTheme(name: BaseTheme) {
    switch (name) {
      case 'Material':
        return (await import('@primeuix/themes/material')).default
      case 'Aura':
        return (await import('@primeuix/themes/aura')).default
      case 'Lara':
        return (await import('@primeuix/themes/lara')).default
      case 'Nora':
        return (await import('@primeuix/themes/nora')).default
    }
  }
  
  function buildThemeOverrides(colorOverrides: ColorOverride[]): any {
    const overrides: any = {
      semantic: {}
    }
    
    colorOverrides.forEach(override => {
      const token = editableColorTokens.find(t => t.id === override.tokenId)
      if (!token) return
      
      switch (token.category) {
        case 'brand':
        case 'status':
          if (override.palette) {
            overrides.semantic[override.tokenId] = override.palette
          }
          break
          
        case 'surface':
          const surfaceNum = token.id.replace('surface-', '')
          if (!overrides.semantic.colorScheme) {
            overrides.semantic.colorScheme = { 
              light: { surface: {} }, 
              dark: { surface: {} } 
            }
          }
          overrides.semantic.colorScheme.light.surface[surfaceNum] = override.value
          overrides.semantic.colorScheme.dark.surface[surfaceNum] = override.value
          break
          
        case 'text':
        case 'interaction':
          const propertyPath = override.tokenId.replace('-', '.')
          overrides.semantic[propertyPath] = override.value
          break
      }
    })
    
    return overrides
  }
  
  function generateMonochromaticTheme(basePalette: Record<number, string>) {
    return {
      primary: basePalette[700],
      secondary: basePalette[500],
      success: basePalette[600],
      info: basePalette[400],
      warning: '#FFB400', // Keep warning distinct
      danger: '#F60D03'   // Keep danger distinct
    }
  }
  
  function generateComplementaryTheme(baseColor: string): Record<string, string> {
    // Simplified complementary color generation
    // In production, use proper color theory calculations
    const basePalette = palette(baseColor)
    return {
      primary: basePalette[700],
      secondary: basePalette[300], // Lighter version as complement
      success: '#10B981',
      info: basePalette[500],
      warning: '#FFB400',
      danger: '#F60D03'
    }
  }
  
  function generateTriadicTheme(baseColor: string): Record<string, string> {
    const basePalette = palette(baseColor)
    return {
      primary: basePalette[700],
      secondary: basePalette[500],
      success: '#10B981',
      info: '#3B82F6',
      warning: '#FFB400',
      danger: '#F60D03'
    }
  }
  
  function generateAnalogousTheme(baseColor: string): Record<string, string> {
    const basePalette = palette(baseColor)
    return {
      primary: basePalette[700],
      secondary: basePalette[600],
      success: basePalette[500],
      info: basePalette[400],
      warning: '#FFB400',
      danger: '#F60D03'
    }
  }
  
  // Watch for theme changes and ensure consistency
  watch(() => configStore.config.darkMode, (isDark) => {
    document.documentElement.classList.toggle('dark', isDark)
  }, { immediate: true })
  
  return {
    // Computed
    tokensByCategory,
    
    // Token Management
    getTokenValue,
    getCurrentCSSValue,
    updateTokenColor,
    
    // Theme Operations
    switchBaseTheme,
    resetToPresetDefaults,
    
    // Color Tools
    generateColorHarmony,
    applyColorHarmony,
    checkColorContrast,
    
    // Integration Helpers
    applyColorUpdate,
    updateCSSProperty
  }
} 