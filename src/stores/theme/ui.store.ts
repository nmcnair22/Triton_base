import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface ThemeUIState {
  configSidebarVisible: boolean
  isDirty: boolean
  isLoading: boolean
  activeTab: 'presets' | 'colors' | 'settings'
  expandedSections: Set<string>
}

export const useThemeUIStore = defineStore('theme-ui', () => {
  // State
  const configSidebarVisible = ref(false)
  const isDirty = ref(false)
  const isLoading = ref(false)
  const activeTab = ref<'presets' | 'colors' | 'settings'>('presets')
  const expandedSections = ref(new Set<string>(['brand', 'status']))

  // Computed
  const isConfigOpen = computed(() => configSidebarVisible.value)
  const hasUnsavedChanges = computed(() => isDirty.value)

  // Actions
  function toggleConfig() {
    configSidebarVisible.value = !configSidebarVisible.value
    console.log('Config sidebar toggled:', configSidebarVisible.value)
  }

  function setConfigVisible(visible: boolean) {
    configSidebarVisible.value = visible
  }

  function openConfig() {
    configSidebarVisible.value = true
  }

  function closeConfig() {
    if (isDirty.value) {
      // In a real app, you might want to show a confirmation dialog
      console.warn('Closing config with unsaved changes')
    }
    configSidebarVisible.value = false
  }

  function setDirty(dirty: boolean) {
    isDirty.value = dirty
  }

  function setLoading(loading: boolean) {
    isLoading.value = loading
  }

  function setActiveTab(tab: 'presets' | 'colors' | 'settings') {
    activeTab.value = tab
  }

  function toggleSection(sectionId: string) {
    if (expandedSections.value.has(sectionId)) {
      expandedSections.value.delete(sectionId)
    } else {
      expandedSections.value.add(sectionId)
    }
  }

  function expandSection(sectionId: string) {
    expandedSections.value.add(sectionId)
  }

  function collapseSection(sectionId: string) {
    expandedSections.value.delete(sectionId)
  }

  function isSectionExpanded(sectionId: string) {
    return expandedSections.value.has(sectionId)
  }

  function expandAllSections() {
    expandedSections.value = new Set(['brand', 'status', 'surface', 'text', 'interaction'])
  }

  function collapseAllSections() {
    expandedSections.value.clear()
  }

  function resetUI() {
    configSidebarVisible.value = false
    isDirty.value = false
    isLoading.value = false
    activeTab.value = 'presets'
    expandedSections.value = new Set(['brand', 'status'])
  }

  return {
    // State
    configSidebarVisible,
    isDirty,
    isLoading,
    activeTab,
    expandedSections,

    // Computed
    isConfigOpen,
    hasUnsavedChanges,

    // Actions
    toggleConfig,
    setConfigVisible,
    openConfig,
    closeConfig,
    setDirty,
    setLoading,
    setActiveTab,
    toggleSection,
    expandSection,
    collapseSection,
    isSectionExpanded,
    expandAllSections,
    collapseAllSections,
    resetUI,
  }
})
