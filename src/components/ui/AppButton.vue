<template>
  <Button
    v-bind="$attrs"
    :dt="computedTokens"
    :class="computedClasses"
    :loading="loading"
    :disabled="disabled"
  >
    <template #icon v-if="$slots.icon">
      <slot name="icon" />
    </template>
    <slot />
  </Button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TokenFactory, type ButtonVariant, type ButtonSize } from '@/themes/token-factory'
import Button from 'primevue/button'

interface Props {
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

const computedTokens = computed(() => {
  // ✅ CLEAN: Only get styling tokens, layout handled by Tailwind classes
  return TokenFactory.button(props.variant, props.size)
})

const computedClasses = computed(() => [
  // Layout classes (Tailwind responsibility)
  'inline-flex items-center justify-center gap-2',
  'transition-all duration-200',
  'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
  
  // Size classes (Tailwind responsibility)
  {
    'px-2 py-1 text-sm min-h-[2rem]': props.size === 'small',
    'px-4 py-2 text-sm min-h-[2.5rem]': props.size === 'medium', 
    'px-6 py-3 text-base min-h-[3rem]': props.size === 'large'
  },
  
  // Conditional classes
  props.fullWidth ? 'w-full' : '',
  props.rounded ? 'rounded-full' : 'rounded-md'
])
</script>


