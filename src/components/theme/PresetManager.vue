<template>
  <Dialog
    v-model:visible="localVisible"
    header="Manage Theme Presets"
    :style="{ width: '800px' }"
    :modal="true"
    maximizable
  >
    <div class="space-y-4">
      <!-- Header Actions -->
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-muted">
            Manage your theme presets. Create, edit, duplicate, and delete custom themes.
          </p>
          <div class="text-xs text-muted mt-1">
            {{ presetStore.userPresets.length }} custom /
            {{ presetStore.builtInPresets.length }} built-in presets
          </div>
        </div>

        <div class="flex gap-2">
          <Button label="Create New" icon="pi pi-plus" @click="createNewPreset" size="small" />

          <Button
            label="Import"
            icon="pi pi-upload"
            severity="secondary"
            @click="triggerImport"
            size="small"
          />
        </div>
      </div>

      <!-- Filter Tabs -->
      <Tabs value="all">
        <TabList>
          <Tab value="all">All Presets</Tab>
          <Tab value="builtin">Built-in</Tab>
          <Tab value="custom">Custom</Tab>
        </TabList>
        <TabPanels>
          <TabPanel value="all">
            <PresetGrid
              :presets="allPresets"
              :active-preset-id="presetStore.activePreset?.id"
              @activate="activatePreset"
              @edit="editPreset"
              @duplicate="duplicatePreset"
              @delete="deletePreset"
            />
          </TabPanel>

          <TabPanel value="builtin">
            <PresetGrid
              :presets="presetStore.builtInPresets"
              :active-preset-id="presetStore.activePreset?.id"
              @activate="activatePreset"
              @edit="editPreset"
              @duplicate="duplicatePreset"
              @delete="deletePreset"
            />
          </TabPanel>

          <TabPanel value="custom">
            <PresetGrid
              :presets="presetStore.userPresets"
              :active-preset-id="presetStore.activePreset?.id"
              @activate="activatePreset"
              @edit="editPreset"
              @duplicate="duplicatePreset"
              @delete="deletePreset"
              :show-empty-state="presetStore.userPresets.length === 0"
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>

    <!-- Hidden file input for import -->
    <input
      ref="fileInput"
      type="file"
      accept=".json"
      @change="handleFileImport"
      style="display: none"
    />

    <!-- Edit Preset Dialog -->
    <Dialog
      v-model:visible="showEditDialog"
      header="Edit Preset"
      :style="{ width: '500px' }"
      :modal="true"
    >
      <div class="space-y-4" v-if="editingPreset">
        <div>
          <label class="block text-sm font-medium mb-2">Preset Name</label>
          <InputText v-model="editingPreset.name" class="w-full" placeholder="Enter preset name" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Description</label>
          <Textarea
            v-model="editingPreset.description"
            class="w-full"
            rows="3"
            placeholder="Describe this theme preset..."
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Tags</label>
          <InputText
            v-model="tagsInput"
            class="w-full"
            placeholder="dark, professional, blue (comma-separated)"
          />
        </div>

        <div class="flex items-center justify-between">
          <span class="text-sm">Set as default preset</span>
          <ToggleSwitch
            v-model="editingPreset.metadata.isDefault"
            :disabled="editingPreset.metadata.isBuiltIn"
          />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <Button label="Cancel" severity="secondary" @click="cancelEdit" />
          <Button label="Save Changes" @click="saveEdit" :disabled="!editingPreset?.name?.trim()" />
        </div>
      </template>
    </Dialog>

    <template #footer>
      <div class="flex justify-between items-center">
        <div class="text-xs text-muted">
          Storage: {{ storageInfo.used }}% used ({{ storageInfo.presets }} presets)
        </div>

        <Button label="Close" @click="closeDialog" />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useThemePresetStore, useThemeConfigStore } from '@/stores/theme'
import { useToast } from 'primevue/usetoast'
import type { ThemePreset } from '@/themes/presets/preset.types'
import PresetGrid from './PresetGrid.vue'

interface Props {
  visible: boolean
}

