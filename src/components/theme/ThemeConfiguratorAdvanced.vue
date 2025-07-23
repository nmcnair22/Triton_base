<template>
  <div class="theme-configurator-advanced">
    <!-- Bottom Drawer -->
    <Drawer
      v-model:visible="isOpen"
      position="bottom"
      :modal="false"
      :showCloseIcon="false"
      class="theme-drawer-bottom"
      :pt="{
        root: { style: `height: ${drawerHeight}; width: 100vw;` },
        content: { class: 'p-0 h-full' }
      }"
    >
      <!-- Header -->
      <div class="configurator-header">
        <div class="header-content">
          <h3 class="header-title">Theme Configuration</h3>
          <div class="header-actions">
            <!-- New Theme Button -->
            <Button
              icon="pi pi-plus"
              severity="secondary"
              text
              rounded
              v-tooltip="'Create new theme'"
              @click="startNewThemeCreation"
            />
            <!-- Current Base Theme Display -->
            <div v-if="currentBaseTheme" class="current-theme-badge">
              <Tag :value="currentBaseTheme" severity="info" />
              <Button
                icon="pi pi-refresh"
                severity="secondary"
                text
                rounded
                size="small"
                v-tooltip="'Refresh token discovery'"
                @click="refreshTokenDiscovery"
              />
            </div>
            <Button
              :icon="`pi pi-${viewMode === 'compact' ? 'expand' : 'compress'}`"
              severity="secondary"
              text
              rounded
              v-tooltip="viewMode === 'compact' ? 'Expand view' : 'Compact view'"
              @click="toggleViewMode"
            />
            <Button
              icon="pi pi-download"
              severity="secondary"
              text
              rounded
              v-tooltip="'Export theme'"
              @click="exportTheme"
            />
            <Button
              icon="pi pi-refresh"
              severity="secondary"
              text
              rounded
              v-tooltip="'Reset changes'"
              @click="resetChanges"
            />
            <Button
              icon="pi pi-times"
              severity="secondary"
              text
              rounded
              @click="close"
            />
          </div>
        </div>
        
        <!-- View Mode Tabs -->
        <div class="view-tabs">
          <Tabs v-model:value="activeTabValue">
            <TabList>
              <Tab v-for="tab in tabItems" :key="tab.label" :value="tab.value">
                <i :class="tab.icon" class="mr-2"></i>
                {{ tab.label }}
              </Tab>
            </TabList>
          </Tabs>
        </div>
      </div>

      <!-- Content Area - Horizontal Layout for Bottom Drawer -->
      <div class="configurator-content-bottom">
        <!-- Base Theme Selector Overlay -->
        <div v-if="showBaseThemeSelector" class="base-theme-overlay-bottom">
          <BaseThemeSelector
            @cancel="cancelThemeCreation"
            @theme-selected="onThemeSelected"
          />
        </div>
        
        <!-- Main Horizontal Layout -->
        <div v-else class="bottom-drawer-layout">
          <!-- Left: Navigation Panel -->
          <div class="navigation-panel">
            <TokenNavigationTree
              v-if="activeTabValue === 'tokens'"
              :searchQuery="searchQuery"
              @select="onTokenGroupSelect"
            />
            <ComponentNavigationTree
              v-else-if="activeTabValue === 'components'"
              :searchQuery="searchQuery"
              @select="onComponentSelect"
            />
            <PresetNavigationList
              v-else-if="activeTabValue === 'presets'"
              @select="onPresetSelect"
              @manage="openPresetManager"
            />
          </div>

          <!-- Right: Editor Area -->
          <div class="editor-panel">
            <!-- Breadcrumb -->
            <div class="content-breadcrumb-bottom" v-if="currentSelection">
              <Breadcrumb :model="breadcrumbItems" />
            </div>

            <!-- Content Editor Area -->
            <div class="editor-area-bottom">
              <!-- Token Group View -->
              <div v-if="activeTabValue === 'tokens' && selectedTokenGroup" class="token-group-editor">
                <h4 class="editor-title">{{ selectedTokenGroup.label }}</h4>
                <div class="token-grid-bottom">
                  <TokenValueEditor
                    v-for="token in selectedTokenGroup.tokens"
                    :key="`token-${token.id}`"
                    :token="token"
                    :value="getTokenValue(token)"
                    :compact="true"
                    :showTokenInfo="false"
                    @update="(value) => updateToken(token, value)"
                    @validate="(valid, error) => handleTokenValidation(token, valid, error)"
                  />
                </div>
              </div>

              <!-- Component View -->
              <div v-else-if="activeTabValue === 'components' && selectedComponent" class="component-editor">
                <div class="component-header">
                  <h4 class="editor-title">{{ selectedComponent.label }}</h4>
                  <div class="component-actions">
                    <Button
                      icon="pi pi-eye"
                      text
                      rounded
                      size="small"
                      v-tooltip="'Preview component'"
                      @click="previewComponent = selectedComponent.key; showComponentPreviewDialog = true"
                    />
                  </div>
                </div>
                
                <DataTable
                  :value="componentTokens"
                  :scrollable="true"
                  scrollHeight="300px"
                  class="compact-table"
                >
                  <Column field="label" header="Token" class="table-header" />
                  <Column field="value" header="Current Value" class="table-header">
                    <template #body="{ data }">
                      <TokenValueEditor
                        :token="data"
                        :value="getTokenValue(data)"
                        :compact="true"
                        :showTokenInfo="false"
                        @update="(value) => updateToken(data, value)"
                        @validate="(valid, error) => handleTokenValidation(data, valid, error)"
                      />
                    </template>
                  </Column>
                </DataTable>
              </div>

              <!-- Preset View -->
              <div v-else-if="activeTabValue === 'presets' && selectedPreset" class="preset-editor">
                <PresetEditor
                  :preset="selectedPreset"
                  @update="updatePreset"
                  @save="savePreset"
                  @delete="deletePreset"
                />
              </div>

              <!-- Empty State -->
              <div v-else class="empty-state">
                <i class="pi pi-palette text-4xl text-surface-400 mb-3"></i>
                <p class="text-lg text-surface-600">
                  Select a {{ ['token group', 'component', 'preset'][activeTab] }} to start customizing
                </p>
              </div>
              
              <!-- Preview Panel (optional, shown in expanded mode) -->
              <div v-if="viewMode === 'expanded' && showPreview" class="preview-panel">
                <ComponentPreview
                  :component="previewComponent"
                  :tokens="previewTokens"
                  :show-token-list="false"
                  @token-edit="editTokenFromPreview"
                  @token-select="selectTokenFromPreview"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="configurator-footer">
        <div class="footer-info">
          <span v-if="modifiedTokenCount > 0" class="modified-count">
            <i class="pi pi-info-circle mr-1"></i>
            {{ modifiedTokenCount }} modified tokens
          </span>
        </div>
        <div class="footer-actions">
          <Button
            label="Reset All"
            severity="secondary"
            text
            size="small"
            :disabled="modifiedTokenCount === 0"
            @click="resetAllChanges"
          />
          <Button
            label="Apply Changes"
            severity="primary"
            size="small"
            :disabled="modifiedTokenCount === 0"
            @click="applyChanges"
          />
        </div>
      </div>
    </Drawer>

    <!-- Component Preview Dialog -->
    <Dialog
      v-model:visible="showComponentPreviewDialog"
      header="Component Preview"
      :modal="true"
      :style="{ width: '80vw', height: '70vh' }"
      :maximizable="true"
    >
      <ComponentPreview
        :component="previewComponent"
        :tokens="previewTokens"
        :show-token-list="true"
        @token-edit="editTokenFromPreview"
        @token-select="selectTokenFromPreview"
      />
    </Dialog>

    <!-- Token Relationships Dialog -->
    <Dialog
      v-model:visible="showRelationshipsDialog"
      header="Token Relationships"
      :modal="true"
      :style="{ width: '60vw', height: '50vh' }"
    >
      <TokenRelationships
        v-if="selectedToken"
        :token="selectedToken"
        @token-select="onTokenSelect"
        @component-view="onComponentView"
      />
    </Dialog>

    <!-- Preset Manager Dialog -->
    <Dialog
      v-model:visible="showPresetManagerDialog"
      header="Preset Manager"
      :modal="true"
      :style="{ width: '70vw', height: '60vh' }"
    >
      <PresetEditor
        v-if="selectedPreset"
        :preset="selectedPreset"
        @update="updatePreset"
        @save="savePreset"
        @delete="deletePreset"
      />
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useThemeAdvancedStore } from '@/stores/theme/advanced.store'
import { useThemePresetStore } from '@/stores/theme'
import { TokenRegistry } from '@/themes/core'
import { TokenDiscovery } from '@/themes/core/token-discovery'
import TokenNavigationTree from './TokenNavigationTree.vue'
import ComponentNavigationTree from './ComponentNavigationTree.vue'
import PresetNavigationList from './PresetNavigationList.vue'
import TokenValueEditor from './TokenValueEditor.vue'
import TokenRelationships from './TokenRelationships.vue'
import PresetEditor from './PresetEditor.vue'
import BaseThemeSelector from './BaseThemeSelector.vue'
import type { DesignToken, ThemePreset, ViewMode, BaseTheme } from '@/themes/presets/preset.types'

