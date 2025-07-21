<template>
  <Button
    v-bind="$attrs"
    :dt="computedTokens"
    :class="computedClasses"
    :style="needsWidthFix ? widthFixStyles : undefined"
    :label="!hasSlotContent ? label : undefined"
    :icon="!hasIconSlot ? icon : undefined"
    :severity="primeVueSeverity"
    :loading="loading"
    :disabled="disabled"
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
  rounded?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'medium',
  fullWidth: false,
  loading: false,
  disabled: false,
  rounded: false,
})

const slots = useSlots()

// ✅ HYBRID APPROACH: Detect when we need special handling
const hasSlotContent = computed(() => !!slots.default)
const hasIconSlot = computed(() => !!slots.icon)
const needsWidthFix = computed(() => hasSlotContent.value && !props.label)

// ✅ CONDITIONAL WIDTH FIX: Only applied when using slot content without label
const widthFixStyles = {
  whiteSpace: 'nowrap' as const,
  minWidth: 'fit-content',
}

// ✅ CLEAN TOKENS: Only styling properties, no layout
const computedTokens = computed(() => {
  return TokenFactory.button(props.variant, props.size)
})

// ✅ PRIMEVUE SIZE MAPPING: Convert our size to PrimeVue's expected values
const primeVueSize = computed(() => {
  const sizeMap = {
    small: 'small' as const,
    medium: undefined, // Default size in PrimeVue
    large: 'large' as const,
  }
  return sizeMap[props.size]
})

// ✅ PRIMEVUE SEVERITY MAPPING: Convert our variant to PrimeVue's severity
const primeVueSeverity = computed(() => {
  const severityMap = {
    primary: undefined, // Default severity in PrimeVue
    secondary: 'secondary' as const,
    success: 'success' as const,
    warning: 'warn' as const,
    danger: 'danger' as const,
    ghost: 'help' as const, // Map ghost to help for now
  }
  return severityMap[props.variant]
})

// ✅ LAYOUT CLASSES: Only non-conflicting Tailwind utilities
const computedClasses = computed(() => [
  // Transitions and focus states (safe)
  'transition-all duration-200',
  'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',

  // Layout modifiers (safe)
  props.fullWidth ? 'w-full' : '',
  props.rounded ? '!rounded-full' : '',

  // NOTE: Removed conflicting layout classes:
  // ❌ 'inline-flex', 'items-center', 'justify-center', 'gap-2'
  // These interfere with PrimeVue's internal button layout
])
</script>

<style scoped>
/* ✅ MINIMAL SCOPED STYLES: Only essential overrides for design system consistency */
:deep(.p-button) {
  /* Ensure minimum touch target for accessibility (44px AAA compliance) */
  min-height: 2.75rem;
  padding: 0.75rem 1.25rem;
}

:deep(.p-button-lg) {
  min-height: 3.25rem;
  padding: 1rem 1.5rem;
}

:deep(.p-button-sm) {
  min-height: 2.25rem;
  padding: 0.5rem 1rem;
}

/* ✅ ICON SPACING: Ensure proper spacing when using icon slot */
:deep(.p-button-icon-left) {
  gap: 0.5rem;
}
</style>
