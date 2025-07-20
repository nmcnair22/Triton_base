# PrimeVue 4 + Tailwind CSS 4 Design System Guide

## 📚 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Design Token System](#design-token-system)
3. [Project Setup](#project-setup)
4. [Global Theme Customization with definePreset](#global-theme-customization-with-definepreset)
5. [Component-Level Customization with dt](#component-level-customization-with-dt)
6. [**NEW:** Runtime Theme Utilities](#runtime-theme-utilities)
7. [**NEW:** Headless Mode & Custom UI](#headless-mode--custom-ui)
8. [**Enhanced:** Pass Through Properties](#enhanced-pass-through-properties)
9. [**Updated:** Layout vs Styling Strategy](#layout-vs-styling-strategy)
10. [Tailwind CSS Integration](#tailwind-css-integration)
11. [Development Patterns](#development-patterns)
12. [Best Practices](#best-practices)
13. [Common Use Cases](#common-use-cases)
14. [Troubleshooting](#troubleshooting)

---

## 🏗️ Architecture Overview

### The Two-Layer System

```
┌─────────────────────────────────────────┐
│           STYLING LAYERS                │
├─────────────────────────────────────────┤
│  🎨 Tailwind CSS 4                     │
│  → Layout, spacing, utilities           │
│  → Grid systems, responsiveness         │
│  → Custom utilities                     │
├─────────────────────────────────────────┤
│  🎯 PrimeVue 4 Theme System            │
│  → Component styling via design tokens  │
│  → Dynamic theming (dark/light)         │
│  → Component-specific behavior          │
└─────────────────────────────────────────┘
```

### **🆕 PrimeVue 4.3.x: Three Rendering Modes**

| **Mode** | **When to Use** | **Styling Method** |
|----------|-----------------|-------------------|
| **Styled Mode** | Production apps, rapid development | Design tokens (`dt`) + presets |
| **Unstyled Mode** | Complete control, custom design | Pass-through (`pt`) + Tailwind |
| **🆕 Headless Mode** | Custom UI, accessibility preserved | `asChild` + custom rendering |

### Responsibility Separation

| **Tailwind CSS 4** | **PrimeVue Theme System** |
|-------------------|---------------------------|
| Layout (`grid`, `flex`) | Component styles (`button`, `card`) |
| Spacing (`p-4`, `m-2`) | Theme colors (`primary`, `surface`) |
| Typography (`text-lg`) | Interactive states (`hover`, `focus`) |
| Responsive design | Dark/light mode switching |
| Custom utilities | Accessibility styling |

---

## 🎨 Design Token System

### Three-Tier Hierarchy

```javascript
// 1. PRIMITIVE TOKENS (Raw values)
const primitiveTokens = {
  blue: {
    50: '#eff6ff',
    500: '#3b82f6', 
    900: '#1e3a8a'
  },
  spacing: {
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem'
  }
}

// 2. SEMANTIC TOKENS (Contextual meaning)
const semanticTokens = {
  primary: {
    color: '{blue.500}',        // Points to primitive
    contrastColor: '{white}'
  },
  surface: {
    0: '{white}',
    100: '{gray.100}',
    900: '{gray.900}'
  }
}

// 3. COMPONENT TOKENS (Specific usage)
const componentTokens = {
  button: {
    primary: {
      background: '{primary.color}',     // Points to semantic
      color: '{primary.contrastColor}',
      borderRadius: '{border.radius.md}'
    }
  }
}
```

### **🆕 Programmatic Token Access**

```javascript
import { $dt } from '@primeuix/themes'

// Get token information
const primaryColor = $dt('primary.color')
/*
Returns: {
  name: '--primary-color',
  variable: 'var(--p-primary-color)',
  value: {
    light: { value: '#10b981' },
    dark: { value: '#34d399' }
  }
}
*/

// Use in computed properties
const tokenValue = $dt('transition.duration').value // '0.2s'
```

### Token Reference Syntax

```javascript
// ✅ Correct token references
'{primary.color}'           // Semantic token
'{surface.100}'            // Semantic with variant
'{blue.500}'              // Primitive token
'{button.background}'     // Component token

// ❌ Incorrect usage
'primary.color'           // Missing braces
'#3b82f6'                // Direct value (not dynamic)
```

---

## ⚙️ Project Setup

### 1. Install Dependencies

```bash
npm install primevue@^4.0.0 @primeuix/themes
npm install -D tailwindcss@^4.0.0 @tailwindcss/primeui
```

### 2. Vite Configuration

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  css: {
    preprocessorOptions: {
      css: {
        additionalData: `@import "@primeuix/themes/aura";`
      }
    }
  }
})
```

### 3. Tailwind Configuration

```javascript
// tailwind.config.js
import primeui from '@tailwindcss/primeui'

export default {
  content: ['./src/**/*.{vue,js,ts}'],
  plugins: [primeui],
  theme: {
    extend: {
      // Custom utilities that work with PrimeVue tokens
      colors: {
        'primary': 'rgb(var(--p-primary-color) / <alpha-value>)',
        'surface': 'rgb(var(--p-surface-color) / <alpha-value>)'
      }
    }
  }
}
```

### 4. Main Application Setup

```javascript
// main.js
import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'
import './style.css'
import App from './App.vue'

// Define your custom preset
const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{blue.50}',
      100: '{blue.100}',
      200: '{blue.200}',
      300: '{blue.300}',
      400: '{blue.400}',
      500: '{blue.500}',
      600: '{blue.600}',
      700: '{blue.700}',
      800: '{blue.800}',
      900: '{blue.900}',
      950: '{blue.950}'
    }
  }
})

const app = createApp(App)

app.use(PrimeVue, {
  theme: {
    preset: MyPreset,
    options: {
      prefix: 'p',
      darkModeSelector: '.dark',
      cssLayer: {
        name: 'primevue',
        order: 'tailwind-base, primevue, tailwind-utilities'
      }
    }
  }
})

app.mount('#app')
```

---

## 🎯 Global Theme Customization with definePreset

### Basic Preset Customization

```javascript
// themes/custom-preset.js
import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'

export const CustomPreset = definePreset(Aura, {
  // Override semantic tokens
  semantic: {
    primary: {
      50: '{purple.50}',
      100: '{purple.100}',
      500: '{purple.500}',
      600: '{purple.600}',
      700: '{purple.700}',
      800: '{purple.800}',
      900: '{purple.900}'
    },
    colorScheme: {
      light: {
        primary: {
          color: '{purple.600}',
          contrastColor: '{white}',
          hoverColor: '{purple.700}',
          activeColor: '{purple.800}'
        },
        surface: {
          0: '{white}',
          50: '{gray.50}',
          100: '{gray.100}',
          200: '{gray.200}',
          300: '{gray.300}',
          400: '{gray.400}',
          500: '{gray.500}'
        }
      },
      dark: {
        primary: {
          color: '{purple.400}',
          contrastColor: '{gray.900}',
          hoverColor: '{purple.300}',
          activeColor: '{purple.200}'
        },
        surface: {
          0: '{gray.950}',
          50: '{gray.900}',
          100: '{gray.800}',
          200: '{gray.700}',
          300: '{gray.600}',
          400: '{gray.500}',
          500: '{gray.400}'
        }
      }
    }
  },
  
  // Override component tokens
  components: {
    button: {
      root: {
        borderRadius: '{border.radius.lg}',
        fontWeight: '600',
        transition: 'all 0.2s ease-in-out'
      },
      colorScheme: {
        light: {
          primary: {
            background: '{primary.color}',
            hoverBackground: '{primary.hoverColor}',
            activeBackground: '{primary.activeColor}',
            borderColor: '{primary.color}',
            color: '{primary.contrastColor}'
          },
          secondary: {
            background: 'transparent',
            hoverBackground: '{surface.100}',
            activeBackground: '{surface.200}',
            borderColor: '{surface.300}',
            color: '{surface.700}'
          }
        },
        dark: {
          primary: {
            background: '{primary.color}',
            hoverBackground: '{primary.hoverColor}',
            activeBackground: '{primary.activeColor}',
            borderColor: '{primary.color}',
            color: '{primary.contrastColor}'
          }
        }
      }
    },
    
    card: {
      root: {
        background: '{surface.0}',
        borderRadius: '{border.radius.xl}',
        border: '1px solid {surface.200}',
        shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      },
      body: {
        padding: '1.5rem'
      },
      title: {
        fontSize: '1.25rem',
        fontWeight: '600',
        color: '{surface.900}'
      }
    }
  }
})
```

### Conditional Preset Customization

```javascript
// themes/brand-presets.js
import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'

// Create different presets for different brands
export const createBrandPreset = (brandConfig) => {
  return definePreset(Aura, {
    semantic: {
      primary: brandConfig.primary,
      ...brandConfig.semantic
    },
    components: {
      button: {
        root: {
          borderRadius: brandConfig.borderRadius || '{border.radius.md}',
          fontFamily: brandConfig.fontFamily || 'inherit'
        }
      }
    }
  })
}

// Usage
export const CorporatePreset = createBrandPreset({
  primary: {
    500: '#1f2937', // Corporate gray
    600: '#111827',
    700: '#030712'
  },
  borderRadius: '{border.radius.sm}', // More conservative
  fontFamily: '"Inter", system-ui, sans-serif'
})

export const StartupPreset = createBrandPreset({
  primary: {
    500: '#8b5cf6', // Purple
    600: '#7c3aed',
    700: '#6d28d9'
  },
  borderRadius: '{border.radius.xl}', // More playful
  fontFamily: '"Poppins", system-ui, sans-serif'
})
```

---

## 🎨 Component-Level Customization with dt

### Basic dt Usage

```vue
<template>
  <!-- Single component override -->
  <Button 
    label="Custom Button"
    :dt="{
      root: {
        background: '{red.500}',
        borderRadius: '2rem',
        padding: '0.75rem 1.5rem'
      }
    }"
  />
  
  <!-- Maintaining theme consistency -->
  <Button 
    label="Themed Button"
    :dt="{
      root: {
        background: '{primary.600}', // Still uses theme tokens
        fontSize: '1.125rem',
        fontWeight: '700'
      }
    }"
  />
</template>
```

### Advanced dt Patterns

```vue
<template>
  <!-- Responsive dt values -->
  <DataTable 
    :value="products"
    :dt="{
      root: {
        fontSize: { 
          base: '0.875rem', 
          md: '1rem' 
        }
      },
      header: {
        background: '{surface.50}',
        borderBottom: '2px solid {primary.color}'
      },
      bodyRow: {
        '&:hover': {
          background: '{primary.50}'
        }
      }
    }"
  />
  
  <!-- Conditional dt based on props -->
  <Card 
    :dt="getCardTokens(variant)"
    :class="getCardClasses(variant)"
  >
    <template #title>{{ title }}</template>
    <template #content>{{ content }}</template>
  </Card>
</template>

<script setup>
interface Props {
  variant: 'default' | 'success' | 'warning' | 'error'
  title: string
  content: string
}

const props = defineProps<Props>()

// Dynamic dt based on props
const getCardTokens = (variant: string) => {
  const tokens = {
    root: {
      borderRadius: '{border.radius.lg}',
      padding: '1.5rem'
    }
  }
  
  switch (variant) {
    case 'success':
      return {
        ...tokens,
        root: {
          ...tokens.root,
          background: '{green.50}',
          borderColor: '{green.200}',
          color: '{green.900}'
        }
      }
    case 'warning':
      return {
        ...tokens,
        root: {
          ...tokens.root,
          background: '{yellow.50}',
          borderColor: '{yellow.200}',
          color: '{yellow.900}'
        }
      }
    case 'error':
      return {
        ...tokens,
        root: {
          ...tokens.root,
          background: '{red.50}',
          borderColor: '{red.200}',
          color: '{red.900}'
        }
      }
    default:
      return tokens
  }
}

// Tailwind classes for layout (not theming)
const getCardClasses = (variant: string) => {
  return [
    'transform transition-transform duration-200',
    'hover:scale-105',
    variant === 'error' ? 'shadow-lg' : 'shadow-md'
  ].join(' ')
}
</script>
```

### Page-Level dt Customization

```vue
<!-- ProductPage.vue -->
<template>
  <div class="min-h-screen bg-surface-50">
    <!-- Page-specific theme overrides -->
    <div :style="pageThemeVars">
      <!-- Header with custom styling -->
      <Toolbar 
        :dt="toolbarTokens"
        class="mb-8"
      >
        <template #start>
          <h1 class="text-2xl font-bold text-surface-900">Products</h1>
        </template>
        <template #end>
          <Button 
            label="Add Product" 
            icon="pi pi-plus"
            :dt="primaryButtonTokens"
            class="ml-4"
          />
        </template>
      </Toolbar>
      
      <!-- Product cards with consistent theming -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        <Card 
          v-for="product in products"
          :key="product.id"
          :dt="productCardTokens"
          class="cursor-pointer hover:shadow-xl transition-shadow duration-300"
        >
          <template #title>{{ product.name }}</template>
          <template #content>
            <p class="text-surface-600 mb-4">{{ product.description }}</p>
            <div class="flex justify-between items-center">
              <span class="text-2xl font-bold text-primary-600">
                ${{ product.price }}
              </span>
              <Button 
                label="Add to Cart"
                size="small"
                :dt="secondaryButtonTokens"
              />
            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Page-specific CSS variables
const pageThemeVars = computed(() => ({
  '--p-primary-color': '59 130 246', // Blue-500 RGB
  '--p-primary-contrast-color': '255 255 255',
  '--product-card-hover-bg': '239 246 255' // Blue-50 RGB
}))

// Consistent dt tokens for this page
const toolbarTokens = {
  root: {
    background: '{surface.0}',
    borderBottom: '1px solid {surface.200}',
    padding: '1rem 1.5rem'
  }
}

const productCardTokens = {
  root: {
    background: '{surface.0}',
    borderRadius: '{border.radius.xl}',
    border: '1px solid {surface.200}',
    transition: 'all 0.3s ease'
  },
  body: {
    padding: '1.5rem'
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '{surface.900}',
    marginBottom: '0.5rem'
  }
}

const primaryButtonTokens = {
  root: {
    background: '{primary.color}',
    borderColor: '{primary.color}',
    color: '{primary.contrastColor}',
    borderRadius: '{border.radius.lg}',
    fontWeight: '600',
    padding: '0.75rem 1.5rem'
  }
}

const secondaryButtonTokens = {
  root: {
    background: 'transparent',
    borderColor: '{primary.color}',
    color: '{primary.color}',
    borderRadius: '{border.radius.lg}',
    fontWeight: '500',
    padding: '0.5rem 1rem'
  }
}
</script>
```

---

## 🆕 **Runtime Theme Utilities**

### Dynamic Preset Management

```javascript
import { 
  usePreset, 
  updatePreset, 
  updatePrimaryPalette, 
  updateSurfacePalette,
  palette 
} from '@primeuix/themes'

// 1. Switch entire presets at runtime
const switchToMaterialTheme = () => {
  usePreset(MaterialPreset)
}

// 2. Update specific tokens
const changePrimaryColor = () => {
  updatePreset({
    semantic: {
      primary: {
        50: '{indigo.50}',
        500: '{indigo.500}',
        900: '{indigo.900}'
      }
    }
  })
}

// 3. Shorthand for primary colors
const updatePrimary = () => {
  updatePrimaryPalette({
    50: '{purple.50}',
    500: '{purple.500}',
    900: '{purple.900}'
  })
}

// 4. Update surface colors
const updateSurfaces = () => {
  updateSurfacePalette({
    light: {
      0: '{white}',
      100: '{gray.100}',
      900: '{gray.900}'
    },
    dark: {
      0: '{slate.950}',
      100: '{slate.800}',
      900: '{slate.100}'
    }
  })
}

// 5. Generate color palettes
const customPalette = palette('#10b981') // Generates 50-950 shades
const bluePalette = palette('{blue}') // Copy existing palette
```

### Theme Picker Component

```vue
<!-- ThemePicker.vue -->
<template>
  <div class="theme-picker p-4 border rounded-lg">
    <h3 class="text-lg font-semibold mb-4">Theme Customizer</h3>
    
    <!-- Preset Switcher -->
    <div class="mb-6">
      <label class="block text-sm font-medium mb-2">Theme Preset</label>
      <Select 
        v-model="selectedPreset" 
        :options="presetOptions"
        option-label="name"
        option-value="value"
        @change="onPresetChange"
        class="w-full"
      />
    </div>
    
    <!-- Primary Color Picker -->
    <div class="mb-6">
      <label class="block text-sm font-medium mb-2">Primary Color</label>
      <div class="grid grid-cols-6 gap-2">
        <button
          v-for="color in colorOptions"
          :key="color.name"
          @click="updatePrimaryColor(color.value)"
          class="w-8 h-8 rounded-full border-2 border-white shadow-md hover:scale-110 transition-transform"
          :style="{ backgroundColor: color.preview }"
          :title="color.name"
        />
      </div>
    </div>
    
    <!-- Dark Mode Toggle -->
    <div class="mb-6">
      <label class="flex items-center gap-2">
        <ToggleSwitch v-model="isDarkMode" @change="toggleDarkMode" />
        <span class="text-sm font-medium">Dark Mode</span>
      </label>
    </div>
    
    <!-- Scale Adjustment -->
    <div class="mb-6">
      <label class="block text-sm font-medium mb-2">Component Scale</label>
      <Slider 
        v-model="scale" 
        :min="0.8" 
        :max="1.2" 
        :step="0.1"
        @change="updateScale"
        class="w-full"
      />
      <div class="text-xs text-surface-600 mt-1">{{ scale }}x</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { 
  usePreset, 
  updatePrimaryPalette, 
  palette,
  $dt 
} from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'
import Material from '@primeuix/themes/material'

const selectedPreset = ref('aura')
const isDarkMode = ref(false)
const scale = ref(1.0)

const presetOptions = [
  { name: 'Aura', value: 'aura' },
  { name: 'Material', value: 'material' },
  { name: 'Lara', value: 'lara' }
]

const colorOptions = [
  { name: 'Blue', value: 'blue', preview: '#3b82f6' },
  { name: 'Purple', value: 'purple', preview: '#8b5cf6' },
  { name: 'Green', value: 'emerald', preview: '#10b981' },
  { name: 'Red', value: 'red', preview: '#ef4444' },
  { name: 'Orange', value: 'orange', preview: '#f97316' },
  { name: 'Pink', value: 'pink', preview: '#ec4899' }
]

const onPresetChange = () => {
  const presets = {
    aura: Aura,
    material: Material,
    // Add more presets as needed
  }
  
  usePreset(presets[selectedPreset.value])
}

const updatePrimaryColor = (colorName) => {
  const generatedPalette = palette(`{${colorName}}`)
  updatePrimaryPalette(generatedPalette)
}

const toggleDarkMode = () => {
  document.documentElement.classList.toggle('dark', isDarkMode.value)
}

const updateScale = () => {
  document.documentElement.style.fontSize = `${scale.value}rem`
}

onMounted(() => {
  // Check system dark mode preference
  isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  
  // Apply initial dark mode
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
  }
})
</script>
```

---

## 🆕 **Headless Mode & Custom UI**

### Understanding Headless Mode

Headless mode allows you to keep PrimeVue's functionality and accessibility while completely customizing the UI using the `asChild` property.

```vue
<template>
  <!-- Standard Button -->
  <Button label="Standard" icon="pi pi-check" />
  
  <!-- Headless Button with Custom UI -->
  <Button v-slot="slotProps" asChild>
    <button
      v-bind="slotProps.a11yAttrs"
      class="custom-gradient-button"
      @click="slotProps.onClick"
    >
      <i class="pi pi-star"></i>
      <span>Custom UI</span>
    </button>
  </Button>
</template>

<style scoped>
.custom-gradient-button {
  @apply rounded-lg bg-gradient-to-br from-primary-400 to-primary-700;
  @apply active:from-primary-700 active:to-primary-900;
  @apply text-white border-none px-6 py-3 font-bold;
  @apply hover:ring-2 cursor-pointer ring-offset-2;
  @apply ring-offset-surface-0 dark:ring-offset-surface-900;
  @apply ring-primary transition-all flex items-center gap-2;
}
</style>
```

### Advanced Headless Components

```vue
<!-- CustomDialog.vue -->
<template>
  <Dialog 
    v-model:visible="visible" 
    pt:root:class="!border-0 !bg-transparent" 
    pt:mask:class="backdrop-blur-sm"
  >
    <template #container="{ closeCallback }">
      <div class="custom-dialog-container">
        <!-- Custom Header -->
        <div class="dialog-header">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center">
              <i class="pi pi-user text-white"></i>
            </div>
            <div>
              <h2 class="text-xl font-bold text-surface-900 dark:text-surface-0">
                {{ title }}
              </h2>
              <p class="text-sm text-surface-600 dark:text-surface-400">
                {{ subtitle }}
              </p>
            </div>
          </div>
          <Button 
            icon="pi pi-times" 
            text 
            rounded 
            @click="closeCallback"
            class="text-surface-500 hover:text-surface-700"
          />
        </div>
        
        <!-- Custom Content -->
        <div class="dialog-content">
          <slot :close="closeCallback" />
        </div>
        
        <!-- Custom Footer -->
        <div class="dialog-footer" v-if="$slots.footer">
          <slot name="footer" :close="closeCallback" />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup>
interface Props {
  visible: boolean
  title: string
  subtitle?: string
}

defineProps<Props>()
defineEmits<{
  'update:visible': [value: boolean]
}>()
</script>

<style scoped>
.custom-dialog-container {
  @apply flex flex-col bg-surface-0 dark:bg-surface-900;
  @apply rounded-2xl shadow-2xl overflow-hidden;
  @apply min-w-96 max-w-2xl mx-auto;
  background-image: 
    linear-gradient(135deg, 
      rgb(var(--p-surface-0)) 0%, 
      rgb(var(--p-surface-50)) 100%
    );
}

.dialog-header {
  @apply flex items-center justify-between p-6;
  @apply border-b border-surface-200 dark:border-surface-700;
}

.dialog-content {
  @apply p-6 flex-1;
}

.dialog-footer {
  @apply flex justify-end gap-3 p-6;
  @apply border-t border-surface-200 dark:border-surface-700;
  @apply bg-surface-50 dark:bg-surface-800;
}
</style>
```

### Headless Data Components

```vue
<!-- CustomDataTable.vue -->
<template>
  <DataTable :value="data" class="custom-table">
    <!-- Headless Pagination -->
    <template #paginatorcontainer="{ first, last, page, pageCount, prevPageCallback, nextPageCallback, totalRecords }">
      <div class="flex items-center justify-between p-4 bg-surface-50 dark:bg-surface-800 rounded-lg">
        <div class="flex items-center gap-4">
          <Button 
            icon="pi pi-angle-double-left" 
            text 
            @click="prevPageCallback" 
            :disabled="page === 0"
            class="text-primary-500"
          />
          <div class="flex items-center gap-2">
            <span class="text-sm text-surface-600 dark:text-surface-400">Page</span>
            <Badge :value="page + 1" class="bg-primary-500" />
            <span class="text-sm text-surface-600 dark:text-surface-400">of {{ pageCount }}</span>
          </div>
          <Button 
            icon="pi pi-angle-double-right" 
            text 
            @click="nextPageCallback" 
            :disabled="page === pageCount - 1"
            class="text-primary-500"
          />
        </div>
        
        <div class="text-sm text-surface-600 dark:text-surface-400">
          Showing {{ first + 1 }} to {{ last }} of {{ totalRecords }} entries
        </div>
      </div>
    </template>
    
    <!-- Custom Column Headers -->
    <Column field="name" header="Name" sortable>
      <template #header>
        <div class="flex items-center gap-2">
          <i class="pi pi-user text-primary-500"></i>
          <span class="font-semibold">Customer Name</span>
        </div>
      </template>
    </Column>
    
    <Column field="status" header="Status">
      <template #body="{ data }">
        <Badge 
          :value="data.status" 
          :severity="getStatusSeverity(data.status)"
          class="font-semibold"
        />
      </template>
    </Column>
  </DataTable>
</template>

<script setup>
interface Props {
  data: any[]
}

defineProps<Props>()

const getStatusSeverity = (status: string) => {
  const severities = {
    'active': 'success',
    'inactive': 'danger',
    'pending': 'warning'
  }
  return severities[status] || 'info'
}
</script>
```

---

## 🔧 **Enhanced Pass Through Properties**

### Declarative vs Programmatic Syntax

```vue
<template>
  <!-- Declarative Syntax (New in 4.3.x) -->
  <Panel
    pt:root:class="border border-primary rounded-xl p-4"
    pt:header:id="customHeaderId"
    pt:header:data-testid="panel-header"
    pt:header:class="bg-primary-50 text-primary-900 font-bold"
    :pt:header:onClick="onHeaderClick"
    pt:content:class="text-primary-700 dark:text-primary-200 mt-4"
    pt:title:class="text-xl"
  >
    <template #header>Custom Panel</template>
    Content goes here
  </Panel>
  
  <!-- Programmatic Syntax (Traditional) -->
  <Panel
    :pt="{
      root: { class: 'border border-primary rounded-xl p-4' },
      header: {
        id: 'customHeaderId',
        'data-testid': 'panel-header',
        class: 'bg-primary-50 text-primary-900 font-bold',
        onClick: onHeaderClick
      },
      content: { class: 'text-primary-700 dark:text-primary-200 mt-4' },
      title: { class: 'text-xl' }
    }"
  >
    <template #header>Custom Panel</template>
    Content goes here
  </Panel>
</template>
```

### Global Pass Through Configuration

```javascript
// main.js - Global PT configuration
app.use(PrimeVue, {
  unstyled: true,
  pt: {
    // Global button styling
    button: {
      root: 'inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
      label: 'text-sm',
      icon: 'w-4 h-4'
    },
    
    // Global panel styling
    panel: {
      root: 'bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg overflow-hidden',
      header: 'flex items-center justify-between p-4 bg-surface-50 dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700',
      content: 'p-4',
      title: 'text-lg font-semibold text-surface-900 dark:text-surface-0',
      toggler: 'w-6 h-6 text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-0'
    },
    
    // Global input styling
    inputtext: {
      root: ({ props, state }) => ({
        class: [
          'w-full px-3 py-2 border rounded-lg transition-colors',
          'bg-surface-0 dark:bg-surface-900',
          'border-surface-300 dark:border-surface-600',
          'text-surface-900 dark:text-surface-0',
          'placeholder:text-surface-500 dark:placeholder:text-surface-400',
          {
            'border-primary-500 focus:ring-2 focus:ring-primary-500/20': !state.invalid,
            'border-red-500 focus:ring-2 focus:ring-red-500/20': state.invalid,
            'opacity-60 cursor-not-allowed': props.disabled
          }
        ]
      })
    }
  }
})
```

### Dynamic Pass Through with Functions

```vue
<!-- DynamicStyledComponent.vue -->
<template>
  <div class="space-y-4">
    <InputText 
      v-model="username"
      placeholder="Username"
      :pt="getInputPT('username')"
    />
    
    <Password 
      v-model="password"
      placeholder="Password"
      :pt="getInputPT('password')"
    />
    
    <Button
      label="Submit"
      :pt="getButtonPT('primary')"
      @click="onSubmit"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const username = ref('')
const password = ref('')
const errors = ref({})

// Dynamic PT based on validation state
const getInputPT = (field: string) => {
  const hasError = errors.value[field]
  const hasValue = field === 'username' ? username.value : password.value
  
  return {
    root: ({ state }) => ({
      class: [
        'w-full px-4 py-3 border-2 rounded-lg transition-all duration-200',
        'bg-surface-0 dark:bg-surface-900',
        'placeholder:text-surface-400 dark:placeholder:text-surface-500',
        {
          // Success state
          'border-green-300 focus:border-green-500 focus:ring-green-500/20': 
            hasValue && !hasError && !state.focused,
          
          // Error state  
          'border-red-300 focus:border-red-500 focus:ring-red-500/20': 
            hasError,
          
          // Default state
          'border-surface-300 focus:border-primary-500 focus:ring-primary-500/20': 
            !hasError && !hasValue,
          
          // Focus state
          'ring-2': state.focused,
          
          // Hover state
          'hover:border-surface-400': !state.focused && !hasError
        }
      ]
    })
  }
}

const getButtonPT = (variant: string) => {
  const variants = {
    primary: {
      root: 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white',
    },
    secondary: {
      root: 'bg-surface-200 hover:bg-surface-300 text-surface-900',
    }
  }
  
  return {
    root: [
      'px-6 py-3 rounded-lg font-semibold transition-all duration-200',
      'focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      variants[variant]?.root
    ]
  }
}

const onSubmit = () => {
  // Validation logic
  const newErrors = {}
  
  if (!username.value) {
    newErrors.username = 'Username is required'
  }
  
  if (!password.value) {
    newErrors.password = 'Password is required'
  }
  
  errors.value = newErrors
}
</script>
```

---

## 📐 **Layout vs Styling Strategy**

### Clear Separation of Concerns

```vue
<template>
  <!-- ✅ GOOD: Clear separation -->
  <div class="container mx-auto px-4 py-8">                    <!-- Tailwind: Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">       <!-- Tailwind: Layout -->
      
      <!-- Sidebar: Tailwind layout + PrimeVue styling -->
      <aside class="lg:col-span-1">                           <!-- Tailwind: Layout -->
        <Card 
          :dt="sidebarCardTokens"                             <!-- PrimeVue: Styling -->
          class="sticky top-4"                                <!-- Tailwind: Position -->
        >
          <template #title>Filters</template>
          <template #content>
            <div class="space-y-4">                           <!-- Tailwind: Layout -->
              <div class="space-y-2">                         <!-- Tailwind: Layout -->
                <label class="block text-sm font-medium">    <!-- Tailwind: Typography -->
                  Category
                </label>
                <Dropdown 
                  v-model="selectedCategory"
                  :options="categories"
                  :dt="dropdownTokens"                        <!-- PrimeVue: Styling -->
                  class="w-full"                              <!-- Tailwind: Layout -->
                />
              </div>
            </div>
          </template>
        </Card>
      </aside>
      
      <!-- Main Content -->
      <main class="lg:col-span-2">                           <!-- Tailwind: Layout -->
        <div class="flex flex-col space-y-6">                <!-- Tailwind: Layout -->
          <!-- Products Grid -->
          <div 
            class="grid gap-6"                               <!-- Tailwind: Layout -->
            :class="{
              'grid-cols-1 md:grid-cols-2': viewMode === 'grid',
              'grid-cols-1': viewMode === 'list'
            }"
          >
            <ProductCard 
              v-for="product in filteredProducts"
              :key="product.id"
              :product="product"
              :view-mode="viewMode"
              :dt="productCardTokens"                        <!-- PrimeVue: Styling -->
            />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
