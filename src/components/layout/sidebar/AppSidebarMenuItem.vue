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
      <div class="flex items-center min-w-0 flex-1">
        <i v-if="item.icon" :class="[item.icon, iconClasses]"></i>
        <span v-if="showLabel" class="menu-label">
          {{ item.label }}
        </span>
      </div>
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
      <span v-show="showLabel" class="menu-label transition-opacity duration-300">
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
  root: false,
})

const route = useRoute()
const router = useRouter()

const { isSlim, isCompact, isHorizontal, isDesktop, layoutState, setActiveMenuItem } =
  useLayoutEnhanced()

const isSubmenuOpen = ref(false)
const itemKey = ref('')

// Access layout state properties
const menuHoverActive = computed(() => layoutState.value.menuHoverActive)

// Fixed padding map instead of dynamic classes
const paddingMap: Record<number, string> = {
  0: '',
  1: 'pl-8',
  2: 'pl-12',
  3: 'pl-16',
  4: 'pl-20',
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
  if (!props.item.to) return false

  // Exact match
  if (route.path === props.item.to) return true

  // Parent match (but not for home)
  if (props.item.to !== '/' && route.path.startsWith(props.item.to)) return true

  return false
})

const hasActiveChild = computed(() => {
  if (!props.item.items) return false
  return props.item.items.some(child => child.to && route.path.startsWith(child.to))
})

const isSubmenuVisible = computed(() => {
  return isSubmenuOpen.value || hasActiveChild.value
})

const forceShowSubmenu = computed(() => {
  return (
    isHorizontal.value ||
    ((isSlim.value || isCompact.value) && menuHoverActive.value && isDesktop.value)
  )
})

const menuLinkClasses = computed(() => {
  const { layoutConfig } = useLayoutEnhanced()
  const classes = [
    'flex',
    'items-center',
    'px-4',
    'py-2.5',
    'rounded-lg',
    'transition-colors',
    'duration-200',
    'no-underline',
    'relative',
    'min-w-0',
    'flex-1',
  ]

  // Active state styling - matching Demo_Frontend with left border
  if (isActive.value) {
    classes.push('bg-primary-500/10', 'text-primary-500', 'font-semibold')
    // Add left border for active state
    classes.push(
      'before:absolute',
      'before:left-0',
      'before:top-0',
      'before:bottom-0',
      'before:w-1',
      'before:bg-primary-500',
      'before:rounded-l-lg'
    )
  } else {
    // Theme-specific colors for proper visibility
    if (layoutConfig.value.menuTheme === 'dark') {
      classes.push('text-slate-300', 'hover:text-white', 'hover:bg-white/10')
    } else if (layoutConfig.value.menuTheme === 'primary') {
      classes.push('text-primary-100', 'hover:text-white', 'hover:bg-white/20')
    } else {
      classes.push(
        'text-gray-600',
        'dark:text-gray-400',
        'hover:bg-gray-100',
        'dark:hover:bg-gray-800',
        'hover:text-gray-900',
        'dark:hover:text-gray-100'
      )
    }
  }

  // Center content for slim/compact when collapsed
  if ((isSlim.value || isCompact.value) && !menuHoverActive.value) {
    classes.push('justify-center', 'px-0')
  }

  // Use padding map for nested items
  if (props.level > 0 && showLabel.value) {
    classes.push(paddingMap[Math.min(props.level, 4)])
  }

  return classes
})

const menuButtonClasses = computed(() => {
  const { layoutConfig } = useLayoutEnhanced()
  const classes = [
    'w-full',
    'flex',
    'items-center',
    'px-3',
    'py-2.5',
    'rounded-lg',
    'bg-transparent',
    'border-none',
    'cursor-pointer',
    'transition-all',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-opacity-20',
  ]

  // Theme-specific colors for proper visibility
  if (layoutConfig.value.menuTheme === 'dark') {
    classes.push('text-slate-300', 'hover:text-white', 'hover:bg-white/10', 'focus:ring-white/20')
    if (hasActiveChild.value) {
      classes.push('bg-white/10', 'text-white', 'font-medium')
    }
  } else if (layoutConfig.value.menuTheme === 'primary') {
    classes.push('text-primary-100', 'hover:text-white', 'hover:bg-white/20', 'focus:ring-white/20')
    if (hasActiveChild.value) {
      classes.push('bg-white/20', 'text-white', 'font-medium')
    }
  } else {
    classes.push(
      'text-slate-700',
      'hover:text-slate-900',
      'hover:bg-slate-100',
      'focus:ring-slate-400'
    )
    if (hasActiveChild.value) {
      classes.push('bg-slate-100', 'text-slate-900', 'font-medium')
    }
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
  'mt-1',
  'space-y-1',
  {
    'ml-4': showLabel.value && props.root,
    'absolute left-full top-0 ml-2 bg-surface-0 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg shadow-lg p-2 min-w-48 z-50':
      (isSlim.value || isCompact.value) && menuHoverActive.value && isDesktop.value,
  },
])

const submenuIcon = computed(() =>
  isSubmenuOpen.value ? 'pi pi-chevron-down' : 'pi pi-chevron-right'
)

const iconClasses = computed(() => {
  const classes = ['text-xl', 'w-6', 'flex-shrink-0', 'text-center']

  // Center icon when label is hidden
  if ((isSlim.value || isCompact.value) && !menuHoverActive.value) {
    classes.push('m-0')
  } else {
    classes.push('mr-3')
  }

  return classes
})

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
  itemKey.value = props.parentKey ? `${props.parentKey}-${props.index}` : String(props.index)

  if (props.item.to && route.path === props.item.to) {
    setActiveMenuItem(itemKey.value)
  } else if (hasActiveChild.value) {
    isSubmenuOpen.value = true
    setActiveMenuItem(itemKey.value)
  }
})

// Watch for route changes
watch(
  () => route.path,
  newPath => {
    if (props.item.to && newPath === props.item.to) {
      setActiveMenuItem(itemKey.value)
    } else if (hasActiveChild.value) {
      isSubmenuOpen.value = true
    }
  }
)
</script>

<style scoped>
.menu-icon {
  font-size: 1.25rem;
  width: 1.5rem;
  flex-shrink: 0;
  text-align: center;
}

.menu-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

.submenu-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

/* Center icon when label is hidden */
.justify-center .menu-icon {
  margin: 0;
}

/* Enhanced active state */
.menu-link.bg-primary-500\/10 {
  font-weight: 600;
}

/* Submenu styling */
.submenu {
  margin-top: 0.25rem;
}

.submenu .menu-item {
  margin-top: 0.25rem;
}

.submenu .menu-link {
  font-size: 0.875rem;
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
