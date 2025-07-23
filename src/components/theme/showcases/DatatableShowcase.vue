<template>
  <div class="datatable-showcase">
    <div class="showcase-section">
      <h5>DataTable Example</h5>
      
      <DataTable 
        :value="sampleData" 
        :paginator="true" 
        :rows="5"
        :size="size"
        :stripedRows="true"
        :showGridlines="showGridlines"
        :class="stateClass"
        responsiveLayout="scroll"
        @row-mouseenter="onRowHover"
        @row-mouseleave="onRowLeave"
      >
        <template #header>
          <div class="table-header">
            <span class="text-lg font-semibold">Products</span>
            <Button icon="pi pi-refresh" text rounded @click="refreshData" />
          </div>
        </template>

        <Column field="id" header="ID" :sortable="true" style="width: 10%">
          <template #body="{ data }">
            <span @mouseenter="onHover('datatable.cell.color')" @mouseleave="onLeave">
              {{ data.id }}
            </span>
          </template>
        </Column>
        
        <Column field="name" header="Name" :sortable="true" style="width: 25%">
          <template #header>
            <span @mouseenter="onHover('datatable.header.color')" @mouseleave="onLeave">
              Name
            </span>
          </template>
          <template #body="{ data }">
            <span class="font-semibold">{{ data.name }}</span>
          </template>
        </Column>
        
        <Column field="category" header="Category" :sortable="true" style="width: 20%">
          <template #body="{ data }">
            <Tag 
              :value="data.category" 
              :severity="getCategorySeverity(data.category)"
              @mouseenter="onHover('datatable.cell.background')" 
              @mouseleave="onLeave"
            />
          </template>
        </Column>
        
        <Column field="price" header="Price" :sortable="true" style="width: 15%">
          <template #body="{ data }">
            <span class="font-mono">${{ data.price.toFixed(2) }}</span>
          </template>
        </Column>
        
        <Column field="status" header="Status" style="width: 15%">
          <template #body="{ data }">
            <Badge 
              :value="data.status" 
              :severity="getStatusSeverity(data.status)"
              @mouseenter="onHover('badge.background')" 
              @mouseleave="onLeave"
            />
          </template>
        </Column>
        
        <Column header="Actions" style="width: 15%">
          <template #body>
            <div class="flex gap-2">
              <Button 
                icon="pi pi-pencil" 
                text 
                rounded 
                size="small"
                @mouseenter="onHover('button.hover.background')" 
                @mouseleave="onLeave"
              />
              <Button 
                icon="pi pi-trash" 
                text 
                rounded 
                severity="danger" 
                size="small"
              />
            </div>
          </template>
        </Column>

        <template #footer>
          <div class="text-sm text-surface-500">
            Total: {{ sampleData.length }} products
          </div>
        </template>
      </DataTable>
    </div>

    <div class="showcase-section">
      <h5>Table Options</h5>
      <div class="options-grid">
        <div class="option-item">
          <label for="gridlines">Show Gridlines</label>
          <ToggleSwitch v-model="showGridlines" inputId="gridlines" />
        </div>
        <div class="option-item">
          <label for="rowHover">Row Hover Effect</label>
          <ToggleSwitch v-model="rowHover" inputId="rowHover" />
        </div>
      </div>
    </div>

    <!-- Token Mapping Info -->
    <div class="token-info-panel" v-if="showTokenInfo">
      <h6>DataTable Token Mappings</h6>
      <ul class="token-list">
        <li><code>datatable.header.background</code> - Header background</li>
        <li><code>datatable.header.color</code> - Header text color</li>
        <li><code>datatable.header.borderColor</code> - Header border</li>
        <li><code>datatable.row.background</code> - Row background</li>
        <li><code>datatable.row.stripedBackground</code> - Alternating row background</li>
        <li><code>datatable.row.hoverBackground</code> - Row hover background</li>
        <li><code>datatable.cell.padding</code> - Cell padding</li>
        <li><code>datatable.cell.borderColor</code> - Cell border</li>
        <li><code>datatable.footer.background</code> - Footer background</li>
        <li><code>datatable.paginator.background</code> - Paginator background</li>
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
const showGridlines = ref(false)
const rowHover = ref(true)

// Sample data
const sampleData = ref([
  { id: 1, name: 'Blue Band Watch', category: 'Accessories', price: 79.99, status: 'In Stock' },
  { id: 2, name: 'Gaming Laptop Pro', category: 'Electronics', price: 1299.99, status: 'In Stock' },
  { id: 3, name: 'Wireless Headphones', category: 'Electronics', price: 199.99, status: 'Low Stock' },
  { id: 4, name: 'Leather Wallet', category: 'Accessories', price: 49.99, status: 'In Stock' },
  { id: 5, name: 'Smart Home Hub', category: 'Electronics', price: 149.99, status: 'Out of Stock' },
  { id: 6, name: 'Running Shoes', category: 'Sports', price: 89.99, status: 'In Stock' },
  { id: 7, name: 'Coffee Maker Deluxe', category: 'Appliances', price: 249.99, status: 'In Stock' },
  { id: 8, name: 'Yoga Mat Premium', category: 'Sports', price: 39.99, status: 'Low Stock' },
  { id: 9, name: 'Desk Organizer Set', category: 'Office', price: 29.99, status: 'In Stock' },
  { id: 10, name: 'Portable Charger', category: 'Electronics', price: 59.99, status: 'In Stock' }
])

// Computed
const stateClass = computed(() => {
  if (!rowHover.value) return 'no-row-hover'
  return ''
})

// Methods
function getCategorySeverity(category: string) {
  const severityMap: Record<string, string> = {
    'Electronics': 'primary',
    'Accessories': 'success',
    'Sports': 'info',
    'Appliances': 'warning',
    'Office': 'secondary'
  }
  return severityMap[category] || 'secondary'
}

function getStatusSeverity(status: string) {
  const severityMap: Record<string, string> = {
    'In Stock': 'success',
    'Low Stock': 'warning',
    'Out of Stock': 'danger'
  }
  return severityMap[status] || 'secondary'
}

function refreshData() {
  // Simulate data refresh
  console.log('Refreshing data...')
}

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

function onRowHover(event: any) {
  onHover('datatable.row.hoverBackground')
}

function onRowLeave() {
  onLeave()
}
</script>

<style scoped>
.datatable-showcase {
  padding: 1rem;
}

.showcase-section {
  margin-bottom: 2rem;
}

.showcase-section h5 {
  margin-bottom: 1rem;
  color: var(--p-text-color);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.option-item label {
  font-size: 0.875rem;
  color: var(--p-text-color);
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

/* Disable row hover when toggle is off */
.no-row-hover :deep(.p-datatable-tbody > tr:hover) {
  background-color: transparent !important;
}

/* Dark mode adjustments */
.dark .token-info-panel {
  background-color: var(--p-surface-800);
}

.dark .token-list code {
  background-color: var(--p-surface-700);
}
</style>