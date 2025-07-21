<template>
  <Drawer
    :visible="themeStore.isConfigOpen"
    @update:visible="handleVisibilityChange"
    position="right"
    :style="{ width: '420px' }"
    :modal="false"
    :dismissable="true"
    :show-close-icon="false"
    class="theme-configurator"
    @click.stop
  >
    <!-- Header with actions -->
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center gap-3">
          <i class="pi pi-palette text-xl" />
          <div>
            <h3 class="text-lg font-semibold m-0">Theme Configuration</h3>
            <p class="text-sm text-muted m-0" v-if="themeStore.activePreset">
              {{ themeStore.activePreset.name }}
            </p>
          </div>
        </div>
        
        <div class="flex items-center gap-2">
          <!-- Save indicator -->
          <Badge 
            v-if="themeStore.canSave" 
            value="●" 
            severity="warning" 
            v-tooltip="'Unsaved changes'"
          />
          
          <!-- Quick actions -->
          <Button
            v-if="themeStore.canSave"
            label="Save"
            size="small"
            severity="success"
            @click="saveCurrentPreset"
            v-tooltip="'Save current changes'"
          />
          
          <Button
            icon="pi pi-refresh"
            severity="secondary"
            text
            rounded
            size="small"
            @click="resetToDefaults"
            v-tooltip="'Reset to preset defaults'"
          />
          
          <Button
            icon="pi pi-times"
            severity="secondary"
            text
            rounded
            size="small"
            @click="themeStore.toggleConfig"
            v-tooltip="'Close theme configurator'"
          />
        </div>
      </div>
    </template>

    <div class="space-y-6 p-2">
      <!-- Quick Theme Selection -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <h4 class="text-sm font-medium m-0">Active Theme</h4>
          <Button
            label="Manage"
            size="small"
            text
            @click="showPresetManager = true"
          />
        </div>
        
        <Select
          v-model="selectedPresetId"
          :options="themeStore.availablePresets"
          optionLabel="name"
          optionValue="id"
          placeholder="Select a theme"
          class="w-full"
          @change="onPresetChange"
          :loading="themeStore.state.isLoading"
        >
          <template #option="{ option }">
            <div class="flex items-center justify-between w-full">
              <div class="flex items-center gap-2">
                <div
                  class="w-4 h-4 rounded border border-surface-300"
                  :style="{ backgroundColor: getPresetPrimaryColor(option) }"
                />
                <div>
                  <div class="font-medium">{{ option.name }}</div>
                  <div class="text-xs text-muted">
                    {{ option.baseTheme }}
                    <span v-if="option.metadata.isBuiltIn" class="ml-1">
                      <i class="pi pi-lock text-xs" />
                    </span>
                  </div>
                </div>
              </div>
              
              <div class="flex items-center gap-1">
                <Badge 
                  v-if="option.metadata.isDefault" 
                  value="DEFAULT" 
                  size="small"
                  severity="info"
                />
                <i 
                  v-if="themeStore.activePreset?.id === option.id" 
                  class="pi pi-check text-success"
                />
              </div>
            </div>
          </template>
        </Select>
      </div>

      <!-- Base Theme & Dark Mode -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2">Base Theme</label>
          <Select
            v-model="baseTheme"
            :options="baseThemeOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
            @change="onBaseThemeChange"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2">Mode</label>
                     <div class="flex items-center justify-between p-3 border border-surface-300 rounded">
             <span class="text-sm">{{ darkMode.isDark.value ? 'Dark' : 'Light' }}</span>
             <ToggleSwitch
               :modelValue="darkMode.isDark.value"
               @update:modelValue="darkMode.toggle"
               :disabled="darkMode.isTransitioning.value"
             />
           </div>
        </div>
      </div>

      <!-- Color Token Editor Tabs -->
      <div>
        <h4 class="text-sm font-medium mb-3">Color Tokens</h4>
        
                         <Tabs value="brand">
          <TabList>
            <Tab
              v-for="category in colorCategories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.label }}
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel
              v-for="category in colorCategories"
              :key="category.id"
              :value="category.id"
            >
              <div class="space-y-2">
                <ColorTokenEditor
                  v-for="token in themeConfig.tokensByCategory.value[category.id] || []"
                  :key="token.id"
                  :token="token"
                  :value="themeStore.getTokenValue(token.id)"
                  :is-edited="isTokenEdited(token.id)"
                  @update="updateTokenColor"
                  @reset="resetToken"
                  @edit="startEditingToken"
                />
              </div>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>

      <!-- Color Harmony Tools -->
      <div>
        <h4 class="text-sm font-medium mb-3">Color Tools</h4>
        
        <div class="grid grid-cols-2 gap-2">
          <Button
            label="Monochromatic"
            size="small"
            severity="secondary"
            @click="applyColorHarmony('monochromatic')"
            v-tooltip="'Generate monochromatic color scheme'"
          />
          <Button
            label="Complementary"
            size="small"
            severity="secondary"
            @click="applyColorHarmony('complementary')"
            v-tooltip="'Generate complementary colors'"
          />
          <Button
            label="Triadic"
            size="small"
            severity="secondary"
            @click="applyColorHarmony('triadic')"
            v-tooltip="'Generate triadic color scheme'"
          />
          <Button
            label="Analogous"
            size="small"
            severity="secondary"
            @click="applyColorHarmony('analogous')"
            v-tooltip="'Generate analogous colors'"
          />
        </div>
      </div>

      <!-- Advanced Options -->
      <Accordion value="preferences">
        <AccordionPanel value="preferences">
          <AccordionHeader>Preferences</AccordionHeader>
          <AccordionContent>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm">Auto-save changes</span>
                <ToggleSwitch v-model="themeStore.config.autoSave" />
              </div>
              
              <div class="flex items-center justify-between">
                <span class="text-sm">Sync across tabs</span>
                <ToggleSwitch v-model="themeStore.config.syncAcrossTabs" />
              </div>
              
              <div class="flex items-center justify-between">
                <span class="text-sm">Smooth transitions</span>
                <ToggleSwitch v-model="themeStore.config.smoothTransitions" />
              </div>
            </div>
          </AccordionContent>
        </AccordionPanel>
        
        <AccordionPanel value="export">
          <AccordionHeader>Import / Export</AccordionHeader>
          <AccordionContent>
            <ThemeExporter />
          </AccordionContent>
        </AccordionPanel>
        
        <AccordionPanel value="storage">
          <AccordionHeader>Storage Info</AccordionHeader>
          <AccordionContent>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span>User Presets:</span>
                <span>{{ themeStore.userPresets.length }} / {{ themeStore.config.maxSavedPresets }}</span>
              </div>
              <div class="flex justify-between">
                <span>Built-in Presets:</span>
                <span>{{ themeStore.builtInPresets.length }}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionPanel>
      </Accordion>

      <!-- Live Preview -->
      <ThemePreview />
    </div>

    <!-- Preset Manager Dialog -->
    <PresetManager 
      v-model:visible="showPresetManager"
      @preset-changed="onPresetChanged"
    />
  </Drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useThemeStore } from '@/stores/theme.store'
