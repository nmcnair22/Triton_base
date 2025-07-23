<template>
  <div class="button-showcase">
    <div class="showcase-section">
      <h5>Button Variants</h5>
      <div class="showcase-grid">
        <div v-for="severity in severities" :key="severity" class="showcase-item">
          <label>{{ capitalize(severity) }}</label>
          <Button
            :label="capitalize(severity)"
            :severity="severity"
            :size="size"
            :class="stateClass"
            :disabled="state === 'disabled'"
            @mouseenter="onHover('button.background', severity)"
            @mouseleave="onLeave"
            @click="onClick('button.background', severity)"
          />
        </div>
      </div>
    </div>

    <div class="showcase-section">
      <h5>Button Styles</h5>
      <div class="showcase-grid">
        <div class="showcase-item">
          <label>Default</label>
          <Button
            label="Default"
            :size="size"
            :class="stateClass"
            :disabled="state === 'disabled'"
            @mouseenter="onHover('button.background')"
            @mouseleave="onLeave"
          />
        </div>
        <div class="showcase-item">
          <label>Outlined</label>
          <Button
            label="Outlined"
            outlined
            :size="size"
            :class="stateClass"
            :disabled="state === 'disabled'"
            @mouseenter="onHover('button.border')"
            @mouseleave="onLeave"
          />
        </div>
        <div class="showcase-item">
          <label>Text</label>
          <Button
            label="Text"
            text
            :size="size"
            :class="stateClass"
            :disabled="state === 'disabled'"
            @mouseenter="onHover('button.color')"
            @mouseleave="onLeave"
          />
        </div>
        <div class="showcase-item">
          <label>Raised</label>
          <Button
            label="Raised"
            raised
            :size="size"
            :class="stateClass"
            :disabled="state === 'disabled'"
            @mouseenter="onHover('button.shadow')"
            @mouseleave="onLeave"
          />
        </div>
        <div class="showcase-item">
          <label>Rounded</label>
          <Button
            label="Rounded"
            rounded
            :size="size"
            :class="stateClass"
            :disabled="state === 'disabled'"
            @mouseenter="onHover('button.borderRadius')"
            @mouseleave="onLeave"
          />
        </div>
      </div>
    </div>

    <div class="showcase-section">
      <h5>Icon Buttons</h5>
      <div class="showcase-grid">
        <div class="showcase-item">
          <label>Icon Only</label>
          <Button
            icon="pi pi-check"
            :size="size"
            :class="stateClass"
            :disabled="state === 'disabled'"
            @mouseenter="onHover('button.padding')"
            @mouseleave="onLeave"
          />
        </div>
        <div class="showcase-item">
          <label>Icon Left</label>
          <Button
            label="Save"
            icon="pi pi-save"
            :size="size"
            :class="stateClass"
            :disabled="state === 'disabled'"
          />
        </div>
        <div class="showcase-item">
          <label>Icon Right</label>
          <Button
            label="Next"
            icon="pi pi-arrow-right"
            iconPos="right"
            :size="size"
            :class="stateClass"
            :disabled="state === 'disabled'"
          />
        </div>
        <div class="showcase-item">
          <label>Rounded Icon</label>
          <Button
            icon="pi pi-bookmark"
            rounded
            text
            :size="size"
            :class="stateClass"
            :disabled="state === 'disabled'"
          />
        </div>
      </div>
    </div>

    <div class="showcase-section">
      <h5>Loading States</h5>
      <div class="showcase-grid">
        <div class="showcase-item">
          <label>Loading</label>
          <Button
            label="Loading"
            :loading="true"
            :size="size"
            :disabled="state === 'disabled'"
          />
        </div>
        <div class="showcase-item">
          <label>Loading Icon</label>
          <Button
            icon="pi pi-check"
            :loading="true"
            :size="size"
            :disabled="state === 'disabled'"
          />
        </div>
      </div>
    </div>

    <div class="showcase-section">
      <h5>Button Groups</h5>
      <div class="showcase-item">
        <label>Button Group</label>
        <div class="p-buttonset">
          <Button label="Left" :size="size" :class="stateClass" />
          <Button label="Center" :size="size" :class="stateClass" />
          <Button label="Right" :size="size" :class="stateClass" />
        </div>
      </div>
    </div>

    <!-- Token Mapping Info -->
    <div class="token-info-panel" v-if="showTokenInfo">
      <h6>Token Mappings</h6>
      <ul class="token-list">
        <li><code>button.background</code> - Background color</li>
        <li><code>button.color</code> - Text color</li>
        <li><code>button.border</code> - Border color</li>
        <li><code>button.borderRadius</code> - Corner radius</li>
        <li><code>button.padding.x</code> - Horizontal padding</li>
        <li><code>button.padding.y</code> - Vertical padding</li>
        <li><code>button.fontSize</code> - Text size</li>
        <li><code>button.fontWeight</code> - Text weight</li>
        <li><code>button.shadow</code> - Box shadow</li>
        <li><code>button.hover.*</code> - Hover state tokens</li>
        <li><code>button.active.*</code> - Active state tokens</li>
        <li><code>button.disabled.*</code> - Disabled state tokens</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DesignToken } from '@/themes/presets/preset.types'