const props = defineProps<{
  visible?: boolean
  position?: 'left' | 'right'
  defaultTab?: number
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  apply: []
  export: []
}>()

// Stores
const advancedStore = useThemeAdvancedStore()
const presetStore = useThemePresetStore()
const _registry = TokenRegistry.getInstance()

// State
const isOpen = ref(props.visible || false)
const viewMode = ref<'compact' | 'expanded'>(advancedStore.viewMode === 'sidebar' ? 'compact' : advancedStore.viewMode as 'compact' | 'expanded')
const tabValues = ['tokens', 'components', 'presets']
const activeTab = ref(props.defaultTab || 0)
const activeTabValue = ref(tabValues[activeTab.value] || 'tokens')
const searchQuery = ref('')
const _tokenFilter = ref('')
const showPreview = ref(false)
const showComponentPreviewDialog = ref(false)
const showRelationshipsDialog = ref(false)
const showPresetManagerDialog = ref(false)
const showBaseThemeSelector = ref(false)
const currentBaseTheme = ref<BaseTheme>('Material')

// Selection state
const selectedTokenGroup = ref<any>(null)
const selectedComponent = ref<any>(null)
const selectedPreset = ref<ThemePreset | null>(null)
const selectedToken = ref<DesignToken | null>(null)
const currentSelection = ref<any>(null)