// PrimeVue: Component styling tokens
const sidebarCardTokens = {
  root: {
    background: '{surface.0}',
    border: '1px solid {surface.200}',
    borderRadius: '{border.radius.lg}',
    shadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  }
}

const dropdownTokens = {
  root: {
    borderColor: '{surface.300}',
    borderRadius: '{border.radius.md}',
    '&:focus': {
      borderColor: '{primary.color}',
      outline: '2px solid {primary.color}/20'
    }
  }
}

const productCardTokens = {
  root: {
    background: '{surface.0}',
    borderRadius: '{border.radius.xl}',
    border: '1px solid {surface.200}',
    transition: 'all 0.3s ease',
    '&:hover': {
      shadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      transform: 'translateY(-2px)'
    }
  }
}
</script>
```

### **❌ What NOT to Do**

```vue
<template>
  <!-- ❌ BAD: Mixing concerns -->
  <Card 
    :dt="{
      root: {
        display: 'grid',                    <!-- Should use Tailwind classes -->
        gridTemplateColumns: '1fr 1fr',    <!-- Should use Tailwind classes -->
        gap: '1rem',                       <!-- Should use Tailwind classes -->
        background: '{surface.0}',         <!-- This is correct -->
        padding: '2rem'                    <!-- Should use Tailwind classes -->
      }
    }"
  >
    <!-- Wrong approach -->
  </Card>
  
  <!-- ✅ GOOD: Proper separation -->
  <Card 
    class="grid grid-cols-2 gap-4 p-8"   <!-- Tailwind: Layout -->
    :dt="{
      root: {
        background: '{surface.0}',         <!-- PrimeVue: Theming -->
        borderRadius: '{border.radius.lg}',
        border: '1px solid {surface.200}'
      }
    }"
  >
    <!-- Correct approach -->
  </Card>
