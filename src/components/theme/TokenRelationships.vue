<template>
  <div class="token-relationships">
    <!-- Token Overview -->
    <div class="token-overview">
      <h5>Token Details</h5>
      <div class="overview-content">
        <div class="overview-item">
          <span class="label">ID:</span>
          <code>{{ token.id }}</code>
        </div>
        <div class="overview-item">
          <span class="label">Path:</span>
          <code>{{ token.path }}</code>
        </div>
        <div class="overview-item">
          <span class="label">Type:</span>
          <Tag :value="token.type" severity="info" />
        </div>
        <div class="overview-item">
          <span class="label">Category:</span>
          <Tag :value="token.category" severity="secondary" />
        </div>
        <div class="overview-item">
          <span class="label">Current Value:</span>
          <div class="current-value">
            <ColorSwatch v-if="token.type === 'color'" :color="currentValue" />
            <code v-else>{{ currentValue }}</code>
          </div>
        </div>
        <div class="overview-item" v-if="token.defaultValue !== currentValue">
          <span class="label">Default Value:</span>
          <div class="default-value">
            <ColorSwatch v-if="token.type === 'color'" :color="token.defaultValue" />
            <code v-else>{{ token.defaultValue }}</code>
          </div>
        </div>
      </div>
    </div>

    <!-- Dependencies -->
    <div class="dependencies-section" v-if="dependencies.length > 0">
      <h5>
        <i class="pi pi-arrow-down mr-2"></i>
        Dependencies
        <Badge :value="dependencies.length" severity="info" class="ml-2" />
      </h5>
      <p class="section-description">Tokens that depend on this token</p>
      
      <div class="token-list">
        <div 
          v-for="dep in dependencies" 
          :key="dep.id"
          class="token-item"
          @click="selectToken(dep)"
        >
          <div class="token-item-header">
            <Tag :value="dep.type" size="small" severity="secondary" />
            <span class="token-name">{{ dep.label }}</span>
          </div>
          <div class="token-item-value">
            <ColorSwatch v-if="dep.type === 'color'" :color="getTokenValue(dep)" />
            <code v-else>{{ getTokenValue(dep) }}</code>
          </div>
          <div class="token-item-path">
            <i class="pi pi-link text-xs mr-1"></i>
            <code class="text-xs">{{ dep.path }}</code>
          </div>
        </div>
      </div>
    </div>

    <!-- Dependents -->
    <div class="dependents-section" v-if="dependents.length > 0">
      <h5>
        <i class="pi pi-arrow-up mr-2"></i>
        Used By
        <Badge :value="dependents.length" severity="warning" class="ml-2" />
      </h5>
      <p class="section-description">Tokens that this token depends on</p>
      
      <div class="token-list">
        <div 
          v-for="dep in dependents" 
          :key="dep.id"
          class="token-item"
          @click="selectToken(dep)"
        >
          <div class="token-item-header">
            <Tag :value="dep.type" size="small" severity="secondary" />
            <span class="token-name">{{ dep.label }}</span>
          </div>
          <div class="token-item-value">
            <ColorSwatch v-if="dep.type === 'color'" :color="getTokenValue(dep)" />
            <code v-else>{{ getTokenValue(dep) }}</code>
          </div>
          <div class="token-item-path">
            <i class="pi pi-link text-xs mr-1"></i>
            <code class="text-xs">{{ dep.path }}</code>
          </div>
        </div>
      </div>
    </div>

    <!-- Affected Components -->
    <div class="affected-components" v-if="affectedComponents.length > 0">
      <h5>
        <i class="pi pi-box mr-2"></i>
        Affected Components
        <Badge :value="affectedComponents.length" severity="success" class="ml-2" />
      </h5>
      <p class="section-description">Components that use this token</p>
      
      <div class="component-grid">
        <div 
          v-for="component in affectedComponents" 
          :key="component"
          class="component-card"
          @click="viewComponent(component)"
        >
          <i :class="getComponentIcon(component)" class="component-icon"></i>
          <span class="component-name">{{ formatComponentName(component) }}</span>
          <Badge 
            v-if="getComponentTokenCount(component) > 1"
            :value="`${getComponentTokenCount(component)} tokens`"
            size="small"
            severity="secondary"
          />
        </div>
      </div>
    </div>

    <!-- Usage Examples -->
    <div class="usage-examples" v-if="usageExamples.length > 0">
      <h5>
        <i class="pi pi-code mr-2"></i>
        Usage Examples
      </h5>
      <Accordion>
        <AccordionPanel v-for="(example, index) in usageExamples" :key="index" :value="String(index)">
          <AccordionHeader>
            <span class="example-title">
              <i :class="example.icon" class="mr-2"></i>
              {{ example.title }}
            </span>
          </AccordionHeader>
          <AccordionContent>
            <div class="example-content">
              <pre><code>{{ example.code }}</code></pre>
              <!-- Preview would go here if needed -->
            </div>
          </AccordionContent>
        </AccordionPanel>
      </Accordion>
    </div>

    <!-- Similar Tokens -->
    <div class="similar-tokens" v-if="similarTokens.length > 0">
      <h5>
        <i class="pi pi-th-large mr-2"></i>
        Similar Tokens
      </h5>
      <p class="section-description">Other tokens of the same type</p>
      
      <div class="similar-token-list">
        <Button
          v-for="similar in similarTokens"
          :key="similar.id"
          :label="similar.label"
          severity="secondary"
          text
          size="small"
          @click="selectToken(similar)"
          class="similar-token-button"
        >
          <template #icon>
            <ColorSwatch 
              v-if="similar.type === 'color'" 
              :color="getTokenValue(similar)" 
              class="mr-2"
            />
          </template>
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useThemeAdvancedStore } from '@/stores/theme/advanced.store'
import { TokenRegistry } from '@/themes/core'
import type { DesignToken } from '@/themes/presets/preset.types'
defineOptions({
  components: { ColorSwatch }
})


