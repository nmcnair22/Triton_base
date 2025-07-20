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
  const baseTokens = TokenFactory.button(props.variant, props.size)
  
  // Override border radius if rounded
  if (props.rounded) {
    baseTokens.root = {
      ...baseTokens.root,
      borderRadius: '9999px'
    }
  }
  
  return baseTokens
})

const computedClasses = computed(() => [
  props.fullWidth ? 'w-full' : '',
  'inline-flex items-center justify-center gap-2',
  'transition-all duration-200 ease-smooth',
])
</script>


