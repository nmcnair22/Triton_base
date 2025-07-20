<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="text-center py-8">
      <h1 class="text-4xl font-bold text-surface-900 dark:text-surface-100 mb-4">Data Tables</h1>
      <p class="text-lg text-surface-600 dark:text-surface-400">
        Advanced data table examples with sorting, filtering, and custom styling
      </p>
    </div>

    <!-- Basic Table -->
    <AppCard elevation="low">
      <template #title>
        <h2 class="text-2xl font-semibold text-surface-900 dark:text-surface-100 flex items-center">
          <i class="pi pi-table mr-3 text-primary"></i>
          Sample Data Table
        </h2>
      </template>

      <DataTable
        :value="sampleData"
        :dt="tableTokens"
        :paginator="true"
        :rows="5"
        responsive-layout="scroll"
        class="w-full"
      >
        <Column field="id" header="ID" sortable></Column>
        <Column field="name" header="Name" sortable></Column>
        <Column field="email" header="Email" sortable></Column>
        <Column field="role" header="Role">
          <template #body="{ data }">
            <span
              class="px-2 py-1 rounded-full text-xs font-medium"
              :class="getRoleBadgeClass(data.role)"
            >
              {{ data.role }}
            </span>
          </template>
        </Column>
        <Column field="status" header="Status">
          <template #body="{ data }">
            <span
              class="px-2 py-1 rounded-full text-xs font-medium flex items-center"
              :class="getStatusBadgeClass(data.status)"
            >
              <i
                class="pi mr-1"
                :class="data.status === 'Active' ? 'pi-check-circle' : 'pi-times-circle'"
              ></i>
              {{ data.status }}
            </span>
          </template>
        </Column>
        <Column header="Actions">
          <template #body>
            <div class="flex gap-2">
              <AppButton variant="ghost" size="small">
                <template #icon><i class="pi pi-pencil"></i></template>
              </AppButton>
              <AppButton variant="ghost" size="small">
                <template #icon><i class="pi pi-trash"></i></template>
              </AppButton>
            </div>
          </template>
        </Column>
      </DataTable>
    </AppCard>

    <!-- Features Overview -->
    <AppCard elevation="medium">
      <template #title>
        <h2 class="text-2xl font-semibold text-surface-900 dark:text-surface-100 flex items-center">
          <i class="pi pi-list mr-3 text-primary"></i>
          Table Features
        </h2>
      </template>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="text-center p-4">
          <div
            class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-3"
          >
            <i class="pi pi-sort text-blue-600 dark:text-blue-400 text-xl"></i>
          </div>
          <h3 class="font-semibold text-surface-900 dark:text-surface-100 mb-2">Sorting</h3>
          <p class="text-sm text-surface-600 dark:text-surface-400">
            Click column headers to sort data
          </p>
        </div>

        <div class="text-center p-4">
          <div
            class="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-3"
          >
            <i class="pi pi-search text-purple-600 dark:text-purple-400 text-xl"></i>
          </div>
          <h3 class="font-semibold text-surface-900 dark:text-surface-100 mb-2">Filtering</h3>
          <p class="text-sm text-surface-600 dark:text-surface-400">
            Advanced filtering capabilities
          </p>
        </div>

        <div class="text-center p-4">
          <div
            class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-3"
          >
            <i class="pi pi-forward text-green-600 dark:text-green-400 text-xl"></i>
          </div>
          <h3 class="font-semibold text-surface-900 dark:text-surface-100 mb-2">Pagination</h3>
          <p class="text-sm text-surface-600 dark:text-surface-400">Built-in pagination support</p>
        </div>

        <div class="text-center p-4">
          <div
            class="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mx-auto mb-3"
          >
            <i class="pi pi-mobile text-red-600 dark:text-red-400 text-xl"></i>
          </div>
          <h3 class="font-semibold text-surface-900 dark:text-surface-100 mb-2">Responsive</h3>
          <p class="text-sm text-surface-600 dark:text-surface-400">
            Mobile-friendly responsive design
          </p>
        </div>

        <div class="text-center p-4">
          <div
            class="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center mx-auto mb-3"
          >
            <i class="pi pi-palette text-yellow-600 dark:text-yellow-400 text-xl"></i>
          </div>
          <h3 class="font-semibold text-surface-900 dark:text-surface-100 mb-2">Themed</h3>
          <p class="text-sm text-surface-600 dark:text-surface-400">Design token customization</p>
        </div>

        <div class="text-center p-4">
          <div
            class="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mx-auto mb-3"
          >
            <i class="pi pi-cog text-indigo-600 dark:text-indigo-400 text-xl"></i>
          </div>
          <h3 class="font-semibold text-surface-900 dark:text-surface-100 mb-2">Customizable</h3>
          <p class="text-sm text-surface-600 dark:text-surface-400">
            Flexible column configuration
          </p>
        </div>
      </div>
    </AppCard>

    <!-- Coming Soon -->
    <AppCard elevation="low">
      <template #title>
        <h2 class="text-2xl font-semibold text-surface-900 dark:text-surface-100 flex items-center">
          <i class="pi pi-clock mr-3 text-primary"></i>
          Advanced Examples Coming Soon
        </h2>
      </template>

      <div class="text-center py-8">
        <i class="pi pi-wrench text-surface-400 text-4xl mb-4 block"></i>
        <p class="text-surface-600 dark:text-surface-400 mb-4">
          More advanced table examples in development:
        </p>
        <ul class="text-left max-w-md mx-auto space-y-2 text-surface-600 dark:text-surface-400">
          <li class="flex items-center">
            <i class="pi pi-check text-green-500 mr-2"></i>Virtual scrolling for large datasets
          </li>
          <li class="flex items-center">
            <i class="pi pi-check text-green-500 mr-2"></i>Inline editing capabilities
          </li>
          <li class="flex items-center">
            <i class="pi pi-check text-green-500 mr-2"></i>Advanced filtering with search
          </li>
          <li class="flex items-center">
            <i class="pi pi-check text-green-500 mr-2"></i>Export to CSV/Excel functionality
          </li>
          <li class="flex items-center">
            <i class="pi pi-check text-green-500 mr-2"></i>Row selection and bulk actions
          </li>
        </ul>
      </div>
    </AppCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { AppButton, AppCard } from '@/components/ui'
import { TokenFactory } from '@/themes'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

// Sample data
const sampleData = ref([
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Editor', status: 'Inactive' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'User', status: 'Active' },
  { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'Editor', status: 'Active' },
  { id: 6, name: 'Diana Davis', email: 'diana@example.com', role: 'Admin', status: 'Inactive' },
  { id: 7, name: 'Eve Miller', email: 'eve@example.com', role: 'User', status: 'Active' },
])

// Table styling using design tokens
const tableTokens = TokenFactory.dataTable()

const getRoleBadgeClass = (role: string) => {
  const classes = {
    Admin: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    Editor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    User: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  }
  return classes[role as keyof typeof classes] || classes.User
}

const getStatusBadgeClass = (status: string) => {
  return status === 'Active'
    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
}
</script>
