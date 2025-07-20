import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'

export const CustomPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{brand.50}',
      100: '{brand.100}',
      200: '{brand.200}',
      300: '{brand.300}',
      400: '{brand.400}',
      500: '{brand.500}',
      600: '{brand.600}',
      700: '{brand.700}',
      800: '{brand.800}',
      900: '{brand.900}',
      950: '{brand.950}',
    },
    colorScheme: {
      light: {
        primary: {
          color: '{brand.600}',
          contrastColor: '{surface.0}',
          hoverColor: '{brand.700}',
          activeColor: '{brand.800}',
        },
        surface: {
          0: '{surface.0}',
          50: '{surface.50}',
          100: '{surface.100}',
          200: '{surface.200}',
          300: '{surface.300}',
          400: '{surface.400}',
          500: '{surface.500}',
          600: '{surface.600}',
          700: '{surface.700}',
          800: '{surface.800}',
          900: '{surface.900}',
          950: '{surface.950}',
        },
      },
      dark: {
        primary: {
          color: '{brand.400}',
          contrastColor: '{brand.950}',
          hoverColor: '{brand.300}',
          activeColor: '{brand.200}',
        },
        surface: {
          0: '{surface.950}',
          50: '{surface.900}',
          100: '{surface.800}',
          200: '{surface.700}',
          300: '{surface.600}',
          400: '{surface.500}',
          500: '{surface.400}',
          600: '{surface.300}',
          700: '{surface.200}',
          800: '{surface.100}',
          900: '{surface.50}',
          950: '{surface.0}',
        },
      },
    },
  },
})
