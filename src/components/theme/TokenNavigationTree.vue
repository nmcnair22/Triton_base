<template>
  <div class="token-navigation-tree">
    <!-- Search Input -->
    <div class="tree-search">
      <span class="p-input-icon-left w-full">
        <i class="pi pi-search text-surface-400"></i>
        <InputText
          v-model="searchQuery"
          placeholder="Search tokens..."
          class="w-full"
          @input="onSearch"
        />
      </span>
    </div>

    <!-- Token Tree -->
    <Tree
      v-model:selectionKeys="selectedKeys"
      :value="filteredNodes"
      selectionMode="single"
      :filter="false"
      class="token-tree"
      :pt="{
        root: { class: 'border-0 p-0' },
        content: { class: 'rounded-md' }
      }"
      @node-select="onNodeSelect"
    >
      <template #default="{ node }">
        <div class="tree-node-content">
          <span class="node-label">{{ node.label }}</span>
          <div class="node-badges">
            <Badge 
              v-if="node.data?.editCount" 
              :value="node.data.editCount" 
              severity="warning"
              size="small"
            />
            <Badge 
              v-if="node.data?.tokenCount" 
              :value="node.data.tokenCount" 
              severity="secondary"
              size="small"
            />
          </div>
        </div>
      </template>
    </Tree>

    <!-- Empty State -->
    <div v-if="filteredNodes.length === 0" class="empty-state">
      <i class="pi pi-search text-3xl text-surface-400 mb-2"></i>
      <p class="text-surface-500">No tokens found matching "{{ searchQuery }}"</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useThemeAdvancedStore } from '@/stores/theme/advanced.store'
import { TokenRegistry } from '@/themes/core'
import type { DesignToken } from '@/themes/presets/preset.types'

const props = defineProps<{
  searchQuery?: string
}>()

const emit = defineEmits<{
  select: [node: any]
}>()

// Stores
const advancedStore = useThemeAdvancedStore()
const registry = TokenRegistry.getInstance()

// State
const searchQuery = ref(props.searchQuery || '')
const selectedKeys = ref<any>({})

// Computed
const globalTokenGroups = computed(() => advancedStore.globalTokenGroups)

const treeNodes = computed(() => {
  const nodes = []
  
  // Primitive tokens node
  const primitiveTokens = registry.getTokensByCategory('primitive')
  if (primitiveTokens.length > 0) {
    const primitiveGroups = groupTokensBySubcategory(primitiveTokens)
    nodes.push({
      key: 'primitive',
      label: 'Primitive Tokens',
      icon: 'pi pi-circle',
      data: { 
        tokenCount: primitiveTokens.length,
        editCount: countEditedTokens(primitiveTokens)
      },
      children: Object.entries(primitiveGroups).map(([subcategory, tokens]) => ({
        key: `primitive-${subcategory}`,
        label: formatLabel(subcategory),
        data: { 
          tokens,
          tokenCount: tokens.length,
          editCount: countEditedTokens(tokens)
        },
        leaf: true
      }))
    })
  }
  
  // Semantic tokens node
  const semanticTokens = registry.getTokensByCategory('semantic')
  if (semanticTokens.length > 0) {
    const semanticGroups = groupTokensBySubcategory(semanticTokens)
    nodes.push({
      key: 'semantic',
      label: 'Semantic Tokens',
      icon: 'pi pi-bookmark',
      data: { 
        tokenCount: semanticTokens.length,
        editCount: countEditedTokens(semanticTokens)
      },
      children: Object.entries(semanticGroups).map(([subcategory, tokens]) => ({
        key: `semantic-${subcategory}`,
        label: formatLabel(subcategory),
        data: { 
          tokens,
          tokenCount: tokens.length,
          editCount: countEditedTokens(tokens)
        },
        leaf: true
      }))
    })
  }
  
  // Custom tokens node
  const customTokens = registry.getTokensByCategory('custom')
  if (customTokens.length > 0) {
    nodes.push({
      key: 'custom',
      label: 'Custom Tokens',
      icon: 'pi pi-plus',
      data: { 
        tokens: customTokens,
        tokenCount: customTokens.length,
        editCount: countEditedTokens(customTokens)
      },
      leaf: customTokens.length < 10 // Expand directly if few tokens
    })
  }
  
  return nodes
})

const filteredNodes = computed(() => {
  if (!searchQuery.value) {
    return treeNodes.value
  }
  
  const query = searchQuery.value.toLowerCase()
  return filterTreeNodes(treeNodes.value, query)
})

// Methods
function groupTokensBySubcategory(tokens: DesignToken[]): Record<string, DesignToken[]> {
  const groups: Record<string, DesignToken[]> = {}
  
  tokens.forEach(token => {
    // Group by subcategory or by first part of path
    const groupKey = token.subcategory || token.path.split('.')[0] || 'other'
    if (!groups[groupKey]) {
      groups[groupKey] = []
    }
    groups[groupKey].push(token)
  })
  
  return groups
}

function countEditedTokens(tokens: DesignToken[]): number {
  return tokens.filter(token => {
    const changes = advancedStore.tokenChangeHistory
    return changes.some(change => change.tokenId === token.id)
  }).length
}

function formatLabel(key: string): string {
  return key
    .split(/[-_.]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function filterTreeNodes(nodes: any[], query: string): any[] {
  const filtered: any[] = []
  
  nodes.forEach(node => {
    // Check if node matches
    if (node.label.toLowerCase().includes(query)) {
      filtered.push(node)
    } else if (node.children) {
      // Check children
      const filteredChildren = filterTreeNodes(node.children, query)
      if (filteredChildren.length > 0) {
        filtered.push({
          ...node,
          children: filteredChildren,
          expanded: true // Expand to show matches
        })
      }
    } else if (node.data?.tokens) {
      // Check tokens in leaf nodes
      const matchingTokens = node.data.tokens.filter((token: DesignToken) =>
        token.label.toLowerCase().includes(query) ||
        token.id.toLowerCase().includes(query) ||
        token.path.toLowerCase().includes(query)
      )
      
      if (matchingTokens.length > 0) {
        filtered.push({
          ...node,
          data: {
            ...node.data,
            tokens: matchingTokens,
            tokenCount: matchingTokens.length
          }
        })
      }
    }
  })
  
  return filtered
}

function onSearch() {
  // Debounced search is handled by the computed property
}

function onNodeSelect(node: any) {
  if (node.data?.tokens) {
    // Leaf node with tokens
    emit('select', {
      key: node.key,
      tokens: node.data.tokens,
      label: node.label
    })
  }
}

// Lifecycle
onMounted(() => {
  // Expand first level by default
  treeNodes.value.forEach(node => {
    if (node.children && node.children.length > 0) {
      selectedKeys.value[node.key] = { checked: false, partialChecked: false }
    }
  })
})

// Watch for external search query changes
watch(() => props.searchQuery, (newQuery) => {
  if (newQuery !== undefined) {
    searchQuery.value = newQuery
  }
})
</script>

<style scoped>
.token-navigation-tree {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.tree-search {
  padding: 0.75rem;
  border-bottom: 1px solid var(--p-surface-200);
}

.token-tree {
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem;
}

.tree-node-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.node-label {
  flex: 1;
  font-size: 0.875rem;
}

.node-badges {
  display: flex;
  gap: 0.25rem;
  margin-left: 0.5rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

/* Dark mode adjustments */
.dark .tree-search {
  border-bottom-color: var(--p-surface-700);
}
</style>