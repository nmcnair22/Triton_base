<template>
  <div class="component-navigation-tree">
    <!-- Search with AutoComplete -->
    <div class="component-search">
      <AutoComplete
        v-model="searchQuery"
        :suggestions="filteredSuggestions"
        placeholder="Search components..."
        dropdown
        :pt="{
          input: { class: 'w-full' }
        }"
        @complete="searchComponents"
        @item-select="selectComponent"
      >
        <template #option="{ option }">
          <div class="component-option">
            <i :class="option.icon" class="mr-2"></i>
            <span>{{ option.label }}</span>
            <Badge 
              v-if="option.editCount" 
              :value="option.editCount" 
              severity="warning"
              size="small"
              class="ml-auto"
            />
          </div>
        </template>
      </AutoComplete>
    </div>

    <!-- Component Categories -->
    <div class="component-categories">
      <Accordion v-model:value="activeAccordions">
        <AccordionPanel 
          v-for="category in componentCategories"
          :key="category.key"
          :value="category.key"
        >
          <AccordionHeader>
            <div class="category-header">
              <i :class="category.icon" class="mr-2"></i>
              <span>{{ category.label }}</span>
              <Badge 
                v-if="category.editCount" 
                :value="category.editCount" 
                severity="warning"
                size="small"
                class="ml-auto"
              />
            </div>
          </AccordionHeader>
          
          <AccordionContent>
          
          <div class="component-grid">
            <div
              v-for="component in category.components"
              :key="component.key"
              class="component-card"
              :class="{ 'selected': selectedComponent?.key === component.key }"
              @click="selectComponent(component)"
            >
              <i :class="component.icon" class="component-icon"></i>
              <span class="component-name">{{ component.label }}</span>
              <div v-if="component.editCount" class="component-badge">
                <Badge :value="component.editCount" severity="warning" size="small" />
              </div>
            </div>
          </div>
          </AccordionContent>
        </AccordionPanel>
      </Accordion>
    </div>

    <!-- Quick Access -->
    <div v-if="recentComponents.length > 0" class="recent-components">
      <h4 class="recent-header">Recently Edited</h4>
      <div class="recent-list">
        <Button
          v-for="component in recentComponents"
          :key="component.key"
          :label="component.label"
          severity="secondary"
          text
          size="small"
          @click="selectComponent(component)"
        >
          <template #icon>
            <i :class="component.icon" class="mr-2"></i>
          </template>
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useThemeAdvancedStore } from '@/stores/theme/advanced.store'
import { TokenDiscovery } from '@/themes/core'

const props = defineProps<{
  searchQuery?: string
}>()

const emit = defineEmits<{
  select: [component: any]
}>()

// Store
const advancedStore = useThemeAdvancedStore()

// State
const searchQuery = ref(props.searchQuery || '')
const filteredSuggestions = ref<any[]>([])
const selectedComponent = ref<any>(null)
const activeAccordions = ref(['form', 'data']) // Default open accordions

