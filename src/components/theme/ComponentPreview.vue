<template>
  <div class="component-preview">
    <!-- Preview Header -->
    <div class="preview-header">
      <div class="preview-title">
        <h4>{{ componentName }} Preview</h4>
        <Tag :value="`${affectedTokens.length} tokens`" severity="info" size="small" />
      </div>
      
      <div class="preview-controls">
        <!-- State Simulator -->
        <SelectButton
          v-model="selectedState"
          :options="stateOptions"
          optionLabel="label"
          optionValue="value"
          size="small"
        />
        
        <!-- Dark Mode Toggle -->
        <ToggleSwitch
          v-model="darkMode"
          inputId="preview-dark-mode"
          class="ml-3"
        />
        <label for="preview-dark-mode" class="ml-2 text-sm">Dark</label>
        
        <!-- Size Options -->
        <Select
          v-if="sizeOptions.length > 0"
          v-model="selectedSize"
          :options="sizeOptions"
          placeholder="Size"
          class="ml-3"
          size="small"
        />
        
        <!-- Refresh Button -->
        <Button
          icon="pi pi-refresh"
          severity="secondary"
          text
          rounded
          size="small"
          v-tooltip="'Reset preview'"
          @click="resetPreview"
          class="ml-2"
        />
      </div>
    </div>

    <!-- Preview Container -->
    <div 
      class="preview-container"
      :class="{ 'dark': darkMode }"
      @mousemove="handleMouseMove"
      @mouseleave="handleMouseLeave"
    >
      <!-- Component Showcase -->
      <component
        :is="showcaseComponent"
        v-if="showcaseComponent"
        :state="selectedState"
        :size="selectedSize"
        :tokens="componentTokens"
        @token-hover="onTokenHover"
        @token-click="onTokenClick"
      />
      
      <!-- Fallback for components without showcase -->
      <div v-else class="generic-preview">
        <component
          :is="componentTag"
          v-bind="componentProps"
          :class="[componentClass, stateClass]"
        >
          {{ componentContent }}
        </component>
      </div>

      <!-- Token Info Overlay -->
      <div
        v-if="hoveredToken && showTokenOverlay"
        class="token-overlay"
        :style="overlayStyle"
      >
        <div class="token-info">
          <div class="token-name">{{ hoveredToken.label }}</div>
          <div class="token-path">{{ hoveredToken.path }}</div>
          <div class="token-value">
            <ColorSwatch v-if="hoveredToken.type === 'color'" :color="hoveredToken.value" />
            <code v-else>{{ hoveredToken.value }}</code>
          </div>
          <div class="token-actions">
            <Button
              label="Edit"
              icon="pi pi-pencil"
              size="small"
              severity="primary"
              @click="editToken(hoveredToken)"
            />
          </div>
        </div>
      </div>

      <!-- Highlighted Elements -->
      <div
        v-for="highlight in tokenHighlights"
        :key="highlight.id"
        class="token-highlight"
        :style="highlight.style"
      />
    </div>

    <!-- Token List Panel -->
    <div class="token-list-panel" v-if="showTokenList">
      <h5>Affected Tokens</h5>
      <div class="token-list">
        <div
          v-for="token in affectedTokens"
          :key="token.id"
          class="token-item"
          :class="{ 'active': hoveredToken?.id === token.id }"
          @mouseenter="hoveredToken = token"
          @mouseleave="hoveredToken = null"
          @click="onTokenClick(token)"
        >
          <div class="token-item-header">
            <Tag :value="token.type" severity="secondary" size="small" />
            <span class="token-label">{{ token.label }}</span>
          </div>
          <div class="token-item-value">
            <ColorSwatch v-if="token.type === 'color'" :color="token.value" />
            <code v-else>{{ token.value }}</code>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, shallowRef, nextTick } from 'vue'
import { useThemeAdvancedStore } from '@/stores/theme/advanced.store'
import type { DesignToken } from '@/themes/presets/preset.types'
defineOptions({
  components: { ColorSwatch }
})


const props = defineProps<{
  component: string
  tokens?: DesignToken[]
  showTokenList?: boolean
}>()

const emit = defineEmits<{
  'token-edit': [token: DesignToken]
  'token-select': [token: DesignToken]
}>()

// Import showcase components dynamically
const showcases = import.meta.glob('./showcases/*.vue')

// Store
const advancedStore = useThemeAdvancedStore()

// State
const darkMode = ref(false)
const selectedState = ref('normal')
const selectedSize = ref('medium')
const hoveredToken = ref<DesignToken | null>(null)
const showTokenOverlay = ref(true)
const overlayPosition = ref({ x: 0, y: 0 })
const tokenHighlights = ref<any[]>([])
const showcaseComponent = shallowRef<any>(null)