const props = defineProps<{
  token: DesignToken
}>()

const emit = defineEmits<{
  select: [token: DesignToken]
  viewComponent: [component: string]
}>()

// Stores
const advancedStore = useThemeAdvancedStore()
const registry = TokenRegistry.getInstance()

// State
const dependencies = ref<DesignToken[]>([])
const dependents = ref<DesignToken[]>([])
const similarTokens = ref<DesignToken[]>([])

// Computed
const currentValue = computed(() => {
  return advancedStore.getTokenValue(props.token.id) || props.token.value
})

const affectedComponents = computed(() => {
  return props.token.affects || []
})

const usageExamples = computed(() => {
  // Generate usage examples based on token type and category
  const examples = []
  
  if (props.token.type === 'color') {
    examples.push({
      title: 'CSS Variable',
      icon: 'pi pi-code',
      code: `var(--${props.token.path.replace(/\./g, '-')})`
    })
    
    if (props.token.category === 'semantic') {
      examples.push({
        title: 'Component Usage',
        icon: 'pi pi-box',
        code: `<Button severity="primary" />\n/* Uses ${props.token.path} */`
      })
    }
  } else if (props.token.type === 'size') {
    examples.push({
      title: 'CSS Usage',
      icon: 'pi pi-code',
      code: `padding: var(--${props.token.path.replace(/\./g, '-')});`
    })
  }
  
  return examples
})

// Component icon mapping
const componentIcons: Record<string, string> = {
  button: 'pi pi-plus-circle',
  inputtext: 'pi pi-pencil',
  select: 'pi pi-chevron-down',
  datatable: 'pi pi-table',
  dialog: 'pi pi-window-maximize',
  card: 'pi pi-id-card',
  panel: 'pi pi-tablet',
  accordion: 'pi pi-bars',
  tabview: 'pi pi-folder-open',
  menu: 'pi pi-list'
}

// Methods
function getTokenValue(token: DesignToken): any {
  return advancedStore.getTokenValue(token.id) || token.value
}

function selectToken(token: DesignToken) {
  emit('select', token)
}

function viewComponent(component: string) {
  emit('viewComponent', component)
}

function getComponentIcon(component: string): string {
  return componentIcons[component.toLowerCase()] || 'pi pi-box'
}