</template>
```

### **When to Use What**

| **Use Tailwind CSS For** | **Use PrimeVue Tokens For** |
|---------------------------|------------------------------|
| Grid layouts (`grid`, `grid-cols-3`) | Component backgrounds (`background: '{surface.0}'`) |
| Flexbox (`flex`, `items-center`) | Theme colors (`color: '{primary.color}'`) |
| Spacing (`p-4`, `m-2`, `space-y-4`) | Borders (`border: '1px solid {surface.200}'`) |
| Typography (`text-lg`, `font-bold`) | Border radius (`borderRadius: '{border.radius.lg}'`) |
| Responsive design (`md:grid-cols-2`) | Interactive states (`'&:hover': { ... }`) |
| Positioning (`absolute`, `sticky`) | Shadows (`shadow: '0 4px 6px rgba(0,0,0,0.1)'`) |
| Z-index (`z-10`, `z-50`) | Component-specific styling |
| Transforms (`rotate-45`, `scale-105`) | Dark mode theming |

---

## 🎨 Tailwind CSS Integration

### CSS Layer Configuration

```css
/* styles/main.css */
@layer tailwind-base, primevue, tailwind-utilities;

@import "tailwindcss";

/* Custom utilities that work with PrimeVue tokens */
@layer tailwind-utilities {
  .text-primary {
    color: rgb(var(--p-primary-color));
  }
  
  .bg-primary {
    background-color: rgb(var(--p-primary-color));
  }
  
  .border-primary {
    border-color: rgb(var(--p-primary-color));
  }
  
  .bg-surface {
    background-color: rgb(var(--p-surface-color));
  }
}
```

### Layout with Tailwind, Styling with PrimeVue

```vue
<template>
  <!-- Tailwind: Layout & Structure -->
  <div class="container mx-auto px-4 py-8">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Sidebar: Tailwind layout + PrimeVue components -->
      <aside class="lg:col-span-1">
        <Card 
          :dt="sidebarCardTokens"
          class="sticky top-4" 
        >
          <template #title>Filters</template>
          <template #content>
            <div class="space-y-4">
              <!-- Tailwind spacing, PrimeVue component styling -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-surface-700">
                  Category
                </label>
                <Dropdown 
                  v-model="selectedCategory"
                  :options="categories"
                  :dt="dropdownTokens"
                  class="w-full"
                />
              </div>
              
              <div class="space-y-2">
                <label class="block text-sm font-medium text-surface-700">
                  Price Range
                </label>
                <Slider 
                  v-model="priceRange"
                  :min="0" 
                  :max="1000"
                  :dt="sliderTokens"
                  class="w-full"
                />
              </div>
            </div>
          </template>
        </Card>
      </aside>
      
      <!-- Main Content: Tailwind layout + PrimeVue components -->
      <main class="lg:col-span-2">
        <div class="flex flex-col space-y-6">
          <!-- Header with Tailwind flexbox -->
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 class="text-3xl font-bold text-surface-900">
              Products
            </h1>
            <div class="flex space-x-2">
              <Button 
                :label="`Sort: ${sortBy}`"
                icon="pi pi-sort"
                :dt="sortButtonTokens"
                @click="toggleSort"
              />
              <Button 
                icon="pi pi-th-large"
                :dt="viewButtonTokens"
                :class="{ 'bg-primary text-white': viewMode === 'grid' }"
                @click="viewMode = 'grid'"
              />
              <Button 
                icon="pi pi-list"
                :dt="viewButtonTokens"
                :class="{ 'bg-primary text-white': viewMode === 'list' }"
                @click="viewMode = 'list'"
              />
            </div>
          </div>
          
          <!-- Products Grid: Tailwind responsive grid -->
          <div 
            class="grid gap-6"
            :class="{
              'grid-cols-1 md:grid-cols-2': viewMode === 'grid',
              'grid-cols-1': viewMode === 'list'
            }"
          >
            <ProductCard 
              v-for="product in filteredProducts"
              :key="product.id"
              :product="product"
              :view-mode="viewMode"
              :dt="productCardTokens"
            />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
