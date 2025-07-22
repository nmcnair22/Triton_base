import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { ThemePreset, ColorOverride } from '@/themes/presets/preset.types'
import { editableColorTokens } from '@/themes/config/theme.config'
import { useThemePresetStore } from './preset.store'
import { useThemeUIStore } from './ui.store'
import { useThemeConfigStore } from './config.store'

export const useThemeEditorStore = defineStore('theme-editor', () => {
  // Dependencies
  const presetStore = useThemePresetStore()
  const uiStore = useThemeUIStore()
  const configStore = useThemeConfigStore()

  // State
  const editingPreset = ref<ThemePreset | null>(null)
  const editingColors = ref<ColorOverride[]>([])
  const originalColors = ref<ColorOverride[]>([])

  // Computed
  const hasChanges = computed(() => {
    if (!editingPreset.value || !presetStore.activePreset) return false

    // Check if colors have changed
    const colorsChanged =
      JSON.stringify(editingColors.value) !== JSON.stringify(originalColors.value)

    // Check if preset properties have changed
    const presetChanged =
      editingPreset.value.name !== presetStore.activePreset.name ||
      editingPreset.value.description !== presetStore.activePreset.description

    return colorsChanged || presetChanged
  })

  const canSave = computed(
    () => hasChanges.value && editingPreset.value && !editingPreset.value.metadata.isBuiltIn
  )

  const isEditingBuiltIn = computed(() => editingPreset.value?.metadata.isBuiltIn || false)

  // Actions
  function startEditing(preset: ThemePreset) {
    console.log(`📝 Starting edit of preset: ${preset.name}`)

    editingPreset.value = { ...preset }
    editingColors.value = [...preset.colorOverrides]
    originalColors.value = [...preset.colorOverrides]

    uiStore.setDirty(false)
  }

  function stopEditing() {
    editingPreset.value = null
    editingColors.value = []
    originalColors.value = []
    uiStore.setDirty(false)
  }

  async function updateColor(tokenId: string, value: string) {
    if (!editingPreset.value) return

    console.log(`🎨 Updating color: ${tokenId} = ${value}`)

    const existingIndex = editingColors.value.findIndex(c => c.tokenId === tokenId)

    if (existingIndex >= 0) {
      // Update existing override
      editingColors.value[existingIndex] = {
        ...editingColors.value[existingIndex],
        value,
      }
    } else {
      // Add new override
      const newOverride: ColorOverride = {
        tokenId,
        value,
      }

      // Check if this token should have a palette
      if (shouldHavePalette(tokenId)) {
        try {
          const { generatePaletteMemoized } = await import(
            '@/utils/performance/color-utils-optimized'
          )
          newOverride.palette = await generatePaletteMemoized(value)
        } catch (error) {
          console.warn('Failed to generate palette:', error)
        }
      }

      editingColors.value.push(newOverride)
    }

    // Mark as dirty
    uiStore.setDirty(true)

    // Apply in real-time if auto-save is enabled
    if (configStore.config.autoSave) {
      await applyColors()
    }
  }

  async function removeColorOverride(tokenId: string) {
    editingColors.value = editingColors.value.filter(c => c.tokenId !== tokenId)
    uiStore.setDirty(true)

    if (configStore.config.autoSave) {
      await applyColors()
    }
  }

  function resetColor(tokenId: string) {
    // Find the original value
    const originalOverride = originalColors.value.find(c => c.tokenId === tokenId)

    if (originalOverride) {
      // Reset to original override value
      updateColor(tokenId, originalOverride.value)
    } else {
      // Remove the override entirely
      removeColorOverride(tokenId)
    }
  }

  function resetAllColors() {
    editingColors.value = [...originalColors.value]
    uiStore.setDirty(false)
    applyColors()
  }

  function getTokenValue(tokenId: string): string {
    // Check editing colors first
    const override = editingColors.value.find(c => c.tokenId === tokenId)
    if (override) return override.value

    // Check active preset
    if (presetStore.activePreset) {
      const presetOverride = presetStore.activePreset.colorOverrides.find(
        c => c.tokenId === tokenId
      )
      if (presetOverride) return presetOverride.value
    }

    // Return default value
    const token = editableColorTokens.find(t => t.id === tokenId)
    return token?.defaultValue || '#000000'
  }

  function hasOverride(tokenId: string): boolean {
    return editingColors.value.some(c => c.tokenId === tokenId)
  }

  async function applyColors() {
    if (!editingPreset.value) return

    console.log('🔄 Applying color changes...')

    // This is where you would apply the colors to the DOM
    // For now, we'll just update CSS custom properties
    editingColors.value.forEach(override => {
      // Apply to CSS variables
      const cssVarName = `--${override.tokenId.replace(/\./g, '-')}`
      document.documentElement.style.setProperty(cssVarName, override.value)

      // Apply palette if it exists
      if (override.palette) {
        Object.entries(override.palette).forEach(([shade, color]) => {
          const paletteVarName = `--${override.tokenId.replace(/\./g, '-')}-${shade}`
          document.documentElement.style.setProperty(paletteVarName, color as string)
        })
      }
    })
  }

  async function saveChanges() {
    if (!editingPreset.value || !canSave.value) return

    console.log(`💾 Saving changes to preset: ${editingPreset.value.name}`)

    // Update the preset with new colors
    editingPreset.value.colorOverrides = [...editingColors.value]

    // Save through preset store
    await presetStore.updatePreset(editingPreset.value)

    // Update original colors reference
    originalColors.value = [...editingColors.value]

    // Reset dirty state
    uiStore.setDirty(false)

    console.log('✅ Changes saved successfully')
  }

  async function saveAsNewPreset(name: string, description?: string) {
    if (!editingPreset.value) return

    console.log(`💾 Saving as new preset: ${name}`)

    // Create new preset through preset store
    const newPreset = await presetStore.createPreset(
      name,
      description,
      editingPreset.value.baseTheme
    )

    // Update with current colors
    newPreset.colorOverrides = [...editingColors.value]
    await presetStore.updatePreset(newPreset)

    // Activate the new preset
    await presetStore.activatePreset(newPreset)

    // Start editing the new preset
    startEditing(newPreset)

    console.log(`✅ New preset created: ${name}`)
    return newPreset
  }

  function shouldHavePalette(tokenId: string): boolean {
    const paletteTokens = ['primary', 'secondary', 'success', 'info', 'warning', 'danger']
    return paletteTokens.includes(tokenId)
  }

  // Watch for active preset changes
  watch(
    () => presetStore.activePreset,
    newPreset => {
      if (newPreset) {
        startEditing(newPreset)
      }
    },
    { immediate: true }
  )

  // Watch for changes to mark dirty
  watch(
    editingColors,
    () => {
      if (editingPreset.value) {
        uiStore.setDirty(hasChanges.value)
      }
    },
    { deep: true }
  )

  return {
    // State
    editingPreset,
    editingColors,

    // Computed
    hasChanges,
    canSave,
    isEditingBuiltIn,

    // Actions
    startEditing,
    stopEditing,
    updateColor,
    removeColorOverride,
    resetColor,
    resetAllColors,
    getTokenValue,
    hasOverride,
    applyColors,
    saveChanges,
    saveAsNewPreset,
  }
})
