<template>
  <div class="app-user-menu relative">
    <!-- User Avatar Button -->
    <button
      ref="userButton"
      class="user-button flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
      @click="toggleMenu"
    >
      <Avatar 
        :image="user.avatar"
        :label="user.initials"
        size="normal"
        shape="circle"
        class="w-8 h-8"
      />
      <div v-if="showName" class="text-left hidden lg:block">
        <div class="text-sm font-medium text-surface-900 dark:text-surface-0">
          {{ user.name }}
        </div>
        <div class="text-xs text-surface-500 dark:text-surface-400">
          {{ user.role }}
        </div>
      </div>
      <i class="pi pi-chevron-down text-xs ml-1 transition-transform duration-200"
         :class="{ 'rotate-180': isMenuOpen }"
      ></i>
    </button>

    <!-- Dropdown Menu -->
    <Transition name="dropdown">
      <div
        v-if="isMenuOpen"
        ref="menuRef"
        class="user-dropdown absolute right-0 mt-2 w-64 bg-surface-0 dark:bg-surface-900 rounded-lg shadow-lg border border-surface-200 dark:border-surface-700 overflow-hidden z-50"
      >
        <!-- User Info Header -->
        <div class="p-4 bg-surface-50 dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700">
          <div class="flex items-center gap-3">
            <Avatar 
              :image="user.avatar"
              :label="user.initials"
              size="large"
              shape="circle"
            />
            <div class="flex-1 min-w-0">
              <div class="font-medium text-surface-900 dark:text-surface-0 truncate">
                {{ user.name }}
              </div>
              <div class="text-sm text-surface-500 dark:text-surface-400 truncate">
                {{ user.email }}
              </div>
              <Tag :value="user.role" severity="info" class="mt-1" />
            </div>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="grid grid-cols-3 gap-1 p-3 border-b border-surface-200 dark:border-surface-700">
          <div class="text-center">
            <div class="text-lg font-semibold text-primary-600">{{ stats.projects }}</div>
            <div class="text-xs text-surface-500">Projects</div>
          </div>
          <div class="text-center border-x border-surface-200 dark:border-surface-700">
            <div class="text-lg font-semibold text-success-600">{{ stats.tasks }}</div>
            <div class="text-xs text-surface-500">Tasks</div>
          </div>
          <div class="text-center">
            <div class="text-lg font-semibold text-warning-600">{{ stats.notifications }}</div>
            <div class="text-xs text-surface-500">Alerts</div>
          </div>
        </div>

        <!-- Menu Items -->
        <div class="py-2">
          <template v-for="(item, index) in menuItems" :key="index">
            <Divider v-if="item.separator" class="my-2" />
            <router-link
              v-else-if="item.to"
              :to="item.to"
              class="menu-item"
              @click="closeMenu"
            >
              <i :class="item.icon" class="w-5"></i>
              <span>{{ item.label }}</span>
              <Badge v-if="item.badge" :value="item.badge" :severity="item.badgeSeverity" class="ml-auto" />
            </router-link>
            <button
              v-else
              class="menu-item w-full"
              @click="handleAction(item)"
            >
              <i :class="item.icon" class="w-5"></i>
              <span>{{ item.label }}</span>
              <i v-if="item.items" class="pi pi-chevron-right ml-auto text-xs"></i>
            </button>
          </template>
        </div>

        <!-- Footer Actions -->
        <div class="p-3 bg-surface-50 dark:bg-surface-800 border-t border-surface-200 dark:border-surface-700">
          <Button
            label="Sign Out"
            icon="pi pi-sign-out"
            severity="danger"
            outlined
            class="w-full"
            size="small"
            @click="handleSignOut"
          />
        </div>
      </div>
    </Transition>

    <!-- Sub Menu (for nested items) -->
    <Transition name="slide">
      <div
        v-if="activeSubmenu"
        class="submenu absolute right-full top-0 mr-2 w-48 bg-surface-0 dark:bg-surface-900 rounded-lg shadow-lg border border-surface-200 dark:border-surface-700 z-50"
      >
        <div class="py-2">
          <button
            v-for="subItem in activeSubmenu.items"
            :key="subItem.label"
            class="menu-item w-full"
            @click="handleSubAction(subItem)"
          >
            <i :class="subItem.icon" class="w-5"></i>
            <span>{{ subItem.label }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useEventListener } from '@vueuse/core'

interface Props {
  showName?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showName: false
})

const router = useRouter()
const toast = useToast()

