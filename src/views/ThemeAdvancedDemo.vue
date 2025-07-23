<template>
  <div class="theme-advanced-demo">
    <!-- Page Header -->
    <div class="demo-header">
      <h1>Advanced Theme Configuration System</h1>
      <p class="text-lg text-surface-600">
        Phase 3 Implementation: Enhanced UI Components with Hybrid Navigation
      </p>
      
      <div class="demo-actions">
        <Button
          label="Open Theme Configurator"
          icon="pi pi-palette"
          severity="primary"
          @click="showConfigurator = true"
        />
        <Button
          label="Discover Tokens"
          icon="pi pi-search"
          severity="secondary"
          @click="discoverTokens"
          :loading="discovering"
        />
        <Button
          label="View Stats"
          icon="pi pi-chart-bar"
          severity="secondary"
          @click="showStats = true"
        />
      </div>
    </div>

    <!-- Current Status -->
    <div class="demo-content">
      <div class="status-grid">
        <!-- Discovery Status -->
        <Card>
          <template #title>Token Discovery</template>
          <template #content>
            <div v-if="!hasDiscoveredTokens" class="text-center py-4">
              <i class="pi pi-info-circle text-4xl text-surface-400 mb-3"></i>
              <p>No tokens discovered yet. Click "Discover Tokens" to start.</p>
            </div>
            <div v-else>
              <div class="status-item">
                <span class="label">Total Components:</span>
                <Badge :value="stats.totalComponents" severity="info" />
              </div>
              <div class="status-item">
                <span class="label">Discovered Components:</span>
                <Badge :value="stats.discoveredComponents" severity="success" />
              </div>
              <div class="status-item">
                <span class="label">Total Tokens:</span>
                <Badge :value="stats.totalTokens" severity="primary" />
              </div>
              <div class="token-breakdown">
                <h5>Token Breakdown</h5>
                <div class="breakdown-grid">
                  <div v-for="(count, category) in stats.tokensByCategory" :key="category" class="breakdown-item">
                    <Tag :value="category" severity="secondary" />
                    <span class="count">{{ count }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>

        <!-- Recent Changes -->
        <Card>
          <template #title>Recent Changes</template>
          <template #content>
            <div v-if="recentChanges.length === 0" class="text-center py-4">
              <i class="pi pi-history text-4xl text-surface-400 mb-3"></i>
              <p>No changes made yet.</p>
            </div>
            <div v-else class="change-list">
              <div v-for="change in recentChanges" :key="change.id" class="change-item">
                <div class="change-header">
                  <span class="token-name">{{ change.tokenLabel }}</span>
                  <span class="timestamp">{{ formatTime(change.timestamp) }}</span>
                </div>
                <div class="change-values">
                  <div class="value-row">
                    <span class="label">From:</span>
                    <ColorSwatch v-if="change.color" :color="change.oldValue" />
                    <code v-else>{{ change.oldValue }}</code>
                  </div>
                  <div class="value-row">
                    <span class="label">To:</span>
                    <ColorSwatch v-if="change.color" :color="change.newValue" />
                    <code v-else>{{ change.newValue }}</code>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>

        <!-- Component Preview -->
        <Card class="full-width">
          <template #title>Component Examples</template>
          <template #content>
            <div class="component-examples">
              <div class="example-section">
                <h5>Buttons</h5>
                <div class="button-group">
                  <Button label="Primary" />
                  <Button label="Secondary" severity="secondary" />
                  <Button label="Success" severity="success" />
                  <Button label="Warning" severity="warning" />
                  <Button label="Danger" severity="danger" />
                </div>
              </div>
              
              <div class="example-section">
                <h5>Form Elements</h5>
                <div class="form-grid">
                  <InputText placeholder="Input text" />
                  <Select :options="['Option 1', 'Option 2']" placeholder="Select" />
                  <DatePicker placeholder="Select date" />
                </div>
              </div>
              
              <div class="example-section">
                <h5>Data Display</h5>
                <DataTable :value="sampleData" size="small" stripedRows>
                  <Column field="name" header="Name" />
                  <Column field="category" header="Category">
                    <template #body="{ data }">
                      <Tag :value="data.category" />
                    </template>
                  </Column>
                  <Column field="value" header="Value" />
                </DataTable>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>

    <!-- Advanced Theme Configurator -->
    <ThemeConfiguratorAdvanced
      v-model:visible="showConfigurator"
      @apply="onApplyChanges"
      @export="onExportTheme"
    />

    <!-- Stats Dialog -->
    <Dialog
      v-model:visible="showStats"
      header="Token Statistics"
      :modal="true"
      :style="{ width: '50vw' }"
    >
      <div class="stats-content">
        <div class="stat-card" v-for="(value, key) in detailedStats" :key="key">
          <div class="stat-label">{{ formatStatLabel(key) }}</div>
          <div class="stat-value">{{ value }}</div>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useThemeAdvancedStore } from '@/stores/theme/advanced.store'
