<template>
  <div class="inputtext-showcase">
    <div class="showcase-section">
      <h5>Input States</h5>
      <div class="showcase-grid">
        <div class="showcase-item">
          <label>Default</label>
          <InputText 
            placeholder="Enter text..." 
            :size="size"
            :class="stateClass"
            @mouseenter="onHover('inputtext.background')"
            @mouseleave="onLeave"
            @click="onClick('inputtext.background')"
          />
        </div>
        
        <div class="showcase-item">
          <label>With Value</label>
          <InputText 
            v-model="inputValue" 
            :size="size"
            :class="stateClass"
            @mouseenter="onHover('inputtext.color')"
            @mouseleave="onLeave"
          />
        </div>
        
        <div class="showcase-item">
          <label>Disabled</label>
          <InputText 
            placeholder="Disabled input" 
            disabled
            :size="size"
            @mouseenter="onHover('inputtext.disabled.background')"
            @mouseleave="onLeave"
          />
        </div>
        
        <div class="showcase-item">
          <label>Invalid</label>
          <InputText 
            placeholder="Invalid input" 
            class="p-invalid"
            :size="size"
            @mouseenter="onHover('inputtext.invalid.borderColor')"
            @mouseleave="onLeave"
          />
        </div>
      </div>
    </div>

    <div class="showcase-section">
      <h5>Input Variations</h5>
      <div class="showcase-grid">
        <div class="showcase-item">
          <label>With Icons</label>
          <span class="p-input-icon-left">
            <i class="pi pi-search" />
            <InputText 
              placeholder="Search" 
              :size="size"
              :class="stateClass"
              @mouseenter="onHover('inputtext.padding')"
              @mouseleave="onLeave"
            />
          </span>
        </div>
        
        <div class="showcase-item">
          <label>Icon Right</label>
          <span class="p-input-icon-right">
            <InputText 
              placeholder="Email" 
              :size="size"
              :class="stateClass"
            />
            <i class="pi pi-envelope" />
          </span>
        </div>
        
        <div class="showcase-item">
          <label>Loading</label>
          <span class="p-input-icon-right">
            <InputText 
              placeholder="Loading..." 
              :size="size"
              :class="stateClass"
            />
            <i class="pi pi-spin pi-spinner" />
          </span>
        </div>
        
        <div class="showcase-item">
          <label>Filled</label>
          <InputText 
            placeholder="Filled variant" 
            class="p-filled"
            :size="size"
            :class="stateClass"
            @mouseenter="onHover('inputtext.filled.background')"
            @mouseleave="onLeave"
          />
        </div>
      </div>
    </div>

    <div class="showcase-section">
      <h5>Input Groups</h5>
      <div class="showcase-grid">
        <div class="showcase-item full-width">
          <label>Input Group</label>
          <div class="p-inputgroup">
            <span class="p-inputgroup-addon">
              <i class="pi pi-user"></i>
            </span>
            <InputText 
              placeholder="Username" 
              :size="size"
              @mouseenter="onHover('inputtext.borderColor')"
              @mouseleave="onLeave"
            />
          </div>
        </div>
        
        <div class="showcase-item full-width">
          <label>Multiple Addons</label>
          <div class="p-inputgroup">
            <span class="p-inputgroup-addon">$</span>
            <InputText 
              placeholder="Price" 
              :size="size"
            />
            <span class="p-inputgroup-addon">.00</span>
          </div>
        </div>
        
        <div class="showcase-item full-width">
          <label>Button Addon</label>
          <div class="p-inputgroup">
            <InputText 
              placeholder="Search" 
              :size="size"
            />
            <Button 
              icon="pi pi-search" 
              :size="size"
              @mouseenter="onHover('button.background')"
              @mouseleave="onLeave"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="showcase-section">
      <h5>Float Label</h5>
      <div class="showcase-grid">
        <div class="showcase-item">
          <label>Float Label</label>
          <FloatLabel>
            <InputText 
              id="float-input"
              v-model="floatValue" 
              :size="size"
              :class="stateClass"
              @mouseenter="onHover('inputtext.focus.borderColor')"
              @mouseleave="onLeave"
            />
            <label for="float-input">Username</label>
          </FloatLabel>
        </div>
      </div>
    </div>

    <!-- Token Mapping Info -->
    <div class="token-info-panel" v-if="showTokenInfo">
      <h6>InputText Token Mappings</h6>
      <ul class="token-list">
        <li><code>inputtext.background</code> - Input background</li>
        <li><code>inputtext.color</code> - Text color</li>
        <li><code>inputtext.borderColor</code> - Border color</li>
        <li><code>inputtext.borderRadius</code> - Corner radius</li>
        <li><code>inputtext.padding</code> - Internal padding</li>
        <li><code>inputtext.fontSize</code> - Text size</li>
        <li><code>inputtext.hover.borderColor</code> - Hover border</li>
        <li><code>inputtext.focus.borderColor</code> - Focus border</li>
        <li><code>inputtext.focus.shadow</code> - Focus shadow</li>
        <li><code>inputtext.disabled.background</code> - Disabled background</li>
        <li><code>inputtext.disabled.color</code> - Disabled text</li>
        <li><code>inputtext.invalid.borderColor</code> - Error border</li>
        <li><code>inputtext.placeholder.color</code> - Placeholder text</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
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

