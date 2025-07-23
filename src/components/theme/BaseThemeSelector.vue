<template>
  <div class="base-theme-selector">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold">Select Base Theme</h3>
      <Button
        icon="pi pi-question-circle"
        text
        rounded
        size="small"
        @click="showHelp = !showHelp"
        v-tooltip="'Learn about base themes'"
      />
    </div>

    <!-- Help Text -->
    <Message v-if="showHelp" severity="info" class="mb-4" :closable="false">
      <p class="text-sm">
        Choose a PrimeVue theme as your starting point. Each theme has different design tokens,
        color palettes, and component styling that will be discovered and made available for customization.
      </p>
    </Message>

    <!-- Theme Selection Grid -->
    <div class="grid grid-cols-2 gap-4 mb-6">
      <div
        v-for="theme in availableThemes"
        :key="theme.name"
        :class="[
          'theme-option',
          'border-2 rounded-lg p-4 cursor-pointer transition-all',
          'hover:shadow-md hover:scale-[1.02]',
          selectedTheme === theme.name
            ? 'border-primary-500 bg-primary-50 shadow-lg'
            : 'border-surface-300 hover:border-primary-300'
        ]"
        @click="selectedTheme = theme.name"
      >
        <!-- Theme Preview -->
        <div class="flex items-center space-x-3 mb-3">
          <div class="flex space-x-1">
            <div
              v-for="color in theme.preview"
              :key="color"
              :style="{ backgroundColor: color }"
              class="w-4 h-4 rounded-full"
            />
          </div>
          <div
            :class="[
              'w-5 h-5 rounded-full border-2 flex items-center justify-center',
              selectedTheme === theme.name 
                ? 'border-primary-500 bg-primary-500' 
                : 'border-surface-400'
            ]"
          >
            <i
              v-if="selectedTheme === theme.name"
              class="pi pi-check text-xs text-white"
            />
          </div>
        </div>

        <!-- Theme Info -->
        <div>
          <h4 class="font-semibold text-base mb-1">{{ theme.name }}</h4>
          <p class="text-sm text-surface-600 mb-2">{{ theme.description }}</p>
          <div class="flex flex-wrap gap-1">
            <Tag
              v-for="tag in theme.tags"
              :key="tag"
              :value="tag"
              size="small"
              severity="secondary"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Discovery Status -->
    <div v-if="isDiscovering" class="mb-4">
      <div class="flex items-center space-x-2 text-primary-600">
        <ProgressSpinner size="20px" strokeWidth="4" />
        <span class="text-sm font-medium">
          Discovering tokens from {{ selectedTheme }} theme...
        </span>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-between">
      <Button
        label="Cancel"
        outlined
        @click="$emit('cancel')"
      />
      <Button
        label="Discover Tokens"
        :disabled="!selectedTheme || isDiscovering"
        @click="startDiscovery"
      >
        <template #icon>
          <i class="pi pi-search mr-2" />
        </template>
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TokenDiscovery } from '@/themes/core'
import type { BaseTheme } from '@/themes/presets/preset.types'

interface ThemeOption {
  name: BaseTheme
  description: string
  preview: string[]
  tags: string[]
}

interface Emits {
  (e: 'cancel'): void
  (e: 'theme-selected', theme: BaseTheme, tokens: Map<string, any>): void
}

const emit = defineEmits<Emits>()

// State
const selectedTheme = ref<BaseTheme>('Material')
const isDiscovering = ref(false)
const showHelp = ref(false)

// Available themes with preview colors and descriptions
const availableThemes: ThemeOption[] = [
  {
    name: 'Material',
    description: 'Google Material Design with bold colors and elevation',
    preview: ['#1976d2', '#388e3c', '#f57c00', '#d32f2f'],
    tags: ['Material', 'Bold', 'Google']
  },
  {
    name: 'Aura',
    description: 'Modern clean design with subtle shadows',
    preview: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
    tags: ['Modern', 'Clean', 'PrimeTek']
  },
  {
    name: 'Lara',
    description: 'Elegant design with refined aesthetics',
    preview: ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981'],
    tags: ['Elegant', 'Refined', 'Professional']
  },
  {
    name: 'Nora',
    description: 'Minimalist approach with subtle styling',
    preview: ['#64748b', '#0f172a', '#475569', '#94a3b8'],
    tags: ['Minimal', 'Subtle', 'Clean']
  }
]

// Start token discovery
async function startDiscovery() {
  if (!selectedTheme.value) return

  isDiscovering.value = true

  try {
    console.log(`🔍 Starting discovery for ${selectedTheme.value} theme`)
    
    // Clear any existing discovery cache to ensure fresh discovery
    TokenDiscovery.clearCache()
    
    // Discover tokens from selected theme
    const discoveredTokens = await TokenDiscovery.discoverAllTokens(selectedTheme.value)
    
    console.log(`✅ Discovery complete: ${discoveredTokens.size} token groups found`)
    
    // Emit the result
    emit('theme-selected', selectedTheme.value, discoveredTokens)
    
  } catch (error) {
    console.error('Token discovery failed:', error)
    // You might want to show a toast or error message here
  } finally {
    isDiscovering.value = false
  }
}
</script>

<style scoped>
.theme-option {
  transition: all 0.2s ease-in-out;
}

.theme-option:hover {
  transform: translateY(-1px);
}
</style> 