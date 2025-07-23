<template>
  <div class="datepicker-showcase">
    <div class="showcase-section">
      <h5>DatePicker Variations</h5>
      <div class="showcase-grid">
        <div class="showcase-item">
          <label>Basic DatePicker</label>
          <DatePicker 
            v-model="date1" 
            placeholder="Select date"
            :size="size"
            :class="stateClass"
            @mouseenter="onHover('datepicker.background')"
            @mouseleave="onLeave"
          />
        </div>

        <div class="showcase-item">
          <label>With Icon</label>
          <DatePicker 
            v-model="date2" 
            showIcon
            iconDisplay="input"
            placeholder="Select date"
            :size="size"
            :class="stateClass"
            @mouseenter="onHover('datepicker.icon.color')"
            @mouseleave="onLeave"
          />
        </div>

        <div class="showcase-item">
          <label>Date Range</label>
          <DatePicker 
            v-model="dateRange" 
            selectionMode="range" 
            placeholder="Select date range"
            :size="size"
            :class="stateClass"
          />
        </div>

        <div class="showcase-item">
          <label>Multiple Dates</label>
          <DatePicker 
            v-model="multipleDates" 
            selectionMode="multiple" 
            placeholder="Select multiple dates"
            :size="size"
            :class="stateClass"
          />
        </div>
      </div>
    </div>

    <div class="showcase-section">
      <h5>Advanced Features</h5>
      <div class="showcase-grid">
        <div class="showcase-item">
          <label>Time Picker</label>
          <DatePicker 
            v-model="dateTime" 
            showTime 
            hourFormat="24"
            placeholder="Select date and time"
            :size="size"
            :class="stateClass"
            @mouseenter="onHover('datepicker.timepicker.background')"
            @mouseleave="onLeave"
          />
        </div>

        <div class="showcase-item">
          <label>Month Picker</label>
          <DatePicker 
            v-model="month" 
            view="month" 
            dateFormat="mm/yy"
            placeholder="Select month"
            :size="size"
            :class="stateClass"
          />
        </div>

        <div class="showcase-item">
          <label>Year Picker</label>
          <DatePicker 
            v-model="year" 
            view="year" 
            dateFormat="yy"
            placeholder="Select year"
            :size="size"
            :class="stateClass"
          />
        </div>

        <div class="showcase-item">
          <label>Disabled</label>
          <DatePicker 
            placeholder="Disabled" 
            disabled
            :size="size"
            @mouseenter="onHover('datepicker.disabled.background')"
            @mouseleave="onLeave"
          />
        </div>
      </div>
    </div>

    <div class="showcase-section">
      <h5>Display Options</h5>
      <div class="showcase-grid">
        <div class="showcase-item">
          <label>Inline Display</label>
          <DatePicker 
            v-model="inlineDate" 
            inline
            @mouseenter="onHover('datepicker.panel.background')"
            @mouseleave="onLeave"
          />
        </div>

        <div class="showcase-item">
          <label>Button Trigger</label>
          <DatePicker 
            v-model="buttonDate" 
            showIcon
            iconDisplay="button"
            :size="size"
          />
        </div>
      </div>
    </div>

    <!-- Token Mapping Info -->
    <div class="token-info-panel" v-if="showTokenInfo">
      <h6>DatePicker Token Mappings</h6>
      <ul class="token-list">
        <li><code>datepicker.background</code> - Input background</li>
        <li><code>datepicker.color</code> - Text color</li>
        <li><code>datepicker.borderColor</code> - Border color</li>
        <li><code>datepicker.borderRadius</code> - Corner radius</li>
        <li><code>datepicker.hover.borderColor</code> - Hover border</li>
        <li><code>datepicker.focus.borderColor</code> - Focus border</li>
        <li><code>datepicker.disabled.background</code> - Disabled background</li>
        <li><code>datepicker.icon.color</code> - Icon color</li>
        <li><code>datepicker.panel.background</code> - Calendar panel background</li>
        <li><code>datepicker.panel.borderRadius</code> - Panel radius</li>
        <li><code>datepicker.panel.shadow</code> - Panel shadow</li>
        <li><code>datepicker.header.background</code> - Header background</li>
        <li><code>datepicker.header.color</code> - Header text</li>
        <li><code>datepicker.date.color</code> - Date text color</li>
        <li><code>datepicker.date.hoverBackground</code> - Date hover</li>
        <li><code>datepicker.date.selectedBackground</code> - Selected date</li>
        <li><code>datepicker.today.color</code> - Today highlight</li>
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
const date1 = ref<Date>()
const date2 = ref<Date>()
const dateRange = ref<Date[]>()
const multipleDates = ref<Date[]>()
const dateTime = ref<Date>()
const month = ref<Date>()
const year = ref<Date>()
const inlineDate = ref<Date>(new Date())
const buttonDate = ref<Date>()

// Computed
const stateClass = computed(() => {
  const stateMap: Record<string, string> = {
    hover: 'p-datepicker-hover',
    focus: 'p-datepicker-focus'
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
</script>

<style scoped>
.datepicker-showcase {
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

.showcase-item label {
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
}

/* State classes for preview */
:deep(.p-datepicker-hover),
:deep(.p-datepicker-hover:enabled) {
  border-color: var(--p-datepicker-hover-border-color) !important;
}

:deep(.p-datepicker-focus),
:deep(.p-datepicker-focus:enabled) {
  border-color: var(--p-datepicker-focus-border-color) !important;
  box-shadow: var(--p-datepicker-focus-shadow) !important;
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
.dark .token-info-panel {
  background-color: var(--p-surface-800);
}

.dark .token-list code {
  background-color: var(--p-surface-700);
}
</style>