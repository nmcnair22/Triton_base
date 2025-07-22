<template>
  <div class="layout-preset-selector">
    <h3 class="text-lg font-semibold mb-4">Layout Presets</h3>
    
    <!-- Preset Grid -->
    <div class="grid grid-cols-2 gap-3 mb-6">
      <div
        v-for="preset in allPresets"
        :key="preset.id"
        class="preset-card"
        :class="{ 'ring-2 ring-primary-500': isActivePreset(preset) }"
        @click="selectPreset(preset)"
      >
        <div class="preset-header">
          <i :class="preset.icon" class="text-xl mb-2"></i>
          <h4 class="font-medium text-sm">{{ preset.name }}</h4>
        </div>
        <p class="text-xs text-surface-500 dark:text-surface-400 mb-2">
          {{ preset.description }}
        </p>
        <div class="flex flex-wrap gap-1">
          <Tag 
            v-for="tag in preset.tags" 
            :key="tag"
            :value="tag"
            severity="secondary"
            class="text-xs"
          />
        </div>
        
        <!-- Delete button for custom presets -->
        <Button
          v-if="preset.id.startsWith('custom-')"
          icon="pi pi-trash"
          severity="danger"
          text
          size="small"
          class="absolute top-2 right-2"
          @click.stop="confirmDelete(preset)"
        />
      </div>
    </div>

    <!-- Save Current as Preset -->
    <Divider />
    
    <div class="save-preset-section">
      <h4 class="font-medium mb-3">Save Current Configuration</h4>
      <div class="space-y-3">
        <InputText
          v-model="newPresetName"
          placeholder="Preset name"
          class="w-full"
        />
        <Textarea
          v-model="newPresetDescription"
          placeholder="Description (optional)"
          rows="2"
          class="w-full"
        />
        <Button
          label="Save as Preset"
          icon="pi pi-save"
          :disabled="!newPresetName"
          class="w-full"
          @click="saveCurrentAsPreset"
        />
      </div>
    </div>

    <!-- Confirmation Dialog -->
    <Dialog
      v-model:visible="deleteDialogVisible"
      modal
      header="Delete Preset"
      :style="{ width: '400px' }"
    >
      <p>Are you sure you want to delete "{{ presetToDelete?.name }}"?</p>
      <template #footer>
        <Button
          label="Cancel"
          severity="secondary"
          @click="deleteDialogVisible = false"
        />
        <Button
          label="Delete"
          severity="danger"
          @click="deletePreset"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLayoutPresets, type LayoutPreset } from '@/composables/layout/useLayoutPresets'
import { useLayoutEnhanced } from '@/composables/layout/useLayoutEnhanced'

const { 
  getAllPresets, 
  applyPreset, 
  saveAsPreset, 
  deleteCustomPreset 
} = useLayoutPresets()

const { layoutConfig } = useLayoutEnhanced()

// State
const allPresets = ref(getAllPresets())
const newPresetName = ref('')
const newPresetDescription = ref('')
const deleteDialogVisible = ref(false)
const presetToDelete = ref<LayoutPreset | null>(null)

// Check if preset matches current config
function isActivePreset(preset: LayoutPreset) {
  return preset.config.menuMode === layoutConfig.value.menuMode &&
         preset.config.menuTheme === layoutConfig.value.menuTheme &&
         preset.config.primaryColor === layoutConfig.value.primaryColor
}

function selectPreset(preset: LayoutPreset) {
  applyPreset(preset.id)
}

function saveCurrentAsPreset() {
  if (!newPresetName.value) return
  
  saveAsPreset(newPresetName.value, newPresetDescription.value)
  
  // Refresh list and reset form
  allPresets.value = getAllPresets()
  newPresetName.value = ''
  newPresetDescription.value = ''
}

function confirmDelete(preset: LayoutPreset) {
  presetToDelete.value = preset
  deleteDialogVisible.value = true
}

function deletePreset() {
  if (presetToDelete.value) {
    deleteCustomPreset(presetToDelete.value.id)
    allPresets.value = getAllPresets()
  }
  deleteDialogVisible.value = false
  presetToDelete.value = null
}
</script>

<style scoped>
.preset-card {
  position: relative;
  padding: 1rem;
  background-color: var(--surface-50);
  border-radius: 0.5rem;
  border: 1px solid var(--surface-200);
  cursor: pointer;
  transition: all 0.2s;
}

.dark .preset-card {
  background-color: var(--surface-800);
  border-color: var(--surface-700);
}

.preset-card:hover {
  border-color: var(--primary-500);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.dark .preset-card:hover {
  border-color: var(--primary-400);
}

.preset-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 0.5rem;
}

.save-preset-section {
  margin-top: 1rem;
}

.space-y-3 > * + * {
  margin-top: 0.75rem;
}
</style> 