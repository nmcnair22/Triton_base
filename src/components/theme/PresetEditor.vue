<template>
  <div class="preset-editor">
    <!-- Preset Header -->
    <div class="preset-header">
      <div class="preset-info">
        <h4>{{ preset.name }}</h4>
        <p class="preset-description">{{ preset.description || 'Custom theme preset' }}</p>
        <div class="preset-metadata">
          <Tag 
            :value="preset.baseTheme" 
            :severity="preset.baseTheme === ('material' as any) ? 'info' : 'success'"
            icon="pi pi-palette"
          />
          <Tag 
            v-if="preset.metadata.isDefault" 
            value="Default" 
            severity="warning"
            icon="pi pi-star-fill"
          />
          <Tag 
            v-if="preset.metadata.isBuiltIn" 
            value="Built-in" 
            severity="secondary"
            icon="pi pi-lock"
          />
          <span class="metadata-text">
            <i class="pi pi-calendar mr-1"></i>
            Modified {{ formatDate(preset.metadata.modified) }}
          </span>
        </div>
      </div>
      
      <div class="preset-actions">
        <Button
          label="Duplicate"
          icon="pi pi-copy"
          severity="secondary"
          @click="duplicatePreset"
        />
        <Button
          label="Export"
          icon="pi pi-download"
          severity="secondary"
          @click="exportPreset"
        />
        <Button
          v-if="!preset.metadata.isBuiltIn"
          label="Delete"
          icon="pi pi-trash"
          severity="danger"
          text
          @click="confirmDelete"
        />
      </div>
    </div>

    <!-- Edit Mode Toggle -->
    <div class="edit-mode-toggle" v-if="!preset.metadata.isBuiltIn">
      <ToggleSwitch
        v-model="editMode"
        inputId="edit-mode"
      />
      <label for="edit-mode" class="ml-2">Edit Mode</label>
    </div>

    <!-- Preset Details (Editable) -->
    <div v-if="editMode && !preset.metadata.isBuiltIn" class="preset-details-edit">
      <div class="detail-group">
        <label>Preset Name</label>
        <InputText 
          v-model="editedPreset.name" 
          placeholder="Enter preset name"
          :class="{ 'p-invalid': !isValidName }"
        />
        <small v-if="!isValidName" class="p-error">Name is required</small>
      </div>
      
      <div class="detail-group">
        <label>Description</label>
        <Textarea 
          v-model="editedPreset.description" 
          placeholder="Enter preset description"
          rows="3"
          autoResize
        />
      </div>
      
      <div class="detail-group">
        <label>Base Theme</label>
        <Select
          v-model="editedPreset.baseTheme"
          :options="baseThemeOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Select base theme"
        />
      </div>
      
      <div class="detail-group">
        <label>Tags</label>
        <div class="tags-input">
          <Tag 
            v-for="(tag, index) in editedPreset.metadata.tags" 
            :key="index"
            :value="tag"
            removable
            @remove="removeTag(index)"
            class="mr-2 mb-2"
          />
          <InputText
            v-model="newTag"
            placeholder="Add tag..."
            @keyup.enter="addTag"
            class="tag-input"
          />
        </div>
      </div>
    </div>

    <!-- Token Overview -->
    <div class="token-overview">
      <h5>Token Overview</h5>
      <div class="overview-stats">
        <div class="stat-card">
          <span class="stat-value">{{ tokenStats.total }}</span>
          <span class="stat-label">Total Tokens</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ tokenStats.modified }}</span>
          <span class="stat-label">Modified</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ tokenStats.primitive }}</span>
          <span class="stat-label">Primitive</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ tokenStats.semantic }}</span>
          <span class="stat-label">Semantic</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ tokenStats.component }}</span>
          <span class="stat-label">Component</span>
        </div>
      </div>
    </div>

    <!-- Token Categories -->
    <div class="token-categories">
      <TabView>
        <TabPanel header="Primitive Tokens" value="primitive">
          <div class="token-category-content">
            <div class="category-header">
              <p>Base design tokens that define your color palette, spacing, and typography</p>
              <Button
                v-if="editMode"
                label="Add Token"
                icon="pi pi-plus"
                size="small"
                @click="addToken('primitive')"
              />
            </div>
            
            <div class="token-groups">
              <div 
                v-for="(group, groupName) in groupedTokens.primitive" 
                :key="groupName"
                class="token-group"
              >
                <h6>{{ formatGroupName(groupName) }}</h6>
                <div class="token-list">
                  <div 
                    v-for="token in group" 
                    :key="token.id"
                    class="token-item"
                    :class="{ 'modified': isTokenModified(token) }"
                  >
                    <div class="token-info">
                      <span class="token-label">{{ token.label }}</span>
                      <code class="token-path">{{ token.path }}</code>
                    </div>
                    <TokenValueEditor
                      :token="token"
                      :value="getTokenValue(token)"
                      :compact="true"
                      :showTokenInfo="false"
                      @update="(value) => updateToken(token, value)"
                      @validate="(valid, error) => handleValidation(token, valid, error)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabPanel>
        
        <TabPanel header="Semantic Tokens" value="semantic">
          <div class="token-category-content">
            <div class="category-header">
              <p>Purpose-driven tokens that reference primitive tokens</p>
              <Button
                v-if="editMode"
                label="Add Token"
                icon="pi pi-plus"
                size="small"
                @click="addToken('semantic')"
              />
            </div>
            
            <div class="token-groups">
              <div 
                v-for="(group, groupName) in groupedTokens.semantic" 
                :key="groupName"
                class="token-group"
              >
                <h6>{{ formatGroupName(groupName) }}</h6>
                <div class="token-list">
                  <div 
                    v-for="token in group" 
                    :key="token.id"
                    class="token-item"
                    :class="{ 'modified': isTokenModified(token) }"
                  >
                    <div class="token-info">
                      <span class="token-label">{{ token.label }}</span>
                      <code class="token-path">{{ token.path }}</code>
                    </div>
                    <TokenValueEditor
                      :token="token"
                      :value="getTokenValue(token)"
                      :compact="true"
                      :showTokenInfo="false"
                      @update="(value) => updateToken(token, value)"
                      @validate="(valid, error) => handleValidation(token, valid, error)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabPanel>
        
        <TabPanel header="Component Tokens" value="component">
          <div class="token-category-content">
            <div class="category-header">
              <p>Component-specific design tokens</p>
            </div>
            
            <Accordion>
              <AccordionPanel 
                v-for="(tokens, component) in groupedTokens.component" 
                :key="component"
                :value="component"
              >
                <AccordionHeader>
                  <span class="component-header">
                    <i :class="getComponentIcon(String(component))" class="mr-2"></i>
                    {{ formatComponentName(String(component)) }}
                    <Badge :value="String(tokens.length)" severity="secondary" class="ml-2" />
                  </span>
                </AccordionHeader>
                <AccordionContent>
                  <div class="token-list">
                    <div 
                      v-for="token in tokens" 
                      :key="token.id"
                      class="token-item"
                      :class="{ 'modified': isTokenModified(token) }"
                    >
                      <div class="token-info">
                        <span class="token-label">{{ token.label }}</span>
                        <code class="token-path">{{ token.path }}</code>
                      </div>
                      <TokenValueEditor
                        :token="token"
                        :value="getTokenValue(token)"
                        :compact="true"
                        :showTokenInfo="false"
                        @update="(value) => updateToken(token, value)"
                        @validate="(valid, error) => handleValidation(token, valid, error)"
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionPanel>
            </Accordion>
          </div>
        </TabPanel>
        
        <TabPanel header="Custom Tokens" value="custom" v-if="hasCustomTokens">
          <div class="token-category-content">
            <div class="category-header">
              <p>User-defined custom tokens</p>
              <Button
                v-if="editMode"
                label="Add Token"
                icon="pi pi-plus"
                size="small"
                @click="addToken('custom')"
              />
            </div>
            
            <div class="token-list">
              <div 
                v-for="token in customTokens" 
                :key="token.id"
                class="token-item"
                :class="{ 'modified': isTokenModified(token) }"
              >
                <div class="token-info">
                  <span class="token-label">{{ token.label }}</span>
                  <code class="token-path">{{ token.path }}</code>
                  <Button
                    v-if="editMode"
                    icon="pi pi-times"
                    severity="danger"
                    text
                    rounded
                    size="small"
                    @click="removeToken(token)"
                  />
                </div>
                <TokenValueEditor
                  :token="token"
                  :value="getTokenValue(token)"
                  :compact="true"
                  :showTokenInfo="false"
                  @update="(value) => updateToken(token, value)"
                  @validate="(valid, error) => handleValidation(token, valid, error)"
                />
              </div>
            </div>
          </div>
        </TabPanel>
      </TabView>
    </div>

    <!-- Save Actions -->
    <div v-if="editMode && hasChanges" class="save-actions">
      <Button
        label="Cancel"
        severity="secondary"
        text
        @click="cancelChanges"
      />
      <Button
        label="Save Changes"
        icon="pi pi-save"
        severity="primary"
        @click="saveChanges"
        :disabled="!isValid"
      />
    </div>

    <!-- Delete Confirmation -->
    <Dialog
      v-model:visible="showDeleteDialog"
      header="Delete Preset"
      :modal="true"
      :style="{ width: '400px' }"
    >
      <p>Are you sure you want to delete the preset "{{ preset.name }}"?</p>
      <p class="text-warning mt-2">
        <i class="pi pi-exclamation-triangle mr-2"></i>
        This action cannot be undone.
      </p>
      <template #footer>
        <Button 
          label="Cancel" 
          severity="secondary" 
          text 
          @click="showDeleteDialog = false" 
        />
        <Button 
          label="Delete" 
          severity="danger" 
          @click="deletePreset" 
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useThemePresetStore } from '@/stores/theme'
import { useThemeAdvancedStore } from '@/stores/theme/advanced.store'
import TokenValueEditor from './TokenValueEditor.vue'
import type { ThemePreset, DesignToken, TokenCategory } from '@/themes/presets/preset.types'
import { useToast } from 'primevue/usetoast'

