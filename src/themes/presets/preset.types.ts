export type BaseTheme = 'Material' | 'Aura' | 'Lara' | 'Nora'

export interface ColorToken {
  id: string
  label: string
  category: 'brand' | 'status' | 'surface' | 'text' | 'interaction'
  description?: string
  cssVariable: string
  defaultValue: string
}

export interface ColorOverride {
  tokenId: string
  value: string
  // Full palette generated from the value for brand/status colors
  palette?: Record<number, string>
}

export interface ThemePreset {
  id: string
  name: string
  description?: string
  baseTheme: BaseTheme
  colorOverrides: ColorOverride[]
  metadata: {
    created: string
    modified: string
    author?: string
    version: string
    tags?: string[]
    isDefault?: boolean
    isBuiltIn?: boolean
  }
}

export interface PresetExport {
  preset: ThemePreset
  exportDate: string
  appVersion: string
}

export interface ThemeConfig {
  // Active theme settings
  activePresetId: string
  baseTheme: BaseTheme
  darkMode: boolean

  // User preferences
  autoSave: boolean
  syncAcrossTabs: boolean
  smoothTransitions: boolean

  // Storage settings
  storageKey: string
  maxSavedPresets: number
}

export interface ThemeState {
  configSidebarVisible: boolean
  isDirty: boolean
  isLoading: boolean
}
