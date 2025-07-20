# 🚀 Design, Layout & Styling Cheat Sheet

*Quick reference for PrimeVue 4 + Tailwind CSS 4 design system*

---

## 🎯 **Quick Decision Trees**

### **"Should I use Tailwind or PrimeVue for this?"**

```
Layout/Structure? → Tailwind CSS
├─ Grid, Flexbox, Spacing → `grid`, `flex`, `p-4`, `gap-6`
├─ Responsive Design → `md:grid-cols-2`, `lg:flex-row`
└─ Positioning → `absolute`, `sticky`, `z-10`

Component Styling? → PrimeVue Tokens
├─ Colors, Backgrounds → `background: '{primary.color}'`
├─ Interactive States → `'&:hover': { ... }`
└─ Theme-aware Styling → `'{surface.100}'`, `'{text.color}'`
```

### **"Which component approach should I use?"**

```
Simple text/icon button? → Optimal Path
├─ Use: label + icon props
├─ Example: <AppButton label="Save" icon="pi pi-check" />
└─ Performance: ⚡ Fastest

Custom content needed? → Flexible Path  
├─ Use: slot with auto-fixes
├─ Example: <AppButton><i class="pi pi-user" /> Custom</AppButton>
└─ Performance: ⚡ Good

Complex components inside? → Complex Path
├─ Use: rich content patterns
├─ Example: <AppButton><Avatar /> <span>Profile</span></AppButton>
└─ Performance: ⚠️ Requires testing
```

### **"Do I need component-level overrides?"**

```
Is the issue caused by:
├─ Framework ignoring semantic tokens? → NECESSARY (component override)
├─ Missing token definition? → PREFERRED (add semantic tokens)
├─ Layout conflict with Tailwind? → NECESSARY (conditional fixes)
├─ Accessibility requirements? → NECESSARY (enhanced styling)
└─ Visual preference only? → PREFERRED (use dt property)
```

---

## 🔧 **Common Patterns**

### **Token Reference Syntax**
```javascript
// ✅ CORRECT
'{primary.color}'           // Semantic token
'{surface.100}'            // Semantic with variant  
'{blue.500}'              // Primitive token
'{button.background}'     // Component token

// ❌ INCORRECT
'primary.color'           // Missing braces
'#3b82f6'                // Direct value (not dynamic)
```

### **Component Token Factory**
```typescript
// ✅ INCLUDE: Styling properties only
const tokens = {
  root: {
    background: '{primary.color}',         // ✅ Theme colors
    borderRadius: '{border.radius.md}',    // ✅ Design system values
    fontWeight: '500',                     // ✅ Typography
    transition: 'all 0.2s ease',          // ✅ Animations
    
    // ❌ EXCLUDE: Layout properties
    // display: 'inline-flex',             // PrimeVue handles this
    // alignItems: 'center',               // PrimeVue handles this
  }
}
```

### **Hybrid Button Implementation**
```vue
<template>
  <Button 
    :dt="computedTokens"
    :class="safeClasses"
    :style="needsFix ? fixStyles : undefined"
    :label="!hasSlotContent ? label : undefined"
    :severity="primeVueSeverity"
  >
    <slot />
  </Button>
</template>

<script setup>
// ✅ CONDITIONAL FIXES: Apply only when needed
const needsFix = computed(() => hasSlotContent.value && !props.label)
const fixStyles = { whiteSpace: 'nowrap', minWidth: 'fit-content' }

// ✅ SAFE CLASSES: Non-conflicting utilities only
const safeClasses = [
  'transition-all duration-200',    // ✅ Animations
  'focus:ring-2',                   // ✅ Focus states
  props.fullWidth ? 'w-full' : '', // ✅ Width modifiers
  // ❌ NEVER: 'inline-flex', 'items-center', 'gap-2'
]
</script>
```

