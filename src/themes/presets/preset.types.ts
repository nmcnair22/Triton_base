export type BaseTheme = 'Material' | 'Aura' | 'Lara' | 'Nora'

// Enhanced token types for the advanced system
export type TokenCategory = 'primitive' | 'semantic' | 'component' | 'custom'
export type TokenType = 'color' | 'size' | 'spacing' | 'borderRadius' | 'shadow' | 'typography'

// Advanced design token interface
export interface DesignToken {
  id: string
  label: string
  category: TokenCategory
  subcategory?: string // e.g., 'button', 'datatable' for component tokens
  path: string // dot notation path e.g., 'button.background.hover'
  value: any
  type: TokenType
  defaultValue: any
  description?: string
  affects?: string[] // which components use this token
  dependencies?: string[] // tokens that depend on this one
  validation?: TokenValidation
  metadata?: {
    added?: string
    deprecated?: boolean
    experimental?: boolean
  }
}

export interface TokenValidation {
  min?: number
  max?: number
  pattern?: RegExp
  allowedValues?: any[]
  validator?: (value: any) => boolean | string
  required?: boolean
}

export interface TokenRelationship {
  parent: string
  children: string[]
  affects: string[]
}

// Legacy ColorToken interface for backward compatibility
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

// Component-specific token override
export interface ComponentTokenOverride {
  component: string
  tokens: Record<string, any>
}

export interface ThemePreset {
  id: string
  name: string
  description?: string
  baseTheme: BaseTheme
  
  // Legacy support
  colorOverrides: ColorOverride[]
  overrides?: Record<string, any>
  
  // New hierarchical token structure (flexible for import/export)
  tokens?: Record<string, any> | {
    primitive: Record<string, DesignToken>
    semantic: Record<string, DesignToken>
    component: Record<string, Record<string, DesignToken>> // nested by component
    custom: Record<string, DesignToken>
  }
  componentOverrides?: Record<string, ComponentTokenOverride>
  
  // Additional properties for export/import
  tags?: string[]
  isDefault?: boolean
  isBuiltIn?: boolean
  createdAt?: string
  updatedAt?: string
  
  // Legacy metadata structure (required for backward compatibility)
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

// Advanced theme system types
export interface TokenChange {
  id: string
  tokenId: string
  tokenLabel: string
  oldValue: any
  newValue: any
  timestamp: number
  component?: string
  color?: string // for visual representation in history
}

export interface TokenGroup {
  id: string
  label: string
  tokens: DesignToken[]
  editCount: number
  expanded?: boolean
}

export interface ComponentTokenMap {
  component: string
  tokens: DesignToken[]
  categories: Record<string, DesignToken[]>
}

// Export format options
export type ExportFormat = 'package' | 'shareable' | 'primevue'

export interface ExportOptions {
  format?: ExportFormat
  includeMetadata?: boolean
  includeDocumentation?: boolean
  minify?: boolean
  primevue?: {
    includeTypeDefinitions?: boolean
    includeDocumentation?: boolean
    componentSeparation?: boolean
    minified?: boolean
  }
  package?: {
    packageName: string
    version?: string
    description?: string
    author?: string
    license?: string
    includeExample?: boolean
    includeTests?: boolean
  }
  shareable?: {
    includeMetadata?: boolean
    includeHistory?: boolean
    compressed?: boolean
  }
}

export interface ExportResult {
  success: boolean
  format: ExportFormat
  filename?: string
  size?: number
  timestamp: string
  error?: string
  packageName?: string
  version?: string
}

// Import types
export interface ImportOptions {
  previewOnly?: boolean
  resolveConflicts?: boolean
  conflictResolution?: 'skip' | 'replace' | 'merge'
  createBackup?: boolean
}

export interface ImportResult {
  success: boolean
  preset?: ThemePreset
  importedTokens?: number
  conflicts?: ImportConflict[]
  preview?: ImportPreview
  errors?: string[]
  warnings?: string[]
  message?: string
  timestamp: string
}

export interface ImportPreview {
  preset: Partial<ThemePreset>
  tokenCount: number
  conflicts: number
  newTokens: number
  categories: string[]
  components: string[]
  format: ExportFormat
}

export interface ImportConflict {
  type: 'token' | 'preset'
  path: string
  existing: {
    value: any
    type?: string
  }
  incoming: {
    value: any
    type?: string
  }
  recommended: 'skip' | 'replace' | 'merge'
}

// View modes for the advanced UI
export type ViewMode = 'sidebar' | 'split' | 'preview' | 'compact' | 'expanded'
export type EditorContext = 'global' | 'component'