// Component metadata
const componentMetadata = {
  // Form components
  autocomplete: { icon: 'pi pi-search', category: 'form' },
  cascadeselect: { icon: 'pi pi-sitemap', category: 'form' },
  checkbox: { icon: 'pi pi-check-square', category: 'form' },
  colorpicker: { icon: 'pi pi-palette', category: 'form' },
  dropdown: { icon: 'pi pi-chevron-down', category: 'form' },
  editor: { icon: 'pi pi-file-edit', category: 'form' },
  inputmask: { icon: 'pi pi-id-card', category: 'form' },
  inputnumber: { icon: 'pi pi-hashtag', category: 'form' },
  inputotp: { icon: 'pi pi-key', category: 'form' },
  inputtext: { icon: 'pi pi-pencil', category: 'form' },
  knob: { icon: 'pi pi-circle', category: 'form' },
  listbox: { icon: 'pi pi-list', category: 'form' },
  multiselect: { icon: 'pi pi-check-square', category: 'form' },
  password: { icon: 'pi pi-lock', category: 'form' },
  radiobutton: { icon: 'pi pi-circle-fill', category: 'form' },
  rating: { icon: 'pi pi-star', category: 'form' },
  select: { icon: 'pi pi-chevron-down', category: 'form' },
  selectbutton: { icon: 'pi pi-th-large', category: 'form' },
  slider: { icon: 'pi pi-sliders-h', category: 'form' },
  textarea: { icon: 'pi pi-align-left', category: 'form' },
  togglebutton: { icon: 'pi pi-toggle-off', category: 'form' },
  toggleswitch: { icon: 'pi pi-toggle-on', category: 'form' },
  treeselect: { icon: 'pi pi-tree', category: 'form' },
  
  // Button components
  button: { icon: 'pi pi-box', category: 'button' },
  buttongroup: { icon: 'pi pi-clone', category: 'button' },
  speeddial: { icon: 'pi pi-plus-circle', category: 'button' },
  splitbutton: { icon: 'pi pi-ellipsis-v', category: 'button' },
  
  // Data components
  datatable: { icon: 'pi pi-table', category: 'data' },
  dataview: { icon: 'pi pi-th-large', category: 'data' },
  orderlist: { icon: 'pi pi-sort', category: 'data' },
  organizationchart: { icon: 'pi pi-sitemap', category: 'data' },
  paginator: { icon: 'pi pi-angle-double-right', category: 'data' },
  picklist: { icon: 'pi pi-arrow-right-arrow-left', category: 'data' },
  timeline: { icon: 'pi pi-clock', category: 'data' },
  tree: { icon: 'pi pi-share-alt', category: 'data' },
  treetable: { icon: 'pi pi-table', category: 'data' },
  virtualscroller: { icon: 'pi pi-forward', category: 'data' },
  
  // Panel components
  accordion: { icon: 'pi pi-bars', category: 'panel' },
  card: { icon: 'pi pi-id-card', category: 'panel' },
  divider: { icon: 'pi pi-minus', category: 'panel' },
  fieldset: { icon: 'pi pi-folder-open', category: 'panel' },
  panel: { icon: 'pi pi-window-maximize', category: 'panel' },
  scrollpanel: { icon: 'pi pi-arrows-v', category: 'panel' },
  splitter: { icon: 'pi pi-border-all', category: 'panel' },
  stepper: { icon: 'pi pi-forward', category: 'panel' },
  tabs: { icon: 'pi pi-folder', category: 'panel' },
  toolbar: { icon: 'pi pi-bars', category: 'panel' },
  
  // Overlay components
  confirmdialog: { icon: 'pi pi-question-circle', category: 'overlay' },
  confirmpopup: { icon: 'pi pi-question', category: 'overlay' },
  dialog: { icon: 'pi pi-window-maximize', category: 'overlay' },
  drawer: { icon: 'pi pi-arrow-right', category: 'overlay' },
  overlaypanel: { icon: 'pi pi-clone', category: 'overlay' },
  popover: { icon: 'pi pi-comment', category: 'overlay' },
  tooltip: { icon: 'pi pi-info-circle', category: 'overlay' },
  
  // File components
  fileupload: { icon: 'pi pi-upload', category: 'file' },
  
  // Menu components
  breadcrumb: { icon: 'pi pi-angle-right', category: 'menu' },
  contextmenu: { icon: 'pi pi-bars', category: 'menu' },
  dock: { icon: 'pi pi-th-large', category: 'menu' },
  megamenu: { icon: 'pi pi-bars', category: 'menu' },
  menu: { icon: 'pi pi-list', category: 'menu' },
  menubar: { icon: 'pi pi-bars', category: 'menu' },
  panelmenu: { icon: 'pi pi-align-justify', category: 'menu' },
  steps: { icon: 'pi pi-forward', category: 'menu' },
  tabmenu: { icon: 'pi pi-bars', category: 'menu' },
  tieredmenu: { icon: 'pi pi-bars', category: 'menu' },
  
  // Media components
  carousel: { icon: 'pi pi-images', category: 'media' },
  galleria: { icon: 'pi pi-image', category: 'media' },
  image: { icon: 'pi pi-image', category: 'media' },
  
  // Message components
  inlinemessage: { icon: 'pi pi-info-circle', category: 'message' },
  message: { icon: 'pi pi-envelope', category: 'message' },
  toast: { icon: 'pi pi-bell', category: 'message' },
  
  // Misc components
  avatar: { icon: 'pi pi-user', category: 'misc' },
  avatargroup: { icon: 'pi pi-users', category: 'misc' },
  badge: { icon: 'pi pi-circle-fill', category: 'misc' },
  blockui: { icon: 'pi pi-ban', category: 'misc' },
  chip: { icon: 'pi pi-tag', category: 'misc' },
  floatlabel: { icon: 'pi pi-bookmark', category: 'misc' },
  iconfield: { icon: 'pi pi-box', category: 'misc' },
  inplace: { icon: 'pi pi-pencil', category: 'misc' },
  metergroup: { icon: 'pi pi-chart-bar', category: 'misc' },
  overlaybadge: { icon: 'pi pi-bell', category: 'misc' },
  progressbar: { icon: 'pi pi-chart-line', category: 'misc' },
  progressspinner: { icon: 'pi pi-spinner', category: 'misc' },
  ripple: { icon: 'pi pi-circle', category: 'misc' },
  scrolltop: { icon: 'pi pi-arrow-up', category: 'misc' },
  skeleton: { icon: 'pi pi-box', category: 'misc' },
  tag: { icon: 'pi pi-tag', category: 'misc' },
  terminal: { icon: 'pi pi-desktop', category: 'misc' },
}