### **Responsive Design Pattern**
```vue
<!-- ✅ CONTAINER: Tailwind for layout -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
  
  <!-- ✅ COMPONENT: PrimeVue for styling -->
  <Card :dt="responsiveCardTokens" class="hover:shadow-xl transition-shadow">
    <template #content>
      <!-- ✅ INNER LAYOUT: Tailwind spacing -->
      <div class="space-y-4">
        <img class="w-full h-48 object-cover rounded-lg" />
        <div class="flex justify-between items-center">
          <!-- ✅ COMPONENTS: PrimeVue styled -->
          <AppButton variant="primary" size="small" />
        </div>
      </div>
    </template>
  </Card>
</div>
```

---

## ❌ **Anti-Patterns to Avoid**

### **Layout Class Conflicts**
```vue
<!-- ❌ DON'T: These conflict with PrimeVue internal layout -->
<Button class="inline-flex items-center justify-center gap-2" />

<!-- ✅ DO: Let PrimeVue handle layout, use safe utilities -->
<Button 
  class="transition-all duration-200 focus:ring-2"
  :icon="icon" 
  :label="label" 
/>
```

### **Global CSS Overrides**
```css
/* ❌ DON'T: Global overrides affect everything */
.p-button {
  min-width: fit-content !important;
  white-space: nowrap !important;
}

/* ✅ DO: Conditional component-level fixes */
:deep(.p-button:has(> :not(.p-button-label):not(.p-button-icon))) {
  white-space: nowrap;
  min-width: fit-content;
}
```

### **Mixing Layout with Styling**
```vue
<!-- ❌ DON'T: Mix layout and styling concerns -->
<Card :dt="{
  root: {
    display: 'grid',              // Use Tailwind class instead
    gap: '1rem',                  // Use Tailwind class instead
    background: '{surface.0}',    // This is correct
  }
}" />

<!-- ✅ DO: Separate layout and styling -->
<Card 
  class="grid gap-4"              <!-- Tailwind: Layout -->
  :dt="{                         <!-- PrimeVue: Styling -->
    root: { background: '{surface.0}' }
  }"
/>
```

---

## ⚡ **Quick Fixes**

### **Secondary Button Color Fix**
```javascript
// ✅ NECESSARY: Component override for secondary buttons
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

### **Button Width Issues**
```vue
<!-- ✅ CONDITIONAL FIX: Only when slot content needs it -->
<script setup>
const needsWidthFix = computed(() => hasSlotContent.value && !props.label)
const widthFixStyles = { whiteSpace: 'nowrap', minWidth: 'fit-content' }
</script>

<template>
  <Button :style="needsWidthFix ? widthFixStyles : undefined" />
</template>
```

### **Dark Mode Not Working**
```javascript
// ✅ ENABLE: Dark mode configuration
app.use(PrimeVue, {
  theme: {
    preset: MyPreset,
    options: {
      darkModeSelector: '.dark'  // Required for dark mode
    }
  }
})
```

### **Tokens Not Updating**
```javascript
// ✅ DEBUG: Check token resolution
const debugTokens = () => {
  const primaryColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--p-primary-color')
  console.log('Primary color:', primaryColor)
}
```

---

## 📝 **Code Snippets**

### **Custom Preset Template**
```javascript
export const CustomPreset = definePreset(Aura, {
  semantic: {
    primary: { 500: '{blue.500}', /* ... */ },
    secondary: { 500: '{blue.500}', /* ... */ }, // Add semantic definition
    colorScheme: {
      light: {
        primary: { color: '{blue.600}', /* ... */ },
        secondary: { color: '{blue.500}', /* ... */ }, // Add colorScheme mapping
      }
    }
  },
  // ✅ NECESSARY: Component overrides for framework limitations
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
})
```

### **Design System Button Component**
```vue
<!-- components/ui/AppButton.vue -->
<template>
  <Button 
    v-bind="$attrs"
    :dt="TokenFactory.button(variant, size)"
    :class="[
      'transition-all duration-200',
      'focus:outline-none focus:ring-2',
      fullWidth ? 'w-full' : ''
    ]"
    :style="needsWidthFix ? { whiteSpace: 'nowrap', minWidth: 'fit-content' } : undefined"
    :label="!$slots.default ? label : undefined"
    :icon="!$slots.icon ? icon : undefined"
    :severity="severityMap[variant]"
    :size="sizeMap[size]"
  >
    <template v-if="$slots.icon" #icon><slot name="icon" /></template>
    <slot />
  </Button>