// Component mapping for generic preview
const componentMap: Record<string, any> = {
  button: { tag: 'Button', props: { label: 'Button' }, content: '' },
  inputtext: { tag: 'InputText', props: { placeholder: 'Enter text...' }, content: '' },
  select: { tag: 'Select', props: { placeholder: 'Select...', options: [] }, content: '' },
  dropdown: { tag: 'Select', props: { placeholder: 'Select...', options: [] }, content: '' },
  datepicker: { tag: 'DatePicker', props: { placeholder: 'Select date' }, content: '' },
  calendar: { tag: 'DatePicker', props: { placeholder: 'Select date' }, content: '' },
  checkbox: { tag: 'Checkbox', props: {}, content: '' },
  radiobutton: { tag: 'RadioButton', props: {}, content: '' },
  textarea: { tag: 'Textarea', props: { placeholder: 'Enter text...', rows: 4 }, content: '' },
  card: { tag: 'Card', props: {}, content: 'Card content' },
  dialog: { tag: 'Dialog', props: { visible: true, header: 'Dialog' }, content: 'Dialog content' },
  panel: { tag: 'Panel', props: { header: 'Panel' }, content: 'Panel content' },
  accordion: { tag: 'Accordion', props: {}, content: '' },
  tabs: { tag: 'Tabs', props: {}, content: '' },
  datatable: { tag: 'DataTable', props: { value: [] }, content: '' }
}

// Options
const stateOptions = [
  { label: 'Normal', value: 'normal' },
  { label: 'Hover', value: 'hover' },
  { label: 'Focus', value: 'focus' },
  { label: 'Active', value: 'active' },
  { label: 'Disabled', value: 'disabled' }
]

const sizeOptions = computed(() => {
  // Component-specific size options
  const sizeMap: Record<string, string[]> = {
    button: ['small', 'medium', 'large'],
    inputtext: ['small', 'medium', 'large'],
    dropdown: ['small', 'medium', 'large'],
    checkbox: ['small', 'medium', 'large']
  }
  
  return sizeMap[props.component] || []
})

// Computed
const componentName = computed(() => {
  return props.component
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
})

const componentTokens = computed(() => {
  return props.tokens || advancedStore.tokenRegistry.getTokensByComponent(props.component)
})

const affectedTokens = computed(() => {
  // Get tokens that affect this component
  return componentTokens.value.filter(token => 
    token.affects?.includes(props.component)
  )
})

const componentTag = computed(() => {
  return componentMap[props.component]?.tag || 'div'
})

const componentProps = computed(() => {
  const baseProps = componentMap[props.component]?.props || {}
  
  // Add size prop if applicable
  if (selectedSize.value !== 'medium' && sizeOptions.value.length > 0) {
    baseProps.size = selectedSize.value
  }
  
  // Add disabled prop if in disabled state
  if (selectedState.value === 'disabled') {
    baseProps.disabled = true
  }
  
  return baseProps
})

const componentContent = computed(() => {
  return componentMap[props.component]?.content || ''
})

const componentClass = computed(() => {
  const classes: string[] = []
  
  // Add component-specific classes
  if (props.component === 'button') {
    classes.push('p-button')
  }
  
  return classes
})

const stateClass = computed(() => {
  const stateClasses: Record<string, string> = {
    hover: 'p-hover',
    focus: 'p-focus',
    active: 'p-active',
    disabled: 'p-disabled'
  }
  
  return stateClasses[selectedState.value] || ''
})

const overlayStyle = computed(() => {
  return {
    left: `${overlayPosition.value.x}px`,
    top: `${overlayPosition.value.y}px`
  }
})

// Methods
async function loadShowcase() {
  const showcasePath = `./showcases/${capitalize(props.component)}Showcase.vue`
  
  if (showcases[showcasePath]) {
    try {
      const module = await showcases[showcasePath]() as any
      showcaseComponent.value = module.default
    } catch (error) {
      console.warn(`No showcase found for ${props.component}`)
      showcaseComponent.value = null
    }
  }
}