const props = defineProps<{
  preset: ThemePreset
}>()

const emit = defineEmits<{
  update: [preset: ThemePreset]
  save: [preset: ThemePreset]
  delete: [presetId: string]
}>()

// Stores
const presetStore = useThemePresetStore()
const advancedStore = useThemeAdvancedStore()
const toast = useToast()

// State
const editMode = ref(false)
const editedPreset = ref<ThemePreset>(JSON.parse(JSON.stringify(props.preset)))
const showDeleteDialog = ref(false)
const newTag = ref('')
const validationErrors = ref<Record<string, string>>({})

// Constants
const baseThemeOptions = [
  { label: 'Material Design', value: 'material' },
  { label: 'Bootstrap', value: 'bootstrap' },
  { label: 'Tailwind', value: 'tailwind' }
]

const componentIcons: Record<string, string> = {
  button: 'pi pi-plus-circle',
  inputtext: 'pi pi-pencil',
  select: 'pi pi-chevron-down',
  datatable: 'pi pi-table',
  dialog: 'pi pi-window-maximize',
  card: 'pi pi-id-card'
}

// Computed
const tokenStats = computed(() => {
  const tokens = editedPreset.value.tokens
  if (!tokens) return { total: 0, modified: 0, primitive: 0, semantic: 0, component: 0 }
  
  const stats = {
    total: 0,
    modified: 0,
    primitive: Object.keys(tokens.primitive || {}).length,
    semantic: Object.keys(tokens.semantic || {}).length,
    component: Object.values(tokens.component || {}).reduce((sum: number, comp: any) => sum + Object.keys(comp).length, 0),
    custom: Object.keys(tokens.custom || {}).length
  }
  
  stats.total = stats.primitive + stats.semantic + stats.component + stats.custom
  
  // Count modified tokens
  const allTokens = [
    ...Object.values(tokens.primitive || {}),
    ...Object.values(tokens.semantic || {}),
    ...Object.values(tokens.component || {}).flatMap((comp: any) => Object.values(comp)),
    ...Object.values(tokens.custom || {})
  ] as DesignToken[]
  
  stats.modified = allTokens.filter(token => isTokenModified(token)).length
  
  return stats
})