// Component styling tokens
const sidebarCardTokens = {
  root: {
    background: '{surface.0}',
    border: '1px solid {surface.200}',
    borderRadius: '{border.radius.lg}',
    shadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  }
}

const dropdownTokens = {
  root: {
    borderColor: '{surface.300}',
    borderRadius: '{border.radius.md}',
    '&:focus': {
      borderColor: '{primary.color}',
      outline: '2px solid {primary.color}/20'
    }
  }
}

// ... other tokens
</script>
```

---

## 🔄 Development Patterns

### 1. Theme Context Composition

```javascript
// composables/useTheme.js
import { computed, inject, provide } from 'vue'

const THEME_CONTEXT = Symbol('theme-context')

export function provideTheme(themeConfig) {
  provide(THEME_CONTEXT, themeConfig)
}

export function useTheme() {
  const theme = inject(THEME_CONTEXT, {
    variant: 'default',
    size: 'medium',
    colorScheme: 'light'
  })
  
  const getComponentTokens = (component, overrides = {}) => {
    const baseTokens = {
      root: {
        borderRadius: theme.variant === 'rounded' ? '{border.radius.xl}' : '{border.radius.md}',
        fontSize: theme.size === 'large' ? '1.125rem' : '1rem'
      }
    }
    
    return mergeTokens(baseTokens, overrides)
  }
  
  return {
    theme: computed(() => theme),
    getComponentTokens
  }
}

