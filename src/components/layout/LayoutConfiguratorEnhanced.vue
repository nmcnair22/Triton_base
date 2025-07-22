<template>
  <Drawer 
    :visible="configSidebarVisible" 
    @update:visible="(value) => layoutState.configSidebarVisible = value"
    position="right" 
    header=""
    class="layout-config-drawer"
    :pt="{
      root: { class: 'w-80' },
      content: { class: 'p-0 h-full' }
    }"
  >
    <!-- Header -->
    <div class="config-header flex items-center justify-between p-4 border-b border-surface-200 dark:border-surface-700">
      <h2 class="text-xl font-semibold text-surface-900 dark:text-surface-0">
        Layout Configuration
      </h2>
      <Button
        icon="pi pi-times"
        severity="secondary"
        text
        rounded
        @click="configSidebarVisible = false"
      />
    </div>
    
    <!-- Configuration Content -->
    <ScrollPanel class="config-content h-full">
      <div class="p-4 space-y-6">
        <!-- Menu Mode Selection -->
        <div class="config-section">
          <h3 class="config-section-title">Menu Mode</h3>
          <div class="grid grid-cols-2 gap-2">
            <Button
              v-for="mode in menuModeOptions"
              :key="mode.value"
              :label="mode.label"
              :icon="mode.icon"
              :severity="menuMode === mode.value ? 'primary' : 'secondary'"
              :outlined="menuMode !== mode.value"
              size="small"
              class="justify-start text-sm p-2"
              v-tooltip.bottom="mode.description"
              @click="setMenuMode(mode.value as any)"
            />
          </div>
        </div>
        
        <!-- Sidebar Theme -->
        <div class="config-section">
          <h3 class="config-section-title">Sidebar Theme</h3>
          <SelectButton
            :model-value="sidebarTheme"
            :options="sidebarThemeOptions"
            option-label="label"
            option-value="value"
            :allow-empty="false"
            class="w-full"
            @update:model-value="setSidebarTheme"
          />
        </div>
        
        <!-- Primary Color -->
        <div class="config-section">
          <h3 class="config-section-title">Primary Color</h3>
          <div class="grid grid-cols-4 gap-3">
            <button
              v-for="color in primaryColorOptions"
              :key="color.value"
              class="color-option"
              :style="{ backgroundColor: color.color }"
              :class="{
                'ring-2 ring-offset-2 ring-surface-900 dark:ring-surface-0 ring-offset-surface-0 dark:ring-offset-surface-900': 
                  primaryColor === color.value
              }"
              :title="color.label"
              @click="setPrimaryColor(color.value)"
            >
              <i 
                v-if="primaryColor === color.value"
                class="pi pi-check text-white text-sm"
              ></i>
            </button>
          </div>
        </div>
        
        <!-- Additional Options -->
        <div class="config-section">
          <h3 class="config-section-title">Options</h3>
          
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <label class="text-sm font-medium">Menu Profile</label>
              <InputSwitch 
                :model-value="menuProfile" 
                @update:model-value="setMenuProfile"
              />
            </div>
            
            <div class="flex items-center justify-between">
              <label class="text-sm font-medium">Menu Anchored</label>
              <InputSwitch 
                :model-value="layoutState.anchored" 
                :disabled="!canToggleAnchor"
                v-tooltip.bottom="canToggleAnchor ? 'Pin/unpin sidebar' : 'Not available in this mode'"
                @update:model-value="handleAnchorToggle"
              />
            </div>
          </div>
        </div>
        
        <!-- Scale -->
        <div class="config-section">
          <h3 class="config-section-title">Interface Scale</h3>
          <div class="flex items-center space-x-3">
            <span class="text-sm">Small</span>
            <Slider
              :model-value="layoutConfig.scale"
              :min="12"
              :max="20"
              :step="1"
              class="flex-1"
              @update:model-value="setScale"
            />
            <span class="text-sm">Large</span>
          </div>
          <div class="text-center mt-2 text-xs text-surface-600 dark:text-surface-400">
            {{ layoutConfig.scale }}px
          </div>
        </div>
        
        <!-- Preview Section -->
        <div class="config-section">
          <h3 class="config-section-title">Preview</h3>
          <div class="border border-surface-200 dark:border-surface-700 rounded-lg p-4 space-y-3">
            <div class="flex items-center space-x-2">
              <Button icon="pi pi-home" size="small" />
              <span class="text-sm">Button Example</span>
            </div>
            <InputText 
              placeholder="Input example" 
              size="small"
              class="w-full"
            />
            <div class="flex space-x-2">
              <Badge value="Info" severity="info" />
              <Badge value="Success" severity="success" />
              <Badge value="Warning" severity="warn" />
            </div>
          </div>
        </div>
        
        <!-- Actions -->
        <Divider />
        
        <div class="space-y-3">
          <Button
            label="Reset to Defaults"
            icon="pi pi-refresh"
            severity="danger"
            outlined
            class="w-full"
            @click="handleReset"
          />
          
          <Button
            label="Export Configuration"
            icon="pi pi-download"
            severity="secondary"
            outlined
            class="w-full"
            @click="exportConfig"
          />
        </div>
      </div>
    </ScrollPanel>
  </Drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLayoutEnhanced } from '@/composables/layout/useLayoutEnhanced'
