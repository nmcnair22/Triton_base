<template>
  <aside 
    :class="sidebarClasses"
    @mouseenter="handleSidebarMouseEnter"
    @mouseleave="handleSidebarMouseLeave"
  >
    <!-- Sidebar Header -->
    <div class="sidebar-header p-4 border-b border-current border-opacity-20 flex items-center justify-between">
      <!-- Logo -->
      <router-link 
        to="/" 
        class="flex items-center space-x-3 text-current no-underline"
        :class="{ 'justify-center': (isSlim && !menuHoverActive) || (isCompact && !menuHoverActive) }"
      >
        <div class="w-8 h-8 bg-current rounded-lg flex items-center justify-center text-surface-0">
          <i class="pi pi-prime text-lg"></i>
        </div>
        <span 
          v-show="!((isSlim || isCompact) && !menuHoverActive)"
          class="font-bold text-xl transition-opacity duration-300"
        >
          Triton
        </span>
      </router-link>
      
      <!-- Anchor Toggle (for reveal/slim modes) -->
      <Button
        v-if="(isReveal || isSlim) && menuHoverActive"
        :icon="anchored ? 'pi pi-lock' : 'pi pi-lock-open'"
        text
        rounded
        size="small"
        class="text-current opacity-70 hover:opacity-100"
        v-tooltip.bottom="anchored ? 'Unpin sidebar' : 'Pin sidebar'"
        @click="toggleAnchor"
      />
    </div>

    <!-- Menu Container -->
    <div class="sidebar-content flex-1 overflow-hidden">
      <ScrollPanel class="h-full">
        <AppSidebarMenu />
      </ScrollPanel>
    </div>

    <!-- Sidebar Footer (optional) -->
    <div 
      v-if="menuProfile && !((isSlim || isCompact) && !menuHoverActive)"
      class="sidebar-footer p-4 border-t border-current border-opacity-20"
    >
      <div class="flex items-center space-x-3">
        <Avatar 
          icon="pi pi-user" 
          size="normal" 
          shape="circle"
          class="bg-current text-surface-0"
        />
        <div class="flex-1 min-w-0">
          <div class="text-sm font-medium truncate">John Doe</div>
          <div class="text-xs opacity-70 truncate">john@example.com</div>
        </div>
        <Button
          icon="pi pi-sign-out"
          text
          rounded
          size="small"
          class="text-current opacity-70 hover:opacity-100"
        />
      </div>
    </div>
  </aside>

  <!-- Mobile Overlay -->
  <div
    v-if="isSidebarActive && (isMobile || isOverlay || isDrawer)"
    class="fixed inset-0 bg-black bg-opacity-50 z-30 backdrop-blur-sm"
    @click="toggleMenu"
  ></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLayoutEnhanced } from '@/composables/layout/useLayoutEnhanced'
import AppSidebarMenu from './AppSidebarMenu.vue'

const {
  sidebarClasses,
  isSlim,
  isCompact,
  isReveal,
  isSidebarActive,
  isMobile,
  isOverlay,
  isDrawer,
  layoutState,
  layoutConfig,
  handleSidebarMouseEnter,
  handleSidebarMouseLeave,
  toggleAnchor,
  toggleMenu
} = useLayoutEnhanced()

// Access reactive properties directly from state/config
const menuHoverActive = computed(() => layoutState.value.menuHoverActive)
const anchored = computed(() => layoutState.value.anchored)
const menuProfile = computed(() => layoutConfig.value.menuProfile)
</script>

<style scoped>
.sidebar-header {
  min-height: 4rem;
}

.sidebar-content {
  height: calc(100vh - 8rem);
}

.sidebar-footer {
  min-height: 4rem;
}

/* Smooth transitions */
.layout-sidebar {
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Custom scrollbar for sidebar */
.layout-sidebar :deep(.p-scrollpanel-bar-y) {
  background-color: rgba(255, 255, 255, 0.2);
  width: 4px;
  border-radius: 2px;
}

.layout-sidebar :deep(.p-scrollpanel-track-y) {
  background-color: transparent;
  width: 8px;
}
</style> 