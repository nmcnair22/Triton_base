<template>
  <div class="preset-list">
    <div
      v-for="preset in presets"
      :key="preset.id"
      class="preset-item"
      :class="{ 'active': preset.id === activePresetId }"
      @click="$emit('select', preset)"
    >
      <div class="preset-color-preview">
        <div 
          v-for="(color, index) in getPresetColors(preset).slice(0, 4)" 
          :key="index"
          class="color-swatch"
          :style="{ backgroundColor: color }"
        />
      </div>
      <div class="preset-content">
        <div class="preset-name">{{ preset.name }}</div>
        <div class="preset-tags">
          <Tag 
            v-for="tag in preset.metadata.tags" 
            :key="tag"
            :value="tag" 
            severity="secondary" 
            size="small" 
          />
        </div>
      </div>
      <div class="preset-actions" @click.stop>
        <Button
          icon="pi pi-ellipsis-v"
          severity="secondary"
          text
          rounded
          size="small"
          @click="showMenu($event, preset)"
        />
      </div>
    </div>
    <div v-if="presets.length === 0" class="empty-state">
      <p>No presets available</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ThemePreset } from '@/themes/presets/preset.types'

const props = defineProps<{
  presets: ThemePreset[]
  activePresetId?: string
}>()

const emit = defineEmits<{
  select: [preset: ThemePreset]
  edit: [preset: ThemePreset]
  duplicate: [preset: ThemePreset]
  delete: [preset: ThemePreset]
}>()

function getPresetColors(preset: ThemePreset): string[] {
  const colors: string[] = []
  
  // Get colors from color overrides
  if (preset.colorOverrides) {
    preset.colorOverrides.forEach(override => {
      if (override.value.startsWith('#')) {
        colors.push(override.value)
      }
    })
  }
  
  // Get colors from tokens if available
  if (preset.tokens?.semantic) {
    Object.values(preset.tokens.semantic).forEach((token: any) => {
      if (token.type === 'color' && typeof token.value === 'string' && token.value.startsWith('#')) {
        colors.push(token.value)
      }
    })
  }
  
  return colors.slice(0, 4)
}

function showMenu(event: Event, preset: ThemePreset) {
  // In a real implementation, show a context menu
  // For now, just emit edit
  emit('edit', preset)
}
</script>

<style scoped>
.preset-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.preset-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid var(--p-surface-200);
  border-radius: var(--p-borderRadius);
  cursor: pointer;
  transition: all 0.2s;
}

.preset-item:hover {
  background-color: var(--p-surface-50);
  border-color: var(--p-primary-200);
}

.preset-item.active {
  background-color: var(--p-primary-50);
  border-color: var(--p-primary-500);
}

.preset-color-preview {
  display: flex;
  gap: 2px;
}

.color-swatch {
  width: 16px;
  height: 16px;
  border-radius: 2px;
}

.preset-content {
  flex: 1;
}

.preset-name {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.preset-tags {
  display: flex;
  gap: 0.25rem;
}

.preset-actions {
  display: flex;
  gap: 0.25rem;
}

.empty-state {
  padding: 2rem;
  text-align: center;
  color: var(--p-text-muted-color);
}

/* Dark mode adjustments */
:deep(.dark) .preset-item {
  border-color: var(--p-surface-700);
}

:deep(.dark) .preset-item:hover {
  background-color: var(--p-surface-800);
  border-color: var(--p-primary-400);
}

:deep(.dark) .preset-item.active {
  background-color: var(--p-primary-900);
  border-color: var(--p-primary-400);
}
</style>