/**
 * Advanced Theme Store
 * Manages the new token infrastructure and advanced features
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { TokenRegistry, TokenMigration, themeExporter, themeImporter } from '@/themes/core'
import type {
  DesignToken,
  TokenChange,
  ViewMode,
  ComponentTokenMap,
  TokenGroup,
  ExportFormat,
  ExportOptions,
  ExportResult,
  ImportOptions,
  ImportResult,
  ThemePreset
} from '@/themes/presets/preset.types'

export const useThemeAdvancedStore = defineStore('theme-advanced', () => {
  // State
  const tokenRegistry = TokenRegistry.getInstance()
  const discoveredTokens = ref(new Map<string, DesignToken[]>())
  const componentOverrides = ref(new Map<string, any>())
  const tokenChangeHistory = ref<TokenChange[]>([])
  const viewMode = ref<ViewMode>('sidebar')
  const activeComponent = ref<string | null>(null)
  const selectedTokenGroup = ref<string | null>(null)
  
  // Performance optimization
  const tokenCache = ref(new Map<string, any>())
  const debouncedUpdates = ref(new Map<string, any>())
  
  // Computed
  const hasDiscoveredTokens = computed(() => discoveredTokens.value.size > 0)
  
  const componentList = computed(() => {
    return Array.from(discoveredTokens.value.keys())
      .filter(key => key !== 'primitive' && key !== 'semantic' && key !== 'custom')
      .sort()
  })
  
  const modifiedTokenCount = computed(() => {
    // Count tokens that have been modified from their default values
    return tokenChangeHistory.value.filter(change => {
      const token = tokenRegistry.getToken(change.tokenId)
      return token && change.newValue !== token.defaultValue
    }).length
  })
  
  const hasUnsavedChanges = computed(() => modifiedTokenCount.value > 0)
  
  const globalTokenGroups = computed((): TokenGroup[] => {
    const groups: TokenGroup[] = []
    
    // Primitive tokens
    const primitiveTokens = tokenRegistry.getTokensByCategory('primitive')
    if (primitiveTokens.length > 0) {
      groups.push({
        id: 'primitive',
        label: 'Primitive Tokens',
        tokens: primitiveTokens,
        editCount: countEditedTokens(primitiveTokens)
      })
    }
    
    // Semantic tokens
    const semanticTokens = tokenRegistry.getTokensByCategory('semantic')
    if (semanticTokens.length > 0) {
      groups.push({
        id: 'semantic',
        label: 'Semantic Tokens',
        tokens: semanticTokens,
        editCount: countEditedTokens(semanticTokens)
      })
    }
    
    // Custom tokens
    const customTokens = tokenRegistry.getTokensByCategory('custom')
    if (customTokens.length > 0) {
      groups.push({
        id: 'custom',
        label: 'Custom Tokens',
        tokens: customTokens,
        editCount: countEditedTokens(customTokens)
      })
    }
    
    return groups
  })
  
  const activeComponentTokens = computed(() => {
    if (!activeComponent.value) return []
    return tokenRegistry.getTokensByComponent(activeComponent.value)
  })
  
  const changeHistoryByComponent = computed(() => {
    const grouped = new Map<string, TokenChange[]>()
    
    tokenChangeHistory.value.forEach(change => {
      const component = change.component || 'global'
      if (!grouped.has(component)) {
        grouped.set(component, [])
      }
      grouped.get(component)!.push(change)
    })
    
    return grouped
  })
  
  // Actions
  function setDiscoveredTokens(tokens: Map<string, DesignToken[]>) {
    discoveredTokens.value = tokens
    
    // Register all tokens with the registry
    tokens.forEach((tokenList, component) => {
      tokenRegistry.registerBatch(tokenList)
    })
  }
  
  function setViewMode(mode: ViewMode) {
    viewMode.value = mode
  }
  
  function selectComponent(component: string | null) {
    activeComponent.value = component
    if (component) {
      selectedTokenGroup.value = null
    }
  }
  
  function selectTokenGroup(group: string | null) {
    selectedTokenGroup.value = group
    if (group) {
      activeComponent.value = null
    }
  }
  
  async function updateTokenWithTracking(tokenId: string, value: any) {
    const token = tokenRegistry.getToken(tokenId)
    if (!token) return
    
    const oldValue = token.value
    
    // Validate new value
    const validation = tokenRegistry.validateTokenValue(tokenId, value)
    if (validation !== true) {
      throw new Error(validation as string)
    }
    
    // Add to history
    const change: TokenChange = {
      id: `change-${Date.now()}`,
      tokenId,
      tokenLabel: token.label,
      oldValue,
      newValue: value,
      timestamp: Date.now(),
      component: activeComponent.value || undefined,
      color: token.type === 'color' ? value : undefined
    }
    
    tokenChangeHistory.value.push(change)
    
    // Limit history size
    if (tokenChangeHistory.value.length > 100) {
      tokenChangeHistory.value = tokenChangeHistory.value.slice(-100)
    }
    
    // Update the token
    tokenRegistry.updateTokenValue(tokenId, value)
    
    // Update cache
    tokenCache.value.set(tokenId, value)
    
    // Notify dependent tokens
    const dependents = tokenRegistry.getDependentTokens(tokenId)
    for (const dependent of dependents) {
      await updateDependentToken(dependent.id, tokenId, value)
    }
  }
  
  async function updateDependentToken(
    dependentId: string, 
    parentId: string, 
    parentValue: any
  ) {
    const dependent = tokenRegistry.getToken(dependentId)
    if (!dependent) return
    
    // Handle token references
    if (typeof dependent.value === 'string' && dependent.value.includes(`{${parentId}}`)) {
      const newValue = dependent.value.replace(`{${parentId}}`, parentValue)
      await updateTokenWithTracking(dependentId, newValue)
    }
  }
  
  function revertToChange(changeId: string) {
    const change = tokenChangeHistory.value.find(c => c.id === changeId)
    if (!change) return
    
    // Revert the token value
    tokenRegistry.updateTokenValue(change.tokenId, change.oldValue)
    
    // Remove this and all subsequent changes
    const changeIndex = tokenChangeHistory.value.findIndex(c => c.id === changeId)
    tokenChangeHistory.value = tokenChangeHistory.value.slice(0, changeIndex)
  }
  
  function clearHistory() {
    tokenChangeHistory.value = []
  }
  
  function getTokenStats() {
    return tokenRegistry.getStats()
  }
  
  function searchTokens(query: string) {
    return tokenRegistry.searchTokens(query)
  }
  
  function countEditedTokens(tokens: DesignToken[]): number {
    return tokens.filter(token => {
      const change = tokenChangeHistory.value.find(c => c.tokenId === token.id)
      return change && change.newValue !== token.defaultValue
    }).length
  }
  
  // Performance helpers
  function getCachedTokenValue(tokenId: string): any {
    if (tokenCache.value.has(tokenId)) {
      return tokenCache.value.get(tokenId)
    }
    
    const token = tokenRegistry.getToken(tokenId)
    if (token) {
      tokenCache.value.set(tokenId, token.value)
      return token.value
    }
    
    return null
  }
  
  function clearCache() {
    tokenCache.value.clear()
  }
  
  // Refresh tokens by clearing registry and re-discovering
  async function refreshTokens() {
    tokenRegistry.clear()
    tokenCache.value.clear()
    const { TokenDiscovery } = await import('@/themes/core')
    const tokens = await TokenDiscovery.discoverAllTokens()
    setDiscoveredTokens(tokens)
  }
  
  // Export current state
  function exportTokenState() {
    return {
      registry: tokenRegistry.export(),
      history: tokenChangeHistory.value,
      overrides: Array.from(componentOverrides.value.entries())
    }
  }
  
  // Import state
  function importTokenState(state: any) {
    if (state.registry) {
      tokenRegistry.import(state.registry)
    }
    
    if (state.history) {
      tokenChangeHistory.value = state.history
    }
    
    if (state.overrides) {
      componentOverrides.value = new Map(state.overrides)
    }
  }
  
  // Additional methods for ThemeConfiguratorAdvanced
  function updateToken(tokenId: string, value: any) {
    return updateTokenWithTracking(tokenId, value)
  }
  
  function resetToken(tokenId: string) {
    const token = tokenRegistry.getToken(tokenId)
    if (!token) return
    
    return updateTokenWithTracking(tokenId, token.defaultValue)
  }
  
  function resetAllChanges() {
    // Reset all tokens to their default values
    tokenChangeHistory.value.forEach(change => {
      const token = tokenRegistry.getToken(change.tokenId)
      if (token) {
        tokenRegistry.updateTokenValue(token.id, token.defaultValue)
      }
    })
    
    // Clear history and cache
    clearHistory()
    clearCache()
  }
  
  function applyChanges() {
    // This would apply the changes to the actual theme
    // For now, we'll just log the changes
    console.log('Applying changes:', {
      modifiedCount: modifiedTokenCount.value,
      changes: tokenChangeHistory.value
    })
    
    // In a real implementation, this would:
    // 1. Generate the theme object with all modifications
    // 2. Apply it to PrimeVue
    // 3. Save to localStorage or backend
  }
  
  function isTokenModified(tokenId: string): boolean {
    const token = tokenRegistry.getToken(tokenId)
    if (!token) return false
    
    const lastChange = tokenChangeHistory.value
      .filter(c => c.tokenId === tokenId)
      .pop()
    
    return lastChange ? lastChange.newValue !== token.defaultValue : false
  }
  
  function getTokenValue(tokenId: string): any {
    // Check cache first
    if (tokenCache.value.has(tokenId)) {
      return tokenCache.value.get(tokenId)
    }
    
    // Check change history for latest value
    const lastChange = tokenChangeHistory.value
      .filter(c => c.tokenId === tokenId)
      .pop()
    
    if (lastChange) {
      return lastChange.newValue
    }
    
    // Fall back to registry value
    const token = tokenRegistry.getToken(tokenId)
    return token?.value
  }

  // Export/Import Methods
  async function exportTheme(
    preset: ThemePreset,
    format: ExportFormat,
    options?: ExportOptions
  ): Promise<ExportResult> {
    return await themeExporter.exportTheme(preset, format, options)
  }

  async function importTheme(
    source: File | string | object,
    options?: ImportOptions
  ): Promise<ImportResult> {
    const result = await themeImporter.importTheme(source, options)
    
    if (result.success && result.preset && !options?.previewOnly) {
      // Update the store with imported data if successful
      // This could trigger UI updates to show the new theme
      clearCache()
      console.log('Theme imported successfully:', {
        preset: result.preset.name,
        tokensImported: result.importedTokens,
        conflicts: result.conflicts?.length || 0
      })
    }
    
    return result
  }

  async function validateImport(source: File | string | object) {
    return await themeImporter.validateImport(source)
  }

  function createThemePresetFromCurrentState(): ThemePreset {
    const now = new Date().toISOString()
    
    // Create a preset from current token modifications
    const preset: ThemePreset = {
      id: `custom_${Date.now()}`,
      name: 'Custom Theme',
      description: 'Theme created from current modifications',
      baseTheme: 'Aura',
      colorOverrides: [],
      isDefault: false,
      isBuiltIn: false,
      tags: ['custom', 'generated'],
      overrides: {},
      tokens: {} as Record<string, any>,
      createdAt: now,
      updatedAt: now,
      metadata: {
        created: now,
        modified: now,
        version: '1.0.0',
        isDefault: false,
        isBuiltIn: false,
        tags: ['custom', 'generated']
      }
    }

    // Add modified tokens to the preset
    tokenChangeHistory.value.forEach(change => {
      (preset.tokens as Record<string, any>)[change.tokenId] = change.newValue
    })

    return preset
  }
  
  return {
    // State
    discoveredTokens,
    componentOverrides,
    tokenChangeHistory,
    viewMode,
    activeComponent,
    selectedTokenGroup,
    
    // Computed
    hasDiscoveredTokens,
    componentList,
    globalTokenGroups,
    activeComponentTokens,
    changeHistoryByComponent,
    modifiedTokenCount,
    hasUnsavedChanges,
    
    // Actions
    setDiscoveredTokens,
    setViewMode,
    selectComponent,
    selectTokenGroup,
    updateTokenWithTracking,
    updateToken,
    resetToken,
    resetAllChanges,
    applyChanges,
    isTokenModified,
    getTokenValue,
    revertToChange,
    clearHistory,
    getTokenStats,
    searchTokens,
    getCachedTokenValue,
    clearCache,
    refreshTokens,
    exportTokenState,
    importTokenState,
    
    // Export/Import methods
    exportTheme,
    importTheme,
    validateImport,
    createThemePresetFromCurrentState,
    
    // Direct registry access
    tokenRegistry
  }
})