interface Emits {
  'update:visible': [visible: boolean]
  'preset-changed': []
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const presetStore = useThemePresetStore()
const configStore = useThemeConfigStore()
const toast = useToast()

// Local state
const showEditDialog = ref(false)
const editingPreset = ref<ThemePreset | null>(null)
const fileInput = ref<HTMLInputElement>()
const tagsInput = ref('')

const localVisible = computed({
  get: () => props.visible,
  set: value => emit('update:visible', value),
})

// Computed data
const allPresets = computed(() => [...presetStore.builtInPresets, ...presetStore.userPresets])

const storageInfo = computed(() => {
  const totalPresets = presetStore.userPresets.length + presetStore.builtInPresets.length
  const maxPresets = configStore.config.maxSavedPresets || 30
  const usedPercentage = Math.round((presetStore.userPresets.length / maxPresets) * 100)

  return {
    used: usedPercentage,
    presets: totalPresets,
  }
})

// Watch for editing preset changes
watch(
  () => editingPreset.value,
  preset => {
    if (preset) {
      tagsInput.value = preset.metadata.tags?.join(', ') || ''
    }
  },
  { immediate: true }
)

// Event handlers
async function activatePreset(preset: ThemePreset) {
  try {
    await presetStore.activatePreset(preset)
    emit('preset-changed')

    toast.add({
      severity: 'success',
      summary: 'Preset Activated',
      detail: `Switched to ${preset.name}`,
      life: 3000,
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Activation Failed',
      detail: error instanceof Error ? error.message : 'Unknown error',
      life: 5000,
    })
  }
}

function editPreset(preset: ThemePreset) {
  if (preset.metadata.isBuiltIn) {
    toast.add({
      severity: 'warn',
      summary: 'Cannot Edit',
      detail: 'Built-in presets cannot be edited. Try duplicating it instead.',
      life: 4000,
    })
    return
  }

  editingPreset.value = { ...preset }
  showEditDialog.value = true
}

async function duplicatePreset(preset: ThemePreset) {
  try {
    const duplicatedPreset = await presetStore.duplicatePreset(preset.id, `${preset.name} Copy`)
    emit('preset-changed')

    toast.add({
      severity: 'success',
      summary: 'Preset Duplicated',
      detail: `Created copy: ${duplicatedPreset.name}`,
      life: 3000,
    })

    // Open edit dialog for the new preset
    editPreset(duplicatedPreset)
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Duplication Failed',
      detail: error instanceof Error ? error.message : 'Unknown error',
      life: 5000,
    })
  }
}

async function deletePreset(preset: ThemePreset) {
  if (preset.metadata.isBuiltIn) {
    toast.add({
      severity: 'warn',
      summary: 'Cannot Delete',
      detail: 'Built-in presets cannot be deleted.',
      life: 4000,
    })
    return
  }

  try {
    await presetStore.deletePreset(preset.id)
    emit('preset-changed')

    toast.add({
      severity: 'info',
      summary: 'Preset Deleted',
      detail: `${preset.name} has been removed`,
      life: 3000,
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Deletion Failed',
      detail: error instanceof Error ? error.message : 'Unknown error',
      life: 5000,
    })
  }
}

async function createNewPreset() {
  try {
    const newPreset = await presetStore.createPreset('New Theme', 'Custom theme preset')
    emit('preset-changed')

    toast.add({
      severity: 'success',
      summary: 'Preset Created',
      detail: `${newPreset.name} is ready to customize`,
      life: 3000,
    })

    // Edit the new preset
    editPreset(newPreset)
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Creation Failed',
      detail: error instanceof Error ? error.message : 'Unknown error',
      life: 5000,
    })
  }
}

function triggerImport() {
  fileInput.value?.click()
}

async function handleFileImport(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  try {
    await presetStore.importPreset(file)
    emit('preset-changed')

    toast.add({
      severity: 'success',
      summary: 'Theme Imported',
      detail: 'Preset imported and activated successfully',
      life: 3000,
    })

    // Imported preset is ready
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Import Failed',
      detail: error instanceof Error ? error.message : 'Invalid theme file',
      life: 5000,
    })
  }

  // Reset file input
  target.value = ''
}

async function saveEdit() {
  if (!editingPreset.value?.name?.trim()) return

  try {
    // Parse tags
    const tags = tagsInput.value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)

    editingPreset.value.metadata.tags = tags

    await presetStore.updatePreset(editingPreset.value)
    emit('preset-changed')

    toast.add({
      severity: 'success',
      summary: 'Preset Updated',
      detail: `${editingPreset.value.name} has been saved`,
      life: 3000,
    })

    showEditDialog.value = false
    editingPreset.value = null
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Save Failed',
      detail: error instanceof Error ? error.message : 'Unknown error',
      life: 5000,
    })
  }
}

function cancelEdit() {
  showEditDialog.value = false
  editingPreset.value = null
  tagsInput.value = ''
}

function closeDialog() {
  emit('update:visible', false)
}
</script>

<style scoped>
.space-y-4 > * + * {
  margin-top: 1rem;
}
</style>