import { useThemeConfig } from '@/themes/composables/useThemeConfig'
import { useDarkMode } from '@/composables/useDarkMode'
import { colorCategories, baseThemes } from '@/themes/config/theme.config'
import ColorTokenEditor from './ColorTokenEditor.vue'
import PresetManager from './PresetManager.vue'
import ThemePreview from './ThemePreview.vue'
import ThemeExporter from './ThemeExporter.vue'
import { useToast } from 'primevue/usetoast'
import type { BaseTheme } from '@/themes/presets/preset.types'

const themeStore = useThemeStore()
const themeConfig = useThemeConfig()
const darkMode = useDarkMode()
const toast = useToast()

// Local state
const selectedPresetId = ref('')
const baseTheme = ref<BaseTheme>('Material')
const showPresetManager = ref(false)

// Base theme options for dropdown
const baseThemeOptions = baseThemes.map(theme => ({
  label: theme,
  value: theme
}))

// Watch for active preset changes
watch(() => themeStore.activePreset, (preset) => {
  if (preset) {
    selectedPresetId.value = preset.id
    baseTheme.value = preset.baseTheme
  }
}, { immediate: true })

// Helper functions
function getPresetPrimaryColor(preset: any): string {
  const primaryOverride = preset.colorOverrides?.find((c: any) => c.tokenId === 'primary')
  return primaryOverride?.value || '#0B2244'
}