function mergeTokens(base, overrides) {
  // Deep merge implementation
  return deepMerge(base, overrides)
}
```

### 2. Component Token Factory

```javascript
// utils/token-factory.js
export class TokenFactory {
  constructor(baseTheme) {
    this.baseTheme = baseTheme
  }
  
  button(variant = 'primary', size = 'medium') {
    const sizeTokens = {
      small: { padding: '0.5rem 0.75rem', fontSize: '0.875rem' },
      medium: { padding: '0.625rem 1rem', fontSize: '1rem' },
      large: { padding: '0.75rem 1.25rem', fontSize: '1.125rem' }
    }
    
    const variantTokens = {
      primary: {
        background: '{primary.color}',
        color: '{primary.contrastColor}',
        borderColor: '{primary.color}'
      },
      secondary: {
        background: 'transparent',
        color: '{primary.color}',
        borderColor: '{primary.color}'
      },
      success: {
        background: '{green.500}',
        color: '{white}',
        borderColor: '{green.500}'
      }
    }
    
    return {
      root: {
        ...sizeTokens[size],
        ...variantTokens[variant],
        borderRadius: '{border.radius.md}',
        fontWeight: '500',
        transition: 'all 0.2s ease-in-out'
      }
    }
  }
  
  card(elevation = 'medium') {
    const elevationTokens = {
      low: { shadow: '0 1px 2px rgba(0, 0, 0, 0.05)' },
      medium: { shadow: '0 4px 6px rgba(0, 0, 0, 0.1)' },
      high: { shadow: '0 20px 25px rgba(0, 0, 0, 0.15)' }
    }
    
    return {
      root: {
        background: '{surface.0}',
        borderRadius: '{border.radius.lg}',
        border: '1px solid {surface.200}',
        ...elevationTokens[elevation]
      }
    }
  }
}

