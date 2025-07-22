import { ref, computed, watch } from 'vue'
import { palette } from '@primeuix/themes'
import { useThemeConfig } from './useThemeConfig'
import { ThemeValidator } from '../utils/validation'
import type { ColorToken } from '../presets/preset.types'

/**
 * Advanced color editor composable
 * Provides color manipulation tools that integrate with our theme system
 */
export function useColorEditor() {
  const themeConfig = useThemeConfig()

  // Current editing state
  const currentTokenId = ref<string | null>(null)
  const currentValue = ref('#000000')
  const isEditing = ref(false)
  const previewMode = ref(false)

  // Generated palettes and variants
  const currentPalette = computed(() => {
    if (!currentValue.value) return null
    try {
      return palette(currentValue.value)
    } catch {
      return null
    }
  })

  // Color format conversion
  const colorFormats = computed(() => {
    if (!currentValue.value) return {}

    return {
      hex: currentValue.value,
      rgb: hexToRgb(currentValue.value),
      hsl: hexToHsl(currentValue.value),
      hsv: hexToHsv(currentValue.value),
    }
  })

  // Validation state
  const validation = computed(() => {
    return ThemeValidator.validateColor(currentValue.value)
  })

  // Start editing a specific color token
  function startEditing(tokenId: string, initialValue?: string) {
    console.log(`🎨 Starting color editor for: ${tokenId}`)

    currentTokenId.value = tokenId
    currentValue.value = initialValue || themeConfig.getTokenValue(tokenId)
    isEditing.value = true
    previewMode.value = false

    console.log(`✅ Color editor ready for ${tokenId}`)
  }

  // Update color value with validation
  function updateColor(newValue: string, applyImmediately = true) {
    console.log(`🎨 Updating color: ${newValue}`)

    // Validate new color
    const validationResult = ThemeValidator.validateColor(newValue)
    if (!validationResult.isValid) {
      console.warn('Invalid color format:', validationResult.errors)
      return false
    }

    currentValue.value = newValue

    // Apply to theme if requested and we have a token
    if (applyImmediately && currentTokenId.value) {
      themeConfig.updateTokenColor(currentTokenId.value, newValue)
    }

    return true
  }

  // Apply current color to theme
  async function applyToTheme() {
    if (!currentTokenId.value || !currentValue.value) return

    console.log(`✅ Applying ${currentValue.value} to ${currentTokenId.value}`)
    await themeConfig.updateTokenColor(currentTokenId.value, currentValue.value)
  }

  // Toggle preview mode (temporary visual changes)
  function togglePreview() {
    previewMode.value = !previewMode.value

    if (previewMode.value && currentTokenId.value) {
      // Apply temporarily for preview
      themeConfig.updateCSSProperty(currentTokenId.value, currentValue.value)
      console.log('👁️ Preview mode ON')
    } else {
      // Revert to stored value
      if (currentTokenId.value) {
        const storedValue = themeConfig.getTokenValue(currentTokenId.value)
        themeConfig.updateCSSProperty(currentTokenId.value, storedValue)
      }
      console.log('👁️ Preview mode OFF')
    }
  }

  // Generate color variations
  function generateVariations() {
    if (!currentValue.value) return {}

    const base = currentValue.value

    return {
      lighter: lightenColor(base, 20),
      darker: darkenColor(base, 20),
      saturated: saturateColor(base, 20),
      desaturated: desaturateColor(base, 20),
      complementary: getComplementaryColor(base),
      analogous: getAnalogousColors(base),
      triadic: getTriadicColors(base),
    }
  }

  // Palette-based color selection
  function selectFromPalette(shade: number) {
    if (!currentPalette.value || !currentPalette.value[shade]) return

    const newColor = currentPalette.value[shade]
    updateColor(newColor)

    console.log(`🎨 Selected shade ${shade}: ${newColor}`)
  }

  // Quick color presets for common use cases
  function applyQuickPreset(presetName: string) {
    const presets: Record<string, string> = {
      // Brand colors
      navy: '#0B2244',
      blue: '#297FB7',
      lightblue: '#60A5FA',

      // Status colors
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
      info: '#3B82F6',

      // Neutrals
      white: '#FFFFFF',
      black: '#000000',
      gray: '#6B7280',
      lightgray: '#F3F4F6',
      darkgray: '#374151',

      // Popular colors
      purple: '#8B5CF6',
      pink: '#EC4899',
      green: '#10B981',
      orange: '#F97316',
      red: '#EF4444',
      yellow: '#EAB308',
      indigo: '#6366F1',
      teal: '#14B8A6',
    }

    const color = presets[presetName]
    if (color) {
      updateColor(color)
      console.log(`🎨 Applied preset: ${presetName} = ${color}`)
    }
  }

  // Copy color to clipboard
  async function copyToClipboard(format: 'hex' | 'rgb' | 'hsl' = 'hex') {
    let valueToCopy = ''

    switch (format) {
      case 'hex':
        valueToCopy = currentValue.value
        break
      case 'rgb':
        valueToCopy = colorFormats.value.rgb || ''
        break
      case 'hsl':
        valueToCopy = colorFormats.value.hsl || ''
        break
    }

    if (valueToCopy) {
      try {
        await navigator.clipboard.writeText(valueToCopy)
        console.log(`📋 Copied ${format.toUpperCase()}: ${valueToCopy}`)
        return true
      } catch (error) {
        console.error('Failed to copy to clipboard:', error)
        return false
      }
    }
    return false
  }

  // Paste color from clipboard
  async function pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText()
      const trimmed = text.trim()

      // Validate pasted color
      const validation = ThemeValidator.validateColor(trimmed)
      if (validation.isValid) {
        updateColor(trimmed)
        console.log(`📋 Pasted color: ${trimmed}`)
        return true
      } else {
        console.warn('Invalid color in clipboard:', validation.errors)
        return false
      }
    } catch (error) {
      console.error('Failed to paste from clipboard:', error)
      return false
    }
  }

  // Stop editing and cleanup
  function stopEditing(saveChanges = true) {
    if (saveChanges && currentTokenId.value) {
      applyToTheme()
    }

    currentTokenId.value = null
    currentValue.value = '#000000'
    isEditing.value = false
    previewMode.value = false

    console.log('✅ Color editor closed')
  }

  // Color manipulation utilities

  function hexToRgb(hex: string): string {
    try {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      if (!result) return ''

      const r = parseInt(result[1], 16)
      const g = parseInt(result[2], 16)
      const b = parseInt(result[3], 16)

      return `rgb(${r}, ${g}, ${b})`
    } catch {
      return ''
    }
  }

  function hexToHsl(hex: string): string {
    try {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      if (!result) return ''

      const r = parseInt(result[1], 16) / 255
      const g = parseInt(result[2], 16) / 255
      const b = parseInt(result[3], 16) / 255

      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      let h,
        s,
        l = (max + min) / 2

      if (max === min) {
        h = s = 0 // achromatic
      } else {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0)
            break
          case g:
            h = (b - r) / d + 2
            break
          case b:
            h = (r - g) / d + 4
            break
          default:
            h = 0
        }
        h /= 6
      }

      return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
    } catch {
      return ''
    }
  }

  function hexToHsv(hex: string): string {
    // Simplified HSV conversion
    return hexToHsl(hex).replace('hsl', 'hsv')
  }

  function lightenColor(hex: string, percent: number): string {
    try {
      const num = parseInt(hex.replace('#', ''), 16)
      const amt = Math.round(2.55 * percent)
      const R = (num >> 16) + amt
      const G = ((num >> 8) & 0x00ff) + amt
      const B = (num & 0x0000ff) + amt

      return (
        '#' +
        (
          0x1000000 +
          (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
          (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
          (B < 255 ? (B < 1 ? 0 : B) : 255)
        )
          .toString(16)
          .slice(1)
      )
    } catch {
      return hex
    }
  }

  function darkenColor(hex: string, percent: number): string {
    return lightenColor(hex, -percent)
  }

  function saturateColor(hex: string, percent: number): string {
    // Simplified saturation adjustment
    return hex // Placeholder - would implement proper HSL manipulation
  }

  function desaturateColor(hex: string, percent: number): string {
    return saturateColor(hex, -percent)
  }

  function getComplementaryColor(hex: string): string {
    try {
      const num = parseInt(hex.replace('#', ''), 16)
      const R = 255 - (num >> 16)
      const G = 255 - ((num >> 8) & 0x00ff)
      const B = 255 - (num & 0x0000ff)

      return '#' + ((R << 16) | (G << 8) | B).toString(16).padStart(6, '0')
    } catch {
      return hex
    }
  }

  function getAnalogousColors(hex: string): string[] {
    // Simplified analogous color generation
    return [lightenColor(hex, 10), hex, darkenColor(hex, 10)]
  }

  function getTriadicColors(hex: string): string[] {
    // Simplified triadic color generation
    return [hex, lightenColor(hex, 30), darkenColor(hex, 20)]
  }

  // Watch for external changes
  watch(currentTokenId, newTokenId => {
    if (newTokenId && !isEditing.value) {
      currentValue.value = themeConfig.getTokenValue(newTokenId)
    }
  })

  return {
    // State
    currentTokenId,
    currentValue,
    isEditing,
    previewMode,

    // Computed
    currentPalette,
    colorFormats,
    validation,

    // Core Functions
    startEditing,
    updateColor,
    applyToTheme,
    stopEditing,

    // Preview & Testing
    togglePreview,
    generateVariations,

    // Palette Tools
    selectFromPalette,
    applyQuickPreset,

    // Clipboard
    copyToClipboard,
    pasteFromClipboard,

    // Color Utilities
    lightenColor,
    darkenColor,
    getComplementaryColor,
  }
}
