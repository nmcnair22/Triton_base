/**
 * Token Discovery Engine
 * Automatically discovers and maps PrimeVue component tokens
 */


import { DiscoveryCache } from './discovery-cache'
import type { 
  DesignToken, 
  TokenCategory, 
  TokenType,
  BaseTheme
} from '@/themes/presets/preset.types'

export class TokenDiscovery {
  private static tokenCache = new Map<string, DesignToken[]>()
  private static discoveryComplete = false
  
  // Comprehensive list of PrimeVue components
  private static readonly componentList = [
    'accordion', 'autocomplete', 'avatar', 'avatargroup', 'badge',
    'blockui', 'breadcrumb', 'button', 'buttongroup', 'card',
    'carousel', 'cascadeselect', 'checkbox', 'chip', 'colorpicker',
    'confirmdialog', 'confirmpopup', 'contextmenu', 'datatable', 'dataview',
    'datepicker', 'dialog', 'divider', 'dock', 'drawer',
    'dropdown', 'editor', 'fieldset', 'fileupload', 'floatlabel',
    'galleria', 'iconfield', 'image', 'inlinemessage', 'inplace',
    'inputchips', 'inputgroup', 'inputmask', 'inputnumber', 'inputotp',
    'inputtext', 'knob', 'listbox', 'megamenu', 'menu',
    'menubar', 'message', 'metergroup', 'multiselect', 'orderlist',
    'organizationchart', 'overlaybadge', 'overlaypanel', 'paginator', 'panel',
    'panelmenu', 'password', 'picklist', 'popover', 'progressbar',
    'progressspinner', 'radiobutton', 'rating', 'ripple', 'scrollpanel',
    'scrolltop', 'select', 'selectbutton', 'skeleton', 'slider',
    'speeddial', 'splitbutton', 'splitter', 'stepper', 'steps',
    'tabmenu', 'tabs', 'tabview', 'tag', 'terminal',
    'textarea', 'tieredmenu', 'timeline', 'toast', 'togglebutton',
    'toggleswitch', 'toolbar', 'tooltip', 'tree', 'treeselect',
    'treetable', 'virtualscroller'
  ]
  
  /**
   * Discover all available tokens from specified base theme
   */
  static async discoverAllTokens(baseTheme: BaseTheme = 'Material'): Promise<Map<string, DesignToken[]>> {
    if (this.discoveryComplete && this.tokenCache.size > 0) {
      return this.tokenCache
    }
    
    // Try to load from cache first
    const cachedTokens = DiscoveryCache.load()
    if (cachedTokens && cachedTokens.size > 0) {
      this.tokenCache = cachedTokens
      this.discoveryComplete = true
      console.log('✅ Loaded tokens from cache')
      return this.tokenCache
    }
    
    console.log(`🔍 Starting token discovery for ${baseTheme} theme...`)
    
    // Clear cache
    this.tokenCache.clear()
    
    // Discover primitive tokens
    const primitiveTokens = await this.discoverPrimitiveTokens(baseTheme)
    if (primitiveTokens.length > 0) {
      this.tokenCache.set('primitive', primitiveTokens)
    }
    
    // Discover semantic tokens
    const semanticTokens = await this.discoverSemanticTokens(baseTheme)
    if (semanticTokens.length > 0) {
      this.tokenCache.set('semantic', semanticTokens)
    }
    
    // Discover component tokens from theme structure
    await this.discoverComponentTokensFromTheme(baseTheme)
    
    this.discoveryComplete = true
    console.log(`✅ Token discovery complete for ${baseTheme}. Found ${this.tokenCache.size} token groups`)
    
    // Save to cache for next time
    DiscoveryCache.save(this.tokenCache)
    
    return this.tokenCache
  }
  