// Usage
const tokenFactory = new TokenFactory()
const buttonTokens = tokenFactory.button('primary', 'large')
const cardTokens = tokenFactory.card('high')
```

### 3. Design System Components

```vue
<!-- components/design-system/AppButton.vue -->
<template>
  <Button 
    v-bind="$attrs"
    :dt="computedTokens"
    :class="computedClasses"
  >
    <slot />
  </Button>
</template>

<script setup>
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  size?: 'small' | 'medium' | 'large'
  fullWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'medium',
  fullWidth: false
})

const computedTokens = computed(() => {
  // Base tokens
  const tokens = {
    root: {
      borderRadius: '{border.radius.md}',
      fontWeight: '500',
      transition: 'all 0.2s ease-in-out'
    }
  }
  
  // Size tokens
  const sizeTokens = {
    small: { padding: '0.5rem 0.75rem', fontSize: '0.875rem' },
    medium: { padding: '0.625rem 1rem', fontSize: '1rem' },
    large: { padding: '0.75rem 1.25rem', fontSize: '1.125rem' }
  }
  
  // Variant tokens
  const variantTokens = {
    primary: {
      background: '{primary.color}',
      color: '{primary.contrastColor}',
      borderColor: '{primary.color}',
      '&:hover': { background: '{primary.600}' }
    },
    secondary: {
      background: 'transparent',
      color: '{primary.color}',
      borderColor: '{primary.color}',
      '&:hover': { background: '{primary.50}' }
    },
    success: {
      background: '{green.500}',
      color: '{white}',
      borderColor: '{green.500}',
      '&:hover': { background: '{green.600}' }
    }
  }
  
  return {
    root: {
      ...tokens.root,
      ...sizeTokens[props.size],
      ...variantTokens[props.variant]
    }
  }
})