const groupedTokens = computed(() => {
  const tokens = editedPreset.value.tokens
  if (!tokens) return { primitive: {}, semantic: {}, component: {}, custom: [] }
  
  return {
    primitive: groupTokensBySubcategory(Object.values(tokens.primitive || {})),
    semantic: groupTokensBySubcategory(Object.values(tokens.semantic || {})),
    component: tokens.component || {},
    custom: Object.values(tokens.custom || {}) as DesignToken[]
  }
})

const customTokens = computed((): DesignToken[] => {
  return groupedTokens.value.custom as DesignToken[]
})

const hasCustomTokens = computed(() => {
  return customTokens.value.length > 0 || editMode.value
})

const hasChanges = computed(() => {
  return JSON.stringify(editedPreset.value) !== JSON.stringify(props.preset)
})

const isValidName = computed(() => {
  return editedPreset.value.name && editedPreset.value.name.trim().length > 0
})

const isValid = computed(() => {
  return isValidName.value && Object.keys(validationErrors.value).length === 0
})

// Methods
function groupTokensBySubcategory(tokens: DesignToken[]): Record<string, DesignToken[]> {
  const groups: Record<string, DesignToken[]> = {}
  
  tokens.forEach(token => {
    const groupKey = token.subcategory || token.path.split('.')[0] || 'other'
    if (!groups[groupKey]) {
      groups[groupKey] = []
    }
    groups[groupKey].push(token)
  })
  
  return groups
}

