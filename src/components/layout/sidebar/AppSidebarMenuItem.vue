<template>
  <li v-if="shouldDisplay" class="menu-item">
    <!-- Menu Item Link -->
    <router-link
      v-if="item.to && !item.items"
      :to="item.to"
      class="menu-link"
      :class="menuLinkClasses"
      @click="handleItemClick"
    >
      <i v-if="item.icon" :class="item.icon" class="menu-icon"></i>
      <span 
        v-show="showLabel" 
        class="menu-label transition-opacity duration-300"
      >
        {{ item.label }}
      </span>
    </router-link>

    <!-- Menu Item Button (with submenu) -->
    <button
      v-else
      type="button"
      class="menu-button"
      :class="menuButtonClasses"
      @click="handleToggleSubmenu"
    >
      <i v-if="item.icon" :class="item.icon" class="menu-icon"></i>
      <span 
        v-show="showLabel" 
        class="menu-label transition-opacity duration-300"
      >
        {{ item.label }}
      </span>
      <i 
        v-if="item.items && showLabel"
        :class="submenuIcon"
        class="submenu-icon transition-transform duration-200"
      ></i>
    </button>

    <!-- Submenu -->
    <Transition name="submenu">
      <ul 
        v-if="item.items && (isSubmenuVisible || forceShowSubmenu)" 
        class="submenu"
        :class="submenuClasses"
      >
        <AppSidebarMenuItem
          v-for="(child, childIndex) in item.items"
          :key="child.label || childIndex"
          :item="child"
          :index="childIndex"
          :parent-key="itemKey"
          :level="level + 1"
          :root="false"
        />
      </ul>
    </Transition>

    <!-- Tooltip for collapsed states -->
    <div
      v-if="(isSlim || isCompact) && !menuHoverActive && item.label"
      v-tooltip.right="{ value: item.label, showDelay: 300 }"
      class="absolute inset-0 pointer-events-none"
    ></div>
  </li>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLayoutEnhanced } from '@/composables/layout/useLayoutEnhanced'

interface MenuItem {
  label?: string
  icon?: string
  to?: string
  items?: MenuItem[]
  badge?: string | number
  separator?: boolean
  visible?: boolean
}

interface Props {
  item: MenuItem
  index: number
  parentKey?: string
  level?: number
  root?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  parentKey: '',
  level: 0,
  root: false
})

const route = useRoute()
const router = useRouter()

const {
  isSlim,
  isCompact,
  isHorizontal,
  isDesktop,
  layoutState,
  setActiveMenuItem
} = useLayoutEnhanced()

const isSubmenuOpen = ref(false)
const itemKey = ref('')

// Access layout state properties
const menuHoverActive = computed(() => layoutState.value.menuHoverActive)
const activeMenuItem = computed(() => layoutState.value.activeMenuItem)

// Fixed padding map instead of dynamic classes
const paddingMap: Record<number, string> = {
  0: '',
  1: 'pl-8',
  2: 'pl-12',
  3: 'pl-16',
  4: 'pl-20'
}

// Computed properties
const shouldDisplay = computed(() => {
  return props.item.visible !== false
})

const showLabel = computed(() => {
  if (isHorizontal.value) return true
  if ((isSlim.value || isCompact.value) && !menuHoverActive.value) return false
  return true
})

const isActive = computed(() => {
  if (props.item.to) {
    return route.path === props.item.to
  }
  return activeMenuItem.value === itemKey.value
})

const hasActiveChild = computed(() => {
  if (!props.item.items) return false
  return props.item.items.some(child => 
    child.to && route.path.startsWith(child.to)
  )
})

const isSubmenuVisible = computed(() => {
  return isSubmenuOpen.value || hasActiveChild.value
})

const forceShowSubmenu = computed(() => {
  return isHorizontal.value || 
         ((isSlim.value || isCompact.value) && menuHoverActive.value && isDesktop.value)
})

