<template>
  <transition
    name="form-error"
    @enter="onEnter"
    @leave="onLeave"
  >
    <div 
      v-if="message"
      class="app-form-error"
      :class="errorClasses"
      role="alert"
      :aria-live="ariaLive"
    >
      <i v-if="showIcon" :class="iconClass" />
      <span class="app-form-error__message">{{ message }}</span>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  message?: string
  fieldName?: string
  severity?: 'error' | 'warning' | 'info'
  showIcon?: boolean
  ariaLive?: 'polite' | 'assertive' | 'off'
}

const props = withDefaults(defineProps<Props>(), {
  severity: 'error',
  showIcon: true,
  ariaLive: 'polite'
})

const errorClasses = computed(() => [
  `app-form-error--${props.severity}`
])

const iconClass = computed(() => {
  const iconMap = {
    error: 'pi pi-exclamation-circle',
    warning: 'pi pi-exclamation-triangle',
    info: 'pi pi-info-circle'
  }
  return [iconMap[props.severity], 'app-form-error__icon']
})

// Animation hooks
const onEnter = (el: Element) => {
  const element = el as HTMLElement
  element.style.height = '0'
  element.style.opacity = '0'
  
  // Force reflow
  element.offsetHeight
  
  element.style.transition = 'height 0.2s ease, opacity 0.2s ease'
  element.style.height = element.scrollHeight + 'px'
  element.style.opacity = '1'
}

const onLeave = (el: Element) => {
  const element = el as HTMLElement
  element.style.transition = 'height 0.2s ease, opacity 0.2s ease'
  element.style.height = '0'
  element.style.opacity = '0'
}
</script>

<style scoped>
.app-form-error {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.875rem;
  overflow: hidden;
}

.app-form-error--error {
  color: rgb(239 68 68);
}

.app-form-error--warning {
  color: rgb(251 146 60);
}

.app-form-error--info {
  color: rgb(59 130 246);
}

.app-form-error__icon {
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.app-form-error__message {
  flex: 1;
}

/* Transition classes */
.form-error-enter-active,
.form-error-leave-active {
  transition: all 0.2s ease-in-out;
}

.form-error-enter-from,
.form-error-leave-to {
  opacity: 0;
  transform: translateY(-0.25rem);
}
</style>