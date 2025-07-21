<template>
  <div class="layout-topbar">
    <div class="topbar-left">
      <!-- Menu Toggle Button -->
      <button 
        class="menu-button" 
        @click="toggleMenu"
        :title="isMenuVisible ? 'Hide menu' : 'Show menu'"
      >
        <i class="pi pi-bars"></i>
      </button>
      
      <!-- Logo for horizontal mode -->
      <div v-if="isHorizontal" class="horizontal-logo">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
            <i class="pi pi-bolt text-white text-sm font-bold"></i>
          </div>
          <div>
            <h1 class="text-lg font-bold text-surface-900 dark:text-surface-100">Triton</h1>
          </div>
        </div>
      </div>
      
      <!-- Breadcrumb placeholder -->
      <div class="breadcrumb">
        <span class="text-surface-500 dark:text-surface-400">{{ $route.path }}</span>
      </div>
    </div>

    <div class="topbar-right">
      <!-- Layout Configuration Button -->
      <button
        @click="toggleConfigSidebar"
        class="topbar-button"
        :class="{ 'topbar-button-active': layoutState.configSidebarVisible }"
        title="Layout Configuration"
      >
        <i class="pi pi-cog"></i>
      </button>
      
      <!-- Theme Configuration Button -->
      <button
        @click="toggleThemeConfig"
        class="topbar-button"
        title="Theme Configuration"
      >
        <i class="pi pi-palette"></i>
      </button>
      
      <!-- User Profile placeholder -->
      <div class="user-profile">
        <button class="topbar-button">
          <i class="pi pi-user"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLayout } from '@/composables/useLayout'
import { useThemeStore } from '@/stores/theme.store'

const { layoutState, isHorizontal, isMenuVisible, toggleMenu, toggleConfigSidebar } = useLayout()
const themeStore = useThemeStore()

function toggleThemeConfig() {
  themeStore.toggleConfig()
}
</script>

<style scoped>
@reference "../../assets/main.css";

.layout-topbar {
  @apply flex items-center justify-between h-16 px-4 bg-surface-0 dark:bg-surface-900 border-b border-surface-200 dark:border-surface-700;
}

.topbar-left {
  @apply flex items-center space-x-4;
}

.topbar-right {
  @apply flex items-center space-x-2;
}

.menu-button {
  @apply w-10 h-10 rounded-lg bg-transparent hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 transition-all duration-200 flex items-center justify-center border border-surface-300 dark:border-surface-600;
}

.horizontal-logo {
  @apply flex items-center;
}

.breadcrumb {
  @apply text-sm;
}

.topbar-button {
  @apply w-10 h-10 rounded-lg bg-transparent hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 transition-all duration-200 flex items-center justify-center border border-surface-300 dark:border-surface-600;
}

.topbar-button-active {
  @apply bg-primary-100 text-primary-600 border-primary-200;
}

.user-profile {
  @apply flex items-center;
}
</style> 