// Component tokens
const componentTokens = ref<DesignToken[]>([])
const previewComponent = ref<string>('')
const previewTokens = ref<DesignToken[]>([])

// Computed
const drawerHeight = computed(() => {
  if (viewMode.value === 'expanded') {
    return showPreview.value ? '45vh' : '40vh'
  }
  return '35vh'
})

const tabItems = computed(() => [
  { label: 'Tokens', icon: 'pi pi-circle', value: 'tokens' },
  { label: 'Components', icon: 'pi pi-box', value: 'components' },
  { label: 'Presets', icon: 'pi pi-palette', value: 'presets' }
])

const breadcrumbItems = computed(() => {
  const items = []
  
  if (activeTabValue.value === 'tokens' && selectedTokenGroup.value) {
    items.push({ label: 'Tokens', icon: 'pi pi-circle' })
    items.push({ label: selectedTokenGroup.value.label })
  } else if (activeTabValue.value === 'components' && selectedComponent.value) {
    items.push({ label: 'Components', icon: 'pi pi-box' })
    items.push({ label: selectedComponent.value.category })
    items.push({ label: selectedComponent.value.label })
  } else if (activeTabValue.value === 'presets' && selectedPreset.value) {
    items.push({ label: 'Presets', icon: 'pi pi-palette' })
    items.push({ label: selectedPreset.value.name })
  }
  
  return items
})

const modifiedTokenCount = computed(() => advancedStore.modifiedTokenCount)

// Methods
function toggleViewMode() {
  viewMode.value = viewMode.value === 'compact' ? 'expanded' : 'compact'
  advancedStore.setViewMode(viewMode.value as ViewMode)
}

function close() {
  isOpen.value = false
  emit('update:visible', false)
}

function exportTheme() {
  emit('export')
}

function resetChanges() {
  if (confirm('Reset all unsaved changes?')) {
    advancedStore.resetAllChanges()
  }
}

function resetAllChanges() {
  resetChanges()
}

function applyChanges() {
  advancedStore.applyChanges()
  emit('apply')
}

// Token handling
function onTokenGroupSelect(group: any) {
  selectedTokenGroup.value = group
  currentSelection.value = group
}

function updateToken(token: DesignToken, value: any) {
  advancedStore.updateToken(token.id, value)
}

function _resetToken(token: DesignToken) {
  advancedStore.resetToken(token.id)
}

function _isTokenModified(token: DesignToken): boolean {
  return advancedStore.isTokenModified(token.id)
}

function getTokenValue(token: DesignToken): any {
  return advancedStore.getTokenValue(token.id) || token.value
}

function handleTokenValidation(token: DesignToken, valid: boolean, error?: string) {
  if (!valid && error) {
    // You could store validation errors in the store or show a toast
    console.warn(`Validation error for token ${token.id}: ${error}`)
  }
}

