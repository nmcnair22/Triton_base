<template>
  <div 
    class="layout-sidebar"
    @mouseenter="onMouseEnter" 
    @mouseleave="onMouseLeave"
    :class="[
      {
        'layout-sidebar-active': layoutState.sidebarActive,
        'layout-sidebar-anchored': layoutState.anchored
      }
    ]"
  >
    <!-- Sidebar Header -->
    <div class="sidebar-header">
              <router-link :to="{ name: 'home' }" class="logo">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
            <i class="pi pi-bolt text-white text-sm font-bold"></i>
          </div>
          <div v-if="!isCompact || layoutState.sidebarActive">
            <h1 class="text-lg font-bold text-surface-900 dark:text-surface-100">Triton</h1>
            <p class="text-xs text-surface-500 dark:text-surface-400">Design System</p>
          </div>
        </div>
      </router-link>
      
      <!-- Anchor Toggle Button -->
      <button 
        v-if="!isHorizontal"
        class="layout-sidebar-anchor" 
        type="button" 
        @click="onAnchorToggle"
        :title="layoutState.anchored ? 'Unpin sidebar' : 'Pin sidebar'"
      >
        <i :class="layoutState.anchored ? 'pi pi-lock' : 'pi pi-lock-open'"></i>
      </button>
    </div>

    <!-- Menu Container -->
    <div class="layout-menu-container">
      <AppMenu />
    </div>

    <!-- Horizontal Topbar (when in horizontal mode) -->
    <AppTopbar v-if="isHorizontal" />
  </div>
</template>

<script setup lang="ts">
import { useLayout } from '@/composables/useLayout'
import AppMenu from './AppMenu.vue'
import AppTopbar from './AppTopbar.vue'

const { layoutState, isHorizontal, isCompact } = useLayout()

let timeout: number | null = null

function onMouseEnter() {
  if (!layoutState.value.anchored) {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
    layoutState.value.sidebarActive = true
  }
}

function onMouseLeave() {
  if (!layoutState.value.anchored) {
    if (!timeout) {
      timeout = setTimeout(() => {
        layoutState.value.sidebarActive = false
      }, 300)
    }
  }
}

function onAnchorToggle() {
  layoutState.value.anchored = !layoutState.value.anchored
}
</script>

<style scoped>
@reference "../../assets/main.css";

.layout-sidebar {
  @apply fixed left-0 top-0 h-full bg-surface-0 dark:bg-surface-900 border-r border-surface-200 dark:border-surface-700 z-50 transition-all duration-300;
  width: 280px;
}

.layout-sidebar:not(.layout-sidebar-anchored) {
  @apply shadow-lg;
  transform: translateX(-100%);
}

.layout-sidebar-active:not(.layout-sidebar-anchored) {
  transform: translateX(0);
}

.layout-sidebar-anchored {
  @apply relative;
  transform: translateX(0);
}

.sidebar-header {
  @apply flex items-center justify-between p-4 border-b border-surface-200 dark:border-surface-700;
}

.logo {
  @apply flex items-center space-x-3 no-underline;
}

.layout-sidebar-anchor {
  @apply w-8 h-8 rounded-full bg-surface-100 dark:bg-surface-800 border border-surface-300 dark:border-surface-600 text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-200 dark:hover:bg-surface-700 transition-all duration-200 flex items-center justify-center;
}

.layout-menu-container {
  @apply flex-1 overflow-y-auto overflow-x-hidden;
}

/* Compact mode styles */
.layout-compact .layout-sidebar {
  width: 80px;
}

.layout-compact .layout-sidebar.layout-sidebar-active {
  width: 280px;
}

/* Slim mode styles */
.layout-slim .layout-sidebar {
  width: 60px;
}

.layout-slim .layout-sidebar.layout-sidebar-active {
  width: 280px;
}

/* Horizontal mode styles */
.layout-horizontal .layout-sidebar {
  @apply w-full h-auto relative border-r-0 border-b border-surface-200 dark:border-surface-700;
}

/* Overlay mode styles */
.layout-overlay .layout-sidebar {
  @apply fixed;
  transform: translateX(-100%);
}

.layout-overlay .layout-sidebar.layout-sidebar-active {
  transform: translateX(0);
  @apply shadow-xl;
}

/* Static mode styles */
.layout-static .layout-sidebar {
  @apply relative;
  transform: translateX(0);
}

.layout-static-inactive .layout-sidebar {
  transform: translateX(-100%);
}

/* Mobile responsiveness */
@media (max-width: 991px) {
  .layout-sidebar {
    @apply fixed;
    transform: translateX(-100%);
  }
  
  .layout-sidebar.layout-sidebar-active {
    transform: translateX(0);
    @apply shadow-xl;
  }
}
</style> 