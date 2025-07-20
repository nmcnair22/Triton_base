import { definePreset } from '@primeuix/themes'
import Material from '@primeuix/themes/material'
import { palette } from '@primeuix/themes'

// Generate color palettes from your brand colors
const primaryPalette = palette('#0B2244')    // Dark navy blue - Primary
const accentPalette = palette('#297FB7')     // Light blue - Accent/Info  
const emergencyPalette = palette('#F60D03')  // Bright red - Emergency/Danger
const warningPalette = palette('#FFB400')    // Amber - Warning
const surfacePalette = palette('#595959')    // Medium gray - Custom surfaces

export const CustomPreset = definePreset(Material, {
  primitive: {
    // Brand color families
    navy: primaryPalette,        // #0B2244 palette
    blue: accentPalette,         // #297FB7 palette  
    red: emergencyPalette,       // #F60D03 palette
    amber: warningPalette,       // #FFB400 palette
    slate: surfacePalette,       // #595959 palette
  },
  
  semantic: {
    // Primary color mapping (Navy Blue)
    primary: {
      50: '{navy.50}',
      100: '{navy.100}',
      200: '{navy.200}',
      300: '{navy.300}',
      400: '{navy.400}',
      500: '{navy.500}',         // #0B2244
      600: '{navy.600}',
      700: '{navy.700}',
      800: '{navy.800}',
      900: '{navy.900}',
      950: '{navy.950}',
    },
    
    // Secondary color mapping (Accent Blue)
    secondary: {
      50: '{blue.50}',
      100: '{blue.100}',
      200: '{blue.200}',
      300: '{blue.300}',
      400: '{blue.400}',
      500: '{blue.500}',         // #297FB7 - Accent blue for secondary
      600: '{blue.600}',
      700: '{blue.700}',
      800: '{blue.800}',
      900: '{blue.900}',
      950: '{blue.950}',
    },
    
    // Status colors
    success: {
      50: '{blue.50}',
      100: '{blue.100}',
      200: '{blue.200}',
      300: '{blue.300}',
      400: '{blue.400}',
      500: '{blue.500}',         // Using accent blue for success
      600: '{blue.600}',
      700: '{blue.700}',
      800: '{blue.800}',
      900: '{blue.900}',
      950: '{blue.950}',
    },
    
    info: {
      50: '{blue.50}',
      100: '{blue.100}',
      200: '{blue.200}',
      300: '{blue.300}',
      400: '{blue.400}',
      500: '{blue.500}',         // #297FB7 - Accent color
      600: '{blue.600}',
      700: '{blue.700}',
      800: '{blue.800}',
      900: '{blue.900}',
      950: '{blue.950}',
    },
    
    warning: {
      50: '{amber.50}',
      100: '{amber.100}',
      200: '{amber.200}',
      300: '{amber.300}',
      400: '{amber.400}',
      500: '{amber.500}',        // #FFB400
      600: '{amber.600}',
      700: '{amber.700}',
      800: '{amber.800}',
      900: '{amber.900}',
      950: '{amber.950}',
    },
    
    danger: {
      50: '{red.50}',
      100: '{red.100}',
      200: '{red.200}',
      300: '{red.300}',
      400: '{red.400}',
      500: '{red.500}',          // #F60D03
      600: '{red.600}',
      700: '{red.700}',
      800: '{red.800}',
      900: '{red.900}',
      950: '{red.950}',
    },
    
    colorScheme: {
      light: {
        primary: {
          color: '{navy.500}',             // #0B2244
          contrastColor: '#ffffff',
          hoverColor: '{navy.600}',
          activeColor: '{navy.700}',
        },
        secondary: {
          color: '{blue.500}',             // #297FB7 - Accent blue
          contrastColor: '#ffffff',
          hoverColor: '{blue.600}',
          activeColor: '{blue.700}',
        },
        surface: {
          0: '#ffffff',                    // White background
          50: '#fafafa',                   // Very light gray
          100: '{slate.100}',
          200: '{slate.200}',
          300: '{slate.300}',
          400: '{slate.400}',
          500: '{slate.500}',              // #595959 (your specified gray)
          600: '{slate.600}',
          700: '{slate.700}',
          800: '{slate.800}',
          900: '{slate.900}',
          950: '{slate.950}',
        },
      },
      dark: {
        primary: {
          color: '{navy.400}',             // Lighter navy for dark mode
          contrastColor: '{navy.950}',
          hoverColor: '{navy.300}',
          activeColor: '{navy.200}',
        },
        secondary: {
          color: '{blue.400}',             // Lighter blue for dark mode
          contrastColor: '{blue.950}',
          hoverColor: '{blue.300}',
          activeColor: '{blue.200}',
        },
        surface: {
          0: '{navy.500}',                 // #0B2244 as dark background!
          50: '{navy.400}',                // Lighter navy tints
          100: '{navy.300}',
          200: '{navy.200}',
          300: '{navy.100}',
          400: '{slate.400}',              // Transition to gray tones
          500: '{slate.500}',              // #595959 (your specified gray)
          600: '{slate.600}',
          700: '{slate.700}',
          800: '{slate.800}',
          900: '{slate.900}',
          950: '{navy.950}',               // Very dark navy
        },
      },
    },
  },
  
  // ✅ COMPONENT-LEVEL OVERRIDES: Fix button secondary styling
  components: {
    button: {
      colorScheme: {
        light: {
          outlined: {
            secondary: {
              hoverBackground: '{blue.50}',           // Light blue hover
              activeBackground: '{blue.100}',         // Slightly darker blue active
              borderColor: '{blue.500}',              // #297FB7 border
              color: '{blue.500}',                    // #297FB7 text
            }
          },
          root: {
            secondary: {
              background: 'transparent',              // Override default gray background
              hoverBackground: '{blue.50}',
              activeBackground: '{blue.100}',
              borderColor: '{blue.500}',
              hoverBorderColor: '{blue.600}',
              activeBorderColor: '{blue.700}',
              color: '{blue.500}',
              hoverColor: '{blue.600}',
              activeColor: '{blue.700}',
            }
          }
        },
        dark: {
          outlined: {
            secondary: {
              hoverBackground: 'rgba(41, 127, 183, 0.1)', // Blue with transparency
              activeBackground: 'rgba(41, 127, 183, 0.2)',
              borderColor: '{blue.400}',              // Lighter blue for dark mode
              color: '{blue.400}',
            }
          },
          root: {
            secondary: {
              background: 'transparent',
              hoverBackground: 'rgba(41, 127, 183, 0.1)',
              activeBackground: 'rgba(41, 127, 183, 0.2)',
              borderColor: '{blue.400}',
              hoverBorderColor: '{blue.300}',
              activeBorderColor: '{blue.200}',
              color: '{blue.400}',
              hoverColor: '{blue.300}',
              activeColor: '{blue.200}',
            }
          }
        }
      }
    }
  },
})