const computedClasses = computed(() => [
  props.fullWidth ? 'w-full' : '',
  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
])
</script>
```

---

## ✅ Best Practices

### 1. Token Organization

```javascript
// Good: Organized by concern
const theme = {
  semantic: {
    // Brand colors
    primary: { /* ... */ },
    secondary: { /* ... */ },
    
    // Feedback colors  
    success: { /* ... */ },
    warning: { /* ... */ },
    error: { /* ... */ },
    
    // Surface colors
    surface: { /* ... */ },
    
    // Typography
    text: { /* ... */ }
  }
}

// Bad: Disorganized
const theme = {
  semantic: {
    blue: { /* ... */ },
    someColor: { /* ... */ },
    buttonColor: { /* ... */ },
    randomStuff: { /* ... */ }
  }
}
```

### 2. Component Token Strategy

```javascript
// ✅ Good: Consistent component tokens
const cardTokens = {
  root: {
    background: '{surface.0}',           // Use semantic tokens
    borderRadius: '{border.radius.lg}',  // Use design system values
    border: '1px solid {surface.200}',   // Consistent with theme
    padding: '{spacing.lg}'              // Reusable spacing
  }
}

// ❌ Bad: Hardcoded values
const cardTokens = {
  root: {
    background: '#ffffff',               // Hardcoded
    borderRadius: '12px',               // Not using tokens
    border: '1px solid #e5e7eb',       // Not dynamic
    padding: '24px'                     // Not consistent
  }
}
```

### 3. Responsive Design Token Usage

```javascript
// ✅ Good: Responsive tokens
const responsiveTokens = {
  root: {
    padding: {
      base: '{spacing.md}',
      md: '{spacing.lg}',
      lg: '{spacing.xl}'
    },
    fontSize: {
      base: '1rem',
      md: '1.125rem'
    }
  }
}

// ✅ Good: Tailwind for responsive layout
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
  <Card :dt="responsiveTokens" />
</div>
```

### 4. Dark Mode Implementation

```javascript
// ✅ Good: Theme-aware dark mode
const darkModeTokens = {
  semantic: {
    colorScheme: {
      light: {
        surface: {
          0: '{white}',
          100: '{gray.100}',
          900: '{gray.900}'
        }
      },
      dark: {
        surface: {
          0: '{gray.950}',
          100: '{gray.800}',
          900: '{gray.100}'
        }
      }
    }
  }
}

// ✅ Good: CSS class toggle
<html class="dark">
  <!-- Theme automatically switches -->
</html>
```

### 5. Performance Optimization

```javascript
// ✅ Good: Computed tokens
const computedTokens = computed(() => ({
  root: {
    background: props.variant === 'primary' ? '{primary.color}' : '{surface.0}'
  }
}))

// ❌ Bad: Inline token computation
<Button :dt="{
  root: {
    background: computeBackground() // Called on every render
  }
}" />
```

---

## 🎯 Common Use Cases

### 1. Custom Theme for Different Sections

```vue
<!-- AdminPanel.vue -->
<template>
  <div class="admin-panel" :style="adminThemeVars">
    <Sidebar :dt="adminSidebarTokens" />
    <MainContent :dt="adminContentTokens" />
  </div>
</template>

<script setup>
const adminThemeVars = {
  '--p-primary-color': '15 23 42',      // Slate-900
  '--p-surface-color': '248 250 252'    // Slate-50
}

const adminSidebarTokens = {
  root: {
    background: '{surface.900}',
    color: '{surface.100}',
    width: '16rem'
  }
}
</script>
```

### 2. Component State Styling

```vue
<template>
  <Card :dt="getCardTokens(status)">
    <template #title>{{ title }}</template>
    <template #content>{{ content }}</template>
  </Card>
</template>

