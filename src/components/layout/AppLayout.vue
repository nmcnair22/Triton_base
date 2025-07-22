<template>
  <div class="layout-wrapper min-h-screen bg-surface-0 dark:bg-surface-50 transition-colors">
    <!-- Sidebar - hide in horizontal mode -->
    <AppSidebarEnhanced v-if="!isHorizontal" />
    
    <!-- Main Content Area -->
    <div :class="mainContentClasses">
      <!-- Topbar - ALWAYS visible -->
      <AppTopbar />
      
      <!-- Page Content -->
      <main class="layout-content flex-1 overflow-auto">
        <div class="content-wrapper container mx-auto px-4 py-6 lg:px-6 lg:py-8">
          <router-view v-slot="{ Component }">
            <Transition name="page" mode="out-in">
              <component :is="Component" />
            </Transition>
          </router-view>
        </div>
      </main>
    </div>
    
    <!-- Enhanced Layout Configurator -->
    <LayoutConfiguratorEnhanced />
    
    <!-- Theme Configurator (existing) -->
    <ThemeConfigurator />
    
    <!-- Toast Messages -->
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useLayoutEnhanced } from '@/composables/layout/useLayoutEnhanced'
import { useThemeConfigStore } from '@/stores/theme'
import { useDarkMode } from '@/composables'
import AppSidebarEnhanced from './sidebar/AppSidebarEnhanced.vue'
import AppTopbar from './AppTopbar.vue'
import LayoutConfiguratorEnhanced from './LayoutConfiguratorEnhanced.vue'
import ThemeConfigurator from '@/components/theme/ThemeConfigurator.vue'
import Toast from 'primevue/toast'

const { 
  mainContentClasses, 
  isHorizontal, 
  layoutConfig 
} = useLayoutEnhanced()

const themeConfigStore = useThemeConfigStore()
const { initialize: initializeDarkMode } = useDarkMode()

// Initialize both systems on mount
onMounted(async () => {
  console.log('🎨 Initializing Enhanced Triton Layout & Theme Systems...')
  
  // Initialize dark mode
  initializeDarkMode()
  
  // Initialize theme store
  await themeConfigStore.initialize()
  
  // Apply initial layout configuration
  applyLayoutConfig()
  
  console.log('✅ Enhanced Triton systems ready!')
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
/* Page transitions */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.layout-content {
  min-height: calc(100vh - 4rem);
}
</style>
