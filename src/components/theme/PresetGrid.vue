<template>
  <div v-if="showEmptyState && presets.length === 0" class="text-center py-12">
    <div class="mb-4">
      <i class="pi pi-palette text-4xl text-muted" />
    </div>
    <h3 class="text-lg font-medium text-surface-700 dark:text-surface-300 mb-2">
      No Custom Presets Yet
    </h3>
    <p class="text-sm text-muted mb-4">
      Create your first custom theme preset to get started
    </p>
    <Button
      label="Create Preset"
      icon="pi pi-plus"
      size="small"
      @click="$emit('create')"
    />
  </div>

  <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <div
      v-for="preset in presets"
      :key="preset.id"
      class="border border-surface-200 dark:border-surface-700 rounded-lg p-4 hover:border-primary/50 transition-all duration-200"
      :class="{
        'ring-2 ring-primary border-primary bg-primary/5': preset.id === activePresetId,
        'hover:shadow-md': preset.id !== activePresetId
      }"
    >
      <!-- Header -->
      <div class="flex items-start justify-between mb-3">
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 rounded border border-surface-300 dark:border-surface-600 flex-shrink-0"
            :style="{ backgroundColor: getPresetPrimaryColor(preset) }"
          />
          
          <div class="min-w-0 flex-1">
            <h4 class="font-medium text-surface-900 dark:text-surface-100 truncate">
              {{ preset.name }}
            </h4>
            <div class="flex items-center gap-2 text-xs text-muted">
              <span>{{ preset.baseTheme }}</span>
              <span v-if="preset.metadata.isBuiltIn" class="flex items-center gap-1">
                <i class="pi pi-lock" />
                Built-in
              </span>
              <span v-if="preset.metadata.isDefault" class="flex items-center gap-1">
                <i class="pi pi-star-fill text-warning" />
                Default
              </span>
            </div>
          </div>
        </div>
        
        <!-- Actions Menu -->
        <Menu
          ref="menu"
          :model="getMenuItems(preset)"
          :popup="true"
        />
        
        <Button
          icon="pi pi-ellipsis-v"
          text
          size="small"
          @click="toggleMenu($event, preset)"
          class="p-1"
        />
      </div>

      <!-- Description -->
      <p
        v-if="preset.description"
        class="text-sm text-muted mb-3 line-clamp-2"
      >
        {{ preset.description }}
      </p>

      <!-- Tags -->
      <div v-if="preset.metadata.tags?.length" class="flex flex-wrap gap-1 mb-3">
        <Tag
          v-for="tag in preset.metadata.tags.slice(0, 3)"
          :key="tag"
          :value="tag"
          severity="secondary"
          class="text-xs px-2 py-1"
        />
        <span
          v-if="preset.metadata.tags.length > 3"
          class="text-xs text-muted"
        >
          +{{ preset.metadata.tags.length - 3 }} more
        </span>
      </div>

      <!-- Color Preview -->
      <div class="flex gap-1 mb-4">
        <div
          v-for="color in getPresetColors(preset)"
          :key="color.name"
          class="w-6 h-6 rounded border border-surface-300 dark:border-surface-600"
          :style="{ backgroundColor: color.value }"
          :title="color.name"
        />
      </div>

      <!-- Actions -->
      <div class="flex justify-between">
        <div class="flex gap-2">
          <Button
            v-if="preset.id !== activePresetId"
            label="Activate"
            size="small"
            @click="$emit('activate', preset)"
          />
          
          <Tag
            v-else
            value="Active"
            severity="success"
            class="px-3 py-1"
          />
        </div>

        <div class="flex gap-1">
          <Button
            icon="pi pi-copy"
            text
            size="small"
            @click="$emit('duplicate', preset)"
            v-tooltip="'Duplicate'"
          />
          
          <Button
            v-if="!preset.metadata.isBuiltIn"
            icon="pi pi-pencil"
            text
            size="small"
            @click="$emit('edit', preset)"
            v-tooltip="'Edit'"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ThemePreset } from '@/themes/presets/preset.types'

interface Props {
  presets: ThemePreset[]
  activePresetId?: string
  showEmptyState?: boolean
}

interface Emits {
  activate: [preset: ThemePreset]
  edit: [preset: ThemePreset]
  duplicate: [preset: ThemePreset]
  delete: [preset: ThemePreset]
  create: []
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const menu = ref()

function getPresetPrimaryColor(preset: ThemePreset): string {
  const primaryOverride = preset.colorOverrides?.find(c => c.tokenId === 'primary')
  return primaryOverride?.value || '#0B2244'
}

function getPresetColors(preset: ThemePreset): Array<{ name: string; value: string }> {
  const colorTokens = ['primary', 'secondary', 'success', 'warning', 'danger']
  
  return colorTokens.map(tokenId => {
    const override = preset.colorOverrides?.find(c => c.tokenId === tokenId)
    return {
      name: tokenId,
      value: override?.value || getDefaultColor(tokenId)
    }
  })
}

function getDefaultColor(tokenId: string): string {
  const defaults: Record<string, string> = {
    primary: '#0B2244',
    secondary: '#297FB7',
    success: '#10B981',
    warning: '#FFB400',
    danger: '#F60D03'
  }
  
  return defaults[tokenId] || '#6B7280'
}

function getMenuItems(preset: ThemePreset) {
  const items: any[] = [
    {
      label: 'Duplicate',
      icon: 'pi pi-copy',
      command: () => emit('duplicate', preset)
    }
  ]

  if (!preset.metadata.isBuiltIn) {
    items.unshift({
      label: 'Edit',
      icon: 'pi pi-pencil',
      command: () => emit('edit', preset)
    })
    
    items.push({
      separator: true
    } as any)
    
    items.push({
      label: 'Delete',
      icon: 'pi pi-trash',
      command: () => emit('delete', preset),
      class: 'text-danger'
    } as any)
  }

  return items
}

function toggleMenu(event: Event, preset: ThemePreset) {
  menu.value?.toggle(event)
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 