  /**
   * Discover primitive tokens from specified theme
   */
  static async discoverPrimitiveTokens(baseTheme: BaseTheme = 'Material'): Promise<DesignToken[]> {
    const tokens: DesignToken[] = []
    
    // Import the specified theme to analyze its structure
    try {
      const theme = await this.loadBaseTheme(baseTheme)
      
      if (theme.primitive) {
        this.extractTokensFromObject(
          theme.primitive,
          '',
          '',
          tokens,
          'primitive'
        )
      }
    } catch {
      console.warn(`Could not load ${baseTheme} theme for primitive token discovery`)
    }
    
    // Add common primitive tokens if not found
    const commonPrimitives = [
      { path: 'borderRadius.none', value: '0', type: 'borderRadius' as TokenType, subcategory: 'borderRadius' },
      { path: 'borderRadius.xs', value: '2px', type: 'borderRadius' as TokenType, subcategory: 'borderRadius' },
      { path: 'borderRadius.sm', value: '4px', type: 'borderRadius' as TokenType, subcategory: 'borderRadius' },
      { path: 'borderRadius.md', value: '6px', type: 'borderRadius' as TokenType, subcategory: 'borderRadius' },
      { path: 'borderRadius.lg', value: '8px', type: 'borderRadius' as TokenType, subcategory: 'borderRadius' },
      { path: 'borderRadius.xl', value: '12px', type: 'borderRadius' as TokenType, subcategory: 'borderRadius' },
    ]
    
    commonPrimitives.forEach(({ path, value, type, subcategory }) => {
      if (!tokens.find(t => t.path === path)) {
        tokens.push({
          id: `primitive.${path}`,
          label: this.humanizeTokenName(path.split('.').pop()!),
          category: 'primitive',
          subcategory,
          path,
          value,
          type,
          defaultValue: value,
          affects: [],
          description: `Primitive ${type} token`
        })
      }
    })
    
    return tokens
  }
  
  /**
   * Discover semantic tokens from specified theme
   */
  static async discoverSemanticTokens(baseTheme: BaseTheme = 'Material'): Promise<DesignToken[]> {
    const tokens: DesignToken[] = []
    
    try {
      const theme = await this.loadBaseTheme(baseTheme)
      
      if (theme.semantic) {
        this.extractTokensFromObject(
          theme.semantic,
          '',
          '',
          tokens,
          'semantic'
        )
      }
          } catch {
        console.warn(`Could not load ${baseTheme} theme for semantic token discovery`)
      }
    
    // Add standard semantic tokens
    const semanticCategories = ['primary', 'secondary', 'success', 'info', 'warning', 'danger', 'surface']
    const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]
    
    semanticCategories.forEach(category => {
      shades.forEach(shade => {
        const path = `${category}.${shade}`
        if (!tokens.find(t => t.path === path)) {
          tokens.push({
            id: `semantic.${path}`,
            label: `${this.humanizeTokenName(category)} ${shade}`,
            category: 'semantic',
            subcategory: category,
            path,
            value: `{${category}.${shade}}`,
            type: 'color',
            defaultValue: `{${category}.${shade}}`,
            affects: [],
            description: `${category} color shade ${shade}`
          })
        }
      })
    })
    