import { useToast } from 'primevue/usetoast'

const toast = useToast()

const {
  configSidebarVisible,
  menuMode,
  sidebarTheme,
  primaryColor,
  menuProfile,
  layoutState,
  layoutConfig,
  menuModeOptions,
  sidebarThemeOptions,
  primaryColorOptions,
  isReveal,
  isSlim,
  setMenuMode,
  setSidebarTheme,
  setPrimaryColor,
  toggleAnchor,
  resetConfig
} = useLayoutEnhanced()

const canToggleAnchor = computed(() => isReveal.value || isSlim.value)

function setMenuProfile(enabled: boolean) {
  layoutConfig.value.menuProfile = enabled
}

function setScale(value: number | number[]) {
  const scaleValue = Array.isArray(value) ? value[0] : value
  layoutConfig.value.scale = scaleValue
  document.documentElement.style.fontSize = scaleValue + 'px'
}

function handleAnchorToggle(_value: boolean) {
  if (canToggleAnchor.value) {
    toggleAnchor()
  }
}

function handleReset() {
  resetConfig()
  toast.add({
    severity: 'success',
    summary: 'Reset Complete',
    detail: 'Layout configuration has been reset to defaults',
    life: 3000
  })
}

function exportConfig() {
  const config = {
    menuMode: menuMode.value,
    sidebarTheme: sidebarTheme.value,
    primaryColor: primaryColor.value,
    menuProfile: menuProfile.value,
    scale: layoutConfig.value.scale
  }
  
  const blob = new Blob([JSON.stringify(config, null, 2)], { 
    type: 'application/json' 
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'triton-layout-config.json'
  link.click()
  URL.revokeObjectURL(url)
  
  toast.add({
    severity: 'success',
    summary: 'Export Complete',
    detail: 'Configuration has been exported',
    life: 3000
  })
}
</script>

<style scoped>
.config-header {
  min-height: 4rem;
}

.config-content {
  height: calc(100vh - 4rem);
}

.config-section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-surface-600);
  margin-bottom: 0.75rem;
}

:root.dark .config-section-title {
  color: var(--color-surface-300);
}

.color-option {
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--color-surface-400);
}

/* Custom scrollbar */
.layout-config-drawer :deep(.p-scrollpanel-bar-y) {
  background-color: var(--color-surface-300);
  width: 4px;
  border-radius: 2px;
}

:root.dark .layout-config-drawer :deep(.p-scrollpanel-bar-y) {
  background-color: var(--color-surface-600);
}

.layout-config-drawer :deep(.p-scrollpanel-track-y) {
  background-color: var(--color-surface-100);
  width: 8px;
  border-radius: 4px;
}

:root.dark .layout-config-drawer :deep(.p-scrollpanel-track-y) {
  background-color: var(--color-surface-800);
}
</style>