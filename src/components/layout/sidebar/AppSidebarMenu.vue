<template>
  <nav class="layout-menu p-2">
    <ul class="menu-list space-y-1">
      <template v-for="(item, i) in menuItems" :key="item.label || i">
        <AppSidebarMenuItem 
          v-if="!item.separator"
          :item="item" 
          :index="i"
          :root="true"
        />
        <li v-else class="menu-separator my-3">
          <hr class="border-current border-opacity-20" />
        </li>
      </template>
    </ul>
  </nav>
</template>

<script setup lang="ts">
const menuItems = ref([
  {
    label: 'Dashboard',
    icon: 'pi pi-home',
    to: '/'
  },
  {
    label: 'Layout Demo',
    icon: 'pi pi-th-large',
    to: '/layout-demo'
  },
  {
    label: 'Components',
    icon: 'pi pi-star',
    items: [
      {
        label: 'Form Demo',
        icon: 'pi pi-fw pi-list',
        to: '/forms'
      },
      {
        label: 'Components Demo', 
        icon: 'pi pi-fw pi-cog',
        to: '/components'
      },
      {
        label: 'Tables Demo',
        icon: 'pi pi-fw pi-table',
        to: '/tables'
      }
    ]
  },
  { separator: true },
  {
    label: 'Theme System',
    icon: 'pi pi-palette',
    items: [
      {
        label: 'Theme Configurator',
        icon: 'pi pi-fw pi-paint-bucket',
        to: '/theme-config'
      },
      {
        label: 'Color Tokens',
        icon: 'pi pi-fw pi-circle',
        to: '/color-tokens'
      }
    ]
  },
  { separator: true },
  {
    label: 'About',
    icon: 'pi pi-info-circle',
    to: '/components'
  }
])
</script>

<style scoped>
.layout-menu {
  width: 100%;
}

.menu-separator {
  margin: 0.75rem 0;
}
</style> 