</template>
```

### **Theme Switching Composable**
```javascript
// composables/useTheme.js
export function useTheme() {
  const toggleDarkMode = () => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        document.documentElement.classList.toggle('dark')
      })
    } else {
      document.documentElement.classList.toggle('dark')
    }
  }
  
  const updatePrimaryColor = (colorName) => {
    const palette = generatePalette(`{${colorName}}`)
    updatePreset({ semantic: { primary: palette } })
  }
  
  return { toggleDarkMode, updatePrimaryColor }
}
```

---

## 🏗️ **Responsibility Matrix**

| **Use Tailwind For** | **Use PrimeVue Tokens For** | **Use Overrides For** |
|----------------------|------------------------------|----------------------|
| `grid grid-cols-3` | `background: '{surface.0}'` | Framework limitations |
| `flex items-center` | `color: '{primary.color}'` | Cross-browser fixes |
| `p-4 m-2 space-y-4` | `borderRadius: '{border.radius.lg}'` | Accessibility (44px targets) |
| `text-lg font-bold` | `'&:hover': { ... }` | Layout conflicts |
| `md:grid-cols-2` | `shadow: '0 4px 6px rgba(...)'` | Performance optimizations |
| `absolute sticky z-10` | Dark/light mode theming | Custom behaviors |

---

## 🔍 **Debug Checklist**

### **Before You Code**
- [ ] Do I need layout or styling?
- [ ] Can I use the optimal path (label/icon props)?
- [ ] Are there existing tokens for this color/spacing?

### **When Something Breaks**
- [ ] Check token syntax: `{primary.color}` not `primary.color`
- [ ] Verify token exists in browser DevTools CSS variables
- [ ] Test dark mode toggle: `.dark` class working?
- [ ] Remove conflicting Tailwind layout classes
- [ ] Check Vue DevTools for correct prop passing

### **Performance Issues**
- [ ] Are computed properties minimal?
- [ ] Am I applying styles conditionally?
- [ ] Are re-renders under control? (< 10 per interaction)

---

## 📱 **Accessibility Quick Checks**

```css
/* ✅ WCAG AAA minimum touch targets */
:deep(.p-button) {
  min-height: 2.75rem; /* 44px */
  min-width: 2.75rem;  /* 44px for icon-only */
}

/* ✅ High contrast focus indicators */
:deep(.p-button:focus-visible) {
  outline: 2px solid {primary.color};
  outline-offset: 2px;
}

/* ✅ Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  :deep(.p-button) { transition: none; }
}
```

---

## 🎨 **Color & Token Quick Reference**

### **Semantic Token Hierarchy**
```
{primary.color} → {blue.500} → #3b82f6
{surface.100} → {gray.100} → #f3f4f6
{text.color} → {surface.900} → #111827
```

### **Common Token Patterns**
```javascript
// ✅ BACKGROUNDS
background: '{surface.0}'           // White/dark surface
background: '{primary.color}'       // Brand color
background: '{green.50}'           // Status colors

// ✅ BORDERS  
border: '1px solid {surface.200}'  // Subtle borders
borderColor: '{primary.color}'     // Brand borders

// ✅ TEXT
color: '{surface.900}'             // Primary text
color: '{surface.600}'             // Secondary text
color: '{primary.contrastColor}'   // High contrast
```

---

## 💡 **Pro Tips**

1. **Start Simple**: Use optimal path first, add complexity only when needed
2. **Token First**: Always try tokens before hardcoded values
3. **Conditional Logic**: Apply fixes only when framework API insufficient
4. **Test All Variants**: Every button variant, size, and state
5. **Performance**: Monitor re-renders, use computed properties wisely
6. **Debug Early**: Use browser DevTools and Vue DevTools liberally
7. **Accessibility**: 44px targets, focus indicators, reduced motion

---

*Keep this cheat sheet handy while coding! 🚀*

**Need more details?** → See [PrimeVue Design Guide](./PrimeVue-Design-Guide.md) 