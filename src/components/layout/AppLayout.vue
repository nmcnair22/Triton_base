<template>
  <div class="layout-wrapper" :class="layoutClasses">
    <!-- Sidebar -->
    <AppSidebar v-if="!isHorizontal" />
    
    <!-- Main Content Area -->
    <div class="layout-main" :class="{ 'layout-main-full': isHorizontal }">
      <!-- Topbar -->
      <AppTopbar />
      
      <!-- Page Content -->
      <main class="layout-content">
        <div class="content-wrapper">
          <router-view />
        </div>
      </main>
    </div>
    
    <!-- Layout Configurator -->
    <LayoutConfigurator />
    
    <!-- Theme Configurator (existing) -->
    <ThemeConfigurator />
    
    <!-- Toast Messages -->
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useLayout } from '@/composables/useLayout'
import { useThemeStore } from '@/stores/theme.store'
import { useDarkMode } from '@/composables'
import AppSidebar from './AppSidebar.vue'
import AppTopbar from './AppTopbar.vue'
import LayoutConfigurator from './LayoutConfigurator.vue'
import ThemeConfigurator from '@/components/theme/ThemeConfigurator.vue'
import Toast from 'primevue/toast'

const { layoutClasses, isHorizontal, layoutConfig } = useLayout()
const themeStore = useThemeStore()
const { initialize: initializeDarkMode } = useDarkMode()

// Initialize both systems on mount
onMounted(async () => {
  console.log('🎨 Initializing Triton Layout & Theme Systems...')
  
  // Initialize dark mode
  initializeDarkMode()
  
  // Initialize theme store
  await themeStore.initialize()
  
  // Apply initial layout configuration
  applyLayoutConfig()
  
  console.log('✅ Triton systems ready!')
})

// Watch for layout configuration changes
watch(() => layoutConfig.value, applyLayoutConfig, { deep: true })

function applyLayoutConfig() {
  // Apply scale
  document.documentElement.style.fontSize = layoutConfig.value.scale + 'px'
  
  // Apply body classes based on layout configuration
  const body = document.body
  
  // Remove all layout classes
  body.classList.remove('p-input-filled', 'p-ripple-disabled')
  
  // Apply input style
  if (layoutConfig.value.inputStyle === 'filled') {
    body.classList.add('p-input-filled')
  }
  
  // Apply ripple setting
  if (!layoutConfig.value.ripple) {
    body.classList.add('p-ripple-disabled')
  }
}
</script>

<style scoped>
@reference "../../assets/main.css";

.layout-wrapper {
  @apply min-h-screen bg-surface-0 dark:bg-surface-50 transition-colors;
  display: flex;
}

.layout-main {
  @apply flex-1 flex flex-col;
  transition: margin-left 0.3s ease;
}

.layout-main-full {
  @apply w-full;
}

.layout-content {
  @apply flex-1 overflow-auto;
}

.content-wrapper {
  @apply container mx-auto px-4 py-8;
}

/* Static Layout */
.layout-static .layout-main {
  margin-left: 280px;
}

.layout-static.layout-static-inactive .layout-main {
  margin-left: 0;
}

/* Overlay Layout */
.layout-overlay .layout-main {
  margin-left: 0;
}

/* Slim Layout */
.layout-slim .layout-main {
  margin-left: 60px;
}

.layout-slim.layout-menu-active .layout-main {
  margin-left: 280px;
}

/* Compact Layout */
.layout-compact .layout-main {
  margin-left: 80px;
}

.layout-compact.layout-menu-active .layout-main {
  margin-left: 280px;
}

/* Horizontal Layout */
.layout-horizontal .layout-main {
  margin-left: 0;
}

/* Mobile Responsive */
@media (max-width: 991px) {
  .layout-static .layout-main,
  .layout-slim .layout-main,
  .layout-compact .layout-main {
    margin-left: 0;
  }
}

/* Layout overlay when menu is active on mobile/overlay mode */
.layout-menu-active::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  z-index: 40;
  backdrop-filter: blur(2px);
}

.layout-static .layout-menu-active::before {
  display: none;
}

@media (min-width: 992px) {
  .layout-menu-active::before {
    display: none;
  }
}
</style>
