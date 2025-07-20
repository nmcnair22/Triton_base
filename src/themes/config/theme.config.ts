import type { BaseTheme, ColorToken, ThemeConfig } from '../presets/preset.types'

// All editable color tokens in your theme system
export const editableColorTokens: ColorToken[] = [
  // Brand Colors (Primary brand identity)
  { 
    id: 'primary', 
    label: 'Primary (Navy)', 
    category: 'brand',
    description: 'Main brand color used for primary actions and CTA buttons',
    cssVariable: '--p-primary-color',
    defaultValue: '#0B2244'
  },
  { 
    id: 'secondary', 
    label: 'Secondary (Accent Blue)', 
    category: 'brand',
    description: 'Accent color for secondary elements and information',
    cssVariable: '--p-secondary-color',
    defaultValue: '#297FB7'
  },
  
  // Status Colors (Semantic meaning)
  { 
    id: 'success', 
    label: 'Success', 
    category: 'status',
    description: 'Success states, confirmations, and positive actions',
    cssVariable: '--p-success-color',
    defaultValue: '#10B981'
  },
  { 
    id: 'info', 
    label: 'Info', 
    category: 'status',
    description: 'Informational messages and neutral states',
    cssVariable: '--p-info-color',
    defaultValue: '#297FB7'
  },
  { 
    id: 'warning', 
    label: 'Warning', 
    category: 'status',
    description: 'Warning states, alerts, and caution messages',
    cssVariable: '--p-warning-color',
    defaultValue: '#FFB400'
  },
  { 
    id: 'danger', 
    label: 'Danger/Emergency', 
    category: 'status',
    description: 'Error states, destructive actions, and critical alerts',
    cssVariable: '--p-danger-color',
    defaultValue: '#F60D03'
  },
  
  // Surface Colors (Backgrounds and containers)
  { 
    id: 'surface-0', 
    label: 'Surface 0 (Background)', 
    category: 'surface',
    description: 'Main background color - lightest surface',
    cssVariable: '--p-surface-0',
    defaultValue: '#ffffff'
  },
  { 
    id: 'surface-50', 
    label: 'Surface 50', 
    category: 'surface',
    description: 'Very light surface for subtle backgrounds',
    cssVariable: '--p-surface-50',
    defaultValue: '#fafafa'
  },
  { 
    id: 'surface-100', 
    label: 'Surface 100', 
    category: 'surface',
    description: 'Light surface for card backgrounds',
    cssVariable: '--p-surface-100',
    defaultValue: '#f5f5f5'
  },
  { 
    id: 'surface-200', 
    label: 'Surface 200', 
    category: 'surface',
    description: 'Medium-light surface for elevated components',
    cssVariable: '--p-surface-200',
    defaultValue: '#e5e5e5'
  },
  { 
    id: 'surface-300', 
    label: 'Surface 300', 
    category: 'surface',
    description: 'Medium surface for borders and dividers',
    cssVariable: '--p-surface-300',
    defaultValue: '#d4d4d4'
  },
  { 
    id: 'surface-400', 
    label: 'Surface 400', 
    category: 'surface',
    description: 'Medium-dark surface for disabled states',
    cssVariable: '--p-surface-400',
    defaultValue: '#a3a3a3'
  },
  { 
    id: 'surface-500', 
    label: 'Surface 500', 
    category: 'surface',
    description: 'Balanced surface for neutral elements',
    cssVariable: '--p-surface-500',
    defaultValue: '#737373'
  },
  { 
    id: 'surface-600', 
    label: 'Surface 600', 
    category: 'surface',
    description: 'Dark surface for secondary text',
    cssVariable: '--p-surface-600',
    defaultValue: '#525252'
  },
  { 
    id: 'surface-700', 
    label: 'Surface 700', 
    category: 'surface',
    description: 'Very dark surface for headings',
    cssVariable: '--p-surface-700',
    defaultValue: '#404040'
  },
  { 
    id: 'surface-800', 
    label: 'Surface 800', 
    category: 'surface',
    description: 'Nearly black surface for dark mode backgrounds',
    cssVariable: '--p-surface-800',
    defaultValue: '#262626'
  },
  { 
    id: 'surface-900', 
    label: 'Surface 900', 
    category: 'surface',
    description: 'Very dark surface for maximum contrast',
    cssVariable: '--p-surface-900',
    defaultValue: '#171717'
  },
  { 
    id: 'surface-950', 
    label: 'Surface 950', 
    category: 'surface',
    description: 'Darkest surface for deep backgrounds',
    cssVariable: '--p-surface-950',
    defaultValue: '#0a0a0a'
  },
  
  // Text Colors (Typography)
  { 
    id: 'text-color', 
    label: 'Primary Text', 
    category: 'text',
    description: 'Primary text color for body content',
    cssVariable: '--p-text-color',
    defaultValue: '#374151'
  },
  { 
    id: 'text-muted', 
    label: 'Muted Text', 
    category: 'text',
    description: 'Secondary text color for less important content',
    cssVariable: '--p-text-muted-color',
    defaultValue: '#6B7280'
  },
  { 
    id: 'text-hover', 
    label: 'Hover Text', 
    category: 'text',
    description: 'Text color on hover states',
    cssVariable: '--p-text-hover-color',
    defaultValue: '#1F2937'
  },
  
  // Interaction Colors (UI feedback)
  { 
    id: 'focus-ring', 
    label: 'Focus Ring', 
    category: 'interaction',
    description: 'Focus indicator color for accessibility',
    cssVariable: '--p-focus-ring-color',
    defaultValue: '#297FB7'
  },
  { 
    id: 'border-color', 
    label: 'Border', 
    category: 'interaction',
    description: 'Default border color for inputs and components',
    cssVariable: '--p-border-color',
    defaultValue: '#E5E7EB'
  },
  { 
    id: 'border-hover', 
    label: 'Border Hover', 
    category: 'interaction',
    description: 'Border color on hover states',
    cssVariable: '--p-border-hover-color',
    defaultValue: '#D1D5DB'
  },
  { 
    id: 'highlight-bg', 
    label: 'Highlight Background', 
    category: 'interaction',
    description: 'Background color for selections and highlights',
    cssVariable: '--p-highlight-bg',
    defaultValue: '#EBF4FF'
  },
  { 
    id: 'overlay-bg', 
    label: 'Overlay Background', 
    category: 'interaction',
    description: 'Background color for modals and overlays',
    cssVariable: '--p-overlay-bg',
    defaultValue: 'rgba(0, 0, 0, 0.4)'
  }
]

// Default theme configuration
export const defaultThemeConfig: ThemeConfig = {
  activePresetId: 'triton-default',
  baseTheme: 'Material',
  darkMode: false,
  autoSave: true,
  syncAcrossTabs: true,
  smoothTransitions: true,
  storageKey: 'triton-theme-config',
  maxSavedPresets: 20
}

// Color categories for organizing the UI
export const colorCategories = [
  { id: 'brand', label: 'Brand Colors', description: 'Primary brand identity colors' },
  { id: 'status', label: 'Status Colors', description: 'Semantic colors for feedback' },
  { id: 'surface', label: 'Surface Colors', description: 'Background and container colors' },
  { id: 'text', label: 'Typography', description: 'Text and content colors' },
  { id: 'interaction', label: 'Interaction', description: 'UI feedback and interaction colors' }
] as const

// Available base themes
export const baseThemes: BaseTheme[] = ['Material', 'Aura', 'Lara', 'Nora']

// Helper function to get tokens by category
export function getTokensByCategory(category: string): ColorToken[] {
  return editableColorTokens.filter(token => token.category === category)
}

// Helper function to find token by ID
export function getTokenById(id: string): ColorToken | undefined {
  return editableColorTokens.find(token => token.id === id)
} 