// Computed
const componentList = computed(() => {
  return advancedStore.componentList.map(key => {
    const metadata = componentMetadata[key as keyof typeof componentMetadata] || 
                    { icon: 'pi pi-box', category: 'misc' }
    const editCount = countComponentEdits(key)
    
    return {
      key,
      label: formatComponentName(key),
      icon: metadata.icon,
      category: metadata.category,
      editCount
    }
  })
})

const componentCategories = computed(() => {
  const categories: Record<string, any> = {
    form: { key: 'form', label: 'Form', icon: 'pi pi-pencil', components: [] },
    button: { key: 'button', label: 'Button', icon: 'pi pi-box', components: [] },
    data: { key: 'data', label: 'Data', icon: 'pi pi-table', components: [] },
    panel: { key: 'panel', label: 'Panel', icon: 'pi pi-window-maximize', components: [] },
    overlay: { key: 'overlay', label: 'Overlay', icon: 'pi pi-clone', components: [] },
    file: { key: 'file', label: 'File', icon: 'pi pi-file', components: [] },
    menu: { key: 'menu', label: 'Menu', icon: 'pi pi-bars', components: [] },
    media: { key: 'media', label: 'Media', icon: 'pi pi-image', components: [] },
    message: { key: 'message', label: 'Message', icon: 'pi pi-envelope', components: [] },
    misc: { key: 'misc', label: 'Misc', icon: 'pi pi-circle', components: [] }
  }
  
  // Group components by category
  componentList.value.forEach(component => {
    const category = categories[component.category]
    if (category) {
      category.components.push(component)
    }
  })
  
  // Calculate edit counts per category
  Object.values(categories).forEach(category => {
    category.editCount = category.components.reduce(
      (sum: number, comp: any) => sum + (comp.editCount || 0), 
      0
    )
  })
  
  // Filter out empty categories
  return Object.values(categories).filter(cat => cat.components.length > 0)
})

const recentComponents = computed(() => {
  const recent: any[] = []
  const seen = new Set<string>()
  
  // Get components with recent edits
  advancedStore.tokenChangeHistory
    .slice()
    .reverse()
    .forEach(change => {
      if (change.component && !seen.has(change.component)) {
        seen.add(change.component)
        const component = componentList.value.find(c => c.key === change.component)
        if (component) {
          recent.push(component)
        }
      }
    })
  
  return recent.slice(0, 5) // Show top 5
})

// Methods
function formatComponentName(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .trim()
}

function countComponentEdits(component: string): number {
  return advancedStore.tokenChangeHistory.filter(
    change => change.component === component
  ).length
}

function searchComponents(event: any) {
  const query = event.query.toLowerCase()
  
  filteredSuggestions.value = componentList.value.filter(component =>
    component.label.toLowerCase().includes(query) ||
    component.key.toLowerCase().includes(query)
  )
}

function selectComponent(component: any) {
  selectedComponent.value = component
  emit('select', component)
  
  // Clear search after selection
  setTimeout(() => {
    searchQuery.value = ''
  }, 100)
}

// Lifecycle
onMounted(async () => {
  // Ensure tokens are discovered
  if (!advancedStore.hasDiscoveredTokens) {
    const tokens = await TokenDiscovery.discoverAllTokens()
    advancedStore.setDiscoveredTokens(tokens)
  }
})
</script>

<style scoped>
.component-navigation-tree {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.component-search {
  padding: 0.75rem;
  border-bottom: 1px solid var(--p-surface-200);
}

.component-option {
  display: flex;
  align-items: center;
  padding: 0.5rem;
}

.component-categories {
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem;
}

.category-header {
  display: flex;
  align-items: center;
  width: 100%;
}

.component-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.5rem;
  padding: 0.5rem 0;
}

.component-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem;
  border: 1px solid var(--p-surface-200);
  border-radius: var(--p-borderRadius);
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.component-card:hover {
  background-color: var(--p-surface-50);
  border-color: var(--p-primary-200);
}

.component-card.selected {
  background-color: var(--p-primary-50);
  border-color: var(--p-primary-500);
}

.component-icon {
  font-size: 1.5rem;
  color: var(--p-primary-500);
  margin-bottom: 0.5rem;
}

.component-name {
  font-size: 0.75rem;
  text-align: center;
  word-break: break-word;
}

.component-badge {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
}

.recent-components {
  padding: 0.75rem;
  border-top: 1px solid var(--p-surface-200);
}

.recent-header {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--p-text-color);
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

/* Dark mode adjustments */
.dark .component-search,
.dark .recent-components {
  border-color: var(--p-surface-700);
}

.dark .component-card {
  border-color: var(--p-surface-700);
}

.dark .component-card:hover {
  background-color: var(--p-surface-800);
  border-color: var(--p-primary-400);
}

.dark .component-card.selected {
  background-color: var(--p-primary-900);
  border-color: var(--p-primary-400);
}
</style>