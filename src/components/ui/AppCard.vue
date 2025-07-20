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
import { TokenFactory, type CardElevation } from '@/themes/token-factory'
import Card from 'primevue/card'

interface Props {
  elevation?: CardElevation
  padding?: 'none' | 'small' | 'medium' | 'large'
  hoverable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  elevation: 'medium',
  padding: 'medium',
  hoverable: false,
})

const computedTokens = computed(() => {
  const tokens = TokenFactory.card(props.elevation)

  const paddingValues = {
    none: '0',
    small: '1rem',
    medium: '1.5rem',
    large: '2rem',
  }

  // Update padding
  tokens.root = {
    ...tokens.root,
    padding: paddingValues[props.padding]
  }

  // Add hover effect if hoverable
  if (props.hoverable) {
    tokens.root = {
      ...tokens.root,
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        transform: 'translateY(-2px)',
        shadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
      }
    }
  }

  return tokens
})

const computedClasses = computed(() => ['animate-fade-in', props.hoverable ? 'cursor-pointer' : ''])
</script>


