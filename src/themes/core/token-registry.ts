/**
 * Token Registry - Centralized management for design tokens
 * Implements singleton pattern for global access
 */

import type { 
  DesignToken, 
  TokenRelationship, 
  TokenCategory,
  TokenType 
} from '@/themes/presets/preset.types'

export class TokenRegistry {
  private static instance: TokenRegistry
  private tokens = new Map<string, DesignToken>()
  private relationships = new Map<string, TokenRelationship>()
  private tokensByCategory = new Map<TokenCategory, DesignToken[]>()
  private tokensByComponent = new Map<string, DesignToken[]>()
  private tokenDependencies = new Map<string, Set<string>>()
  
  private constructor() {
    // Private constructor for singleton
  }
  
  static getInstance(): TokenRegistry {
    if (!this.instance) {
      this.instance = new TokenRegistry()
    }
    return this.instance
  }

  static clearInstance(): void {
    this.instance = undefined as any
  }
  
  /**
   * Register a new token
   */
  register(token: DesignToken): void {
    // Store in main registry
    this.tokens.set(token.id, token)
    
    // Update category index
    if (!this.tokensByCategory.has(token.category)) {
      this.tokensByCategory.set(token.category, [])
    }
    const categoryTokens = this.tokensByCategory.get(token.category)!
    const existingIndex = categoryTokens.findIndex(t => t.id === token.id)
    if (existingIndex >= 0) {
      // Replace existing token
      categoryTokens[existingIndex] = token
    } else {
      categoryTokens.push(token)
    }
    
    // Update component index for component tokens
    if (token.category === 'component' && token.subcategory) {
      if (!this.tokensByComponent.has(token.subcategory)) {
        this.tokensByComponent.set(token.subcategory, [])
      }
      const componentTokens = this.tokensByComponent.get(token.subcategory)!
      const existingCompIndex = componentTokens.findIndex(t => t.id === token.id)
      if (existingCompIndex >= 0) {
        // Replace existing token
        componentTokens[existingCompIndex] = token
      } else {
        componentTokens.push(token)
      }
    }
    
    // Build relationships
    this.buildRelationships(token)
  }
  
  /**
   * Register multiple tokens at once
   */
  registerBatch(tokens: DesignToken[]): void {
    tokens.forEach(token => this.register(token))
  }
  
  /**
   * Get a token by ID
   */
  getToken(id: string): DesignToken | undefined {
    return this.tokens.get(id)
  }
  
  /**
   * Get all tokens
   */
  getAllTokens(): DesignToken[] {
    return Array.from(this.tokens.values())
  }
  
  /**
   * Get tokens by category
   */
  getTokensByCategory(category: TokenCategory): DesignToken[] {
    return this.tokensByCategory.get(category) || []
  }
  
  /**
   * Get tokens by component
   */
  getTokensByComponent(component: string): DesignToken[] {
    return this.tokensByComponent.get(component) || []
  }
  
  /**
   * Get tokens by type
   */
  getTokensByType(type: TokenType): DesignToken[] {
    return Array.from(this.tokens.values())
      .filter(token => token.type === type)
  }
  
  /**
   * Search tokens by query
   */
  searchTokens(query: string): DesignToken[] {
    const lowercaseQuery = query.toLowerCase()
    return Array.from(this.tokens.values()).filter(token => 
      token.id.toLowerCase().includes(lowercaseQuery) ||
      token.label.toLowerCase().includes(lowercaseQuery) ||
      token.path.toLowerCase().includes(lowercaseQuery) ||
      token.description?.toLowerCase().includes(lowercaseQuery)
    )
  }
  
  /**
   * Get token relationships
   */
  getRelationships(tokenId: string): TokenRelationship | undefined {
    return this.relationships.get(tokenId)
  }
  
  /**
   * Get dependent tokens
   */
  getDependentTokens(tokenId: string): DesignToken[] {
    const deps = this.tokenDependencies.get(tokenId)
    if (!deps) return []
    
    return Array.from(deps)
      .map(id => this.getToken(id))
      .filter((token): token is DesignToken => token !== undefined)
  }
  
