<template>
  <ul class="horizontal-menu flex items-center h-full m-0 p-0 list-none">
    <template v-for="(item, i) in menuItems" :key="item.label || i">
      <li
        class="horizontal-menu-item"
        @mouseenter="onItemMouseEnter(item)"
        @mouseleave="onItemMouseLeave"
      >
        <!-- Menu Link -->
        <router-link
          v-if="item.to && !item.items"
          :to="item.to"
          class="horizontal-menu-link"
          :class="{ active: isActive(item) }"
        >
          <i v-if="item.icon" :class="item.icon" class="mr-2"></i>
          <span>{{ item.label }}</span>
        </router-link>

        <!-- Menu Button (with submenu) -->
        <button
          v-else-if="item.items"
          type="button"
          class="horizontal-menu-link"
          :class="{ active: hasActiveChild(item) }"
        >
          <i v-if="item.icon" :class="item.icon" class="mr-2"></i>
          <span>{{ item.label }}</span>
          <i class="pi pi-angle-down ml-2 text-sm"></i>
        </button>

        <!-- Dropdown Submenu -->
        <Transition name="dropdown">
          <div v-if="item.items && activeItem === item" class="horizontal-submenu">
            <ul class="submenu-list">
              <li v-for="child in item.items" :key="child.label">
                <router-link
                  v-if="child.to"
                  :to="child.to"
                  class="submenu-link"
                  :class="{ active: isActive(child) }"
                >
                  <i v-if="child.icon" :class="child.icon" class="mr-2"></i>
                  <span>{{ child.label }}</span>
                </router-link>
              </li>
            </ul>
          </div>
        </Transition>
      </li>
    </template>
  </ul>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const activeItem = ref<any>(null)
let mouseLeaveTimer: any = null

// Same menu items as sidebar
const menuItems = ref([
  {
    label: 'Dashboard',
    icon: 'pi pi-home',
    to: '/',
  },
  {
    label: 'Components',
    icon: 'pi pi-star',
    items: [
      {
        label: 'Form Demo',
        icon: 'pi pi-list',
        to: '/forms-demo',
      },
      {
        label: 'Components Demo',
        icon: 'pi pi-cog',
        to: '/components-demo',
      },
      {
        label: 'Tables Demo',
        icon: 'pi pi-table',
        to: '/tables-demo',
      },
    ],
  },
  {
    label: 'Theme System',
    icon: 'pi pi-palette',
    items: [
      {
        label: 'Theme Configurator',
        icon: 'pi pi-paint-bucket',
        to: '/theme-config',
      },
      {
        label: 'Color Tokens',
        icon: 'pi pi-circle',
        to: '/color-tokens',
      },
    ],
  },
  {
    label: 'About',
    icon: 'pi pi-info-circle',
    to: '/about',
  },
])

function isActive(item: any) {
  if (!item.to) return false
  return route.path === item.to || (item.to !== '/' && route.path.startsWith(item.to))
}

function hasActiveChild(item: any) {
  if (!item.items) return false
  return item.items.some((child: any) => isActive(child))
}

function onItemMouseEnter(item: any) {
  if (mouseLeaveTimer) {
    clearTimeout(mouseLeaveTimer)
    mouseLeaveTimer = null
  }
  if (item.items) {
    activeItem.value = item
  }
}

function onItemMouseLeave() {
  mouseLeaveTimer = setTimeout(() => {
    activeItem.value = null
  }, 100)
}
</script>

<style scoped>
.horizontal-menu {
  height: 100%;
}

.horizontal-menu-item {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
}

.horizontal-menu-link {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 1.25rem;
  color: #374151;
  transition: color 0.2s;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  background: transparent;
  border: 0;
  white-space: nowrap;
}

.dark .horizontal-menu-link {
  color: #d1d5db;
}

.horizontal-menu-link:hover {
  color: #3b82f6;
}

.dark .horizontal-menu-link:hover {
  color: #60a5fa;
}

.horizontal-menu-link.active {
  color: #3b82f6;
  position: relative;
}

.dark .horizontal-menu-link.active {
  color: #60a5fa;
}

.horizontal-menu-link.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #3b82f6;
}

.dark .horizontal-menu-link.active::after {
  background-color: #60a5fa;
}

/* Dropdown */
.horizontal-submenu {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 200px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  margin-top: 0.5rem;
}

.dark .horizontal-submenu {
  background: #1f2937;
  border-color: #374151;
}

.submenu-list {
  list-style: none;
  padding: 0.5rem;
  margin: 0;
}

.submenu-link {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  color: #374151;
  border-radius: 0.375rem;
  transition:
    background-color 0.2s,
    color 0.2s;
  text-decoration: none;
}

.dark .submenu-link {
  color: #d1d5db;
}

.submenu-link:hover {
  background-color: #f3f4f6;
}

.dark .submenu-link:hover {
  background-color: #374151;
}

.submenu-link.active {
  background-color: #dbeafe;
  color: #3b82f6;
}

.dark .submenu-link.active {
  background-color: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}

/* Dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
