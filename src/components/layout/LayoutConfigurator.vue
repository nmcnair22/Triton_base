<template>
  <Drawer
    :visible="layoutState.configSidebarVisible"
    @update:visible="hideConfigSidebar"
    position="right"
    class="layout-configurator-drawer"
    :show-close-icon="false"
  >
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div>
          <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-100">Layout Configuration</h2>
          <p class="text-sm text-surface-500 dark:text-surface-400">Customize sidebar and layout options</p>
        </div>
        <button
          @click="hideConfigSidebar"
          class="w-8 h-8 rounded-full hover:bg-surface-100 dark:hover:bg-surface-800 
                 text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100
                 transition-colors flex items-center justify-center"
        >
          <i class="pi pi-times text-sm"></i>
        </button>
      </div>
    </template>

    <div class="space-y-6 p-1">
      <!-- Menu Type Section -->
      <div class="space-y-3">
        <h3 class="text-sm font-medium text-surface-900 dark:text-surface-100">Menu Type</h3>
        <div class="space-y-2">
          <div
            v-for="mode in menuModes"
            :key="mode.value"
            class="p-3 rounded-lg border border-surface-200 dark:border-surface-700 cursor-pointer transition-all"
            :class="{
              'bg-primary-100 border-primary-300 text-primary-600': layoutConfig.menuMode === mode.value,
              'bg-surface-50 dark:bg-surface-800 hover:bg-surface-100 dark:hover:bg-surface-700': layoutConfig.menuMode !== mode.value
            }"
            @click="setMenuMode(mode.value)"
          >
            <div class="flex items-center space-x-3">
              <i :class="mode.icon" class="text-lg"></i>
              <div>
                <div class="font-medium text-sm">{{ mode.label }}</div>
                <div class="text-xs text-surface-500 dark:text-surface-400">{{ mode.description }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Menu Theme Section -->
      <div class="space-y-3">
        <h3 class="text-sm font-medium text-surface-900 dark:text-surface-100">Menu Theme</h3>
        <div class="flex space-x-2">
          <button
            v-for="theme in menuThemes"
            :key="theme.value"
            @click="setMenuTheme(theme.value)"
            class="flex-1 p-3 rounded-lg border transition-all text-sm font-medium"
            :class="{
              'bg-primary-100 border-primary-300 text-primary-600': layoutConfig.menuTheme === theme.value,
              'bg-surface-50 dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700': layoutConfig.menuTheme !== theme.value
            }"
          >
            <i :class="theme.icon" class="mr-2"></i>
            {{ theme.label }}
          </button>
        </div>
      </div>

      <!-- Topbar Theme Section -->
      <div class="space-y-3">
        <h3 class="text-sm font-medium text-surface-900 dark:text-surface-100">Topbar Theme</h3>
        <div class="flex space-x-2">
          <button
            v-for="theme in topbarThemes"
            :key="theme.value"
            @click="setTopbarTheme(theme.value)"
            class="flex-1 p-3 rounded-lg border transition-all text-sm font-medium"
            :class="{
              'bg-primary-100 border-primary-300 text-primary-600': layoutConfig.topbarTheme === theme.value,
              'bg-surface-50 dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700': layoutConfig.topbarTheme !== theme.value
            }"
          >
            <i :class="theme.icon" class="mr-2"></i>
            {{ theme.label }}
          </button>
        </div>
      </div>

      <!-- Input Style Section -->
      <div class="space-y-3">
        <h3 class="text-sm font-medium text-surface-900 dark:text-surface-100">Input Style</h3>
        <div class="flex space-x-2">
          <button
            v-for="style in inputStyles"
            :key="style.value"
            @click="setInputStyle(style.value)"
            class="flex-1 p-3 rounded-lg border transition-all text-sm font-medium"
            :class="{
              'bg-primary-100 border-primary-300 text-primary-600': layoutConfig.inputStyle === style.value,
              'bg-surface-50 dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700': layoutConfig.inputStyle !== style.value
            }"
          >
            <i :class="style.icon" class="mr-2"></i>
            {{ style.label }}
          </button>
        </div>
      </div>

      <!-- Scale Section -->
      <div class="space-y-3">
        <h3 class="text-sm font-medium text-surface-900 dark:text-surface-100">Scale</h3>
        <div class="space-y-2">
          <Slider
            v-model="layoutConfig.scale"
            :min="12"
            :max="20"
            :step="1"
            @update:model-value="(value) => setScale(Array.isArray(value) ? value[0] : value)"
            class="w-full"
          />
          <div class="flex justify-between text-xs text-surface-500 dark:text-surface-400">
            <span>Small (12px)</span>
            <span class="font-medium">{{ layoutConfig.scale }}px</span>
            <span>Large (20px)</span>
          </div>
        </div>
      </div>

      <!-- Ripple Effect Section -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-medium text-surface-900 dark:text-surface-100">Ripple Effect</h3>
            <p class="text-xs text-surface-500 dark:text-surface-400">Enable material design ripple animations</p>
          </div>
          <ToggleSwitch
            v-model="layoutConfig.ripple"
            @update:model-value="setRipple"
          />
        </div>
      </div>
    </div>
  </Drawer>
</template>

<script setup lang="ts">
import { useLayout } from '@/composables/useLayout'
import type { LayoutConfig } from '@/composables/useLayout'

const {
  layoutConfig,
  layoutState,
  hideConfigSidebar,
  setMenuMode,
  setMenuTheme,
  setTopbarTheme,
  setInputStyle,
  setScale,
  setRipple
} = useLayout()

const menuModes = [
  {
    label: 'Static',
    value: 'static' as const,
    description: 'Fixed sidebar always visible',
    icon: 'pi pi-sidebar'
  },
  {
    label: 'Overlay',
    value: 'overlay' as const,
    description: 'Sidebar slides over content',
    icon: 'pi pi-clone'
  },
  {
    label: 'Slim',
    value: 'slim' as const,
    description: 'Narrow sidebar with hover expand',
    icon: 'pi pi-align-left'
  },
  {
    label: 'Compact',
    value: 'compact' as const,
    description: 'Icons only with hover expand',
    icon: 'pi pi-th-large'
  },
  {
    label: 'Horizontal',
    value: 'horizontal' as const,
    description: 'Top navigation bar',
    icon: 'pi pi-bars'
  }
]

const menuThemes = [
  { label: 'Light', value: 'light' as const, icon: 'pi pi-sun' },
  { label: 'Dark', value: 'dark' as const, icon: 'pi pi-moon' }
]

const topbarThemes = [
  { label: 'Light', value: 'light' as const, icon: 'pi pi-sun' },
  { label: 'Dark', value: 'dark' as const, icon: 'pi pi-moon' }
]

const inputStyles = [
  { label: 'Outlined', value: 'outlined' as const, icon: 'pi pi-square' },
  { label: 'Filled', value: 'filled' as const, icon: 'pi pi-stop' }
]
</script>

<style scoped>
@reference "../../assets/main.css";

.layout-configurator-drawer {
  width: 350px;
}

.layout-configurator-drawer :deep(.p-drawer-content) {
  padding: 0;
}
</style> 