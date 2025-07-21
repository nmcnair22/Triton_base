<template>
  <div class="theme-exporter space-y-4">
    <div>
      <h5 class="text-sm font-medium mb-2">Export Current Theme</h5>
      <Button
        label="Download Theme"
        icon="pi pi-download"
        size="small"
        class="w-full"
        @click="exportTheme"
        :disabled="!themeStore.activePreset"
      />
    </div>

    <div>
      <h5 class="text-sm font-medium mb-2">Import Theme</h5>
      <FileUpload
        mode="basic"
        accept=".json"
        :maxFileSize="1000000"
        @select="importTheme"
        :auto="true"
        chooseLabel="Import Theme File"
        class="w-full"
      />
    </div>

    <div class="text-xs text-muted">
      Themes are exported as JSON files that can be shared with others.
    </div>
  </div>
</template>

<script setup lang="ts">
import { useThemeStore } from '@/stores/theme.store'
import { useToast } from 'primevue/usetoast'

const themeStore = useThemeStore()
const toast = useToast()

async function exportTheme() {
  try {
    if (themeStore.activePreset) {
      await themeStore.exportPreset(themeStore.activePreset.id)
      toast.add({
        severity: 'success',
        summary: 'Theme Exported',
        detail: 'Theme file downloaded successfully',
        life: 3000,
      })
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Export Failed',
      detail: error instanceof Error ? error.message : 'Unknown error',
      life: 5000,
    })
  }
}

async function importTheme(event: any) {
  try {
    const file = event.files[0]
    if (file) {
      await themeStore.importPreset(file)
      toast.add({
        severity: 'success',
        summary: 'Theme Imported',
        detail: 'Theme imported and activated successfully',
        life: 3000,
      })
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Import Failed',
      detail: error instanceof Error ? error.message : 'Unknown error',
      life: 5000,
    })
  }
}
</script>

<style scoped>
.space-y-4 > * + * {
  margin-top: 1rem;
}
</style>
