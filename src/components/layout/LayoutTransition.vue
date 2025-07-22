<template>
  <Transition
    :name="transitionName"
    @before-enter="onBeforeEnter"
    @enter="onEnter"
    @after-enter="onAfterEnter"
    @before-leave="onBeforeLeave"
    @leave="onLeave"
  >
    <slot />
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLayoutEnhanced } from '@/composables/layout/useLayoutEnhanced'

const { layoutConfig } = useLayoutEnhanced()

const transitionName = computed(() => {
  // Different transitions for different mode changes
  if (layoutConfig.value.menuMode === 'reveal' || layoutConfig.value.menuMode === 'drawer') {
    return 'slide-fade'
  }
  if (layoutConfig.value.menuMode === 'slim' || layoutConfig.value.menuMode === 'compact') {
    return 'width-fade'
  }
  return 'fade'
})

function onBeforeEnter(el: Element) {
  const element = el as HTMLElement
  element.style.opacity = '0'
}

function onEnter(el: Element) {
  const element = el as HTMLElement
  // Force reflow
  void element.offsetHeight
  element.style.opacity = '1'
}

function onAfterEnter(el: Element) {
  const element = el as HTMLElement
  element.style.opacity = ''
}

function onBeforeLeave(el: Element) {
  const element = el as HTMLElement
  element.style.opacity = '1'
}

function onLeave(el: Element) {
  const element = el as HTMLElement
  element.style.opacity = '0'
}
</script>

<style>
/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide + Fade transition */
.slide-fade-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-enter-from {
  transform: translateX(-20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

/* Width + Fade transition */
.width-fade-enter-active,
.width-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.width-fade-enter-from,
.width-fade-leave-to {
  opacity: 0;
  transform: scaleX(0.8);
}
</style>