  /**
   * Update token value
   */
  updateTokenValue(tokenId: string, value: any): void {
    const token = this.tokens.get(tokenId)
    if (token) {
      token.value = value
      this.notifyDependents(tokenId)
    }
  }
  
  /**
   * Validate token value
   */
  validateTokenValue(tokenId: string, value: any): boolean | string {
    const token = this.tokens.get(tokenId)
    if (!token || !token.validation) return true
    
    const { validation } = token
    
    // Check min/max for numeric values
    if (validation.min !== undefined && value < validation.min) {
      return `Value must be at least ${validation.min}`
    }
    if (validation.max !== undefined && value > validation.max) {
      return `Value must be at most ${validation.max}`
    }
    
    // Check pattern for string values
    if (validation.pattern && typeof value === 'string') {
      if (!validation.pattern.test(value)) {
        return 'Value does not match required pattern'
      }
    }
    
    // Check allowed values
    if (validation.allowedValues && !validation.allowedValues.includes(value)) {
      return `Value must be one of: ${validation.allowedValues.join(', ')}`
    }
    
    // Custom validator
    if (validation.validator) {
      return validation.validator(value)
    }
    
    return true
  }
  
  /**
   * Build token relationships
   */
  private buildRelationships(token: DesignToken): void {
    // Check if this token depends on others
    if (token.dependencies && token.dependencies.length > 0) {
      token.dependencies.forEach(depId => {
        if (!this.tokenDependencies.has(depId)) {
          this.tokenDependencies.set(depId, new Set())
        }
        this.tokenDependencies.get(depId)!.add(token.id)
      })
    }
    
    // Build relationship object
    const relationship: TokenRelationship = {
      parent: token.id,
      children: Array.from(this.tokenDependencies.get(token.id) || []),
      affects: token.affects || []
    }
    
    this.relationships.set(token.id, relationship)
  }
  
  /**
   * Notify dependent tokens of changes
   */
  private notifyDependents(tokenId: string): void {
    const dependents = this.tokenDependencies.get(tokenId)
    if (dependents) {
      dependents.forEach(depId => {
        // In a real implementation, this would trigger updates
        console.log(`Token ${depId} needs update due to change in ${tokenId}`)
      })
    }
  }
  
  /**
   * Clear all tokens (useful for testing)
   */
  clear(): void {
    this.tokens.clear()
    this.relationships.clear()
    this.tokensByCategory.clear()
    this.tokensByComponent.clear()
    this.tokenDependencies.clear()
  }
  
  /**
   * Export registry data
   */
  export(): {
    tokens: DesignToken[]
    relationships: Array<[string, TokenRelationship]>
  } {
    return {
      tokens: this.getAllTokens(),
      relationships: Array.from(this.relationships.entries())
    }
  }
  
  /**
   * Import registry data
   */
  import(data: {
    tokens: DesignToken[]
    relationships?: Array<[string, TokenRelationship]>
  }): void {
    this.clear()
    this.registerBatch(data.tokens)
    
    if (data.relationships) {
      data.relationships.forEach(([id, relationship]) => {
        this.relationships.set(id, relationship)
      })
    }
  }
  
  /**
   * Get statistics about the registry
   */
  getStats(): {
    totalTokens: number
    byCategory: Record<TokenCategory, number>
    byType: Record<TokenType, number>
    components: number
  } {
    const stats = {
      totalTokens: this.tokens.size,
      byCategory: {} as Record<TokenCategory, number>,
      byType: {} as Record<TokenType, number>,
      components: this.tokensByComponent.size
    }
    
    // Count by category
    this.tokensByCategory.forEach((tokens, category) => {
      stats.byCategory[category] = tokens.length
    })
    
    // Count by type
    const types: TokenType[] = ['color', 'size', 'spacing', 'borderRadius', 'shadow', 'typography']
    types.forEach(type => {
      stats.byType[type] = this.getTokensByType(type).length
    })
    
    return stats
  }
}