const props = defineProps<{
  state?: string
  size?: string
  tokens?: DesignToken[]
  showTokenInfo?: boolean
}>()

const emit = defineEmits<{
  'token-hover': [token: DesignToken | null]
  'token-click': [token: DesignToken]
}>()

// Data
const severities = ['primary', 'secondary', 'success', 'info', 'warning', 'danger', 'contrast']

// Computed
const stateClass = computed(() => {
  const stateMap: Record<string, string> = {
    hover: 'p-button-hover',
    focus: 'p-button-focus',
    active: 'p-button-active'
  }
  return stateMap[props.state || ''] || ''
})

// Methods
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function onHover(tokenPath: string, variant?: string) {
  if (!props.tokens) return
  
  // Find the token that matches this path
  const token = props.tokens.find(t => {
    if (variant && variant !== 'primary') {
      return t.path === tokenPath.replace('button', `button.${variant}`)
    }
    return t.path === tokenPath
  })
  
  if (token) {
    emit('token-hover', token)
  }
}

function onLeave() {
  emit('token-hover', null)
}

function onClick(tokenPath: string, variant?: string) {
  if (!props.tokens) return
  
  const token = props.tokens.find(t => {
    if (variant && variant !== 'primary') {
      return t.path === tokenPath.replace('button', `button.${variant}`)
    }
    return t.path === tokenPath
  })
  
  if (token) {
    emit('token-click', token)
  }
}
</script>

<style scoped>
.button-showcase {
  padding: 1rem;
}

.showcase-section {
  margin-bottom: 2rem;
}

.showcase-section h5 {
  margin-bottom: 1rem;
  color: var(--p-text-color);
}

.showcase-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
}

.showcase-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.showcase-item label {
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
}

.p-buttonset {
  display: flex;
}

.p-buttonset .p-button {
  border-radius: 0;
}

.p-buttonset .p-button:first-child {
  border-top-left-radius: var(--p-borderRadius);
  border-bottom-left-radius: var(--p-borderRadius);
}

.p-buttonset .p-button:last-child {
  border-top-right-radius: var(--p-borderRadius);
  border-bottom-right-radius: var(--p-borderRadius);
}

.p-buttonset .p-button:not(:first-child) {
  margin-left: -1px;
}

/* Token Info Panel */
.token-info-panel {
  margin-top: 3rem;
  padding: 1rem;
  background-color: var(--p-surface-50);
  border-radius: var(--p-borderRadius);
}

.token-info-panel h6 {
  margin-top: 0;
  margin-bottom: 0.75rem;
}

.token-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.token-list li {
  padding: 0.25rem 0;
  font-size: 0.875rem;
}

.token-list code {
  padding: 0.125rem 0.375rem;
  background-color: var(--p-surface-100);
  border-radius: 3px;
  font-size: 0.75rem;
  margin-right: 0.5rem;
}

/* State classes for preview */
:deep(.p-button-hover),
:deep(.p-button-hover:enabled) {
  background-color: var(--p-button-hover-background) !important;
  border-color: var(--p-button-hover-border-color) !important;
  color: var(--p-button-hover-color) !important;
}

:deep(.p-button-focus),
:deep(.p-button-focus:enabled) {
  box-shadow: var(--p-button-focus-shadow) !important;
  outline: 2px solid var(--p-focus-ring-color) !important;
  outline-offset: 2px !important;
}

:deep(.p-button-active),
:deep(.p-button-active:enabled) {
  background-color: var(--p-button-active-background) !important;
  border-color: var(--p-button-active-border-color) !important;
  color: var(--p-button-active-color) !important;
}

/* Dark mode adjustments */
.dark .token-info-panel {
  background-color: var(--p-surface-800);
}

.dark .token-list code {
  background-color: var(--p-surface-700);
}
</style>