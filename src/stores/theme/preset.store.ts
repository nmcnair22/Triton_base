import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ThemePreset, BaseTheme } from '@/themes/presets/preset.types'
import { PresetManager } from '@/themes/presets/preset-manager'
import { ThemeValidator } from '@/themes/utils/validation'
import { useThemeConfigStore } from './config.store'
import { useThemeUIStore } from './ui.store'

export const useThemePresetStore = defineStore('theme-preset', () => {
  // Dependencies
  const configStore = useThemeConfigStore()
  const uiStore = useThemeUIStore()
  
  // State
  const presets = ref<ThemePreset[]>([])
  const activePreset = ref<ThemePreset | null>(null)
  const presetManager = new PresetManager()
  
  // Computed
  const availablePresets = computed(() => presets.value)
  const userPresets = computed(() => presets.value.filter(p => !p.metadata.isBuiltIn))
  const builtInPresets = computed(() => presets.value.filter(p => p.metadata.isBuiltIn))
  const defaultPreset = computed(() => presets.value.find(p => p.metadata.isDefault))
  
  const hasUserPresets = computed(() => userPresets.value.length > 0)
  const activePresetId = computed(() => activePreset.value?.id || '')
  const isActivePresetBuiltIn = computed(() => activePreset.value?.metadata.isBuiltIn || false)
  
  // Actions
  async function initialize() {
    console.log('🎨 Initializing Theme Preset Store...')
    
    try {
      uiStore.setLoading(true)
      
      // Load built-in presets
      const loadedBuiltInPresets = await presetManager.loadBuiltInPresets()
      presets.value.push(...loadedBuiltInPresets)
      
      // Load user presets
      const loadedUserPresets = await presetManager.loadUserPresets()
      presets.value.push(...loadedUserPresets)
      
      console.log(`✅ Loaded ${loadedBuiltInPresets.length} built-in and ${loadedUserPresets.length} user presets`)
      
      // Set initial active preset
      const savedPresetId = configStore.config.activePresetId
      const initialPreset = presets.value.find(p => p.id === savedPresetId) || defaultPreset.value
      
      if (initialPreset) {
        await activatePreset(initialPreset, false) // Don't save during initialization
      }
      
    } catch (error) {
      console.error('❌ Failed to initialize preset store:', error)
      throw error
    } finally {
      uiStore.setLoading(false)
    }
  }
  
  async function activatePreset(preset: ThemePreset, save = true) {
    console.log(`🎯 Activating preset: ${preset.name}`)
    
    activePreset.value = preset
    configStore.setActivePresetId(preset.id)
    configStore.setBaseTheme(preset.baseTheme)
    
    // Apply theme will be handled by editor store
    // This maintains separation of concerns
    
    if (save && configStore.config.autoSave) {
      configStore.saveConfig()
    }
    
    // Reset dirty state when activating a preset
    uiStore.setDirty(false)
  }
  
  async function createPreset(name: string, description?: string, baseTheme?: BaseTheme): Promise<ThemePreset> {
    console.log(`🎨 Creating new preset: ${name}`)
    
    const newPreset: ThemePreset = {
      id: `user-${Date.now()}`,
      name,
      description,
      baseTheme: baseTheme || configStore.config.baseTheme,
      colorOverrides: [], // Will be populated by editor store
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
    
    // Validate
    const validation = ThemeValidator.validatePreset(newPreset)
    if (!validation.isValid) {
      throw new Error(`Preset validation failed: ${validation.errors.join(', ')}`)
    }
    
    // Save to storage
    await presetManager.saveUserPreset(newPreset)
    
    // Add to list
    presets.value.push(newPreset)
    
    console.log(`✅ Preset created: ${name}`)
    return newPreset
  }
  
  async function updatePreset(preset: ThemePreset): Promise<void> {
    if (preset.metadata.isBuiltIn) {
      throw new Error('Cannot update built-in presets')
    }
    
    console.log(`✏️ Updating preset: ${preset.name}`)
    
    // Update metadata
    preset.metadata.modified = new Date().toISOString()
    
    // Validate
    const validation = ThemeValidator.validatePreset(preset)
    if (!validation.isValid) {
      throw new Error(`Preset validation failed: ${validation.errors.join(', ')}`)
    }
    
    // Save to storage
    await presetManager.saveUserPreset(preset)
    
    // Update in local state
    const index = presets.value.findIndex(p => p.id === preset.id)
    if (index !== -1) {
      presets.value[index] = preset
    }
    
    // Update active preset if it's the one being updated
    if (activePreset.value?.id === preset.id) {
      activePreset.value = preset
    }
    
    console.log(`✅ Preset updated: ${preset.name}`)
  }
  
  async function deletePreset(presetId: string): Promise<void> {
    const preset = presets.value.find(p => p.id === presetId)
    if (!preset) {
      throw new Error(`Preset with ID ${presetId} not found`)
    }
    
    if (preset.metadata.isBuiltIn) {
      throw new Error('Cannot delete built-in presets')
    }
    
    console.log(`🗑️ Deleting preset: ${preset.name}`)
    
    // Delete from storage
    await presetManager.deleteUserPreset(presetId)
    
    // Remove from list
    presets.value = presets.value.filter(p => p.id !== presetId)
    
    // If it was active, switch to default
    if (activePreset.value?.id === presetId) {
      const fallbackPreset = defaultPreset.value
      if (fallbackPreset) {
        await activatePreset(fallbackPreset)
      }
    }
    
    console.log(`✅ Preset deleted: ${preset.name}`)
  }
  
  async function duplicatePreset(presetId: string, newName: string): Promise<ThemePreset> {
    const preset = presets.value.find(p => p.id === presetId)
    if (!preset) {
      throw new Error(`Preset with ID ${presetId} not found`)
    }
    
    console.log(`📋 Duplicating preset: ${preset.name} -> ${newName}`)
    
    const duplicated = await presetManager.duplicatePreset(preset, newName)
    presets.value.push(duplicated)
    
    console.log(`✅ Preset duplicated: ${newName}`)
    return duplicated
  }
  
  async function exportPreset(presetId: string): Promise<void> {
    const preset = presets.value.find(p => p.id === presetId)
    if (!preset) {
      throw new Error(`Preset with ID ${presetId} not found`)
    }
    
    console.log(`📤 Exporting preset: ${preset.name}`)
    
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
  
  async function importPreset(file: File): Promise<ThemePreset> {
    console.log(`📥 Importing preset from: ${file.name}`)
    
    // Validate file
    const fileValidation = ThemeValidator.validateImportFile(file)
    if (!fileValidation.isValid) {
      throw new Error(`File validation failed: ${fileValidation.errors.join(', ')}`)
    }
    
    const imported = await presetManager.importPreset(file)
    presets.value.push(imported)
    
    console.log(`✅ Preset imported: ${imported.name}`)
    return imported
  }
  
  function getPresetById(id: string): ThemePreset | undefined {
    return presets.value.find(p => p.id === id)
  }
  
  function searchPresets(query: string): ThemePreset[] {
    const lowerQuery = query.toLowerCase()
    return presets.value.filter(p => 
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description?.toLowerCase().includes(lowerQuery) ||
      p.metadata.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }
  
  return {
    // State
    presets,
    activePreset,
    
    // Computed
    availablePresets,
    userPresets,
    builtInPresets,
    defaultPreset,
    hasUserPresets,
    activePresetId,
    isActivePresetBuiltIn,
    
    // Actions
    initialize,
    activatePreset,
    createPreset,
    updatePreset,
    deletePreset,
    duplicatePreset,
    exportPreset,
    importPreset,
    getPresetById,
    searchPresets
  }
})