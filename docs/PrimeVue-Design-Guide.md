# PrimeVue 4 + Tailwind CSS 4 Design System Guide

## 📚 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Design Token System](#design-token-system)
3. [Project Setup](#project-setup)
4. [Global Theme Customization with definePreset](#global-theme-customization-with-definepreset)
5. [Component-Level Customization with dt](#component-level-customization-with-dt)
6. [**NEW:** Component Styling & Layout Strategy](#component-styling--layout-strategy)
7. [**NEW:** When Component Overrides Are Necessary](#when-component-overrides-are-necessary)
8. [**NEW:** Runtime Theme Configuration Systems](#runtime-theme-configuration-systems)
9. [**Enhanced:** Pass Through Properties](#enhanced-pass-through-properties)
10. [**Enhanced:** Layout vs Styling Strategy](#layout-vs-styling-strategy)
11. [Tailwind CSS Integration](#tailwind-css-integration)
12. [**Enhanced:** Development Patterns](#development-patterns)
13. [**Enhanced:** Best Practices](#best-practices)
14. [Common Use Cases](#common-use-cases)
15. [**Enhanced:** Troubleshooting](#troubleshooting)

---

## 🏗️ Architecture Overview

### The Three-Layer System

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
├─────────────────────────────────────────┤
│  🔧 Component-Level Overrides          │
│  → Necessary fixes for theme issues     │
│  → Custom component behaviors           │
│  → Framework limitation workarounds     │
└─────────────────────────────────────────┘
```

### **🆕 The Hybrid Approach**

Our design system uses a **hybrid approach** that balances performance with flexibility:

#### **✅ Optimal Path**: Framework API (90% of use cases)
```vue
<!-- PREFERRED: Uses PrimeVue's intended API -->
<AppButton label="Save Changes" icon="pi pi-check" variant="primary" />
```
**When to use**: Simple buttons with text and/or icons
**Performance**: Fastest, no layout issues
**Maintenance**: Easiest to maintain

#### **✅ Flexible Path**: Custom Content with Auto-Fixes (8% of use cases)
```vue
<!-- WHEN NEEDED: Custom content with automatic width handling -->
<AppButton variant="secondary">
  <i class="pi pi-user mr-2" />
  <span>Custom Content</span>
</AppButton>
```
**When to use**: Custom text/icon combinations, dynamic content
**Performance**: Good, conditional fixes applied only when needed
**Maintenance**: Moderate, requires proper implementation

#### **⚠️ Complex Path**: Rich Content (2% of use cases)
```vue
<!-- COMPLEX: Rich content with automatic fixes -->
<AppButton>
  <div class="flex items-center gap-2">
    <Avatar size="small" />
    <span class="font-medium">Profile Settings</span>
  </div>
</AppButton>
```
**When to use**: Complex UI components inside buttons
**Performance**: Slower, requires careful implementation
**Maintenance**: Most complex, requires testing

### **🎯 Decision Framework**

```
Do you need just text/icon? 
├─ YES → Use Optimal Path (label + icon props)
└─ NO → Do you need custom content?
    ├─ Simple custom content → Use Flexible Path (slot with auto-fixes)
    └─ Complex components → Use Complex Path (rich content patterns)
```

### Responsibility Separation

| **Tailwind CSS 4** | **PrimeVue Theme System** | **Component Overrides** |
|-------------------|---------------------------|------------------------|
| Layout (`grid`, `flex`) | Component styles (`button`, `card`) | Framework limitations |
| Spacing (`p-4`, `m-2`) | Theme colors (`primary`, `surface`) | Cross-browser fixes |
| Typography (`text-lg`) | Interactive states (`hover`, `focus`) | Accessibility enhancements |
| Responsive design | Dark/light mode switching | Custom behaviors |
| Custom utilities | Semantic token system | Performance optimizations |

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

### **🆕 Token Debugging Utilities**

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

// Debug current token values
const debugTokens = () => {
  const root = document.documentElement
  const styles = getComputedStyle(root)
  
  // Extract all PrimeVue CSS variables
  const tokens = {}
  for (let i = 0; i < styles.length; i++) {
    const prop = styles[i]
    if (prop.startsWith('--p-')) {
      tokens[prop] = styles.getPropertyValue(prop)
    }
  }
  
  console.table(tokens)
}
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
  }
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

---

## 🏗️ Component Styling & Layout Strategy

### The Hybrid Approach Implementation

Our design system follows a **hybrid approach** that optimizes for both developer experience and performance:

```vue
<template>
  <PrimeVueComponent
    v-bind="$attrs"
    :dt="computedTokens"
    :class="computedClasses"
    :style="needsWidthFix ? widthFixStyles : undefined"
    :label="!hasSlotContent ? label : undefined"
    :icon="!hasIconSlot ? icon : undefined"
    :severity="primeVueSeverity"
    :size="primeVueSize"
  >
    <template v-if="hasIconSlot" #icon>
      <slot name="icon" />
    </template>
    <slot />
  </PrimeVueComponent>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'
import { TokenFactory, type ButtonVariant, type ButtonSize } from '@/themes/token-factory'
import Button from 'primevue/button'

interface Props {
  label?: string
  icon?: string
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  loading?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'medium',
  fullWidth: false,
  loading: false,
  disabled: false
})

// ✅ HYBRID DETECTION: Determine rendering approach
const slots = useSlots()
const hasSlotContent = computed(() => !!slots.default)
const hasIconSlot = computed(() => !!slots.icon)

// ✅ CONDITIONAL FIXES: Apply only when framework API insufficient
const needsWidthFix = computed(() => hasSlotContent.value && !props.label)

const widthFixStyles = {
  whiteSpace: 'nowrap' as const,
  minWidth: 'fit-content'
}

// ✅ CLEAN TOKENS: Only styling properties, no layout
const computedTokens = computed(() => {
  return TokenFactory.button(props.variant, props.size)
})

// ✅ PRIMEVUE MAPPINGS: Convert our design system to framework expectations
const primeVueSize = computed(() => {
  const sizeMap = {
    small: 'small' as const,
    medium: undefined,  // Default size in PrimeVue
    large: 'large' as const
  }
  return sizeMap[props.size]
})

const primeVueSeverity = computed(() => {
  const severityMap = {
    primary: undefined,     // Default severity in PrimeVue
    secondary: 'secondary' as const,
    success: 'success' as const,
    warning: 'warn' as const,
    danger: 'danger' as const,
    ghost: 'help' as const
  }
  return severityMap[props.variant]
})

// ✅ SAFE CLASSES: Non-conflicting Tailwind utilities
const computedClasses = computed(() => [
  // Safe utilities that don't interfere with PrimeVue layout
  'transition-all duration-200',
  'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
  
  // Conditional layout utilities
  props.fullWidth ? 'w-full' : '',
  
  // ❌ NEVER USE: Layout classes that conflict with PrimeVue
  // 'inline-flex', 'items-center', 'justify-center', 'gap-2'
])
</script>

<style scoped>
/* ✅ MINIMAL OVERRIDES: Only essential fixes */
:deep(.p-button) {
  /* Accessibility: WCAG AAA minimum touch targets */
  min-height: 2.75rem; /* 44px */
}

/* ✅ CONDITIONAL OVERRIDES: Only when slot content needs fixes */
:deep(.p-button:has(> :not(.p-button-label):not(.p-button-icon))) {
  white-space: nowrap;
  min-width: fit-content;
}
</style>
```

### **Core Principles**

#### 1. **Separation of Concerns**
- **PrimeVue**: Component functionality, semantic styling, design tokens
- **Tailwind CSS**: Layout, spacing, utility styling, responsive design
- **Component Overrides**: Minimal fixes for framework limitations

#### 2. **Progressive Enhancement**
- Start with the framework's intended API
- Add customizations only when needed
- Prefer composition over configuration

#### 3. **Avoid Layout Conflicts**
- Never override PrimeVue's core layout properties
- Use Tailwind for non-conflicting utilities only
- Apply fixes conditionally, not globally

---

## 🔧 When Component Overrides Are Necessary

### **Case Study: Secondary Button Color Issue**

**Problem**: PrimeVue Material theme uses hardcoded surface colors for secondary severity buttons, ignoring semantic secondary color definitions.

**Analysis**:
```javascript
// ✅ These work correctly (use semantic tokens):
primary: undefined,    // Uses colorScheme.primary colors
success: 'success'     // Uses semantic success colors  
warning: 'warn'        // Uses semantic warning colors
danger: 'danger'       // Uses semantic danger colors

// ❌ This doesn't work (uses hardcoded surface colors):
secondary: 'secondary' // Ignores semantic secondary colors!
```

**Solution**: Component-level overrides in the preset are **necessary**, not just preferred:

```javascript
// themes/custom-preset.js
export const CustomPreset = definePreset(Aura, {
  semantic: {
    // ✅ Define semantic colors (required but not sufficient)
    secondary: {
      50: '{blue.50}',
      500: '{blue.500}',
      600: '{blue.600}',
      // ... full palette
    }
  },
  
  // ✅ NECESSARY: Component-level overrides
  components: {
    button: {
      colorScheme: {
        light: {
          root: {
            secondary: {
              background: 'transparent',
              color: '{blue.500}',
              borderColor: '{blue.500}',
              hoverBackground: '{blue.50}'
            }
          }
        }
      }
    }
  }
})
```

### **When Component Overrides Are Necessary**

| **Scenario** | **Why Necessary** | **Solution** |
|--------------|-------------------|--------------|
| Base theme ignores semantic tokens | Framework limitation | Component-level override |
| Cross-browser inconsistencies | Browser differences | Conditional CSS fixes |
| Accessibility requirements | WCAG compliance | Enhanced styling |
| Framework layout conflicts | Internal component structure | Width/layout fixes |
| Performance optimizations | Reduce re-renders | Computed properties |

### **Decision Matrix: Override Necessity**

```
Is the issue caused by:
├─ Framework ignoring semantic tokens? → NECESSARY (component override)
├─ Missing semantic token definition? → PREFERRED (semantic tokens)
├─ Layout conflict with Tailwind? → NECESSARY (conditional fixes)
├─ Accessibility requirements? → NECESSARY (enhanced styling)
└─ Visual preference? → PREFERRED (dt property)
```

---

## 🎛️ Runtime Theme Configuration Systems

### **Real-Time Theme Switching Architecture**

Based on analysis of production theme systems, here's the complete pattern:

#### **1. Reactive Configuration Store**

```javascript
// composables/useTheme.js
import { reactive, computed } from 'vue'
import { updatePreset, updateSurfacePalette, palette } from '@primeuix/themes'

const themeConfig = reactive({
  preset: 'Aura',           // Base theme: Aura, Lara, Nora
  primary: 'blue',          // Primary color
  surface: 'slate',         // Surface palette
  darkTheme: false,         // Dark mode toggle
  menuMode: 'static',       // Sidebar layout mode
  menuTheme: 'primary',     // Menu theme
  cardStyle: 'transparent'  // Card styling
})

const themeState = reactive({
  configSidebarVisible: false,
  isTransitioning: false
})

export function useTheme() {
  const isDarkTheme = computed(() => themeConfig.darkTheme)
  
  const toggleConfigSidebar = () => {
    themeState.configSidebarVisible = !themeState.configSidebarVisible
  }
  
  const toggleDarkMode = () => {
    if (!document.startViewTransition) {
      executeDarkModeToggle()
      return
    }
    
    // Uses View Transition API for smooth animated transitions
    document.startViewTransition(() => {
      executeDarkModeToggle()
    })
  }
  
  const executeDarkModeToggle = () => {
    themeConfig.darkTheme = !themeConfig.darkTheme
    document.documentElement.classList.toggle('dark')
  }
  
  const updateThemeColor = (type, colorName) => {
    if (type === 'primary') {
      themeConfig.primary = colorName
      const generatedPalette = palette(`{${colorName}}`)
      updatePreset({
        semantic: {
          primary: generatedPalette
        }
      })
    } else if (type === 'surface') {
      themeConfig.surface = colorName
      const surfacePalette = getSurfacePalette(colorName)
      updateSurfacePalette(surfacePalette)
    }
  }
  
  return {
    themeConfig,
    themeState,
    isDarkTheme,
    toggleConfigSidebar,
    toggleDarkMode,
    updateThemeColor
  }
}
```

#### **2. Theme Configuration UI Component**

```vue
<!-- ThemeConfigurator.vue -->
<template>
  <Drawer
    v-model:visible="themeState.configSidebarVisible"
    position="right"
    header="Theme Settings"
    class="w-80"
  >
    <div class="flex flex-col gap-6">
      <!-- Preset Switcher -->
      <div>
        <span class="text-lg font-semibold mb-2 block">Theme Preset</span>
        <SelectButton 
          v-model="themeConfig.preset" 
          :options="presetOptions"
          @change="onPresetChange"
          :allowEmpty="false"
          class="w-full"
        />
      </div>
      
      <!-- Primary Color Picker -->
      <div>
        <span class="text-lg font-semibold mb-2 block">Primary Color</span>
        <div class="grid grid-cols-6 gap-2">
          <button
            v-for="color in primaryColors"
            :key="color.name"
            @click="updateThemeColor('primary', color.name)"
            class="w-8 h-8 rounded-full border-2 border-white shadow-md hover:scale-110 transition-transform relative"
            :style="{ backgroundColor: color.preview }"
          >
            <i 
              v-if="color.name === themeConfig.primary" 
              class="pi pi-check text-white absolute inset-0 flex items-center justify-center text-sm"
            />
          </button>
        </div>
      </div>
      
      <!-- Surface Color Picker -->
      <div>
        <span class="text-lg font-semibold mb-2 block">Surface Colors</span>
        <div class="grid grid-cols-4 gap-2">
          <button
            v-for="surface in surfaceOptions"
            :key="surface.name"
            @click="updateThemeColor('surface', surface.name)"
            class="w-8 h-8 rounded border hover:scale-110 transition-transform relative"
            :style="{ backgroundColor: surface.preview }"
          >
            <i 
              v-if="surface.name === themeConfig.surface" 
              class="pi pi-check text-white absolute inset-0 flex items-center justify-center text-sm"
            />
          </button>
        </div>
      </div>
      
      <!-- Dark Mode Toggle -->
      <div>
        <label class="flex items-center gap-3">
          <ToggleSwitch v-model="themeConfig.darkTheme" @change="toggleDarkMode" />
          <span class="text-lg font-semibold">Dark Mode</span>
        </label>
      </div>
      
      <!-- Layout Options -->
      <div>
        <span class="text-lg font-semibold mb-2 block">Layout Mode</span>
        <div class="grid grid-cols-2 gap-2">
          <Button
            v-for="mode in layoutModes"
            :key="mode.value"
            :label="mode.label"
            :severity="themeConfig.menuMode === mode.value ? 'primary' : 'secondary'"
            @click="themeConfig.menuMode = mode.value"
            size="small"
          />
        </div>
      </div>
    </div>
  </Drawer>
</template>

<script setup>
import { useTheme } from '@/composables/useTheme'

const { themeConfig, themeState, toggleConfigSidebar, toggleDarkMode, updateThemeColor } = useTheme()

const presetOptions = ['Aura', 'Lara', 'Nora']

const primaryColors = [
  { name: 'blue', preview: '#3b82f6' },
  { name: 'purple', preview: '#8b5cf6' },
  { name: 'green', preview: '#10b981' },
  { name: 'red', preview: '#ef4444' },
  { name: 'orange', preview: '#f97316' },
  { name: 'pink', preview: '#ec4899' }
]

const surfaceOptions = [
  { name: 'slate', preview: '#64748b' },
  { name: 'gray', preview: '#6b7280' },
  { name: 'zinc', preview: '#71717a' },
  { name: 'stone', preview: '#78716c' }
]

const layoutModes = [
  { label: 'Static', value: 'static' },
  { label: 'Overlay', value: 'overlay' },
  { label: 'Slim', value: 'slim' },
  { label: 'Compact', value: 'compact' }
]
</script>
```

#### **3. Theme Trigger Integration**

```vue
<!-- AppTopbar.vue -->
<template>
  <div class="layout-topbar">
    <!-- Other topbar content -->
    
    <div class="topbar-right">
      <ul class="topbar-menu">
        <!-- Theme Configuration Button -->
        <li class="right-sidebar-item">
          <button 
            class="app-config-button p-2 rounded-lg hover:bg-surface-100 transition-colors"
            @click="toggleConfigSidebar"
            title="Theme Settings"
          >
            <i class="pi pi-cog text-lg" />
          </button>
        </li>
        
        <!-- Quick Dark Mode Toggle -->
        <li class="right-sidebar-item">
          <button 
            class="app-config-button p-2 rounded-lg hover:bg-surface-100 transition-colors"
            @click="toggleDarkMode"
            :title="isDarkTheme ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
          >
            <i :class="isDarkTheme ? 'pi pi-sun' : 'pi pi-moon'" class="text-lg" />
          </button>
        </li>
      </ul>
    </div>
  </div>
  
  <!-- Theme Configurator -->
  <ThemeConfigurator />
</template>

<script setup>
import { useTheme } from '@/composables/useTheme'
import ThemeConfigurator from '@/components/ThemeConfigurator.vue'

const { isDarkTheme, toggleConfigSidebar, toggleDarkMode } = useTheme()
</script>
```

### **Key Features of Production Theme Systems**

1. **Real-time Preview**: Changes apply instantly without page refresh
2. **Persistent State**: Configuration persists across sessions
3. **Smooth Transitions**: View Transition API for dark mode
4. **Comprehensive Options**: 17 colors × 8 surfaces × 3 themes × 7 layouts
5. **Performance**: Uses PrimeVue's efficient theme system
6. **Accessibility**: Proper focus management and keyboard navigation

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
                <label class="block text-sm font-medium text-surface-700">    <!-- Tailwind: Typography -->
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
</script>
```

### **❌ Common Anti-Patterns & Solutions**

#### **Anti-Pattern**: Layout Class Conflicts
```vue
<!-- ❌ BAD: These classes conflict with PrimeVue internal layout -->
<Button class="inline-flex items-center justify-center gap-2" />
```

#### **Solution**: Respect Framework Layout
```vue
<!-- ✅ GOOD: Use framework props and safe utilities -->
<Button 
  class="transition-all duration-200 focus:ring-2"
  :icon="icon"
  :label="label"
/>
```

#### **Anti-Pattern**: Mixing Layout with Styling
```vue
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
```

#### **Solution**: Proper Separation
```vue
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
```

### **Responsibility Matrix**

| **Use Tailwind CSS For** | **Use PrimeVue Tokens For** | **Use Component Overrides For** |
|---------------------------|------------------------------|--------------------------------|
| Grid layouts (`grid`, `grid-cols-3`) | Component backgrounds (`background: '{surface.0}'`) | Framework limitations |
| Flexbox (`flex`, `items-center`) | Theme colors (`color: '{primary.color}'`) | Cross-browser fixes |
| Spacing (`p-4`, `m-2`, `space-y-4`) | Borders (`border: '1px solid {surface.200}'`) | Accessibility enhancements |
| Typography (`text-lg`, `font-bold`) | Border radius (`borderRadius: '{border.radius.lg}'`) | Layout conflict resolution |
| Responsive design (`md:grid-cols-2`) | Interactive states (`'&:hover': { ... }`) | Performance optimizations |
| Positioning (`absolute`, `sticky`) | Shadows (`shadow: '0 4px 6px rgba(0,0,0,0.1)'`) | Custom component behaviors |

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

---

## 🔄 **Enhanced Development Patterns**

### 1. The Hybrid Component Pattern

```vue
<!-- components/ui/AppButton.vue -->
<template>
  <Button 
    v-bind="$attrs"
    :dt="computedTokens"
    :class="computedClasses"
    :style="needsWidthFix ? widthFixStyles : undefined"
    :label="!hasSlotContent ? label : undefined"
    :icon="!hasIconSlot ? icon : undefined"
    :severity="primeVueSeverity"
    :size="primeVueSize"
  >
    <template v-if="hasIconSlot" #icon>
      <slot name="icon" />
    </template>
    <slot />
  </Button>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'
import { TokenFactory, type ButtonVariant, type ButtonSize } from '@/themes/token-factory'
import Button from 'primevue/button'

interface Props {
  label?: string
  icon?: string
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  loading?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'medium',
  fullWidth: false,
  loading: false,
  disabled: false
})

// ✅ HYBRID DETECTION: Determine rendering approach
const slots = useSlots()
const hasSlotContent = computed(() => !!slots.default)
const hasIconSlot = computed(() => !!slots.icon)

// ✅ CONDITIONAL FIXES: Apply only when framework API insufficient
const needsWidthFix = computed(() => hasSlotContent.value && !props.label)

const widthFixStyles = {
  whiteSpace: 'nowrap' as const,
  minWidth: 'fit-content'
}

// ✅ CLEAN TOKENS: Only styling properties, no layout
const computedTokens = computed(() => {
  return TokenFactory.button(props.variant, props.size)
})

// ✅ PRIMEVUE MAPPINGS: Convert our design system to framework expectations
const primeVueSize = computed(() => {
  const sizeMap = {
    small: 'small' as const,
    medium: undefined,  // Default size in PrimeVue
    large: 'large' as const
  }
  return sizeMap[props.size]
})

const primeVueSeverity = computed(() => {
  const severityMap = {
    primary: undefined,     // Default severity in PrimeVue
    secondary: 'secondary' as const,
    success: 'success' as const,
    warning: 'warn' as const,
    danger: 'danger' as const,
    ghost: 'help' as const
  }
  return severityMap[props.variant]
})

// ✅ SAFE CLASSES: Non-conflicting Tailwind utilities
const computedClasses = computed(() => [
  // Safe utilities that don't interfere with PrimeVue layout
  'transition-all duration-200',
  'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
  
  // Conditional layout utilities
  props.fullWidth ? 'w-full' : '',
  
  // ❌ NEVER USE: Layout classes that conflict with PrimeVue
  // 'inline-flex', 'items-center', 'justify-center', 'gap-2'
])
</script>

<style scoped>
/* ✅ MINIMAL OVERRIDES: Only essential fixes */
:deep(.p-button) {
  /* Accessibility: WCAG AAA minimum touch targets */
  min-height: 2.75rem; /* 44px */
}

/* ✅ CONDITIONAL OVERRIDES: Only when slot content needs fixes */
:deep(.p-button:has(> :not(.p-button-label):not(.p-button-icon))) {
  white-space: nowrap;
  min-width: fit-content;
}
</style>
```

### 2. Token Factory Pattern

```typescript
// themes/token-factory.ts
export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost'
export type ButtonSize = 'small' | 'medium' | 'large'

export class TokenFactory {
  static button(variant: ButtonVariant = 'primary', size: ButtonSize = 'medium') {
    // ✅ INCLUDE: Only styling properties that work with design tokens
    return {
      root: {
        // Colors and theming
        background: this.getVariantBackground(variant),
        color: this.getVariantColor(variant),
        borderColor: this.getVariantBorderColor(variant),
        
        // Typography and spacing
        borderRadius: '{border.radius.md}',
        fontWeight: '500',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        
        // Interactive states
        '&:hover:not(:disabled)': {
          background: this.getVariantHoverBackground(variant),
        },
        
        '&:focus-visible': {
          outline: '2px solid {primary.color}',
          outlineOffset: '2px',
        },
        
        '&:disabled': {
          opacity: '0.6',
          cursor: 'not-allowed',
        }
        
        // ❌ EXCLUDE: Layout properties (let PrimeVue handle these)
        // display: 'inline-flex',     // PrimeVue handles this
        // alignItems: 'center',       // PrimeVue handles this  
        // justifyContent: 'center',   // PrimeVue handles this
        // gap: '0.5rem',             // PrimeVue handles this
      }
    }
  }
  
  private static getVariantBackground(variant: ButtonVariant): string {
    const variants = {
      primary: '{primary.color}',
      secondary: 'transparent',
      success: '{green.500}',
      warning: '{amber.500}',
      danger: '{red.500}',
      ghost: 'transparent'
    }
    return variants[variant]
  }
  
  private static getVariantColor(variant: ButtonVariant): string {
    const variants = {
      primary: '{primary.contrastColor}',
      secondary: '{primary.color}',
      success: 'white',
      warning: 'white',
      danger: 'white',
      ghost: '{surface.700}'
    }
    return variants[variant]
  }
  
  private static getVariantBorderColor(variant: ButtonVariant): string {
    const variants = {
      primary: '{primary.color}',
      secondary: '{primary.color}',
      success: '{green.500}',
      warning: '{amber.500}',
      danger: '{red.500}',
      ghost: '{surface.300}'
    }
    return variants[variant]
  }
  
  private static getVariantHoverBackground(variant: ButtonVariant): string {
    const variants = {
      primary: '{primary.600}',
      secondary: '{primary.50}',
      success: '{green.600}',
      warning: '{amber.600}',
      danger: '{red.600}',
      ghost: '{surface.100}'
    }
    return variants[variant]
  }
}
```

### 3. Theme Context Composition

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

---

## ✅ **Enhanced Best Practices**

### 1. **Component Override Guidelines**

#### **When Component Overrides Are Necessary**
```javascript
// ✅ NECESSARY: Base theme ignores semantic tokens
components: {
  button: {
    colorScheme: {
      light: {
        root: {
          secondary: {
            background: 'transparent',
            color: '{blue.500}',
            borderColor: '{blue.500}'
          }
        }
      }
    }
  }
}
```

#### **When Component Overrides Are Preferred**
```javascript
// ✅ PREFERRED: Visual customization that could use dt instead
components: {
  card: {
    root: {
      borderRadius: '{border.radius.xl}',  // Could be done with dt
      shadow: '0 4px 12px rgba(0,0,0,0.15)' // Could be done with dt
    }
  }
}
```

### 2. **Performance Optimization**

#### **Computed Properties**
```vue
<script setup>
// ✅ GOOD: Minimal dependencies, clear logic
const needsWidthFix = computed(() => hasSlotContent.value && !props.label)

// ❌ AVOID: Complex logic in computed properties
const complexStyles = computed(() => {
  // Heavy calculations, multiple dependencies
  return someComplexCalculation()
})
</script>
```

#### **Conditional Rendering**
```vue
<template>
  <!-- ✅ GOOD: Conditional application -->
  <Button :style="needsFix ? fixStyles : undefined" />
  
  <!-- ❌ AVOID: Always applying styles -->
  <Button :style="allStyles" />
</template>
```

### 3. **Token Organization Strategy**

```javascript
// ✅ Good: Semantic organization
const theme = {
  semantic: {
    // Brand identity
    primary: { /* ... */ },
    secondary: { /* ... */ },
    
    // Feedback states
    success: { /* ... */ },
    warning: { /* ... */ },
    danger: { /* ... */ },
    
    // Surface hierarchy
    surface: { /* ... */ },
    
    // Typography
    text: { /* ... */ }
  }
}

// ❌ Bad: Disorganized naming
const theme = {
  semantic: {
    blue: { /* ... */ },
    someColor: { /* ... */ },
    buttonColor: { /* ... */ },
    randomStuff: { /* ... */ }
  }
}
```

### 4. **Accessibility Considerations**

```vue
<style scoped>
/* ✅ WCAG AAA minimum touch targets */
:deep(.p-button) {
  min-height: 2.75rem; /* 44px */
  min-width: 2.75rem;  /* 44px for icon-only buttons */
}

/* ✅ High contrast focus indicators */
:deep(.p-button:focus-visible) {
  outline: 2px solid {primary.color};
  outline-offset: 2px;
}

/* ✅ Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  :deep(.p-button) {
    transition: none;
  }
}
</style>
```

### 5. **Testing Patterns**

```vue
<!-- Test all usage patterns -->
<template>
  <div class="space-y-4">
    <!-- ✅ Test 1: Optimal API usage -->
    <AppButton label="Save" icon="pi pi-check" variant="primary" />
    
    <!-- ✅ Test 2: Slot content -->
    <AppButton variant="secondary">
      <i class="pi pi-user mr-2" />
      Custom Content
    </AppButton>
    
    <!-- ✅ Test 3: Complex content -->
    <AppButton>
      <div class="flex items-center gap-2">
        <Avatar size="small" />
        <span>Rich Content</span>
      </div>
    </AppButton>
    
    <!-- ✅ Test 4: All variants and sizes -->
    <AppButton 
      v-for="variant in variants" 
      :key="variant" 
      :variant="variant" 
      :label="variant" 
    />
  </div>
</template>
```

---

## 🎯 Common Use Cases

### 1. **Theme-Aware Component States**

```vue
<template>
  <Card :dt="getCardTokens(status)" :class="getCardClasses(status)">
    <template #title>{{ title }}</template>
    <template #content>
      <p>{{ content }}</p>
      <div class="flex justify-end gap-2 mt-4">
        <AppButton 
          v-if="status === 'pending'" 
          label="Approve" 
          variant="success" 
          @click="approve"
        />
        <AppButton 
          v-if="status === 'pending'" 
          label="Reject" 
          variant="danger" 
          @click="reject"
        />
      </div>
    </template>
  </Card>
</template>

<script setup>
const getCardTokens = (status) => {
  const statusTokens = {
    pending: {
      root: {
        background: '{yellow.50}',
        borderColor: '{yellow.200}',
        color: '{yellow.900}'
      }
    },
    approved: {
      root: {
        background: '{green.50}',
        borderColor: '{green.200}',
        color: '{green.900}'
      }
    },
    rejected: {
      root: {
        background: '{red.50}',
        borderColor: '{red.200}',
        color: '{red.900}'
      }
    }
  }
  
  return statusTokens[status] || {
    root: {
      background: '{surface.0}',
      borderColor: '{surface.200}',
      color: '{surface.900}'
    }
  }
}

const getCardClasses = (status) => [
  'transition-all duration-200',
  status === 'pending' ? 'ring-2 ring-yellow-200' : ''
]
</script>
```

### 2. **Responsive Design System Component**

```vue
<template>
  <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
    <Card 
      v-for="product in products"
      :key="product.id"
      :dt="responsiveCardTokens"
      class="hover:shadow-xl transition-shadow cursor-pointer"
      @click="selectProduct(product)"
    >
      <template #title>{{ product.name }}</template>
      <template #content>
        <div class="space-y-3">
          <img 
            :src="product.image" 
            :alt="product.name"
            class="w-full h-48 object-cover rounded-lg"
          />
          <p class="text-surface-600">{{ product.description }}</p>
          <div class="flex justify-between items-center">
            <span class="text-2xl font-bold text-primary-600">
              ${{ product.price }}
            </span>
            <AppButton 
              label="Add to Cart"
              size="small"
              variant="primary"
              @click.stop="addToCart(product)"
            />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
const responsiveCardTokens = {
  root: {
    background: '{surface.0}',
    borderRadius: '{border.radius.xl}',
    border: '1px solid {surface.200}',
    padding: '1.5rem',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      shadow: '0 20px 25px rgba(0, 0, 0, 0.1)'
    }
  }
}
</script>
```

---

## 🔧 **Enhanced Troubleshooting**

### **Common Issues and Solutions**

#### 1. **Secondary Button Color Issue (Case Study)**

**Problem**: Secondary buttons appear gray instead of custom color
```vue
<!-- ❌ Issue: Button appears gray -->
<AppButton variant="secondary" label="Secondary" />
```

**Root Cause**: PrimeVue Material theme ignores semantic secondary colors
```javascript
// ❌ This alone doesn't work:
semantic: {
  secondary: {
    500: '{blue.500}' // Ignored by Material theme!
  }
}
```

**Solution**: Component-level override is necessary
```javascript
// ✅ Required fix:
components: {
  button: {
    colorScheme: {
      light: {
        root: {
          secondary: {
            background: 'transparent',
            color: '{blue.500}',
            borderColor: '{blue.500}',
            hoverBackground: '{blue.50}'
          }
        }
      }
    }
  }
}
```

#### 2. **Layout Conflicts with Tailwind**

**Problem**: Button layout broken
```vue
<!-- ❌ Problem: Conflicting layout classes -->
<Button class="inline-flex items-center justify-center gap-2" />
```

**Solution**: Remove conflicting classes, use framework API
```vue
<!-- ✅ Solution: Let PrimeVue handle layout -->
<Button 
  :icon="icon"
  :label="label"
  class="transition-all duration-200"  <!-- Safe utilities only -->
/>
```

#### 3. **Token Not Updating**

**Problem**: Design tokens aren't reflecting changes
```javascript
// ❌ Problem: Direct CSS variable usage
<Button style="background: var(--p-primary-color)" />
```

**Debug**: Check token resolution
```javascript
// ✅ Debug: Check if token exists
const debugTokens = () => {
  const primaryColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--p-primary-color')
  console.log('Primary color:', primaryColor)
}
```

**Solution**: Use token references
```javascript
// ✅ Solution: Use token references
<Button :dt="{ root: { background: '{primary.color}' } }" />
```

#### 4. **Dark Mode Not Working**

**Problem**: Dark mode styles not applying
```javascript
// ❌ Problem: Missing dark mode configuration
app.use(PrimeVue, {
  theme: {
    preset: MyPreset
    // Missing options
  }
})
```

**Solution**: Configure dark mode selector
```javascript
// ✅ Solution: Add dark mode configuration
app.use(PrimeVue, {
  theme: {
    preset: MyPreset,
    options: {
      darkModeSelector: '.dark' // Enable dark mode
    }
  }
})
```

### **Debug Utilities**

#### **Token Inspector Component**
```vue
<!-- TokenDebugger.vue -->
<template>
  <div v-if="isDev" class="fixed bottom-4 right-4 bg-surface-0 border rounded-lg p-4 shadow-lg max-w-md">
    <h3 class="font-bold mb-2">Token Debugger</h3>
    <div class="space-y-2 text-sm">
      <div v-for="(value, token) in currentTokens" :key="token">
        <strong>{{ token }}:</strong> {{ value }}
      </div>
    </div>
    <button @click="copyTokens" class="mt-2 text-xs text-primary-600 hover:underline">
      Copy to Clipboard
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const isDev = import.meta.env.DEV

const currentTokens = computed(() => {
  const root = document.documentElement
  const styles = getComputedStyle(root)
  const tokens = {}
  
  // Extract PrimeVue CSS variables
  for (let i = 0; i < styles.length; i++) {
    const prop = styles[i]
    if (prop.startsWith('--p-primary') || prop.startsWith('--p-surface')) {
      tokens[prop] = styles.getPropertyValue(prop).trim()
    }
  }
  
  return tokens
})

const copyTokens = () => {
  navigator.clipboard.writeText(JSON.stringify(currentTokens.value, null, 2))
}
</script>
```

#### **Performance Monitor**
```vue
<script setup>
// Monitor component re-renders
const renderCount = ref(0)

onUpdated(() => {
  renderCount.value++
  if (renderCount.value > 10) {
    console.warn('High re-render count detected:', renderCount.value)
  }
})

// Monitor token computations
const computedTokens = computed(() => {
  console.time('token-computation')
  const tokens = TokenFactory.button(props.variant, props.size)
  console.timeEnd('token-computation')
  return tokens
})
</script>
```

### **Debugging Checklist**

- [ ] **Check Token Syntax**: Are braces correct? `{primary.color}` not `primary.color`
- [ ] **Verify Token Exists**: Use browser DevTools to check CSS variables
- [ ] **Test Dark Mode**: Toggle `.dark` class and verify token updates
- [ ] **Check CSS Layers**: Ensure proper layer order in CSS
- [ ] **Validate Props**: Check Vue DevTools for correct prop passing
- [ ] **Review Computed Dependencies**: Ensure computed properties have correct dependencies
- [ ] **Test All Variants**: Verify all button variants, sizes, and states
- [ ] **Check Console Errors**: Look for token resolution or CSS errors

---

## 📖 Summary

This comprehensive design system provides:

1. **🎨 Consistent Theming**: Global preset customization with `definePreset`
2. **⚡ Dynamic Styling**: Component-level overrides with `dt` property  
3. **📱 Responsive Design**: Tailwind CSS for layout, PrimeVue for component styling
4. **🌓 Dark Mode**: Built-in theme switching with CSS variables
5. **🔧 Developer Experience**: Type safety, token autocompletion, and debugging tools
6. **🆕 Hybrid Approach**: Optimal → Flexible → Complex component patterns
7. **🛠️ Component Overrides**: Necessary fixes for framework limitations
8. **🎛️ Real-time Configuration**: Complete theme switching systems
9. **🔍 Enhanced Debugging**: Tools and techniques for troubleshooting issues

**Key Principles**:
- Use **Tailwind** for layout, spacing, and structural styling
- Use **PrimeVue tokens** for component theming and dynamic styling
- Use **`definePreset`** for global theme customization
- Use **`dt`** for component-specific overrides
- Use **component overrides** when framework limitations require them
- Use **hybrid approach** to balance performance with flexibility
- Always prefer **token references** over hardcoded values
- Apply **fixes conditionally**, not globally

This approach ensures maintainable, scalable, and consistent design systems that can adapt to different brands, themes, and user preferences while maintaining excellent developer experience and addressing real-world framework limitations.