<script setup>
const getCardTokens = (status) => {
  const baseTokens = {
    root: {
      borderRadius: '{border.radius.lg}',
      padding: '{spacing.lg}'
    }
  }
  
  const statusTokens = {
    pending: {
      root: {
        ...baseTokens.root,
        background: '{yellow.50}',
        borderColor: '{yellow.200}',
        color: '{yellow.900}'
      }
    },
    approved: {
      root: {
        ...baseTokens.root,
        background: '{green.50}',
        borderColor: '{green.200}',
        color: '{green.900}'
      }
    },
    rejected: {
      root: {
        ...baseTokens.root,
        background: '{red.50}',
        borderColor: '{red.200}',
        color: '{red.900}'
      }
    }
  }
  
  return statusTokens[status] || baseTokens
}
</script>
```

### 3. Form Styling Consistency

```vue
<template>
  <form class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="space-y-2">
        <label class="form-label">First Name</label>
        <InputText 
          v-model="form.firstName"
          :dt="inputTokens"
          class="w-full"
        />
      </div>
      
      <div class="space-y-2">
        <label class="form-label">Last Name</label>
        <InputText 
          v-model="form.lastName"
          :dt="inputTokens"
          class="w-full"
        />
      </div>
      
      <div class="space-y-2 md:col-span-2">
        <label class="form-label">Email</label>
        <InputText 
          v-model="form.email"
          type="email"
          :dt="inputTokens"
          class="w-full"
        />
      </div>
    </div>
    
    <div class="flex justify-end space-x-4">
      <Button 
        label="Cancel" 
        severity="secondary"
        :dt="buttonTokens.secondary"
      />
      <Button 
        label="Save" 
        type="submit"
        :dt="buttonTokens.primary"
      />
    </div>
  </form>
</template>

<script setup>
const inputTokens = {
  root: {
    borderColor: '{surface.300}',
    borderRadius: '{border.radius.md}',
    padding: '0.75rem',
    fontSize: '1rem',
    '&:focus': {
      borderColor: '{primary.color}',
      outline: '2px solid {primary.color}/20'
    },
    '&:invalid': {
      borderColor: '{red.500}',
      outline: '2px solid {red.500}/20'
    }
  }
}

const buttonTokens = {
  primary: {
    root: {
      background: '{primary.color}',
      color: '{primary.contrastColor}',
      padding: '0.75rem 1.5rem',
      borderRadius: '{border.radius.md}',
      fontWeight: '500'
    }
  },
  secondary: {
    root: {
      background: 'transparent',
      color: '{surface.600}',
      borderColor: '{surface.300}',
      padding: '0.75rem 1.5rem',
      borderRadius: '{border.radius.md}',
      fontWeight: '500'
    }
  }
}
</script>

<style scoped>
.form-label {
  @apply block text-sm font-medium text-surface-700 mb-1;
}
</style>
```

---

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. Tokens Not Updating

**Problem**: Design tokens aren't reflecting changes
```javascript
// ❌ Problem: Direct CSS variable usage
<Button style="background: var(--p-primary-color)" />
```

**Solution**: Use token references
```javascript
// ✅ Solution: Use token references
<Button :dt="{ root: { background: '{primary.color}' } }" />
```

#### 2. Dark Mode Not Working

**Problem**: Dark mode styles not applying
```css
/* ❌ Problem: Missing dark mode selector */
.my-component {
  background: var(--p-surface-0);
}
```

**Solution**: Configure dark mode selector properly
```javascript
// ✅ Solution: Configure dark mode
app.use(PrimeVue, {
  theme: {
    preset: MyPreset,
    options: {
      darkModeSelector: '.dark' // or 'class' or '[data-theme="dark"]'
    }
  }
})
```

#### 3. Tailwind Classes Overriding PrimeVue

**Problem**: Tailwind utilities conflicting with PrimeVue styles
```vue
<!-- ❌ Problem: Conflicting styles -->
<Button class="bg-blue-500" :dt="{ root: { background: '{primary.color}' } }" />
```

**Solution**: Use CSS layers or avoid conflicting utilities
```css
/* ✅ Solution: Configure CSS layers */
@layer tailwind-base, primevue, tailwind-utilities;
```

#### 4. Token Reference Errors

**Problem**: Invalid token references
```javascript
// ❌ Problem: Invalid references
const tokens = {
  root: {
    background: 'primary.color',        // Missing braces
    color: '{nonexistent.token}',       // Token doesn't exist
    padding: '{spacing.invalid}'        // Invalid token path
  }
}
```

**Solution**: Use valid token references
```javascript
// ✅ Solution: Valid references
const tokens = {
  root: {
    background: '{primary.color}',      // Correct syntax
    color: '{primary.contrastColor}',   // Existing token
    padding: '{spacing.md}'             // Valid token path
  }
}
```

### Debug Techniques

#### 1. Inspect Generated CSS Variables

```javascript
// Check what CSS variables are available
console.log(getComputedStyle(document.documentElement))

// Check specific token value
const primaryColor = getComputedStyle(document.documentElement)
  .getPropertyValue('--p-primary-color')
console.log('Primary color:', primaryColor)
```

#### 2. Token Development Helper

```vue
<template>
  <div class="token-debugger" v-if="isDev">
    <h3>Current Tokens</h3>
    <pre>{{ JSON.stringify(currentTokens, null, 2) }}</pre>
  </div>
</template>

<script setup>
const isDev = import.meta.env.DEV

const currentTokens = computed(() => {
  const root = document.documentElement
  const styles = getComputedStyle(root)
  const tokens = {}
  
  // Extract all PrimeVue CSS variables
  for (let i = 0; i < styles.length; i++) {
    const prop = styles[i]
    if (prop.startsWith('--p-')) {
      tokens[prop] = styles.getPropertyValue(prop)
    }
  }
  
  return tokens
})
</script>
```

---

## 📖 Summary

This design system approach provides:

1. **🎨 Consistent Theming**: Global preset customization with `definePreset`
2. **⚡ Dynamic Styling**: Component-level overrides with `dt` property  
3. **📱 Responsive Design**: Tailwind CSS for layout, PrimeVue for component styling
4. **🌓 Dark Mode**: Built-in theme switching with CSS variables
5. **🔧 Developer Experience**: Type safety, token autocompletion, and debugging tools
6. **🆕 Runtime Control**: Dynamic theme switching with utilities
7. **🆕 Headless Mode**: Complete UI customization while preserving functionality
8. **🔧 Enhanced PT**: Advanced pass-through properties with declarative syntax

**Key Principles**:
- Use **Tailwind** for layout, spacing, and structural styling
- Use **PrimeVue tokens** for component theming and dynamic styling
- Use **`definePreset`** for global theme customization
- Use **`dt`** for component-specific overrides
- Use **`asChild`** for custom UI while preserving accessibility
- Always prefer **token references** over hardcoded values

This approach ensures maintainable, scalable, and consistent design systems that can adapt to different brands, themes, and user preferences while maintaining excellent developer experience.