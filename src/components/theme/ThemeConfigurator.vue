<template>
  <Drawer
    :visible="uiStore.isConfigOpen"
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
            <p class="text-sm text-muted m-0" v-if="presetStore.activePreset">
              {{ presetStore.activePreset.name }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- Save indicator -->
          <Badge
            v-if="editorStore.canSave"
            value="●"
            severity="warning"
            v-tooltip="'Unsaved changes'"
          />

          <!-- Quick actions -->
          <Button
            v-if="editorStore.canSave"
            label="Save"
            size="small"
            severity="success"
            @click="saveCurrentPreset"
            v-tooltip="'Save current changes'"
            class="text-xs"
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
            @click="uiStore.toggleConfig"
            v-tooltip="'Close theme configurator'"
          />
        </div>
      </div>
    </template>

    <div class="space-y-4 p-2">
      <!-- Quick Theme Selection -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <h4 class="text-xs font-medium m-0">Active Theme</h4>
          <Button label="Manage" size="small" text @click="showPresetManager = true" />
        </div>

        <Select
          v-model="selectedPresetId"
          :options="presetStore.availablePresets"
          optionLabel="name"
          optionValue="id"
          placeholder="Select a theme"
          class="w-full text-sm"
          size="small"
          @change="onPresetChange"
          :loading="uiStore.isLoading"
        >
          <template #option="{ option }">
            <div class="flex items-center justify-between w-full">
              <div class="flex items-center gap-2">
                <div
                  class="w-4 h-4 rounded border border-surface-300"
                  :style="{ backgroundColor: getPresetPrimaryColor(option) }"
                />
                <div>
                  <div class="text-sm font-medium">{{ option.name }}</div>
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
                  v-if="presetStore.activePreset?.id === option.id"
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
          <label class="block text-xs font-medium mb-1">Base Theme</label>
          <Select
            v-model="baseTheme"
            :options="baseThemeOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full text-sm"
            size="small"
            @change="onBaseThemeChange"
          />
        </div>

        <div>
          <label class="block text-xs font-medium mb-1">Mode</label>
          <div class="flex items-center justify-between p-2 border border-surface-300 rounded">
            <span class="text-xs">{{ darkMode.isDark.value ? 'Dark' : 'Light' }}</span>
            <ToggleSwitch
              :modelValue="darkMode.isDark.value"
              @update:modelValue="darkMode.toggle"
              :disabled="darkMode.isTransitioning.value"
              size="small"
            />
          </div>
        </div>
      </div>

      <!-- Color Token Editor Tabs -->
      <div>
        <h4 class="text-xs font-medium mb-2">Color Tokens</h4>

        <Tabs value="brand">
          <TabList>
            <Tab v-for="category in colorCategories" :key="category.id" :value="category.id">
              {{ category.label }}
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel v-for="category in colorCategories" :key="category.id" :value="category.id">
              <div class="space-y-2">
                <ColorTokenEditor
                  v-for="token in themeConfig.tokensByCategory.value[category.id] || []"
                  :key="token.id"
                  :token="token"
                  :value="editorStore.getTokenValue(token.id)"
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
        <h4 class="text-xs font-medium mb-2">Color Tools</h4>

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
                <span class="text-xs">Auto-save changes</span>
                <ToggleSwitch v-model="configStore.config.autoSave" size="small" />
              </div>

              <div class="flex items-center justify-between">
                <span class="text-xs">Sync across tabs</span>
                <ToggleSwitch v-model="configStore.config.syncAcrossTabs" size="small" />
              </div>

              <div class="flex items-center justify-between">
                <span class="text-xs">Smooth transitions</span>
                <ToggleSwitch v-model="configStore.config.smoothTransitions" size="small" />
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
            <div class="space-y-1 text-xs">
              <div class="flex justify-between">
                <span>User Presets:</span>
                <span
                  >{{ presetStore.userPresets.length }} /
                  {{ configStore.config.maxSavedPresets || 20 }}</span
                >
              </div>
              <div class="flex justify-between">
                <span>Built-in Presets:</span>
                <span>{{ presetStore.builtInPresets.length }}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionPanel>
      </Accordion>

      <!-- Live Preview -->
      <ThemePreview />
    </div>

    <!-- Preset Manager Dialog -->
    <PresetManager v-model:visible="showPresetManager" @preset-changed="onPresetChanged" />
  </Drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  useThemeConfigStore,
  useThemeUIStore,
  useThemePresetStore,
  useThemeEditorStore,
} from '@/stores/theme'
import { useThemeConfig } from '@/themes/composables/useThemeConfig'
import { useDarkMode } from '@/composables/useDarkMode'
import { colorCategories, baseThemes } from '@/themes/config/theme.config'
import ColorTokenEditor from './ColorTokenEditor.vue'
import PresetManager from './PresetManager.vue'
import ThemePreview from './ThemePreview.vue'
import ThemeExporter from './ThemeExporter.vue'
import { useToast } from 'primevue/usetoast'
import type { BaseTheme } from '@/themes/presets/preset.types'