// State
const inputValue = ref('Sample text')
const floatValue = ref('')

// Computed
const stateClass = computed(() => {
  const stateMap: Record<string, string> = {
    hover: 'p-inputtext-hover',
    focus: 'p-inputtext-focus',
    disabled: 'p-disabled'
  }
  return stateMap[props.state || ''] || ''
})

// Methods
function onHover(tokenPath: string) {
  if (!props.tokens) return
  
  const token = props.tokens.find(t => t.path === tokenPath)
  if (token) {
    emit('token-hover', token)
  }
}

function onLeave() {
  emit('token-hover', null)
}

function onClick(tokenPath: string) {
  if (!props.tokens) return
  
  const token = props.tokens.find(t => t.path === tokenPath)
  if (token) {
    emit('token-click', token)
  }
}
</script>

<style scoped>
.inputtext-showcase {
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
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.showcase-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.showcase-item.full-width {
  grid-column: 1 / -1;
}

.showcase-item label {
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
}

/* Input group styling */
.p-inputgroup {
  display: flex;
}

.p-inputgroup .p-inputtext {
  flex: 1;
  border-radius: 0;
}

.p-inputgroup-addon {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background-color: var(--p-surface-100);
  border: 1px solid var(--p-surface-300);
  color: var(--p-text-muted-color);
}

.p-inputgroup-addon:first-child {
  border-top-left-radius: var(--p-borderRadius);
  border-bottom-left-radius: var(--p-borderRadius);
  border-right: 0;
}

.p-inputgroup-addon:last-child {
  border-top-right-radius: var(--p-borderRadius);
  border-bottom-right-radius: var(--p-borderRadius);
  border-left: 0;
}

.p-inputgroup .p-inputtext:first-child {
  border-top-left-radius: var(--p-borderRadius);
  border-bottom-left-radius: var(--p-borderRadius);
}

.p-inputgroup .p-inputtext:last-child {
  border-top-right-radius: var(--p-borderRadius);
  border-bottom-right-radius: var(--p-borderRadius);
}

.p-inputgroup .p-button {
  border-radius: 0;
}

.p-inputgroup .p-button:last-child {
  border-top-right-radius: var(--p-borderRadius);
  border-bottom-right-radius: var(--p-borderRadius);
}

/* State classes for preview */
:deep(.p-inputtext-hover),
:deep(.p-inputtext-hover:enabled) {
  border-color: var(--p-inputtext-hover-border-color) !important;
}

:deep(.p-inputtext-focus),
:deep(.p-inputtext-focus:enabled) {
  border-color: var(--p-inputtext-focus-border-color) !important;
  box-shadow: var(--p-inputtext-focus-shadow) !important;
  outline: 0 !important;
}

/* Token Info Panel */
.token-info-panel {
  margin-top: 2rem;
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

/* Dark mode adjustments */
.dark .p-inputgroup-addon {
  background-color: var(--p-surface-800);
  border-color: var(--p-surface-700);
}

.dark .token-info-panel {
  background-color: var(--p-surface-800);
}

.dark .token-list code {
  background-color: var(--p-surface-700);
}
</style>