function formatComponentName(component: string): string {
  return component
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function getComponentTokenCount(component: string): number {
  // Count how many tokens affect this component
  const tokens = registry.getTokensByComponent(component)
  return tokens.length
}

function loadRelationships() {
  // Load token dependencies
  if (props.token.dependencies) {
    dependencies.value = props.token.dependencies
      .map(id => registry.getToken(id))
      .filter(Boolean) as DesignToken[]
  }
  
  // Load tokens that depend on this one
  const allTokens = registry.getAllTokens()
  dependents.value = allTokens.filter(t => 
    t.dependencies?.includes(props.token.id)
  )
  
  // Load similar tokens
  similarTokens.value = allTokens.filter(t => 
    t.type === props.token.type && 
    t.category === props.token.category &&
    t.id !== props.token.id
  ).slice(0, 10) // Limit to 10 similar tokens
}

// Lifecycle
onMounted(() => {
  loadRelationships()
})
</script>

<script lang="ts">
// ColorSwatch component
import { defineComponent, h } from 'vue'

const ColorSwatch = defineComponent({
  name: 'ColorSwatch',
  props: {
    color: String,
    class: String
  },
  setup(props) {
    return () => h('span', {
      class: ['color-swatch', props.class],
      style: {
        backgroundColor: props.color,
        display: 'inline-block',
        width: '20px',
        height: '20px',
        borderRadius: '4px',
        border: '2px solid var(--p-surface-300)',
        verticalAlign: 'middle'
      }
    })
  }
})

</script>

<style scoped>
.token-relationships {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Token Overview */
.token-overview {
  background-color: var(--p-surface-50);
  border-radius: var(--p-border-radius);
  padding: 1rem;
}

.token-overview h5 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--p-text-color);
}

.overview-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.overview-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.overview-item .label {
  font-weight: 600;
  color: var(--p-text-muted-color);
  min-width: 100px;
}

.overview-item code {
  font-family: monospace;
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
  background-color: var(--p-surface-100);
  border-radius: 3px;
}

.current-value,
.default-value {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Section Headers */
.dependencies-section h5,
.dependents-section h5,
.affected-components h5,
.usage-examples h5,
.similar-tokens h5 {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.section-description {
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
  margin-bottom: 1rem;
}

/* Token Lists */
.token-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.token-item {
  padding: 0.75rem;
  background-color: var(--p-surface-50);
  border: 1px solid var(--p-surface-200);
  border-radius: var(--p-border-radius);
  cursor: pointer;
  transition: all 0.2s;
}

.token-item:hover {
  background-color: var(--p-surface-100);
  border-color: var(--p-primary-200);
  transform: translateX(4px);
}

.token-item-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.token-name {
  font-weight: 600;
  font-size: 0.875rem;
}

.token-item-value {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.token-item-value code {
  font-size: 0.75rem;
  padding: 0.125rem 0.375rem;
  background-color: var(--p-surface-100);
  border-radius: 3px;
}

.token-item-path {
  display: flex;
  align-items: center;
  color: var(--p-text-muted-color);
}

.token-item-path code {
  font-size: 0.75rem;
}

/* Component Grid */
.component-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.75rem;
}

.component-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background-color: var(--p-surface-50);
  border: 1px solid var(--p-surface-200);
  border-radius: var(--p-border-radius);
  cursor: pointer;
  transition: all 0.2s;
}

.component-card:hover {
  background-color: var(--p-surface-100);
  border-color: var(--p-primary-200);
  transform: translateY(-2px);
}

.component-icon {
  font-size: 1.5rem;
  color: var(--p-primary-500);
}

.component-name {
  font-weight: 500;
  font-size: 0.875rem;
  text-align: center;
}

/* Usage Examples */
.example-title {
  display: flex;
  align-items: center;
}

.example-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.example-content pre {
  margin: 0;
  padding: 1rem;
  background-color: var(--p-surface-900);
  color: var(--p-surface-50);
  border-radius: var(--p-border-radius);
  overflow-x: auto;
}

.example-content code {
  font-family: monospace;
  font-size: 0.875rem;
}

.example-preview {
  padding: 1rem;
  background-color: var(--p-surface-50);
  border-radius: var(--p-border-radius);
}

/* Similar Tokens */
.similar-token-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.similar-token-button {
  display: flex;
  align-items: center;
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .token-overview,
  .token-item,
  .component-card {
    background-color: var(--p-surface-800);
  }
  
  .token-item:hover,
  .component-card:hover {
    background-color: var(--p-surface-700);
  }
  
  .overview-item code,
  .token-item-value code {
    background-color: var(--p-surface-700);
  }
  
  .example-content pre {
    background-color: var(--p-surface-950);
  }
  
  .example-preview {
    background-color: var(--p-surface-800);
  }
}
</style>