const configStore = useThemeConfigStore()
const uiStore = useThemeUIStore()
const presetStore = useThemePresetStore()
const editorStore = useThemeEditorStore()
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
  value: theme,
}))

// Watch for active preset changes
watch(
  () => presetStore.activePreset,
  preset => {
    if (preset) {
      selectedPresetId.value = preset.id
      baseTheme.value = preset.baseTheme
    }
  },
  { immediate: true }
)

// Helper functions
function getPresetPrimaryColor(preset: any): string {
  const primaryOverride = preset.colorOverrides?.find((c: any) => c.tokenId === 'primary')
  return primaryOverride?.value || '#0B2244'
}

function isTokenEdited(tokenId: string): boolean {
  return editorStore.editingColors.some((c: any) => c.tokenId === tokenId)
}

// Event handlers
function handleVisibilityChange(visible: boolean) {
  // Ignore all automatic visibility changes to prevent unwanted drawer closure
  // Only manual close button should close the drawer
  console.log('🎯 Ignoring automatic visibility change:', visible)
}

async function onPresetChange(event: any) {
  const preset = presetStore.availablePresets.find((p: any) => p.id === event.value)
  if (preset) {
    await presetStore.activatePreset(preset)
    toast.add({
      severity: 'success',
      summary: 'Theme Changed',
      detail: `Switched to ${preset.name}`,
      life: 3000,
    })
  }
}

async function onBaseThemeChange() {
  if (editorStore.editingPreset) {
    await themeConfig.switchBaseTheme(baseTheme.value)
    toast.add({
      severity: 'info',
      summary: 'Base Theme Changed',
      detail: `Switched to ${baseTheme.value}`,
      life: 3000,
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
      life: 2000,
    })
  }
}

function startEditingToken(tokenId: string) {
  // This could open a detailed color editor dialog
  console.log('Start editing token:', tokenId)
}

async function saveCurrentPreset() {
  try {
    if (editorStore.editingPreset && !editorStore.editingPreset.metadata.isBuiltIn) {
      await editorStore.saveChanges()
      toast.add({
        severity: 'success',
        summary: 'Preset Saved',
        detail: 'Your changes have been saved',
        life: 3000,
      })
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Save Failed',
      detail: error instanceof Error ? error.message : 'Unknown error',
      life: 5000,
    })
  }
}

async function resetToDefaults() {
  await themeConfig.resetToPresetDefaults()
  toast.add({
    severity: 'info',
    summary: 'Reset Complete',
    detail: 'Theme reset to preset defaults',
    life: 3000,
  })
}

async function applyColorHarmony(
  type: 'monochromatic' | 'complementary' | 'triadic' | 'analogous'
) {
  const primaryColor = editorStore.getTokenValue('primary')
  const harmony = themeConfig.generateColorHarmony(primaryColor, type)

  if (Object.keys(harmony).length > 0) {
    await themeConfig.applyColorHarmony(harmony)
    toast.add({
      severity: 'success',
      summary: 'Color Harmony Applied',
      detail: `Applied ${type} color scheme`,
      life: 3000,
    })
  }
}

function onPresetChanged() {
  // Refresh when presets are modified
  selectedPresetId.value = presetStore.activePreset?.id || ''
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