function formatGroupName(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1).replace(/[-_]/g, ' ')
}

function formatComponentName(name: string): string {
  return name.split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function getComponentIcon(component: string): string {
  return componentIcons[component.toLowerCase()] || 'pi pi-box'
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

function getTokenValue(token: DesignToken): any {
  // Check if there's a value in the edited preset
  const category = token.category
  const tokens = editedPreset.value.tokens
  
  if (tokens && tokens[category]) {
    if (category === 'component' && token.subcategory) {
      const componentTokens = tokens[category][token.subcategory]
      if (componentTokens && componentTokens[token.id]) {
        return componentTokens[token.id].value
      }
    } else {
      const categoryTokens = tokens[category] as Record<string, DesignToken>
      if (categoryTokens[token.id]) {
        return categoryTokens[token.id].value
      }
    }
  }
  
  return token.value
}

function isTokenModified(token: DesignToken): boolean {
  return getTokenValue(token) !== token.defaultValue
}

function updateToken(token: DesignToken, value: any) {
  if (!editMode.value) return
  
  const category = token.category
  if (!editedPreset.value.tokens) {
    editedPreset.value.tokens = {
      primitive: {},
      semantic: {},
      component: {},
      custom: {}
    }
  }
  
  const tokens = editedPreset.value.tokens
  
  if (category === 'component' && token.subcategory) {
    if (!tokens.component[token.subcategory]) {
      tokens.component[token.subcategory] = {}
    }
    tokens.component[token.subcategory][token.id] = { ...token, value }
  } else {
    tokens[category][token.id] = { ...token, value }
  }
  
  emit('update', editedPreset.value)
}

function handleValidation(token: DesignToken, valid: boolean, error?: string) {
  if (valid) {
    delete validationErrors.value[token.id]
  } else if (error) {
    validationErrors.value[token.id] = error
  }
}

function addTag() {
  if (newTag.value.trim()) {
    if (!editedPreset.value.metadata.tags) {
      editedPreset.value.metadata.tags = []
    }
    if (!editedPreset.value.metadata.tags.includes(newTag.value.trim())) {
      editedPreset.value.metadata.tags.push(newTag.value.trim())
      newTag.value = ''
    }
  }
}

function removeTag(index: number) {
  editedPreset.value.metadata.tags?.splice(index, 1)
}

function addToken(category: TokenCategory) {
  // TODO: Open dialog to create new token
  toast.add({
    severity: 'info',
    summary: 'Coming Soon',
    detail: `Add ${category} token functionality will be implemented`,
    life: 3000
  })
}

function removeToken(token: DesignToken) {
  // TODO: Remove custom token
  toast.add({
    severity: 'info',
    summary: 'Coming Soon',
    detail: 'Remove token functionality will be implemented',
    life: 3000
  })
}

async function duplicatePreset() {
  const newName = `${editedPreset.value.name} (Copy)`
  const newDescription = editedPreset.value.description ? `${editedPreset.value.description} (Copy)` : undefined
  
  // Create new preset with same base theme
  const newPreset = await presetStore.createPreset(
    newName,
    newDescription,
    editedPreset.value.baseTheme
  )
  
  // Copy over tokens and overrides
  if (editedPreset.value.tokens) {
    await presetStore.updatePreset({
      ...newPreset,
      tokens: JSON.parse(JSON.stringify(editedPreset.value.tokens)),
      colorOverrides: [...editedPreset.value.colorOverrides]
    })
  }
  
  toast?.add({
    severity: 'success',
    summary: 'Preset Duplicated',
    detail: `Created "${newName}"`,
    life: 3000
  })
}

function exportPreset() {
  // TODO: Implement export functionality
  toast.add({
    severity: 'info',
    summary: 'Coming Soon',
    detail: 'Export functionality will be implemented in Phase 6',
    life: 3000
  })
}

function confirmDelete() {
  if (!editedPreset.value.metadata.isBuiltIn) {
    showDeleteDialog.value = true
  }
}

function deletePreset() {
  emit('delete', editedPreset.value.id)
  showDeleteDialog.value = false
  toast?.add({
    severity: 'success',
    summary: 'Preset Deleted',
    detail: `Deleted "${editedPreset.value.name}"`,
    life: 3000
  })
}

function saveChanges() {
  if (isValid.value) {
    editedPreset.value.metadata.modified = new Date().toISOString()
    emit('save', editedPreset.value)
    editMode.value = false
    toast.add({
      severity: 'success',
      summary: 'Changes Saved',
      detail: 'Preset has been updated',
      life: 3000
    })
  }
}

function cancelChanges() {
  editedPreset.value = JSON.parse(JSON.stringify(props.preset))
  validationErrors.value = {}
  editMode.value = false
}

// Watch for external preset changes
watch(() => props.preset, (newPreset) => {
  if (!hasChanges.value) {
    editedPreset.value = JSON.parse(JSON.stringify(newPreset))
  }
}, { deep: true })
</script>

<style scoped>
.preset-editor {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: 100%;
  overflow-y: auto;
}

/* Preset Header */
.preset-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--p-surface-200);
}