function capitalize(str: string): string {
  // Handle special cases for renamed components
  if (str === 'dropdown') return 'Select'
  if (str === 'calendar') return 'Datepicker'
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function handleMouseMove(event: MouseEvent) {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  overlayPosition.value = {
    x: event.clientX - rect.left + 10,
    y: event.clientY - rect.top + 10
  }
  
  // Detect which token is being hovered
  detectHoveredToken(event)
}

function handleMouseLeave() {
  hoveredToken.value = null
  tokenHighlights.value = []
}

function detectHoveredToken(event: MouseEvent) {
  // This would detect which element is being hovered and find related tokens
  // For now, we'll use a simplified approach
  const element = event.target as HTMLElement
  
  // Check if element has token-related classes or attributes
  const tokenId = element.getAttribute('data-token-id')
  if (tokenId) {
    hoveredToken.value = componentTokens.value.find(t => t.id === tokenId) || null
  }
}

function onTokenHover(token: DesignToken | null) {
  hoveredToken.value = token
  
  if (token) {
    // Create highlight overlay for elements using this token
    highlightTokenUsage(token)
  } else {
    tokenHighlights.value = []
  }
}

function onTokenClick(token: DesignToken) {
  emit('token-select', token)
}

function editToken(token: DesignToken) {
  emit('token-edit', token)
}

function highlightTokenUsage(token: DesignToken) {
  // Find elements that use this token and create highlight overlays
  // This is a simplified implementation
  tokenHighlights.value = []
  
  // In a real implementation, we would:
  // 1. Parse CSS to find where the token is used
  // 2. Find matching DOM elements
  // 3. Create highlight overlays for each element
}

function resetPreview() {
  selectedState.value = 'normal'
  selectedSize.value = 'medium'
  darkMode.value = false
  hoveredToken.value = null
  tokenHighlights.value = []
}

// Lifecycle
onMounted(() => {
  loadShowcase()
})

// Watch for component changes
watch(() => props.component, () => {
  loadShowcase()
  resetPreview()
})
</script>

<script lang="ts">
// ColorSwatch component
import { defineComponent, h } from 'vue'

const ColorSwatch = defineComponent({
  name: 'ColorSwatch',
  props: {
    color: String
  },
  setup(props) {
    return () => h('span', {
      class: 'color-swatch',
      style: {
        backgroundColor: props.color,
        display: 'inline-block',
        width: '24px',
        height: '24px',
        borderRadius: '4px',
        border: '2px solid var(--p-surface-300)',
        verticalAlign: 'middle',
        marginRight: '0.5rem'
      }
    })
  }
})

</script>

<style scoped>
.component-preview {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--p-surface-0);
  border-radius: var(--p-borderRadius);
  overflow: hidden;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--p-surface-200);
}

.preview-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.preview-title h4 {
  margin: 0;
}

.preview-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.preview-container {
  flex: 1;
  padding: 2rem;
  overflow: auto;
  position: relative;
  background-color: var(--p-surface-50);
  transition: background-color 0.3s;
}

.preview-container.dark {
  background-color: var(--p-surface-900);
}

.generic-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

/* Token Overlay */
.token-overlay {
  position: absolute;
  z-index: 1000;
  pointer-events: none;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15));
}

.token-info {
  background-color: var(--p-surface-0);
  border: 1px solid var(--p-surface-200);
  border-radius: var(--p-borderRadius);
  padding: 0.75rem;
  min-width: 200px;
}

.token-name {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.token-path {
  font-size: 0.75rem;
  color: var(--p-text-muted-color);
  margin-bottom: 0.5rem;
  font-family: monospace;
}

.token-value {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
}

.token-value code {
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
  background-color: var(--p-surface-100);
  border-radius: 3px;
}

.token-actions {
  pointer-events: all;
}

/* Token Highlights */
.token-highlight {
  position: absolute;
  border: 2px dashed var(--p-primary-500);
  background-color: rgba(var(--p-primary-500-rgb), 0.1);
  pointer-events: none;
  border-radius: 4px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
}

/* Token List Panel */
.token-list-panel {
  width: 280px;
  padding: 1rem;
  border-left: 1px solid var(--p-surface-200);
  overflow-y: auto;
}

.token-list-panel h5 {
  margin-top: 0;
  margin-bottom: 1rem;
}

.token-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.token-item {
  padding: 0.75rem;
  background-color: var(--p-surface-50);
  border: 1px solid var(--p-surface-200);
  border-radius: var(--p-borderRadius);
  cursor: pointer;
  transition: all 0.2s;
}

.token-item:hover,
.token-item.active {
  background-color: var(--p-primary-50);
  border-color: var(--p-primary-200);
}

.token-item-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.token-label {
  font-weight: 500;
  font-size: 0.875rem;
}

.token-item-value {
  display: flex;
  align-items: center;
}

.token-item-value code {
  font-size: 0.75rem;
  padding: 0.125rem 0.375rem;
  background-color: var(--p-surface-100);
  border-radius: 3px;
}

/* Dark mode adjustments */
.dark .token-overlay .token-info {
  background-color: var(--p-surface-800);
  border-color: var(--p-surface-700);
}

.dark .token-value code,
.dark .token-item-value code {
  background-color: var(--p-surface-700);
}

.dark .token-list-panel {
  border-color: var(--p-surface-700);
}

.dark .token-item {
  background-color: var(--p-surface-800);
  border-color: var(--p-surface-700);
}

.dark .token-item:hover,
.dark .token-item.active {
  background-color: var(--p-primary-900);
  border-color: var(--p-primary-400);
}
</style>