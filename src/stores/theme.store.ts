import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { ThemePreset, BaseTheme, ColorOverride, ThemeConfig, ThemeState } from '@/themes/presets/preset.types'
import { defaultThemeConfig, editableColorTokens } from '@/themes/config/theme.config'
import { PresetManager } from '@/themes/presets/preset-manager'
import { ThemeValidator } from '@/themes/utils/validation'

export const useThemeStore = defineStore('theme', () => {
  // State
  const config = ref<ThemeConfig>({ ...defaultThemeConfig })
  const state = ref<ThemeState>({
    configSidebarVisible: false,
    isDirty: false,
    isLoading: false
  })
  
  // Core theme data
  const presets = ref<ThemePreset[]>([])
  const activePreset = ref<ThemePreset | null>(null)
  
  // Temporary editing state (for real-time preview)
  const editingPreset = ref<ThemePreset | null>(null)
  const editingColors = ref<ColorOverride[]>([])
  
  // Services
  const presetManager = new PresetManager()
  
  // Computed
  const availablePresets = computed(() => presets.value)
  const userPresets = computed(() => presets.value.filter(p => !p.metadata.isBuiltIn))
  const builtInPresets = computed(() => presets.value.filter(p => p.metadata.isBuiltIn))
  const canSave = computed(() => state.value.isDirty && editingPreset.value && !editingPreset.value.metadata.isBuiltIn)
  const isConfigOpen = computed(() => state.value.configSidebarVisible)
  
  // Core Actions
  
  /**
   * Initialize the theme system
   */
  async function initialize() {
    console.log('🎨 Initializing Triton Theme System...')
    
    try {
      state.value.isLoading = true
      
      // Load saved configuration from localStorage
      loadSavedConfig()
      
             // Load built-in presets
       const builtInPresets = await presetManager.loadBuiltInPresets()
       presets.value.push(...builtInPresets)
       
       // Load user presets
       const userPresets = await presetManager.loadUserPresets()
       presets.value.push(...userPresets)
      
      // Set active preset
      const savedPresetId = config.value.activePresetId
      const preset = presets.value.find(p => p.id === savedPresetId) || presets.value.find(p => p.metadata.isDefault)
      
      if (preset) {
        await activatePreset(preset)
      }
      
      console.log('✅ Theme system initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize theme system:', error)
    } finally {
      state.value.isLoading = false
    }
  }
  
  /**
   * Activate a theme preset
   */
  async function activatePreset(preset: ThemePreset) {
    console.log(`🎯 Activating preset: ${preset.name}`)
    
    activePreset.value = preset
    editingPreset.value = { ...preset }
    editingColors.value = [...preset.colorOverrides]
    config.value.activePresetId = preset.id
    config.value.baseTheme = preset.baseTheme
    
    // Apply theme changes (will be enhanced in Phase 3)
    await applyTheme()
    
    // Save configuration
    if (config.value.autoSave) {
      saveConfig()
    }
    
    state.value.isDirty = false
  }
  
  /**
   * Update a color token value with palette generation
   */
  async function updateColor(tokenId: string, value: string) {
    console.log(`🎨 Updating color token: ${tokenId} = ${value}`)
    
    const existing = editingColors.value.find(c => c.tokenId === tokenId)
    
    if (existing) {
      existing.value = value
      // Generate palette for brand/status colors
      if (shouldHavePalette(tokenId)) {
        try {
          const { palette } = await import('@primeuix/themes')
          existing.palette = palette(value)
        } catch (error) {
          console.warn('Failed to generate palette:', error)
        }
      }
    } else {
      const newOverride: ColorOverride = {
        tokenId,
        value
      }
      
      // Generate palette for brand/status colors
      if (shouldHavePalette(tokenId)) {
        try {
          const { palette } = await import('@primeuix/themes')
          newOverride.palette = palette(value)
        } catch (error) {
          console.warn('Failed to generate palette:', error)
        }
      }
      
      editingColors.value.push(newOverride)
    }
    
    state.value.isDirty = true
    
    // Apply in real-time if auto-save is enabled
    if (config.value.autoSave) {
      await applyTheme()
    }
  }
  
  /**
   * Check if a token should have a palette
   */
  function shouldHavePalette(tokenId: string): boolean {
    const paletteTokens = ['primary', 'secondary', 'success', 'info', 'warning', 'danger']
    return paletteTokens.includes(tokenId)
  }
  
  /**
   * Apply current theme configuration
   */
  async function applyTheme() {
    if (!editingPreset.value) return
    
    console.log('🔄 Applying theme changes...')
    
    try {
      // Theme application logic will be implemented in Phase 3
      // For now, just log the changes
      console.log('Applied color overrides:', editingColors.value)
      
      // Apply dark mode
      applyDarkMode(config.value.darkMode)
      
    } catch (error) {
      console.error('❌ Failed to apply theme:', error)
    }
  }
  
  /**
   * Toggle dark mode
   */
  function toggleDarkMode() {
    config.value.darkMode = !config.value.darkMode
    applyDarkMode(config.value.darkMode)
    saveConfig()
  }
  
  /**
   * Toggle configuration sidebar
   */
  function toggleConfig() {
    console.log('🎯 toggleConfig called, current state:', state.value.configSidebarVisible)
    state.value.configSidebarVisible = !state.value.configSidebarVisible
    console.log('🎯 toggleConfig new state:', state.value.configSidebarVisible)
  }

  function setConfigVisible(visible: boolean) {
    console.log('🎯 setConfigVisible called', { visible, currentState: state.value.configSidebarVisible })
    state.value.configSidebarVisible = visible
  }
  
  /**
   * Get current value for a color token
   */
  function getTokenValue(tokenId: string): string {
    // Check editing colors first
    const override = editingColors.value.find(c => c.tokenId === tokenId)
    if (override) return override.value
    
    // Check active preset
    if (activePreset.value) {
      const presetOverride = activePreset.value.colorOverrides.find(c => c.tokenId === tokenId)
      if (presetOverride) return presetOverride.value
    }
    
    // Return default value
    const token = editableColorTokens.find(t => t.id === tokenId)
    return token?.defaultValue || '#000000'
  }
  
  // Helper Functions
  
  /**
   * Apply dark mode to the document
   */
  function applyDarkMode(isDark: boolean) {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
  
  /**
   * Load saved configuration from localStorage
   */
  function loadSavedConfig() {
    try {
      const saved = localStorage.getItem(config.value.storageKey)
      if (saved) {
        const parsedConfig = JSON.parse(saved)
        config.value = { ...config.value, ...parsedConfig }
      }
    } catch (error) {
      console.warn('Failed to load saved config:', error)
    }
  }
  
  /**
   * Save current configuration to localStorage
   */
  function saveConfig() {
    try {
      const configToSave = {
        activePresetId: config.value.activePresetId,
        baseTheme: config.value.baseTheme,
        darkMode: config.value.darkMode,
        autoSave: config.value.autoSave,
        syncAcrossTabs: config.value.syncAcrossTabs,
        smoothTransitions: config.value.smoothTransitions
      }
      localStorage.setItem(config.value.storageKey, JSON.stringify(configToSave))
    } catch (error) {
      console.warn('Failed to save config:', error)
    }
  }
  
  /**
   * Save current preset as a new user preset
   */
  async function saveAsNewPreset(name: string, description?: string) {
    if (!editingPreset.value) return
    
    console.log(`💾 Saving new preset: ${name}`)
    
    const newPreset: ThemePreset = {
      id: `user-${Date.now()}`,
      name,
      description,
      baseTheme: editingPreset.value.baseTheme,
      colorOverrides: [...editingColors.value],
      metadata: {
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        author: 'User',
        version: '1.0.0',
        isBuiltIn: false
      }
    }
    
    // Validate before saving
    const validation = ThemeValidator.validatePreset(newPreset)
    if (!validation.isValid) {
      const errorMsg = `Validation failed: ${validation.errors.join(', ')}`
      console.error(errorMsg)
      throw new Error(errorMsg)
    }
    
    // Save to storage
    await presetManager.saveUserPreset(newPreset)
    
    // Add to list
    presets.value.push(newPreset)
    
    // Activate the new preset
    await activatePreset(newPreset)
    
    console.log(`✅ New preset saved: ${name}`)
    return newPreset
  }
  
  /**
   * Update current preset (if it's a user preset)
   */
  async function updateCurrentPreset() {
    if (!editingPreset.value || editingPreset.value.metadata.isBuiltIn) {
      console.warn('Cannot update built-in preset')
      return
    }
    
    console.log(`💾 Updating preset: ${editingPreset.value.name}`)
    
    const updated: ThemePreset = {
      ...editingPreset.value,
      colorOverrides: [...editingColors.value],
      metadata: {
        ...editingPreset.value.metadata,
        modified: new Date().toISOString()
      }
    }
    
    // Validate before saving
    const validation = ThemeValidator.validatePreset(updated)
    if (!validation.isValid) {
      const errorMsg = `Validation failed: ${validation.errors.join(', ')}`
      console.error(errorMsg)
      throw new Error(errorMsg)
    }
    
    // Update in storage
    await presetManager.saveUserPreset(updated)
    
    // Update in list
    const index = presets.value.findIndex(p => p.id === updated.id)
    if (index >= 0) {
      presets.value[index] = updated
    }
    
    // Update active preset
    activePreset.value = updated
    editingPreset.value = { ...updated }
    
    state.value.isDirty = false
    console.log(`✅ Preset updated: ${updated.name}`)
  }
  
  /**
   * Delete a user preset
   */
  async function deletePreset(presetId: string) {
    console.log(`🗑️ Deleting preset: ${presetId}`)
    
    const preset = presets.value.find(p => p.id === presetId)
    if (!preset) {
      throw new Error(`Preset with ID ${presetId} not found`)
    }
    
    if (preset.metadata.isBuiltIn) {
      throw new Error('Cannot delete built-in presets')
    }
    
    // Delete from storage
    await presetManager.deleteUserPreset(presetId)
    
    // Remove from list
    presets.value = presets.value.filter(p => p.id !== presetId)
    
    // If it was active, switch to default
    if (activePreset.value?.id === presetId) {
      const defaultPreset = presets.value.find(p => p.metadata.isDefault)
      if (defaultPreset) {
        await activatePreset(defaultPreset)
      }
    }
    
    console.log(`✅ Preset deleted: ${preset.name}`)
  }
  
  /**
   * Duplicate an existing preset
   */
  async function duplicatePreset(presetId: string, newName: string) {
    console.log(`📋 Duplicating preset: ${presetId} -> ${newName}`)
    
    const preset = presets.value.find(p => p.id === presetId)
    if (!preset) {
      throw new Error(`Preset with ID ${presetId} not found`)
    }
    
    const duplicated = await presetManager.duplicatePreset(preset, newName)
    presets.value.push(duplicated)
    
    console.log(`✅ Preset duplicated: ${newName}`)
    return duplicated
  }
  
  /**
   * Export a preset as JSON file
   */
  async function exportPreset(presetId: string) {
    console.log(`📤 Exporting preset: ${presetId}`)
    
    const preset = presets.value.find(p => p.id === presetId)
    if (!preset) {
      throw new Error(`Preset with ID ${presetId} not found`)
    }
    
    const blob = await presetManager.exportPreset(preset)
    
    // Create download link
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${preset.name.toLowerCase().replace(/\s+/g, '-')}-theme.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    console.log(`✅ Preset exported: ${preset.name}`)
  }
  
  /**
   * Import a preset from JSON file
   */
  async function importPreset(file: File) {
    console.log(`📥 Importing preset from: ${file.name}`)
    
    // Validate file first
    const fileValidation = ThemeValidator.validateImportFile(file)
    if (!fileValidation.isValid) {
      const errorMsg = `File validation failed: ${fileValidation.errors.join(', ')}`
      console.error(errorMsg)
      throw new Error(errorMsg)
    }
    
    const imported = await presetManager.importPreset(file)
    presets.value.push(imported)
    
    console.log(`✅ Preset imported: ${imported.name}`)
    return imported
  }

  /**
   * Create a new custom preset
   */
  async function createPreset(name: string, description?: string): Promise<ThemePreset> {
    console.log(`🎨 Creating new preset: ${name}`)
    
    const newPreset: ThemePreset = {
      id: `custom-${Date.now()}`,
      name,
      description,
      baseTheme: config.value.baseTheme,
      colorOverrides: [...editingColors.value],
      metadata: {
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        author: 'User',
        version: '1.0.0',
        tags: [],
        isDefault: false,
        isBuiltIn: false
      }
    }

    await presetManager.saveUserPreset(newPreset)
    presets.value.push(newPreset)
    
    console.log(`✅ Preset created: ${name}`)
    return newPreset
  }

  /**
   * Update an existing preset
   */
  async function updatePreset(preset: ThemePreset): Promise<void> {
    console.log(`✏️ Updating preset: ${preset.name}`)
    
    preset.metadata.modified = new Date().toISOString()
    await presetManager.saveUserPreset(preset)
    
    // Update in local state
    const index = presets.value.findIndex(p => p.id === preset.id)
    if (index !== -1) {
      presets.value[index] = preset
    }
    
    console.log(`✅ Preset updated: ${preset.name}`)
  }
  
  // Cross-tab synchronization
  if (typeof window !== 'undefined' && config.value.syncAcrossTabs) {
    window.addEventListener('storage', (e) => {
      if (e.key === config.value.storageKey && e.newValue) {
        try {
          const newConfig = JSON.parse(e.newValue)
          Object.assign(config.value, newConfig)
          
          // Re-apply theme
          const preset = presets.value.find(p => p.id === config.value.activePresetId)
          if (preset) {
            activatePreset(preset)
          }
        } catch (error) {
          console.warn('Failed to sync config across tabs:', error)
        }
      }
    })
  }
  
      return {
      // State
      config,
      state,
      presets,
      activePreset,
      editingPreset,
      editingColors,
      
      // Computed
      availablePresets,
      userPresets,
      builtInPresets,
      canSave,
      isConfigOpen,
      
      // Actions
      initialize,
      activatePreset,
      updateColor,
      applyTheme,
      toggleDarkMode,
      toggleConfig,
      setConfigVisible,
      getTokenValue,
      
      // Preset Management
      saveAsNewPreset,
      updateCurrentPreset,
      deletePreset,
      duplicatePreset,
      exportPreset,
      importPreset,
      createPreset,
      updatePreset
    }
}) 