function _showTokenRelationships(token: DesignToken) {
  selectedToken.value = token
  showRelationshipsDialog.value = true
}

function onTokenSelect(token: DesignToken) {
  selectedToken.value = token
  // Optionally close the relationships dialog and show the selected token
  showRelationshipsDialog.value = false
  
  // Find and select the token in the navigation
  const tokenGroup = {
    key: `${token.category}-${token.subcategory || 'default'}`,
    tokens: [token],
    label: token.label
  }
  onTokenGroupSelect(tokenGroup)
}

function onComponentView(component: string) {
  // Switch to component tab and select the component
  activeTab.value = 1
  showRelationshipsDialog.value = false
  
  const componentData = {
    key: component,
    label: formatComponentName(component),
    icon: getComponentIcon(component)
  }
  onComponentSelect(componentData)
}

function formatComponentName(name: string): string {
  return name.split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Base Theme Selection Methods
function startNewThemeCreation() {
  showBaseThemeSelector.value = true
}

function cancelThemeCreation() {
  showBaseThemeSelector.value = false
}

async function onThemeSelected(baseTheme: BaseTheme, discoveredTokens: Map<string, any>) {
  try {
    console.log(`🎨 Setting up configurator with ${baseTheme} theme`)
    
    // Update current base theme
    currentBaseTheme.value = baseTheme
    
    // Set discovered tokens in the advanced store
    advancedStore.setDiscoveredTokens(discoveredTokens)
    
    // Hide the selector
    showBaseThemeSelector.value = false
    
    // Switch to tokens tab to show discovered tokens
    activeTab.value = 0
    activeTabValue.value = 'tokens'
    
    console.log(`✅ Configurator ready with ${discoveredTokens.size} token groups from ${baseTheme}`)
    
  } catch (error) {
    console.error('Failed to set up theme configuration:', error)
  }
}

async function refreshTokenDiscovery() {
  if (!currentBaseTheme.value) return
  
  try {
    console.log(`🔄 Refreshing token discovery for ${currentBaseTheme.value}`)
    
    // Clear cache and re-discover
    TokenDiscovery.clearCache()
    const tokens = await TokenDiscovery.discoverAllTokens(currentBaseTheme.value)
    
    // Update store
    advancedStore.setDiscoveredTokens(tokens)
    
    console.log(`✅ Token discovery refreshed: ${tokens.size} groups`)
    
  } catch (error) {
    console.error('Failed to refresh token discovery:', error)
  }
}

function getComponentIcon(component: string): string {
  const icons: Record<string, string> = {
    button: 'pi pi-plus-circle',
    inputtext: 'pi pi-pencil',
    select: 'pi pi-chevron-down',
    datatable: 'pi pi-table',
    dialog: 'pi pi-window-maximize',
    card: 'pi pi-id-card'
  }
  return icons[component.toLowerCase()] || 'pi pi-box'
}

// Component handling
async function onComponentSelect(component: any) {
  selectedComponent.value = component
  currentSelection.value = component
  
  // Load component tokens
  const tokens = await TokenDiscovery.discoverComponentTokens(component.key)
  componentTokens.value = tokens
}

function _openComponentPreview() {
  if (selectedComponent.value) {
    previewComponent.value = selectedComponent.value.key
    previewTokens.value = componentTokens.value
    
    if (viewMode.value === 'expanded') {
      showPreview.value = true
    } else {
      showComponentPreviewDialog.value = true
    }
  }
}

// Preset handling
function onPresetSelect(preset: ThemePreset) {
  selectedPreset.value = preset
  currentSelection.value = preset
}

function updatePreset(preset: ThemePreset) {
  // Update the preset in the store
  presetStore.updatePreset(preset)
}

function savePreset(preset: ThemePreset) {
  // Save the preset to the store
  presetStore.updatePreset(preset)
  selectedPreset.value = preset
}

function deletePreset(presetId: string) {
  // Delete the preset from the store
  presetStore.deletePreset(presetId)
  selectedPreset.value = null
  currentSelection.value = null
}

function openPresetManager() {
  showPresetManagerDialog.value = true
}

function editTokenFromPreview(token: DesignToken) {
  // For now, just select the token
  // In Phase 5, this will open the token editor
  selectedToken.value = token
  showRelationshipsDialog.value = true
}

function selectTokenFromPreview(token: DesignToken) {
  selectedToken.value = token
  showRelationshipsDialog.value = true
}

// Lifecycle
onMounted(async () => {
  // Always refresh tokens to ensure proper subcategories
  await advancedStore.refreshTokens()
})

// Watchers
watch(() => props.visible, (newVal) => {
  isOpen.value = newVal
})

watch(isOpen, (newVal) => {
  emit('update:visible', newVal)
})
</script>

<style scoped>
.theme-configurator-advanced {
  --header-height: 120px;
  --footer-height: 60px;
}

.theme-drawer :deep(.p-drawer-content) {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Header */
.configurator-header {
  height: var(--header-height);
  border-bottom: 1px solid var(--p-surface-200);
  background-color: var(--p-surface-0);
  padding: 1rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.header-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.view-tabs :deep(.p-tabmenu) {
  border: none;
}

/* Content Area */
.configurator-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.sidebar-navigation {
  width: 280px;
  border-right: 1px solid var(--p-surface-200);
  overflow-y: auto;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.preview-panel {
  width: 400px;
  border-left: 1px solid var(--p-surface-200);
  padding: 1rem;
  overflow-y: auto;
}

/* Breadcrumb */
.content-breadcrumb {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--p-surface-200);
}

/* Editor Area */
.editor-area {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}

.editor-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

/* Token Grid */
.token-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.token-card {
  padding: 1rem;
  border: 1px solid var(--p-surface-200);
  border-radius: var(--p-borderRadius);
  background-color: var(--p-surface-50);
}

.token-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
}

.token-name {
  font-weight: 600;
}

.token-actions {
  display: flex;
  gap: 0.25rem;
  margin-top: 0.5rem;
}

/* Component Editor */
.component-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.table-header {
  padding: 0.5rem 0;
}

.token-label {
  display: flex;
  align-items: center;
}

.compact-table :deep(.p-datatable-thead > tr > th) {
  padding: 0.5rem;
}

.compact-table :deep(.p-datatable-tbody > tr > td) {
  padding: 0.5rem;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
}

/* Footer */
.configurator-footer {
  height: var(--footer-height);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;
  border-top: 1px solid var(--p-surface-200);
  background-color: var(--p-surface-0);
}

.footer-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.modified-count {
  color: var(--p-warning-500);
  font-size: 0.875rem;
}

.footer-actions {
  display: flex;
  gap: 0.5rem;
}

/* Bottom Drawer Layout */
.theme-drawer-bottom {
  z-index: 1000;
}

.configurator-content-bottom {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.bottom-drawer-layout {
  display: flex;
  height: 100%;
  gap: 1rem;
  padding: 1rem;
}

.navigation-panel {
  width: 280px;
  flex-shrink: 0;
  background: var(--p-surface-50);
  border-radius: var(--p-border-radius);
  border: 1px solid var(--p-surface-200);
  overflow-y: auto;
}

.editor-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--p-surface-0);
  border-radius: var(--p-border-radius);
  border: 1px solid var(--p-surface-200);
  overflow: hidden;
}

.content-breadcrumb-bottom {
  padding: 1rem;
  border-bottom: 1px solid var(--p-surface-200);
}

.editor-area-bottom {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}

.token-grid-bottom {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

/* Base Theme Selector Overlay for Bottom Drawer */
.base-theme-overlay-bottom {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(6px);
  z-index: 100;
  padding: 2rem;
  overflow-y: auto;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.dark .base-theme-overlay-bottom {
  background-color: rgba(0, 0, 0, 0.98);
}

.dark .navigation-panel {
  background: var(--p-surface-800);
  border-color: var(--p-surface-700);
}

.dark .editor-panel {
  background: var(--p-surface-900);
  border-color: var(--p-surface-700);
}

.dark .content-breadcrumb-bottom {
  border-color: var(--p-surface-700);
}

/* Current Theme Badge */
.current-theme-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  background-color: var(--p-surface-50);
  border-radius: var(--p-border-radius);
  border: 1px solid var(--p-surface-200);
}

.dark .current-theme-badge {
  background-color: var(--p-surface-800);
  border-color: var(--p-surface-700);
}

/* Dark mode adjustments */
.dark .configurator-header,
.dark .configurator-footer {
  background-color: var(--p-surface-900);
}

.dark .configurator-header,
.dark .sidebar-navigation,
.dark .content-breadcrumb,
.dark .preview-panel,
.dark .configurator-footer {
  border-color: var(--p-surface-700);
}

.dark .token-card {
  background-color: var(--p-surface-800);
  border-color: var(--p-surface-700);
}
</style>