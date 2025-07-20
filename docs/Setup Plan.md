# 🚀 **FINAL** PrimeVue 4 + Tailwind CSS 4 + Vue 3 + Vite + TypeScript Production Setup

## 📋 **Complete Optimized Setup Plan**

---

## **Phase 1: Project Foundation & Dependencies**

### **Step 1.1: Initialize Modern Vue Project**
```bash
# Create Vue 3 project with TypeScript, Router, Pinia, ESLint, Prettier
npm create vue@latest primevue-tailwind-project -- --typescript --router --pinia --eslint --prettier

cd primevue-tailwind-project
```

### **Step 1.2: Install Core Dependencies (Latest Versions)**
```bash
# PrimeVue 4 and theming system
npm install primevue @primeuix/themes

# Tailwind CSS 4 with Vite plugin and PrimeUI integration
npm install tailwindcss@next @tailwindcss/vite@next
npm install tailwindcss-primeui

# Icons and PrimeVue utilities
npm install @primevue/icons primeicons

# Vue ecosystem and modern composables
npm install @vueuse/core @vueuse/head
```

### **Step 1.3: Install Development Dependencies**
```bash
# Modern TypeScript configuration
npm install -D @vue/tsconfig

# Auto-import system with full TypeScript support
npm install -D unplugin-auto-import unplugin-vue-components @primevue/auto-import-resolver

# Performance and analysis tools
npm install -D vite-plugin-inspect vite-bundle-analyzer

# Enhanced code quality
npm install -D @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D @vue/eslint-config-typescript @vue/eslint-config-prettier
```

---

## **Phase 2: TypeScript & Vite Configuration**

### **Step 2.1: Modern TypeScript Configuration**
```json
// tsconfig.json
{
  "extends": ["@vue/tsconfig/tsconfig.dom.json"],
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true,
    "allowSyntheticDefaultImports": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/composables/*": ["./src/composables/*"],
      "@/themes/*": ["./src/themes/*"],
      "@/utils/*": ["./src/utils/*"]
    },
    "types": ["vite/client", "@vue/runtime-core", "unplugin-auto-import/client"]
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.d.ts", 
    "src/**/*.tsx",
    "src/**/*.vue",
    "auto-imports.d.ts",
    "components.d.ts"
  ]
}
```

### **Step 2.2: Performance-Optimized Vite Configuration**
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { PrimeVueResolver } from '@primevue/auto-import-resolver'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue(),
    // Tailwind CSS 4 Vite plugin (performance optimized)
    tailwindcss(),
    // Auto-import composables and utilities
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        '@vueuse/core',
        '@vueuse/head'
      ],
      dts: true,
      vueTemplate: true,
      eslintrc: {
        enabled: true
      }
    }),
    // Auto-import components with TypeScript support
    Components({
      resolvers: [PrimeVueResolver()],
      dts: true,
      dirs: ['src/components', 'src/components/ui']
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // Build optimization for production
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('vue')) return 'vue-vendor'
            if (id.includes('primevue')) return 'primevue-vendor'
            if (id.includes('@vueuse')) return 'vueuse-vendor'
            if (id.includes('lodash') || id.includes('dayjs')) return 'utils-vendor'
            return 'vendor'
          }
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  // Development optimization
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      '@vueuse/core',
      'primevue/button',
      'primevue/card',
      'primevue/inputtext',
      'primevue/dropdown',
      'primevue/datatable'
    ]
  }
})
```

---

## **Phase 3: Tailwind CSS 4 - CSS-First Architecture**

### **Step 3.1: Modern CSS-First Configuration**
```css
/* src/styles/main.css */

/* Import modern font stack */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

/* Import Tailwind CSS 4 */
@import "tailwindcss";