import { TokenDiscovery } from '@/themes/core/token-discovery'
import ThemeConfiguratorAdvanced from '@/components/theme/ThemeConfiguratorAdvanced.vue'
defineOptions({
  components: { ColorSwatch }
})


// Store
const advancedStore = useThemeAdvancedStore()

// State
const showConfigurator = ref(false)
const showStats = ref(false)
const discovering = ref(false)

// Sample data for DataTable
const sampleData = ref([
  { name: 'Primary Color', category: 'semantic', value: '{primary.500}' },
  { name: 'Button Background', category: 'component', value: '{primary.500}' },
  { name: 'Border Radius', category: 'primitive', value: '6px' }
])

// Computed
const hasDiscoveredTokens = computed(() => advancedStore.hasDiscoveredTokens)
const stats = computed(() => TokenDiscovery.getDiscoveryStats())
const recentChanges = computed(() => 
  advancedStore.tokenChangeHistory.slice(-5).reverse()
)

const detailedStats = computed(() => ({
  totalTokens: stats.value.totalTokens,
  primitiveTokens: stats.value.tokensByCategory.primitive || 0,
  semanticTokens: stats.value.tokensByCategory.semantic || 0,
  componentTokens: stats.value.tokensByCategory.component || 0,
  customTokens: stats.value.tokensByCategory.custom || 0,
  discoveredComponents: stats.value.discoveredComponents,
  totalComponents: stats.value.totalComponents,
  modifiedTokens: advancedStore.modifiedTokenCount,
  cacheSize: TokenDiscovery['tokenCache']?.size || 0
}))

// Methods
async function discoverTokens() {
  discovering.value = true
  try {
    const tokens = await TokenDiscovery.discoverAllTokens()
    advancedStore.setDiscoveredTokens(tokens)
    console.log('✅ Token discovery complete:', stats.value)
  } catch (error) {
    console.error('❌ Token discovery failed:', error)
  } finally {
    discovering.value = false
  }
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  
  if (minutes < 1) return 'just now'
  if (minutes === 1) return '1 minute ago'
  if (minutes < 60) return `${minutes} minutes ago`
  
  const hours = Math.floor(minutes / 60)
  if (hours === 1) return '1 hour ago'
  if (hours < 24) return `${hours} hours ago`
  
  return date.toLocaleDateString()
}

function formatStatLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}

function onApplyChanges() {
  console.log('Theme changes applied!')
}

function onExportTheme() {
  const exportData = advancedStore.exportTokenState()
  console.log('Theme exported:', exportData)
  
  // In a real implementation, this would download the theme file
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'theme-export.json'
  a.click()
  URL.revokeObjectURL(url)
}

// Lifecycle
onMounted(() => {
  // Auto-discover tokens if not already done
  if (!hasDiscoveredTokens.value) {
    discoverTokens()
  }
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
        width: '20px',
        height: '20px',
        borderRadius: '4px',
        border: '1px solid var(--p-surface-300)',
        verticalAlign: 'middle'
      }
    })
  }
})

</script>

<style scoped>
.theme-advanced-demo {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.demo-header {
  text-align: center;
  margin-bottom: 3rem;
}

.demo-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.demo-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.full-width {
  grid-column: 1 / -1;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--p-surface-200);
}

.status-item:last-child {
  border-bottom: none;
}

.token-breakdown {
  margin-top: 1rem;
}

.token-breakdown h5 {
  margin-bottom: 0.75rem;
}

.breakdown-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background-color: var(--p-surface-50);
  border-radius: var(--p-borderRadius);
}

.change-list {
  max-height: 300px;
  overflow-y: auto;
}

.change-item {
  padding: 0.75rem;
  border-bottom: 1px solid var(--p-surface-200);
}

.change-item:last-child {
  border-bottom: none;
}

.change-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.token-name {
  font-weight: 600;
}

.timestamp {
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
}

.change-values {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
}

.value-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.value-row .label {
  color: var(--p-text-muted-color);
}

.component-examples {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.example-section h5 {
  margin-bottom: 1rem;
}

.button-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stats-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  padding: 1.5rem;
  background-color: var(--p-surface-50);
  border-radius: var(--p-borderRadius);
  text-align: center;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 600;
  color: var(--p-primary-500);
}

/* Dark mode adjustments */
.dark .breakdown-item {
  background-color: var(--p-surface-800);
}

.dark .stat-card {
  background-color: var(--p-surface-800);
}
</style>