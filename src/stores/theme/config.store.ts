import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { BaseTheme } from '@/themes/presets/preset.types'
import { useThemePresetStore } from './preset.store'

export interface ThemeConfig {
  activePresetId: string
  baseTheme: BaseTheme
  darkMode: boolean
  autoSave: boolean
  syncAcrossTabs: boolean
  smoothTransitions: boolean
  storageKey: string
  maxSavedPresets?: number
}

export const useThemeConfigStore = defineStore('theme-config', () => {
  // State
  const config = ref<ThemeConfig>({
    activePresetId: '',
    baseTheme: 'Material' as BaseTheme,
    darkMode: false,
    autoSave: true,
    syncAcrossTabs: true,
    smoothTransitions: true,
    storageKey: 'triton-theme-config',
    maxSavedPresets: 20,
  })

  // Actions
  function toggleDarkMode() {
    config.value.darkMode = !config.value.darkMode
    applyDarkMode(config.value.darkMode)
    saveConfig()
  }

  function setDarkMode(isDark: boolean) {
    config.value.darkMode = isDark
    applyDarkMode(isDark)
    if (config.value.autoSave) {
      saveConfig()
    }
  }

  function setActivePresetId(presetId: string) {
    config.value.activePresetId = presetId
    if (config.value.autoSave) {
      saveConfig()
    }
  }

  function setBaseTheme(theme: BaseTheme) {
    config.value.baseTheme = theme
    if (config.value.autoSave) {
      saveConfig()
    }
  }

  function applyDarkMode(isDark: boolean) {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  function loadSavedConfig() {
    try {
      const saved = localStorage.getItem(config.value.storageKey)
      if (saved) {
        const parsedConfig = JSON.parse(saved)
        // Only load specific properties to avoid overwriting defaults
        const allowedKeys: (keyof ThemeConfig)[] = [
          'activePresetId',
          'baseTheme',
          'darkMode',
          'autoSave',
          'syncAcrossTabs',
          'smoothTransitions',
        ]

        allowedKeys.forEach(key => {
          if (key in parsedConfig) {
            ;(config.value[key] as any) = parsedConfig[key]
          }
        })

        // Apply dark mode immediately
        applyDarkMode(config.value.darkMode)
      }
    } catch (error) {
      console.warn('Failed to load saved config:', error)
    }
  }

  function saveConfig() {
    try {
      const configToSave = {
        activePresetId: config.value.activePresetId,
        baseTheme: config.value.baseTheme,
        darkMode: config.value.darkMode,
        autoSave: config.value.autoSave,
        syncAcrossTabs: config.value.syncAcrossTabs,
        smoothTransitions: config.value.smoothTransitions,
      }
      localStorage.setItem(config.value.storageKey, JSON.stringify(configToSave))
    } catch (error) {
      console.warn('Failed to save config:', error)
    }
  }

  function resetConfig() {
    config.value = {
      activePresetId: '',
      baseTheme: 'Material' as BaseTheme,
      darkMode: false,
      autoSave: true,
      syncAcrossTabs: true,
      smoothTransitions: true,
      storageKey: 'triton-theme-config',
      maxSavedPresets: 20,
    }
    applyDarkMode(false)
    saveConfig()
  }

  // Cross-tab synchronization
  if (typeof window !== 'undefined' && config.value.syncAcrossTabs) {
    window.addEventListener('storage', e => {
      if (e.key === config.value.storageKey && e.newValue) {
        try {
          const newConfig = JSON.parse(e.newValue)
          Object.assign(config.value, newConfig)
          applyDarkMode(config.value.darkMode)
        } catch (error) {
          console.warn('Failed to sync config across tabs:', error)
        }
      }
    })
  }

  // Watch for auto-save changes
  watch(
    () => config.value.autoSave,
    newValue => {
      if (newValue) {
        saveConfig()
      }
    }
  )

  // Initialize method that coordinates with preset store
  async function initialize() {
    console.log('🎨 Initializing Theme System...')

    // Load saved configuration
    loadSavedConfig()

    // Initialize preset store
    const presetStore = useThemePresetStore()
    await presetStore.initialize()

    console.log('✅ Theme system initialized')
  }

  return {
    // State
    config,

    // Getters
    isDarkMode: () => config.value.darkMode,
    isAutoSave: () => config.value.autoSave,
    isSyncEnabled: () => config.value.syncAcrossTabs,

    // Actions
    initialize,
    toggleDarkMode,
    setDarkMode,
    setActivePresetId,
    setBaseTheme,
    loadSavedConfig,
    saveConfig,
    resetConfig,
  }
})
