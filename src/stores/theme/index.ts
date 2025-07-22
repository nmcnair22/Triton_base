/**
 * Theme Store Module
 *
 * This module exports all theme-related stores that were split from
 * the original monolithic theme store for better separation of concerns.
 */

export { useThemeConfigStore } from './config.store'
export type { ThemeConfig } from './config.store'

export { useThemeUIStore } from './ui.store'
export type { ThemeUIState } from './ui.store'

export { useThemePresetStore } from './preset.store'
export { useThemeEditorStore } from './editor.store'

// Re-export types for convenience
export type {
  ThemePreset,
  BaseTheme,
  ColorOverride,
  ThemeState,
} from '@/themes/presets/preset.types'

/**
 * Composite store that provides a unified interface
 * for backward compatibility during migration
 */
import { computed } from 'vue'
import { useThemeConfigStore } from './config.store'
import { useThemeUIStore } from './ui.store'
import { useThemePresetStore } from './preset.store'
import { useThemeEditorStore } from './editor.store'

export function useThemeStore() {
  const configStore = useThemeConfigStore()
  const uiStore = useThemeUIStore()
  const presetStore = useThemePresetStore()
  const editorStore = useThemeEditorStore()

  // Initialize all stores
  async function initialize() {
    configStore.loadSavedConfig()
    await presetStore.initialize()
  }

  return {
    // Config Store
    config: configStore.config,
    toggleDarkMode: configStore.toggleDarkMode,

    // UI Store
    state: computed(() => ({
      configSidebarVisible: uiStore.configSidebarVisible,
      isDirty: uiStore.isDirty,
      isLoading: uiStore.isLoading,
    })),
    toggleConfig: uiStore.toggleConfig,
    setConfigVisible: uiStore.setConfigVisible,
    isConfigOpen: uiStore.isConfigOpen,

    // Preset Store
    presets: presetStore.presets,
    activePreset: presetStore.activePreset,
    availablePresets: presetStore.availablePresets,
    userPresets: presetStore.userPresets,
    builtInPresets: presetStore.builtInPresets,
    activatePreset: presetStore.activatePreset,
    deletePreset: presetStore.deletePreset,
    duplicatePreset: presetStore.duplicatePreset,
    exportPreset: presetStore.exportPreset,
    importPreset: presetStore.importPreset,

    // Editor Store
    editingPreset: editorStore.editingPreset,
    editingColors: editorStore.editingColors,
    canSave: editorStore.canSave,
    updateColor: editorStore.updateColor,
    getTokenValue: editorStore.getTokenValue,
    applyTheme: editorStore.applyColors,
    saveAsNewPreset: editorStore.saveAsNewPreset,
    updateCurrentPreset: editorStore.saveChanges,
    createPreset: presetStore.createPreset,
    updatePreset: presetStore.updatePreset,

    // Initialize
    initialize,
  }
}

/**
 * Helper to migrate from old theme store to new split stores
 * This can be used in components during the migration period
 */
export function migrateThemeStore() {
  console.warn('Using legacy useThemeStore(). Please migrate to individual stores:')
  console.warn('- useThemeConfigStore() for configuration')
  console.warn('- useThemeUIStore() for UI state')
  console.warn('- useThemePresetStore() for preset management')
  console.warn('- useThemeEditorStore() for theme editing')

  return useThemeStore()
}
