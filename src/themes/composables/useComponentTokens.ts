/**
 * Composable for accessing component-specific tokens
 */

import { computed, ref } from 'vue'
import { TokenRegistry } from '@/themes/core/token-registry'
import { useThemeAdvancedStore } from '@/stores/theme/advanced.store'
import type { DesignToken } from '@/themes/presets/preset.types'

export function useComponentTokens(componentName: string) {
  const registry = TokenRegistry.getInstance()
  const advancedStore = useThemeAdvancedStore()
  
  // Get all tokens for this component
  const componentTokens = computed(() => {
    return registry.getTokensByComponent(componentName)
  })
  
  // Get tokens grouped by category (background, text, spacing, etc.)
  const tokensByCategory = computed(() => {
    const grouped: Record<string, DesignToken[]> = {}
    
    componentTokens.value.forEach(token => {
      const category = token.path.split('.')[0] || 'other'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(token)
    })
    
    return grouped
  })
  
  // Get tokens for a specific element/state
  function getTokensForElement(element: string): DesignToken[] {
    return componentTokens.value.filter(token => 
      token.path.includes(element)
    )
  }
  
  // Get tokens for a specific variant (primary, secondary, etc.)
  function getTokensForVariant(variant: string): DesignToken[] {
    return componentTokens.value.filter(token => 
      token.path.includes(variant) || 
      token.id.includes(variant)
    )
  }
  
  // Get tokens for a specific size (small, medium, large)
  function getTokensForSize(size: string): DesignToken[] {
    return componentTokens.value.filter(token => 
      token.path.includes(size) ||
      token.id.includes(size)
    )
  }
  
  // Get token value with fallback
  function getTokenValue(tokenPath: string, fallback?: any): any {
    const fullTokenId = `${componentName}.${tokenPath}`
    const token = registry.getToken(fullTokenId)
    
    if (token) {
      // Check if there's a cached/edited value
      const cachedValue = advancedStore.getCachedTokenValue(fullTokenId)
      return cachedValue !== null ? cachedValue : token.value
    }
    
    return fallback
  }
  
  // Get CSS variable for a token
  function getTokenCssVar(tokenPath: string): string {
    return `--p-${componentName}-${tokenPath.replace(/\./g, '-')}`
  }
  
  // Get all active tokens (currently being used)
  function getActiveTokens(): DesignToken[] {
    // This could be enhanced to detect which tokens are actually
    // being used based on current component state
    return componentTokens.value
  }
  
  // Check if a token has been edited
  function isTokenEdited(tokenId: string): boolean {
    const changes = advancedStore.tokenChangeHistory
    return changes.some(change => change.tokenId === tokenId)
  }
  
  // Get edited value for a token
  function getEditedValue(tokenId: string): any {
    const changes = advancedStore.tokenChangeHistory
    const lastChange = changes
      .filter(change => change.tokenId === tokenId)
      .pop()
    
    return lastChange?.newValue
  }
  
  // Build CSS custom properties object
  function buildCssVars(): Record<string, any> {
    const vars: Record<string, any> = {}
    
    componentTokens.value.forEach(token => {
      const cssVar = getTokenCssVar(token.path)
      const value = getEditedValue(token.id) || token.value
      vars[cssVar] = value
    })
    
    return vars
  }
  
  return {
    // Computed
    componentTokens,
    tokensByCategory,
    
    // Methods
    getTokensForElement,
    getTokensForVariant,
    getTokensForSize,
    getTokenValue,
    getTokenCssVar,
    getActiveTokens,
    isTokenEdited,
    getEditedValue,
    buildCssVars
  }
}