.preset-info h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.preset-description {
  color: var(--p-text-muted-color);
  margin-bottom: 0.75rem;
}

.preset-metadata {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.metadata-text {
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
}

.preset-actions {
  display: flex;
  gap: 0.5rem;
}

/* Edit Mode */
.edit-mode-toggle {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background-color: var(--p-surface-50);
  border-radius: var(--p-border-radius);
}

.preset-details-edit {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  padding: 1rem;
  background-color: var(--p-surface-50);
  border-radius: var(--p-border-radius);
}

.detail-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-group label {
  font-weight: 600;
  font-size: 0.875rem;
}

.tags-input {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.tag-input {
  flex: 1;
  min-width: 120px;
}

/* Token Overview */
.token-overview {
  background-color: var(--p-surface-50);
  border-radius: var(--p-border-radius);
  padding: 1rem;
}

.token-overview h5 {
  margin: 0 0 1rem 0;
}

.overview-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 1rem;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background-color: white;
  border-radius: var(--p-border-radius);
  border: 1px solid var(--p-surface-200);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--p-primary-500);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
}

/* Token Categories */
.token-categories {
  flex: 1;
}

.token-category-content {
  padding: 1rem 0;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.category-header p {
  margin: 0;
  color: var(--p-text-muted-color);
}

/* Token Groups */
.token-groups {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.token-group h6 {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  color: var(--p-text-color);
}

/* Token List */
.token-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.token-item {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 1rem;
  align-items: center;
  padding: 0.75rem;
  background-color: var(--p-surface-50);
  border: 1px solid var(--p-surface-200);
  border-radius: var(--p-border-radius);
  transition: all 0.2s;
}

.token-item.modified {
  background-color: var(--p-primary-50);
  border-color: var(--p-primary-200);
}

.token-item:hover {
  border-color: var(--p-primary-300);
}

.token-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.token-label {
  font-weight: 600;
  font-size: 0.875rem;
}

.token-path {
  font-size: 0.75rem;
  padding: 0.125rem 0.375rem;
  background-color: var(--p-surface-100);
  border-radius: 3px;
  color: var(--p-text-muted-color);
}

/* Component Header */
.component-header {
  display: flex;
  align-items: center;
}

/* Save Actions */
.save-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem;
  background-color: var(--p-surface-50);
  border-radius: var(--p-border-radius);
  position: sticky;
  bottom: 0;
  z-index: 10;
}

/* Warnings */
.text-warning {
  color: var(--p-warning-500);
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .preset-details-edit,
  .token-overview,
  .stat-card,
  .token-item,
  .save-actions,
  .edit-mode-toggle {
    background-color: var(--p-surface-800);
  }
  
  .stat-card {
    border-color: var(--p-surface-700);
  }
  
  .token-item {
    background-color: var(--p-surface-800);
    border-color: var(--p-surface-700);
  }
  
  .token-item.modified {
    background-color: var(--p-primary-900);
    border-color: var(--p-primary-400);
  }
  
  .token-path {
    background-color: var(--p-surface-700);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .preset-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .preset-actions {
    width: 100%;
    justify-content: flex-start;
  }
  
  .token-item {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .overview-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>