/* CSS-First Theme Configuration */
@theme {
  /* Typography */
  --font-sans: "Inter", system-ui, sans-serif;
  --font-mono: "SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace;
  
  /* Custom breakpoints */
  --breakpoint-3xl: 1920px;
  --breakpoint-4xl: 2560px;
  
  /* Brand colors using modern OKLCH color space */
  --color-brand-50: oklch(0.98 0.02 250);
  --color-brand-100: oklch(0.95 0.05 250);
  --color-brand-200: oklch(0.90 0.10 250);
  --color-brand-300: oklch(0.82 0.15 250);
  --color-brand-400: oklch(0.72 0.20 250);
  --color-brand-500: oklch(0.62 0.25 250);
  --color-brand-600: oklch(0.52 0.22 250);
  --color-brand-700: oklch(0.42 0.18 250);
  --color-brand-800: oklch(0.32 0.14 250);
  --color-brand-900: oklch(0.22 0.10 250);
  --color-brand-950: oklch(0.12 0.05 250);
  
  /* Surface colors for light/dark compatibility */
  --color-surface-50: oklch(0.99 0 0);
  --color-surface-100: oklch(0.97 0 0);
  --color-surface-200: oklch(0.94 0 0);
  --color-surface-300: oklch(0.91 0 0);
  --color-surface-400: oklch(0.82 0 0);
  --color-surface-500: oklch(0.65 0 0);
  --color-surface-600: oklch(0.53 0 0);
  --color-surface-700: oklch(0.41 0 0);
  --color-surface-800: oklch(0.27 0 0);
  --color-surface-900: oklch(0.15 0 0);
  --color-surface-950: oklch(0.08 0 0);
  
  /* Animation easing functions */
  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* Dark mode variant */
@variant dark (&:where(.dark, .dark *));

/* CSS Layer organization - critical for avoiding conflicts */
@layer base, primevue, utilities;

/* Base styles */
@layer base {
  * {
    box-sizing: border-box;
  }
  
  html {
    scroll-behavior: smooth;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  body {
    font-family: var(--font-sans);
    line-height: 1.6;
    color: rgb(var(--p-surface-900));
    background-color: rgb(var(--p-surface-50));
    transition: color 0.3s var(--ease-smooth), background-color 0.3s var(--ease-smooth);
  }
  
  .dark body {
    color: rgb(var(--p-surface-100));
    background-color: rgb(var(--p-surface-950));
  }
}

/* Theme-aware utilities that bridge PrimeVue and Tailwind */
@layer utilities {
  /* Primary color utilities */
  .text-primary {
    color: rgb(var(--p-primary-color));
  }
  
  .bg-primary {
    background-color: rgb(var(--p-primary-color));
  }
  
  .border-primary {
    border-color: rgb(var(--p-primary-color));
  }
  
  /* Surface utilities */
  .bg-surface {
    background-color: rgb(var(--p-surface-0));
  }
  
  .text-surface {
    color: rgb(var(--p-surface-900));
  }
  
  /* Focus ring utility for accessibility */
  .focus-ring {
    @apply focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2;
  }
  
  /* Component utilities */
  .card-elevated {
    @apply bg-surface border border-surface-200 rounded-lg shadow-sm;
  }
  
  /* Animation utilities */
  .animate-fade-in {
    animation: fadeIn 0.3s var(--ease-smooth);
  }
  
  .animate-slide-up {
    animation: slideUp 0.4s var(--ease-smooth);
  }
}

/* Dark mode specific utilities */
.dark .bg-surface {
  background-color: rgb(var(--p-surface-900));
}

.dark .text-surface {
  color: rgb(var(--p-surface-100));
}

.dark .card-elevated {
  @apply border-surface-700 bg-surface-900;
}

/* Keyframe animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0; 
    transform: translateY(10px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}
```

---

## **Phase 4: PrimeVue Theme System with definePreset**

### **Step 4.1: Custom Theme Preset**
```typescript
// src/themes/custom-preset.ts
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
      950: '{brand.950}'
    },
    colorScheme: {
      light: {
        primary: {
          color: '{brand.600}',
          contrastColor: '{surface.0}',
          hoverColor: '{brand.700}',
          activeColor: '{brand.800}'
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
          950: '{surface.950}'
        }
      },
      dark: {
        primary: {
          color: '{brand.400}',
          contrastColor: '{brand.950}',
          hoverColor: '{brand.300}',
          activeColor: '{brand.200}'
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
          950: '{surface.0}'
        }
      }
    }
  },
  components: {
    button: {
      root: {
        borderRadius: '0.5rem',
        fontWeight: '500',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        focusRing: {
          width: '2px',
          style: 'solid',
          color: '{primary.color}',
          offset: '2px'
        }
      }
    },
    card: {
      root: {
        background: '{surface.0}',
        borderRadius: '0.75rem',
        border: '1px solid {surface.200}',
        shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)'
      }
    },
    inputtext: {
      root: {
        background: '{surface.0}',
        borderColor: '{surface.300}',
        color: '{surface.700}',
        borderRadius: '0.375rem',
        focusRing: {
          width: '2px',
          style: 'solid', 
          color: '{primary.color}',
          offset: '0px'
        }
      }
    }
  }
})
```

### **Step 4.2: Design Token Factory for dt Customization**
```typescript
// src/themes/token-factory.ts
import type { DesignTokens } from '@primeuix/themes'

export class TokenFactory {
  static button(
    variant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost' = 'primary',
    size: 'small' | 'medium' | 'large' = 'medium'
  ): DesignTokens {
    const sizeTokens = {
      small: { 
        padding: '0.375rem 0.75rem', 
        fontSize: '0.875rem',
        minHeight: '2rem'
      },
      medium: { 
        padding: '0.5rem 1rem', 
        fontSize: '0.875rem',
        minHeight: '2.5rem'
      },
      large: { 
        padding: '0.75rem 1.5rem', 
        fontSize: '1rem',
        minHeight: '3rem'
      }
    }
    
    const variantTokens = {
      primary: {
        background: '{primary.color}',
        color: '{primary.contrastColor}',
        borderColor: '{primary.color}',
        '&:hover:not(:disabled)': {
          background: '{primary.hoverColor}'
        }
      },
      secondary: {
        background: 'transparent',
        color: '{primary.color}',
        borderColor: '{primary.color}',
        '&:hover:not(:disabled)': {
          background: '{primary.50}'
        }
      },
      success: {
        background: '{green.500}',
        color: '{white}',
        borderColor: '{green.500}',
        '&:hover:not(:disabled)': {
          background: '{green.600}'
        }
      },
      warning: {
        background: '{yellow.500}',
        color: '{yellow.950}',
        borderColor: '{yellow.500}',
        '&:hover:not(:disabled)': {
          background: '{yellow.600}'
        }
      },
      danger: {
        background: '{red.500}',
        color: '{white}',
        borderColor: '{red.500}',
        '&:hover:not(:disabled)': {
          background: '{red.600}'
        }
      },
      ghost: {
        background: 'transparent',
        color: '{surface.600}',
        borderColor: 'transparent',
        '&:hover:not(:disabled)': {
          background: '{surface.100}',
          color: '{surface.900}'
        }
      }
    }
    
    return {
      root: {
        ...sizeTokens[size],
        ...variantTokens[variant],
        borderRadius: '0.5rem',
        fontWeight: '500',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        border: '1px solid',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
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
  
  static card(elevation: 'flat' | 'low' | 'medium' | 'high' = 'medium'): DesignTokens {
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
  
  static input(state: 'default' | 'error' | 'success' = 'default'): DesignTokens {
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
}
```

---

## **Phase 5: Main Application Setup**

### **Step 5.1: Configure PrimeVue with Custom Theme**
```typescript
// src/main.ts
import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import { CustomPreset } from './themes/custom-preset'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import { createHead } from '@vueuse/head'

// Import styles in correct order
import './styles/main.css'
import 'primeicons/primeicons.css'

import App from './App.vue'
import routes from './router/routes'

const app = createApp(App)
const router = createRouter({
  history: createWebHistory(),
  routes
})

app.use(createPinia())
app.use(router)
app.use(createHead())

// Enhanced PrimeVue configuration
app.use(PrimeVue, {
  theme: {
    preset: CustomPreset,
    options: {
      prefix: 'p',
      darkModeSelector: '.dark',
      cssLayer: {
        name: 'primevue',
        order: 'base, primevue, utilities'
      }
    }
  },
  ripple: true,
  inputStyle: 'outlined'
})

app.mount('#app')
```

---

## **Phase 6: Design System Components with dt**

### **Step 6.1: Create Design System Button Component**
```vue
<!-- src/components/ui/AppButton.vue -->
<template>
  <Button 
    v-bind="$attrs"
    :dt="computedTokens"
    :class="computedClasses"
    :loading="loading"
  >
    <template #icon v-if="$slots.icon">
      <slot name="icon" />
    </template>
    <slot />
  </Button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TokenFactory } from '@/themes/token-factory'

interface Props {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost'
  size?: 'small' | 'medium' | 'large'
  fullWidth?: boolean
  loading?: boolean
  rounded?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'medium',
  fullWidth: false,
  loading: false,
  rounded: false
})

const computedTokens = computed(() => {
  const baseTokens = TokenFactory.button(props.variant, props.size)
  
  // Override border radius if rounded
  if (props.rounded) {
    baseTokens.root.borderRadius = '9999px'
  }
  
  return baseTokens
})

const computedClasses = computed(() => [
  props.fullWidth ? 'w-full' : '',
  'focus-ring',
  'inline-flex items-center justify-center gap-2'
])
</script>
```

### **Step 6.2: Create Design System Card Component**
```vue
<!-- src/components/ui/AppCard.vue -->
<template>
  <Card :dt="computedTokens" :class="computedClasses">
    <template #header v-if="$slots.header">
      <slot name="header" />
    </template>
    <template #title v-if="$slots.title">
      <slot name="title" />
    </template>
    <template #subtitle v-if="$slots.subtitle">
      <slot name="subtitle" />
    </template>
    <template #content>
      <slot />
    </template>
    <template #footer v-if="$slots.footer">
      <slot name="footer" />
    </template>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TokenFactory } from '@/themes/token-factory'

interface Props {
  elevation?: 'flat' | 'low' | 'medium' | 'high'
  padding?: 'none' | 'small' | 'medium' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  elevation: 'medium',
  padding: 'medium'
})

const computedTokens = computed(() => {
  const tokens = TokenFactory.card(props.elevation)
  
  const paddingValues = {
    none: '0',
    small: '1rem',
    medium: '1.5rem',
    large: '2rem'
  }
  
  tokens.root.padding = paddingValues[props.padding]
  
  return tokens
})

const computedClasses = computed(() => [
  'animate-fade-in'
])
</script>
```

---

## **Phase 7: Modern Dark Mode with VueUse**

### **Step 7.1: Enhanced Dark Mode Composable**
```typescript
// src/composables/useDarkMode.ts
export function useDarkMode() {
  // Use VueUse's useDark with automatic persistence and system detection
  const isDark = useDark({
    selector: 'html',
    attribute: 'class',
    valueDark: 'dark',
    valueLight: '',
    storageKey: 'app-color-scheme',
    storage: localStorage,
    onChanged: (dark: boolean) => {
      // Update meta theme-color for mobile browsers
      updateThemeColor(dark)
    }
  })
  
  const toggleDarkMode = useToggle(isDark)
  
  // Update theme color meta tag for mobile browsers
  const updateThemeColor = (dark: boolean) => {
    const themeColor = dark ? '#0c0a09' : '#ffffff' // surface-950 : surface-0
    
    let metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta')
      metaThemeColor.setAttribute('name', 'theme-color')
      document.head.appendChild(metaThemeColor)
    }
    metaThemeColor.setAttribute('content', themeColor)
  }
  
  // Initialize theme color on mount
  onMounted(() => {
    updateThemeColor(isDark.value)
  })
  
  return {
    isDark: readonly(isDark),
    toggleDarkMode
  }
}
```

---

## **Phase 8: Project Structure & Organization**

### **Step 8.1: Create Organized Directory Structure**
```
src/
├── components/
│   ├── ui/                    # Design system components
│   │   ├── AppButton.vue
│   │   ├── AppCard.vue
│   │   ├── AppInput.vue
│   │   └── index.ts
│   ├── layout/                # Layout components
│   │   ├── AppHeader.vue
│   │   ├── AppSidebar.vue
│   │   ├── AppLayout.vue
│   │   └── index.ts
│   └── features/              # Feature-specific components
├── composables/               # Vue composables
│   ├── useDarkMode.ts
│   ├── useTheme.ts
│   └── index.ts
├── themes/                    # Theme system
│   ├── custom-preset.ts
│   ├── token-factory.ts
│   └── index.ts
├── styles/                    # Global styles
│   ├── main.css
│   └── components.css
├── utils/                     # Utility functions
│   ├── theme.ts
│   └── index.ts
├── views/                     # Page components
├── router/                    # Vue Router
└── stores/                    # Pinia stores
```

### **Step 8.2: Create Barrel Exports**
```typescript
// src/themes/index.ts
export { CustomPreset } from './custom-preset'
export { TokenFactory } from './token-factory'

// src/composables/index.ts
export { useDarkMode } from './useDarkMode'

// src/components/ui/index.ts
export { default as AppButton } from './AppButton.vue'
export { default as AppCard } from './AppCard.vue'
export { default as AppInput } from './AppInput.vue'
```

---

## **Phase 9: Development Experience**

### **Step 9.1: Modern ESLint Configuration**
```javascript
// .eslintrc.cjs
module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript/recommended',
    '@vue/eslint-config-prettier',
    './.eslintrc-auto-import.json'
  ],
  env: {
    node: true,
    'vue/setup-compiler-macros': true
  },
  parserOptions: {
    ecmaVersion: 'latest',
    parser: '@typescript-eslint/parser'
  },
  rules: {
    // Vue 3 specific rules
    'vue/multi-word-component-names': 'off',
    'vue/component-api-style': ['error', ['script-setup']],
    'vue/component-name-in-template-casing': ['error', 'PascalCase'],
    'vue/define-macros-order': ['error', {
      order: ['defineOptions', 'defineProps', 'defineEmits', 'defineSlots']
    }],
    
    // TypeScript rules
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_' 
    }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    
    // General rules
    'prefer-const': 'error',
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  }
}
```

### **Step 9.2: Production Package Scripts**
```json
// package.json scripts section
{
  "scripts": {
    "dev": "vite --host",
    "build": "vue-tsc && vite build",
    "build:analyze": "vite build && npx vite-bundle-analyzer dist/stats.html",
    "preview": "vite preview",
    "lint": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --fix",
    "lint:check": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "type-check": "vue-tsc --noEmit --skipLibCheck",
    "clean": "rm -rf dist node_modules/.vite",
    "reinstall": "rm -rf node_modules package-lock.json && npm install"
  }
}
```

---

## **Phase 10: Example Implementation**

### **Step 10.1: Create Demo Layout**
```vue
<!-- src/components/layout/AppLayout.vue -->
<template>
  <div class="min-h-screen bg-surface-50 dark:bg-surface-950 transition-colors">
    <!-- Header -->
    <header class="bg-surface-0 dark:bg-surface-900 border-b border-surface-200 dark:border-surface-700 sticky top-0 z-50">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center space-x-4">
            <h1 class="text-xl font-bold text-surface-900 dark:text-surface-100">
              Design System
            </h1>
          </div>
          
          <!-- Navigation -->
          <nav class="hidden md:flex space-x-6">
            <router-link 
              v-for="item in navigation"
              :key="item.name"
              :to="item.to"
              class="text-surface-600 dark:text-surface-400 hover:text-primary transition-colors"
            >
              {{ item.name }}
            </router-link>
          </nav>
          
          <!-- Theme Toggle -->
          <div class="flex items-center space-x-4">
            <AppButton
              variant="ghost"
              size="small"
              :dt="themeToggleTokens"
              @click="toggleDarkMode"
            >
              <i :class="isDark ? 'pi pi-sun' : 'pi pi-moon'" />
            </AppButton>
          </div>
        </div>
      </div>
    </header>
    
    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useDarkMode } from '@/composables'
import { AppButton } from '@/components/ui'

const { isDark, toggleDarkMode } = useDarkMode()

const navigation = [
  { name: 'Dashboard', to: '/' },
  { name: 'Components', to: '/components' },
  { name: 'Forms', to: '/forms' },
  { name: 'Data', to: '/data' }
]

const themeToggleTokens = {
  root: {
    width: '2.5rem',
    height: '2.5rem',
    borderRadius: '50%',
    background: 'transparent',
    border: '1px solid {surface.300}',
    color: '{surface.600}',
    '&:hover:not(:disabled)': {
      background: '{surface.100}',
      color: '{surface.900}'
    }
  }
}
</script>
```

### **Step 10.2: Create Components Demo Page**
```vue
<!-- src/views/ComponentsDemo.vue -->
<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="text-center py-8">
      <h1 class="text-4xl font-bold text-surface-900 dark:text-surface-100 mb-4">
        Design System Components
      </h1>
      <p class="text-lg text-surface-600 dark:text-surface-400">
        Built with PrimeVue 4 + Tailwind CSS 4 + Design Tokens
      </p>
    </div>

    <!-- Buttons Section -->
    <AppCard elevation="low">
      <template #title>
        <h2 class="text-2xl font-semibold text-surface-900 dark:text-surface-100">
          Button Variants
        </h2>
      </template>
      
      <div class="space-y-6">
        <!-- Primary buttons -->
        <div class="space-y-3">
          <h3 class="text-lg font-medium text-surface-700 dark:text-surface-300">Primary</h3>
          <div class="flex flex-wrap gap-4">
            <AppButton variant="primary" size="small">Small</AppButton>
            <AppButton variant="primary" size="medium">Medium</AppButton>
            <AppButton variant="primary" size="large">Large</AppButton>
            <AppButton variant="primary" size="medium" rounded>Rounded</AppButton>
          </div>
        </div>

        <!-- All variants -->
        <div class="space-y-3">
          <h3 class="text-lg font-medium text-surface-700 dark:text-surface-300">All Variants</h3>
          <div class="flex flex-wrap gap-4">
            <AppButton variant="primary">Primary</AppButton>
            <AppButton variant="secondary">Secondary</AppButton>
            <AppButton variant="success">Success</AppButton>
            <AppButton variant="warning">Warning</AppButton>
            <AppButton variant="danger">Danger</AppButton>
            <AppButton variant="ghost">Ghost</AppButton>
          </div>
        </div>
      </div>
    </AppCard>

    <!-- Cards Section -->
    <AppCard elevation="low">
      <template #title>
        <h2 class="text-2xl font-semibold text-surface-900 dark:text-surface-100">
          Card Elevations
        </h2>
      </template>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AppCard elevation="flat" padding="small">
          <template #title>Flat</template>
          <p class="text-surface-600 dark:text-surface-400">No shadow elevation</p>
        </AppCard>
        
        <AppCard elevation="low" padding="small">
          <template #title>Low</template>
          <p class="text-surface-600 dark:text-surface-400">Subtle shadow elevation</p>
        </AppCard>
        
        <AppCard elevation="medium" padding="small">
          <template #title>Medium</template>
          <p class="text-surface-600 dark:text-surface-400">Standard shadow elevation</p>
        </AppCard>
        
        <AppCard elevation="high" padding="small">
          <template #title>High</template>
          <p class="text-surface-600 dark:text-surface-400">Prominent shadow elevation</p>
        </AppCard>
      </div>
    </AppCard>

    <!-- Theme Demo -->
    <AppCard elevation="medium">
      <template #title>
        <h2 class="text-2xl font-semibold text-surface-900 dark:text-surface-100">
          Theme System Demo
        </h2>
      </template>
      
      <div class="space-y-4">
        <p class="text-surface-700 dark:text-surface-300">
          This design system uses <code class="bg-surface-200 dark:bg-surface-700 px-2 py-1 rounded text-sm">dt</code> 
          (design tokens) for component customization, ensuring consistency across light and dark themes.
        </p>
        
        <div class="p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <h4 class="font-semibold text-primary mb-2">Key Features:</h4>
          <ul class="list-disc list-inside space-y-1 text-surface-700 dark:text-surface-300">
            <li>CSS-first Tailwind CSS 4 configuration</li>
            <li>PrimeVue 4 design token system</li>
            <li>Automatic dark mode with system detection</li>
            <li>Type-safe component customization</li>
            <li>Performance-optimized build configuration</li>
          </ul>
        </div>
      </div>
    </AppCard>
  </div>
</template>

<script setup lang="ts">
import { AppButton, AppCard } from '@/components/ui'
</script>
```

---

## ✅ **Final Validation Checklist**

After completing all phases, verify:

- [ ] **Project builds without errors** - `npm run build`
- [ ] **TypeScript type checking passes** - `npm run type-check`
- [ ] **ESLint validation passes** - `npm run lint:check`
- [ ] **Dark mode toggles correctly**
- [ ] **Design tokens respond to theme changes**
- [ ] **Tailwind utilities work alongside PrimeVue**
- [ ] **Auto-imports function properly**
- [ ] **Components render with correct styling**
- [ ] **Responsive design works as expected**
- [ ] **Performance optimizations are active** - `npm run build:analyze`

---

## 🎯 **Key Benefits of This Architecture**

### **✅ Styled Mode + Design Tokens (dt)**
- **Theme consistency** across all components
- **Dynamic theming** with automatic dark mode
- **Type-safe customization** with full IntelliSense
- **Performance optimized** with CSS variables

### **✅ Tailwind CSS 4 CSS-First**
- **No config file needed** - everything in CSS
- **Better performance** with Vite plugin
- **Modern color spaces** (OKLCH) for better gradients
- **Seamless integration** with PrimeVue tokens

### **✅ Modern Vue 3 + TypeScript**
- **Strict type safety** with latest compiler features
- **Auto-imports** for better developer experience
- **Performance optimized** with manual chunk splitting
- **Future-proof** architecture

This setup provides a **production-ready, scalable, and maintainable** foundation for modern Vue 3 applications with the perfect balance of design system consistency and development flexibility! 🚀