function isTokenEdited(tokenId: string): boolean {
  return themeStore.editingColors.some(c => c.tokenId === tokenId)
}

// Event handlers
function handleVisibilityChange(visible: boolean) {
  // Ignore all automatic visibility changes to prevent unwanted drawer closure
  // Only manual close button should close the drawer
  console.log('🎯 Ignoring automatic visibility change:', visible)
}

async function onPresetChange(event: any) {
  const preset = themeStore.availablePresets.find(p => p.id === event.value)
  if (preset) {
    await themeStore.activatePreset(preset)
    toast.add({
      severity: 'success',
      summary: 'Theme Changed',
      detail: `Switched to ${preset.name}`,
      life: 3000
    })
  }
}

async function onBaseThemeChange() {
  if (themeStore.editingPreset) {
    await themeConfig.switchBaseTheme(baseTheme.value)
    toast.add({
      severity: 'info',
      summary: 'Base Theme Changed',
      detail: `Switched to ${baseTheme.value}`,
      life: 3000
    })
  }
}

async function updateTokenColor(tokenId: string, value: string) {
  console.log('🎯 updateTokenColor called', { tokenId, value })
  await themeConfig.updateTokenColor(tokenId, value)
  console.log('🎯 updateTokenColor completed')
}

async function resetToken(tokenId: string) {
  // Find the token across all categories
  let foundToken = null
  
  for (const categoryTokens of Object.values(themeConfig.tokensByCategory.value)) {
    foundToken = categoryTokens.find(t => t.id === tokenId)
    if (foundToken) break
  }
  
  if (foundToken) {
    await themeConfig.updateTokenColor(tokenId, foundToken.defaultValue)
    toast.add({
      severity: 'info',
      summary: 'Token Reset',
      detail: `${foundToken.label} reset to default`,
      life: 2000
    })
  }
}

function startEditingToken(tokenId: string) {
  // This could open a detailed color editor dialog
  console.log('Start editing token:', tokenId)
}

async function saveCurrentPreset() {
  try {
    if (themeStore.editingPreset && !themeStore.editingPreset.metadata.isBuiltIn) {
      await themeStore.updateCurrentPreset()
      toast.add({
        severity: 'success',
        summary: 'Preset Saved',
        detail: 'Your changes have been saved',
        life: 3000
      })
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Save Failed',
      detail: error instanceof Error ? error.message : 'Unknown error',
      life: 5000
    })
  }
}

async function resetToDefaults() {
  await themeConfig.resetToPresetDefaults()
  toast.add({
    severity: 'info',
    summary: 'Reset Complete',
    detail: 'Theme reset to preset defaults',
    life: 3000
  })
}

async function applyColorHarmony(type: 'monochromatic' | 'complementary' | 'triadic' | 'analogous') {
  const primaryColor = themeStore.getTokenValue('primary')
  const harmony = themeConfig.generateColorHarmony(primaryColor, type)
  
  if (Object.keys(harmony).length > 0) {
    await themeConfig.applyColorHarmony(harmony)
    toast.add({
      severity: 'success',
      summary: 'Color Harmony Applied',
      detail: `Applied ${type} color scheme`,
      life: 3000
    })
  }
}

function onPresetChanged() {
  // Refresh when presets are modified
  selectedPresetId.value = themeStore.activePreset?.id || ''
}
</script>

<style scoped>
.theme-configurator {
  --p-drawer-content-padding: 0;
}

.theme-configurator :deep(.p-drawer-content) {
  overflow-y: auto;
}

.theme-configurator :deep(.p-drawer-header) {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--p-surface-200);
}

.space-y-6 > * + * {
  margin-top: 1.5rem;
}

.space-y-3 > * + * {
  margin-top: 0.75rem;
}

.space-y-2 > * + * {
  margin-top: 0.5rem;
}
</style> 