    return tokens
  }
  
  /**
   * Discover component tokens from specified theme and custom preset
   */
  static async discoverComponentTokensFromTheme(baseTheme: BaseTheme = 'Material'): Promise<void> {
    try {
      // First, try to discover component tokens from the base theme itself
      const theme = await this.loadBaseTheme(baseTheme)
      
      if (theme.components) {
        for (const [componentName, componentTheme] of Object.entries(theme.components)) {
          const tokens: DesignToken[] = []
          
          this.extractTokensFromObject(
            componentTheme,
            componentName,
            '',
            tokens,
            'component'
          )
          
          if (tokens.length > 0) {
            this.tokenCache.set(componentName, tokens)
          }
        }
      }
      
      // Also import our custom preset to analyze component overrides
      const { CustomPreset } = await import('@/themes/custom-preset')
      
      // Check if there are component overrides
      if (CustomPreset.components) {
        for (const [componentName, componentTheme] of Object.entries(CustomPreset.components)) {
          const tokens: DesignToken[] = []
          
          this.extractTokensFromObject(
            componentTheme,
            componentName,
            '',
            tokens,
            'component'
          )
          
          if (tokens.length > 0) {
            this.tokenCache.set(componentName, tokens)
          }
        }
      }
    } catch {
      console.warn(`Could not load component tokens for ${baseTheme} theme`)
    }
    
    // Also discover from known component structures
    await this.discoverKnownComponentTokens()
  }
  
  /**
   * Discover tokens for known component structures
   */
  static async discoverKnownComponentTokens(): Promise<void> {
    // Button tokens (as an example, we'll add more)
    const buttonTokens: DesignToken[] = [
      // Background colors
      {
        id: 'button.background',
        label: 'Background',
        category: 'component',
        subcategory: 'button',
        path: 'background',
        value: '{primary.500}',
        type: 'color',
        defaultValue: '{primary.500}',
        affects: ['button'],
        description: 'Default button background color'
      },
      {
        id: 'button.hover.background',
        label: 'Hover Background',
        category: 'component',
        subcategory: 'button',
        path: 'hover.background',
        value: '{primary.600}',
        type: 'color',
        defaultValue: '{primary.600}',
        affects: ['button'],
        dependencies: ['button.background'],
        description: 'Button background color on hover'
      },
      {
        id: 'button.active.background',
        label: 'Active Background',
        category: 'component',
        subcategory: 'button',
        path: 'active.background',
        value: '{primary.700}',
        type: 'color',
        defaultValue: '{primary.700}',
        affects: ['button'],
        dependencies: ['button.background'],
        description: 'Button background color when pressed'
      },
      // Text colors
      {
        id: 'button.color',
        label: 'Text Color',
        category: 'component',
        subcategory: 'button',
        path: 'color',
        value: '#ffffff',
        type: 'color',
        defaultValue: '#ffffff',
        affects: ['button'],
        description: 'Button text color'
      },
      // Padding
      {
        id: 'button.padding.x',
        label: 'Horizontal Padding',
        category: 'component',
        subcategory: 'button',
        path: 'padding.x',
        value: '1rem',
        type: 'spacing',
        defaultValue: '1rem',
        affects: ['button'],
        description: 'Button horizontal padding'
      },
      {
        id: 'button.padding.y',
        label: 'Vertical Padding',
        category: 'component',
        subcategory: 'button',
        path: 'padding.y',
        value: '0.5rem',
        type: 'spacing',
        defaultValue: '0.5rem',
        affects: ['button'],
        description: 'Button vertical padding'
      },
      // Border radius
      {
        id: 'button.borderRadius',
        label: 'Border Radius',
        category: 'component',
        subcategory: 'button',
        path: 'borderRadius',
        value: '{borderRadius.md}',
        type: 'borderRadius',
        defaultValue: '{borderRadius.md}',
        affects: ['button'],
        description: 'Button corner radius'
      },
      // Font
      {
        id: 'button.fontSize',
        label: 'Font Size',
        category: 'component',
        subcategory: 'button',
        path: 'fontSize',
        value: '1rem',
        type: 'typography',
        defaultValue: '1rem',
        affects: ['button'],
        description: 'Button text size'
      },
      {
        id: 'button.fontWeight',
        label: 'Font Weight',
        category: 'component',
        subcategory: 'button',
        path: 'fontWeight',
        value: '500',
        type: 'typography',
        defaultValue: '500',
        affects: ['button'],
        description: 'Button text weight'
      }
    ]
    
    this.tokenCache.set('button', buttonTokens)
    
    // DataTable tokens
    const dataTableTokens: DesignToken[] = [
      {
        id: 'datatable.header.background',
        label: 'Header Background',
        category: 'component',
        subcategory: 'datatable',
        path: 'header.background',
        value: '{surface.50}',
        type: 'color',
        defaultValue: '{surface.50}',
        affects: ['datatable'],
        description: 'Table header background color'
      },
      {
        id: 'datatable.header.color',
        label: 'Header Text Color',
        category: 'component',
        subcategory: 'datatable',
        path: 'header.color',
        value: '{surface.700}',
        type: 'color',
        defaultValue: '{surface.700}',
        affects: ['datatable'],
        description: 'Table header text color'
      },
      {
        id: 'datatable.row.background',
        label: 'Row Background',
        category: 'component',
        subcategory: 'datatable',
        path: 'row.background',
        value: '{surface.0}',
        type: 'color',
        defaultValue: '{surface.0}',
        affects: ['datatable'],
        description: 'Table row background color'
      },
      {
        id: 'datatable.row.stripedBackground',
        label: 'Striped Row Background',
        category: 'component',
        subcategory: 'datatable',
        path: 'row.stripedBackground',
        value: '{surface.50}',
        type: 'color',
        defaultValue: '{surface.50}',
        affects: ['datatable'],
        description: 'Alternating row background color'
      },
      {
        id: 'datatable.row.hoverBackground',
        label: 'Row Hover Background',
        category: 'component',
        subcategory: 'datatable',
        path: 'row.hoverBackground',
        value: '{surface.100}',
        type: 'color',
        defaultValue: '{surface.100}',
        affects: ['datatable'],
        description: 'Row background on hover'
      }
    ]
    
    this.tokenCache.set('datatable', dataTableTokens)
    
    // Add more component tokens as needed
    // This is a starting point - in a real implementation, 
    // we would dynamically discover these from the actual theme files
  }
  
  /**
   * Extract tokens from an object recursively
   */
  private static extractTokensFromObject(
    obj: any,
    component: string,
    path: string,
    tokens: DesignToken[],
    category: TokenCategory
  ): void {
    if (!obj || typeof obj !== 'object') return
    
    for (const [key, value] of Object.entries(obj)) {
      const fullPath = path ? `${path}.${key}` : key
      
      if (key === 'colorScheme') {
        // Handle light/dark variants
        this.extractColorSchemeTokens(value, component, fullPath, tokens, category)
      } else if (key === 'css' || key === '_extend') {
        // Skip CSS overrides and internal properties
        continue
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Recurse into nested objects
        this.extractTokensFromObject(value, component, fullPath, tokens, category)
      } else if (value !== undefined && value !== null) {
        // Create token
        const tokenId = category === 'component' 
          ? `${component}.${fullPath}` 
          : `${category}.${fullPath}`
          
        // Determine subcategory
        let subcategory: string | undefined
        if (category === 'component') {
          subcategory = component
        } else if (category === 'primitive' || category === 'semantic') {
          // Use the first part of the path as subcategory
          subcategory = fullPath.split('.')[0]
        }
        
        const token: DesignToken = {
          id: tokenId,
          label: this.humanizeTokenName(key),
          category,
          subcategory,
          path: fullPath,
          value,
          type: this.inferTokenType(key, value),
          defaultValue: value,
          affects: category === 'component' ? [component] : [],
          description: this.generateDescription(component, fullPath)
        }
        
        tokens.push(token)
      }
    }
  }
  
  /**
   * Extract color scheme tokens (light/dark)
   */
  private static extractColorSchemeTokens(
    colorScheme: any,
    component: string,
    path: string,
    tokens: DesignToken[],
    category: TokenCategory
  ): void {
    if (colorScheme.light) {
      this.extractTokensFromObject(
        colorScheme.light,
        component,
        `${path}.light`,
        tokens,
        category
      )
    }
    
    if (colorScheme.dark) {
      this.extractTokensFromObject(
        colorScheme.dark,
        component,
        `${path}.dark`,
        tokens,
        category
      )
    }
  }
  
  /**
   * Infer token type from key and value
   */
  private static inferTokenType(key: string, value: any): TokenType {
    const keyLower = key.toLowerCase()
    
    // Color detection
    const colorKeywords = ['color', 'background', 'border', 'shadow', 'outline', 'fill', 'stroke']
    if (colorKeywords.some(keyword => keyLower.includes(keyword))) {
      return 'color'
    }
    
    // Check value for color patterns
    if (typeof value === 'string') {
      if (value.match(/^#[0-9A-Fa-f]{3,8}$/) || 
          value.match(/^rgb/) || 
          value.match(/^hsl/) ||
          value.includes('{') && value.includes('.')) {
        return 'color'
      }
    }
    
    // Size detection
    const sizeKeywords = ['size', 'width', 'height', 'dimension']
    if (sizeKeywords.some(keyword => keyLower.includes(keyword))) {
      return 'size'
    }
    
    // Spacing detection
    const spacingKeywords = ['padding', 'margin', 'gap', 'space', 'offset', 'indent']
    if (spacingKeywords.some(keyword => keyLower.includes(keyword))) {
      return 'spacing'
    }
    
    // Border radius detection
    const radiusKeywords = ['radius', 'rounded', 'corner']
    if (radiusKeywords.some(keyword => keyLower.includes(keyword))) {
      return 'borderRadius'
    }
    
    // Shadow detection
    const shadowKeywords = ['shadow', 'elevation']
    if (shadowKeywords.some(keyword => keyLower.includes(keyword))) {
      return 'shadow'
    }
    
    // Typography detection
    const typographyKeywords = ['font', 'text', 'line', 'letter']
    if (typographyKeywords.some(keyword => keyLower.includes(keyword))) {
      return 'typography'
    }
    
    // Check value patterns
    if (typeof value === 'string') {
      if (value.match(/^\d+(\.\d+)?(px|rem|em|%)$/)) {
        return 'size'
      }
      if (value.includes('box-shadow') || value.includes('drop-shadow')) {
        return 'shadow'
      }
    }
    
    // Default to typography for other string values
    return 'typography'
  }
  
  /**
   * Convert token name to human-readable format
   */
  private static humanizeTokenName(name: string): string {
    if (!name) return ''
    
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/([0-9]+)/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .split(' ')
      .filter(word => word.length > 0)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .trim()
  }
  
  /**
   * Generate description for a token
   */
  private static generateDescription(component: string, path: string): string {
    const pathParts = path.split('.')
    const lastPart = pathParts[pathParts.length - 1]
    
    // State-based descriptions
    if (path.includes('hover')) {
      return `Hover state for ${component || 'element'}`
    }
    if (path.includes('focus')) {
      return `Focus state for ${component || 'element'}`
    }
    if (path.includes('active') || path.includes('pressed')) {
      return `Active/pressed state for ${component || 'element'}`
    }
    if (path.includes('disabled')) {
      return `Disabled state for ${component || 'element'}`
    }
    
    // Component-specific descriptions
    if (component) {
      if (path.includes('background')) {
        return `Background styling for ${component}`
      }
      if (path.includes('color')) {
        return `Text/foreground color for ${component}`
      }
      if (path.includes('border')) {
        return `Border styling for ${component}`
      }
      if (path.includes('padding')) {
        return `Inner spacing for ${component}`
      }
      if (path.includes('margin')) {
        return `Outer spacing for ${component}`
      }
    }
    
    return `${this.humanizeTokenName(lastPart)} for ${component || 'design system'}`
  }
  
  /**
   * Get discovered tokens for a specific component
   */
  static async discoverComponentTokens(componentName: string): Promise<DesignToken[]> {
    // Ensure discovery has been run
    if (!this.discoveryComplete) {
      await this.discoverAllTokens()
    }
    
    return this.tokenCache.get(componentName) || []
  }
  
  /**
   * Clear the token cache manually
   */
  static clearCache(): void {
    this.tokenCache.clear()
    this.discoveryComplete = false
    DiscoveryCache.clear()
    console.log('🗑️ Token discovery cache cleared')
  }
  
  /**
   * Get discovery statistics
   */
  static getDiscoveryStats(): {
    totalComponents: number
    discoveredComponents: number
    totalTokens: number
    tokensByCategory: Record<string, number>
  } {
    let totalTokens = 0
    const tokensByCategory: Record<string, number> = {
      primitive: 0,
      semantic: 0,
      component: 0,
      custom: 0
    }
    
    this.tokenCache.forEach((tokens, key) => {
      totalTokens += tokens.length
      
      if (key === 'primitive' || key === 'semantic') {
        tokensByCategory[key] = tokens.length
      } else {
        tokensByCategory.component += tokens.length
      }
    })
    
    return {
      totalComponents: this.componentList.length,
      discoveredComponents: this.tokenCache.size - 2, // Subtract primitive and semantic
      totalTokens,
      tokensByCategory
    }
  }

  private static async loadBaseTheme(baseTheme: BaseTheme): Promise<any> {
    switch (baseTheme) {
      case 'Material':
        return (await import('@primeuix/themes/material')).default
      case 'Aura':
        return (await import('@primeuix/themes/aura')).default
      case 'Lara':
        return (await import('@primeuix/themes/lara')).default
      case 'Nora':
        return (await import('@primeuix/themes/nora')).default
      default:
        throw new Error(`Unsupported base theme: ${baseTheme}`)
    }
  }
}