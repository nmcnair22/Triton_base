<template>
  <div class="preset-navigation-list">
    <!-- Active Preset -->
    <div class="active-preset-section">
      <h4 class="section-header">Active Theme</h4>
      <div class="active-preset-card" v-if="activePreset">
        <div class="preset-info">
          <h5 class="preset-name">{{ activePreset.name }}</h5>
          <p class="preset-description">{{ activePreset.description || 'No description' }}</p>
          <div class="preset-meta">
            <Tag 
              v-if="activePreset.metadata.isBuiltIn" 
              value="Built-in" 
              severity="secondary" 
              size="small" 
            />
            <Tag 
              v-if="activePreset.metadata.isDefault" 
              value="Default" 
              severity="success" 
              size="small" 
            />
            <span class="preset-date">
              Modified {{ formatDate(activePreset.metadata.modified) }}
            </span>
          </div>
        </div>
        <div class="preset-actions">
          <Button
            icon="pi pi-pencil"
            severity="secondary"
            text
            rounded
            v-tooltip="'Edit preset'"
            @click="editPreset(activePreset)"
          />
          <Button
            icon="pi pi-copy"
            severity="secondary"
            text
            rounded
            v-tooltip="'Duplicate preset'"
            @click="duplicatePreset(activePreset)"
          />
        </div>
      </div>
    </div>

    <Divider />

    <!-- Preset List -->
    <div class="preset-list-section">
      <div class="section-header-row">
        <h4 class="section-header">All Presets</h4>
        <Button
          label="Manage"
          icon="pi pi-cog"
          severity="secondary"
          text
          size="small"
          @click="openManager"
        />
      </div>

      <!-- Preset Categories -->
      <Tabs v-model:value="activeTab">
        <TabList>
          <Tab value="all">All</Tab>
          <Tab value="builtin">Built-in</Tab>
          <Tab value="custom">Custom</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel value="all">
            <PresetList
              :presets="allPresets"
              :activePresetId="activePreset?.id"
              @select="selectPreset"
              @edit="editPreset"
              @duplicate="duplicatePreset"
              @delete="deletePreset"
            />
          </TabPanel>
          
          <TabPanel value="builtin">
            <PresetList
              :presets="builtInPresets"
              :activePresetId="activePreset?.id"
              @select="selectPreset"
              @edit="editPreset"
              @duplicate="duplicatePreset"
            />
          </TabPanel>
          
          <TabPanel value="custom">
            <PresetList
              :presets="userPresets"
              :activePresetId="activePreset?.id"
              @select="selectPreset"
              @edit="editPreset"
              @duplicate="duplicatePreset"
              @delete="deletePreset"
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <Button
        label="Create New"
        icon="pi pi-plus"
        severity="primary"
        size="small"
        class="w-full"
        @click="createNewPreset"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useThemePresetStore } from '@/stores/theme'
import type { ThemePreset } from '@/themes/presets/preset.types'
import PresetList from './PresetList.vue'

const emit = defineEmits<{
  select: [preset: ThemePreset]
  manage: []
}>()

// Store
const presetStore = useThemePresetStore()

// State
const activeTab = ref('all')

// Computed
const activePreset = computed(() => presetStore.activePreset)
const allPresets = computed(() => presetStore.availablePresets)
const builtInPresets = computed(() => presetStore.builtInPresets)
const userPresets = computed(() => presetStore.userPresets)

// Methods
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      return diffMinutes === 0 ? 'just now' : `${diffMinutes}m ago`
    }
    return `${diffHours}h ago`
  } else if (diffDays === 1) {
    return 'yesterday'
  } else if (diffDays < 7) {
    return `${diffDays}d ago`
  } else {
    return date.toLocaleDateString()
  }
}

async function selectPreset(preset: ThemePreset) {
  await presetStore.activatePreset(preset)
  emit('select', preset)
}

function editPreset(preset: ThemePreset) {
  // Open edit dialog or navigate to edit mode
  console.log('Edit preset:', preset)
}

async function duplicatePreset(preset: ThemePreset) {
  const newName = prompt(`Duplicate "${preset.name}" as:`, `${preset.name} Copy`)
  if (newName) {
    await presetStore.duplicatePreset(preset.id, newName)
  }
}

async function deletePreset(preset: ThemePreset) {
  if (confirm(`Delete preset "${preset.name}"? This action cannot be undone.`)) {
    await presetStore.deletePreset(preset.id)
  }
}

function createNewPreset() {
  const name = prompt('Enter preset name:')
  if (name) {
    presetStore.createPreset(name)
  }
}

function openManager() {
  emit('manage')
}
</script>

<style scoped>
.preset-navigation-list {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.active-preset-section {
  padding: 0.75rem;
}

.section-header {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--p-text-color);
}

.section-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.active-preset-card {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background-color: var(--p-surface-50);
  border: 1px solid var(--p-surface-200);
  border-radius: var(--p-borderRadius);
}

.preset-info {
  flex: 1;
}

.preset-name {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.preset-description {
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
  margin-bottom: 0.5rem;
}

.preset-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: var(--p-text-muted-color);
}

.preset-actions {
  display: flex;
  gap: 0.25rem;
}

.preset-list-section {
  flex: 1;
  overflow: hidden;
  padding: 0 0.75rem;
}

:deep(.p-tabview) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.p-tabview-panels) {
  flex: 1;
  overflow-y: auto;
}

.quick-actions {
  padding: 0.75rem;
  border-top: 1px solid var(--p-surface-200);
}

/* Dark mode adjustments */
.dark .active-preset-card {
  background-color: var(--p-surface-800);
  border-color: var(--p-surface-700);
}

.dark .quick-actions {
  border-top-color: var(--p-surface-700);
}
</style>