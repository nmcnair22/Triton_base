// Recursive type for design tokens that allows any CSS properties and nested structures
type DesignTokenValue = string | number | { [key: string]: DesignTokenValue }

// Flexible design tokens interface that allows CSS properties and pseudo-selectors
interface FlexibleDesignTokens {
  [key: string]: Record<string, DesignTokenValue>
}

export class TokenFactory {
  static button(
    variant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost' = 'primary',
    size: 'small' | 'medium' | 'large' = 'medium'
  ): FlexibleDesignTokens {
    // ✅ MINIMAL TOKENS: Let PrimeVue handle colors via severity prop
    // Only override non-color properties for consistency
    
    return {
      root: {
        // ✅ KEEP: Typography and layout consistency
        borderRadius: '{border.radius.md}',
        fontWeight: '500',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        
        // ✅ REMOVED: All color overrides - let PrimeVue handle these via severity
        // background, color, borderColor, hover states are now handled by severity prop
        
        '&:focus-visible': {
          outline: '2px solid {primary.color}',
          outlineOffset: '2px'
        },
        '&:disabled': {
          opacity: '0.5',
          cursor: 'not-allowed'
        }
      }
    }
  }
  
  static card(elevation: 'flat' | 'low' | 'medium' | 'high' = 'medium'): FlexibleDesignTokens {
    const elevationTokens = {
      flat: { 
        shadow: 'none',
        border: '1px solid {surface.200}'
      },
      low: { 
        shadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
        border: '1px solid {surface.200}'
      },
      medium: { 
        shadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        border: '1px solid {surface.200}'
      },
      high: { 
        shadow: '0 20px 25px rgba(0, 0, 0, 0.15)',
        border: '1px solid {surface.300}'
      }
    }
    
    return {
      root: {
        background: '{surface.0}',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        ...elevationTokens[elevation]
      }
    }
  }
  
  static input(state: 'default' | 'error' | 'success' = 'default'): FlexibleDesignTokens {
    const stateTokens = {
      default: {
        borderColor: '{surface.300}',
        '&:focus': {
          borderColor: '{primary.color}',
          outline: '2px solid {primary.color}/20'
        }
      },
      error: {
        borderColor: '{red.500}',
        '&:focus': {
          borderColor: '{red.500}',
          outline: '2px solid {red.500}/20'
        }
      },
      success: {
        borderColor: '{green.500}',
        '&:focus': {
          borderColor: '{green.500}',
          outline: '2px solid {green.500}/20'
        }
      }
    }
    
    return {
      root: {
        background: '{surface.0}',
        border: '1px solid',
        borderRadius: '0.375rem',
        padding: '0.75rem',
        fontSize: '1rem',
        color: '{surface.900}',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        ...stateTokens[state]
      }
    }
  }

  static dataTable(): FlexibleDesignTokens {
    return {
      root: {
        background: '{surface.0}',
        border: '1px solid {surface.200}',
        borderRadius: '0.75rem',
        color: '{surface.700}',
      },
      header: {
        background: '{surface.50}',
        color: '{surface.900}',
        borderColor: '{surface.200}',
        padding: '1rem',
        fontWeight: '600',
      },
      headerCell: {
        padding: '0.75rem 1rem',
        borderColor: '{surface.200}',
      },
      bodyRow: {
        background: '{surface.0}',
        color: '{surface.700}',
        '&:hover': {
          background: '{surface.50}',
        },
      },
      bodyCell: {
        padding: '0.75rem 1rem',
        borderColor: '{surface.200}',
      },
      colorScheme: {
        dark: {
          root: {
            background: '{surface.900}',
            border: '1px solid {surface.700}',
            color: '{surface.300}',
          },
          header: {
            background: '{surface.800}',
            color: '{surface.100}',
          },
          bodyRow: {
            background: '{surface.900}',
            color: '{surface.300}',
            '&:hover': {
              background: '{surface.800}',
            },
          },
        },
      },
    }
  }
}

// Helper types for better TypeScript support
export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost'
export type ButtonSize = 'small' | 'medium' | 'large'
export type CardElevation = 'flat' | 'low' | 'medium' | 'high'
export type InputState = 'default' | 'error' | 'success'
