<template>
  <nav class="layout-menu">
    <ul class="menu-list">
      <li v-for="(item, index) in menuItems" :key="index" class="menu-item">
        <router-link 
          :to="item.to" 
          class="menu-link"
          :class="{ 'menu-link-active': $route.path === item.to }"
        >
          <i :class="item.icon" class="menu-icon"></i>
          <span class="menu-label">{{ item.label }}</span>
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
interface MenuItem {
  label: string
  to: string
  icon: string
}

const menuItems: MenuItem[] = [
  { label: 'Dashboard', to: '/', icon: 'pi pi-home' },
  { label: 'Components', to: '/components', icon: 'pi pi-palette' },
  { label: 'Forms', to: '/forms', icon: 'pi pi-file-edit' },
  { label: 'Tables', to: '/tables', icon: 'pi pi-table' },
  { label: 'Charts', to: '/charts', icon: 'pi pi-chart-bar' },
  { label: 'Settings', to: '/settings', icon: 'pi pi-cog' }
]
</script>

<style scoped>
@reference "../../assets/main.css";

.layout-menu {
  @apply p-4;
}

.menu-list {
  @apply space-y-1;
}

.menu-item {
  @apply list-none;
}

.menu-link {
  @apply flex items-center space-x-3 px-3 py-2 rounded-lg text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all duration-200 no-underline;
}

.menu-link-active {
  @apply bg-primary-100 text-primary-600 border border-primary-200;
}

.menu-icon {
  @apply w-5 h-5 flex-shrink-0;
}

.menu-label {
  @apply text-sm font-medium;
}
</style> 