// User data (replace with your auth store)
const user = ref({
  name: 'John Doe',
  email: 'john.doe@triton.com',
  role: 'Administrator',
  avatar: '/images/avatar/default.jpg',
  initials: 'JD'
})

const stats = ref({
  projects: 12,
  tasks: 48,
  notifications: 3
})

// Menu state
const isMenuOpen = ref(false)
const activeSubmenu = ref<any>(null)
const userButton = ref<HTMLElement>()
const menuRef = ref<HTMLElement>()

// Menu items
const menuItems = computed(() => [
  {
    label: 'My Profile',
    icon: 'pi pi-user',
    to: '/profile'
  },
  {
    label: 'Account Settings',
    icon: 'pi pi-cog',
    to: '/settings/account'
  },
  {
    label: 'Notifications',
    icon: 'pi pi-bell',
    badge: stats.value.notifications,
    badgeSeverity: 'danger',
    to: '/notifications'
  },
  { separator: true },
  {
    label: 'Theme',
    icon: 'pi pi-palette',
    items: [
      { label: 'Light', icon: 'pi pi-sun', action: 'theme-light' },
      { label: 'Dark', icon: 'pi pi-moon', action: 'theme-dark' },
      { label: 'System', icon: 'pi pi-desktop', action: 'theme-system' }
    ]
  },
  {
    label: 'Language',
    icon: 'pi pi-globe',
    items: [
      { label: 'English', icon: 'pi pi-flag', action: 'lang-en' },
      { label: 'Spanish', icon: 'pi pi-flag', action: 'lang-es' },
      { label: 'French', icon: 'pi pi-flag', action: 'lang-fr' }
    ]
  },
  { separator: true },
  {
    label: 'Help & Support',
    icon: 'pi pi-question-circle',
    to: '/help'
  },
  {
    label: 'Keyboard Shortcuts',
    icon: 'pi pi-keyboard',
    action: 'shortcuts'
  }
])

// Methods
function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
  if (!isMenuOpen.value) {
    activeSubmenu.value = null
  }
}

function closeMenu() {
  isMenuOpen.value = false
  activeSubmenu.value = null
}

function handleAction(item: any) {
  if (item.items) {
    activeSubmenu.value = activeSubmenu.value === item ? null : item
  } else if (item.action) {
    executeAction(item.action)
    closeMenu()
  }
}

function handleSubAction(subItem: any) {
  if (subItem.action) {
    executeAction(subItem.action)
  }
  closeMenu()
}

function executeAction(action: string) {
  switch (action) {
    case 'theme-light':
      // Handle theme change
      document.documentElement.classList.remove('dark')
      toast.add({ severity: 'success', summary: 'Theme Changed', detail: 'Switched to light theme', life: 3000 })
      break
    case 'theme-dark':
      document.documentElement.classList.add('dark')
      toast.add({ severity: 'success', summary: 'Theme Changed', detail: 'Switched to dark theme', life: 3000 })
      break
    case 'shortcuts':
      // Show shortcuts modal
      toast.add({ severity: 'info', summary: 'Keyboard Shortcuts', detail: 'Press Ctrl+K to open command palette', life: 5000 })
      break
    default:
      console.log('Action:', action)
  }
}

function handleSignOut() {
  toast.add({ 
    severity: 'info', 
    summary: 'Signing Out', 
    detail: 'You are being signed out...', 
    life: 2000 
  })
  
  setTimeout(() => {
    router.push('/login')
  }, 2000)
}

// Click outside to close
useEventListener(document, 'click', (e: MouseEvent) => {
  if (userButton.value && !userButton.value.contains(e.target as Node) &&
      menuRef.value && !menuRef.value.contains(e.target as Node)) {
    closeMenu()
  }
})

// Keyboard navigation
onMounted(() => {
  useEventListener(document, 'keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isMenuOpen.value) {
      closeMenu()
    }
  })
})
</script>

<style scoped>
.user-button {
  outline: none;
}

.user-button:focus {
  box-shadow: 0 0 0 2px var(--primary-color);
}

.user-dropdown {
  min-width: 16rem;
  max-width: 20rem;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  color: var(--text-color);
  transition: background-color 0.2s;
  text-decoration: none;
  cursor: pointer;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
}

.menu-item:hover {
  background-color: var(--surface-100);
}

.dark .menu-item:hover {
  background-color: var(--surface-800);
}

.menu-item:focus {
  outline: none;
  background-color: var(--surface-100);
}

.dark .menu-item:focus {
  background-color: var(--surface-800);
}

/* Dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

/* Slide animation for submenu */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.15s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateX(10px);
}
</style> 