const menuLinkClasses = computed(() => {
  const classes = [
    'w-full', 'flex', 'items-center', 'px-3', 'py-2.5', 'rounded-lg',
    'text-current', 'no-underline', 'transition-all', 'duration-200',
    'hover:bg-current', 'hover:bg-opacity-10',
    'focus:outline-none', 'focus:ring-2', 'focus:ring-current', 'focus:ring-opacity-20'
  ]
  
  if (isActive.value) {
    classes.push('bg-current', 'bg-opacity-10', 'font-medium')
  }
  
  if ((isSlim.value || isCompact.value) && !menuHoverActive.value && !props.item.items) {
    classes.push('justify-center')
  }
  
  // Use padding map instead of dynamic class
  if (props.level > 0 && showLabel.value) {
    classes.push(paddingMap[Math.min(props.level, 4)])
  }
  
  return classes
})

const menuButtonClasses = computed(() => {
  const classes = [
    'w-full', 'flex', 'items-center', 'px-3', 'py-2.5', 'rounded-lg',
    'text-current', 'bg-transparent', 'border-none', 'cursor-pointer',
    'transition-all', 'duration-200',
    'hover:bg-current', 'hover:bg-opacity-10',
    'focus:outline-none', 'focus:ring-2', 'focus:ring-current', 'focus:ring-opacity-20'
  ]
  
  if (hasActiveChild.value) {
    classes.push('bg-current', 'bg-opacity-10', 'font-medium')
  }
  
  if ((isSlim.value || isCompact.value) && !menuHoverActive.value) {
    classes.push('justify-center')
  }
  
  if (props.level > 0 && showLabel.value) {
    classes.push(paddingMap[Math.min(props.level, 4)])
  }
  
  return classes
})

const submenuClasses = computed(() => [
  'mt-1', 'space-y-1',
  {
    'ml-4': showLabel.value && props.root,
    'absolute left-full top-0 ml-2 bg-surface-0 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg shadow-lg p-2 min-w-48 z-50': 
      (isSlim.value || isCompact.value) && menuHoverActive.value && isDesktop.value
  }
])

const submenuIcon = computed(() => 
  isSubmenuOpen.value ? 'pi pi-chevron-down' : 'pi pi-chevron-right'
)

// Methods
function handleItemClick() {
  if (props.item.to) {
    router.push(props.item.to)
  }
}

function handleToggleSubmenu() {
  if (props.item.items) {
    isSubmenuOpen.value = !isSubmenuOpen.value
    setActiveMenuItem(itemKey.value)
  } else if (props.item.to) {
    router.push(props.item.to)
  }
}

// Generate item key
onMounted(() => {
  itemKey.value = props.parentKey 
    ? `${props.parentKey}-${props.index}` 
    : String(props.index)
    
  if (props.item.to && route.path === props.item.to) {
    setActiveMenuItem(itemKey.value)
  } else if (hasActiveChild.value) {
    isSubmenuOpen.value = true
    setActiveMenuItem(itemKey.value)
  }
})

// Watch for route changes
watch(() => route.path, (newPath) => {
  if (props.item.to && newPath === props.item.to) {
    setActiveMenuItem(itemKey.value)
  } else if (hasActiveChild.value) {
    isSubmenuOpen.value = true
  }
})
</script>

<style scoped>
.menu-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.menu-label {
  flex: 1;
  text-align: left;
}

.submenu-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.menu-button,
.menu-link {
  font-size: 0.9rem;
  min-height: 2.75rem;
}

/* Submenu transitions */
.submenu-enter-active,
.submenu-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.submenu-enter-from,
.submenu-leave-to {
  opacity: 0;
  max-height: 0;
}

.submenu-enter-to,
.submenu-leave-from {
  opacity: 1;
  max-height: 500px;
}

/* Horizontal submenu positioning */
@media (min-width: 992px) {
  .submenu.absolute {
    animation: slideInRight 0.2s ease-out;
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style> 