<template>
  <div class="select-showcase">
    <div class="showcase-section">
      <h5>Select Variations</h5>
      <div class="showcase-grid">
        <div class="showcase-item">
          <label>Basic Select</label>
          <Select 
            v-model="selectedCity" 
            :options="cities" 
            optionLabel="name" 
            placeholder="Select a City"
            :size="size"
            :class="stateClass"
            @mouseenter="onHover('select.background')"
            @mouseleave="onLeave"
          />
        </div>

        <div class="showcase-item">
          <label>With Groups</label>
          <Select 
            v-model="selectedCountry" 
            :options="groupedCountries" 
            optionLabel="label" 
            optionGroupLabel="label" 
            optionGroupChildren="items"
            placeholder="Select a Country"
            :size="size"
            :class="stateClass"
          />
        </div>

        <div class="showcase-item">
          <label>With Filter</label>
          <Select 
            v-model="selectedProduct" 
            :options="products" 
            optionLabel="name" 
            placeholder="Search Products"
            filter
            :size="size"
            :class="stateClass"
            @mouseenter="onHover('select.filter.background')"
            @mouseleave="onLeave"
          />
        </div>

        <div class="showcase-item">
          <label>Disabled</label>
          <Select 
            :options="cities" 
            optionLabel="name" 
            placeholder="Disabled"
            disabled
            :size="size"
            @mouseenter="onHover('select.disabled.background')"
            @mouseleave="onLeave"
          />
        </div>
      </div>
    </div>

    <div class="showcase-section">
      <h5>Advanced Features</h5>
      <div class="showcase-grid">
        <div class="showcase-item">
          <label>With Templates</label>
          <Select 
            v-model="selectedStatus" 
            :options="statuses" 
            optionLabel="name"
            placeholder="Select Status"
            :size="size"
            :class="stateClass"
          >
            <template #value="slotProps">
              <div v-if="slotProps.value" class="flex align-items-center gap-2">
                <Badge :value="slotProps.value.name" :severity="slotProps.value.severity" />
              </div>
              <span v-else>{{ slotProps.placeholder }}</span>
            </template>
            <template #option="slotProps">
              <div class="flex align-items-center gap-2">
                <Badge :value="slotProps.option.name" :severity="slotProps.option.severity" />
              </div>
            </template>
          </Select>
        </div>

        <div class="showcase-item">
          <label>Multiple Selection</label>
          <MultiSelect 
            v-model="selectedTags" 
            :options="tags" 
            optionLabel="name" 
            placeholder="Select Tags"
            :maxSelectedLabels="3"
            :size="size"
            :class="stateClass"
            @mouseenter="onHover('select.multiselect.background')"
            @mouseleave="onLeave"
          />
        </div>

        <div class="showcase-item">
          <label>Editable</label>
          <Select 
            v-model="editableValue" 
            :options="cities" 
            optionLabel="name" 
            placeholder="Type or Select"
            editable
            :size="size"
            :class="stateClass"
          />
        </div>

        <div class="showcase-item">
          <label>Loading</label>
          <Select 
            :options="[]" 
            placeholder="Loading..."
            :loading="true"
            :size="size"
          />
        </div>
      </div>
    </div>

    <div class="showcase-section">
      <h5>Select Positioning</h5>
      <div class="showcase-grid">
        <div class="showcase-item">
          <label>Append To Body</label>
          <Select 
            v-model="selectedCity2" 
            :options="cities" 
            optionLabel="name" 
            placeholder="Appends to body"
            appendTo="body"
            :size="size"
          />
        </div>
      </div>
    </div>

    <!-- Token Mapping Info -->
    <div class="token-info-panel" v-if="showTokenInfo">
      <h6>Select Token Mappings</h6>
      <ul class="token-list">
        <li><code>select.background</code> - Input background</li>
        <li><code>select.color</code> - Text color</li>
        <li><code>select.borderColor</code> - Border color</li>
        <li><code>select.borderRadius</code> - Corner radius</li>
        <li><code>select.padding</code> - Internal padding</li>
        <li><code>select.hover.borderColor</code> - Hover border</li>
        <li><code>select.focus.borderColor</code> - Focus border</li>
        <li><code>select.disabled.background</code> - Disabled background</li>
        <li><code>select.panel.background</code> - Panel background</li>
        <li><code>select.panel.borderRadius</code> - Panel radius</li>
        <li><code>select.panel.shadow</code> - Panel shadow</li>
        <li><code>select.item.padding</code> - Option padding</li>
        <li><code>select.item.hoverBackground</code> - Option hover</li>
        <li><code>select.item.selectedBackground</code> - Selected option</li>
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
const selectedCity = ref(null)
const selectedCity2 = ref(null)
const selectedCountry = ref(null)
const selectedProduct = ref(null)
const selectedStatus = ref(null)
const selectedTags = ref([])
const editableValue = ref(null)

// Data
const cities = [
  { name: 'New York', code: 'NY' },
  { name: 'Rome', code: 'RM' },
  { name: 'London', code: 'LDN' },
  { name: 'Istanbul', code: 'IST' },
  { name: 'Paris', code: 'PRS' }
]

const groupedCountries = [
  {
    label: 'Europe',
    code: 'EU',
    items: [
      { label: 'Germany', value: 'DE' },
      { label: 'France', value: 'FR' },
      { label: 'Spain', value: 'ES' }
    ]
  },
  {
    label: 'North America',
    code: 'NA',
    items: [
      { label: 'United States', value: 'US' },
      { label: 'Canada', value: 'CA' },
      { label: 'Mexico', value: 'MX' }
    ]
  },
  {
    label: 'Asia',
    code: 'AS',
    items: [
      { label: 'Japan', value: 'JP' },
      { label: 'China', value: 'CN' },
      { label: 'India', value: 'IN' }
    ]
  }
]

const products = [
  { name: 'Laptop Pro', category: 'Electronics' },
  { name: 'Wireless Mouse', category: 'Electronics' },
  { name: 'Office Chair', category: 'Furniture' },
  { name: 'Desk Lamp', category: 'Furniture' },
  { name: 'Notebook Set', category: 'Stationery' }
]

const statuses = [
  { name: 'Active', severity: 'success' },
  { name: 'Pending', severity: 'warning' },
  { name: 'Inactive', severity: 'danger' },
  { name: 'Draft', severity: 'secondary' }
]

const tags = [
  { name: 'Technology', code: 'tech' },
  { name: 'Sports', code: 'sports' },
  { name: 'Business', code: 'business' },
  { name: 'Entertainment', code: 'entertainment' },
  { name: 'Science', code: 'science' }
]

// Computed
const stateClass = computed(() => {
  const stateMap: Record<string, string> = {
    hover: 'p-select-hover',
    focus: 'p-select-focus'
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
.select-showcase {
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
:deep(.p-dropdown-hover),
:deep(.p-dropdown-hover:enabled) {
  border-color: var(--p-select-hover-border-color) !important;
}

:deep(.p-dropdown-focus),
:deep(.p-dropdown-focus:enabled) {
  border-color: var(--p-select-focus-border-color) !important;
  box-shadow: var(--p-select-focus-shadow) !important;
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