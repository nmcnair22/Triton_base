<template>
  <div class="min-h-screen bg-surface-50 dark:bg-surface-950 transition-colors">
    <!-- Header -->
    <header
      class="bg-surface-0 dark:bg-surface-900 border-b border-surface-200 dark:border-surface-700 sticky top-0 z-50 backdrop-blur-sm"
    >
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <!-- Logo & Title -->
          <div class="flex items-center space-x-4">
            <div
              class="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center"
            >
              <i class="pi pi-bolt text-white text-sm font-bold"></i>
            </div>
            <div>
              <h1 class="text-xl font-bold text-surface-900 dark:text-surface-100">Triton</h1>
              <p class="text-xs text-surface-500 dark:text-surface-400 hidden sm:block">
                PrimeVue 4 + Tailwind CSS 4
              </p>
            </div>
          </div>

          <!-- Navigation -->
          <nav class="hidden md:flex space-x-1">
            <router-link
              v-for="item in navigation"
              :key="item.name"
              :to="item.to"
              class="px-3 py-2 text-sm font-medium rounded-md transition-all duration-200"
              :class="[
                $route.path === item.to
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-surface-600 dark:text-surface-400 hover:text-primary hover:bg-surface-100 dark:hover:bg-surface-800',
              ]"
            >
              <i :class="item.icon" class="mr-2"></i>
              {{ item.name }}
            </router-link>
          </nav>

          <!-- Actions -->
          <div class="flex items-center space-x-2">
            <!-- Theme Toggle -->
            <AppButton
              variant="ghost"
              size="small"
              :dt="themeToggleTokens"
              @click="toggleDarkMode"
              class="relative"
            >
              <template #icon>
                <i
                  :class="isDark ? 'pi pi-sun' : 'pi pi-moon'"
                  class="transition-transform duration-300"
                  :style="{ transform: isDark ? 'rotate(180deg)' : 'rotate(0deg)' }"
                />
              </template>
            </AppButton>

            <!-- Mobile Menu Button -->
            <AppButton
              variant="ghost"
              size="small"
              class="md:hidden"
              @click="mobileMenuOpen = !mobileMenuOpen"
            >
              <template #icon>
                <i :class="mobileMenuOpen ? 'pi pi-times' : 'pi pi-bars'"></i>
              </template>
            </AppButton>
          </div>
        </div>

        <!-- Mobile Navigation -->
        <div
          v-if="mobileMenuOpen"
          class="md:hidden border-t border-surface-200 dark:border-surface-700 py-4 animate-fade-in"
        >
          <nav class="space-y-2">
            <router-link
              v-for="item in navigation"
              :key="item.name"
              :to="item.to"
              @click="mobileMenuOpen = false"
              class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200"
              :class="[
                $route.path === item.to
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-surface-600 dark:text-surface-400 hover:text-primary hover:bg-surface-100 dark:hover:bg-surface-800',
              ]"
            >
              <i :class="item.icon" class="mr-3 w-4 h-4"></i>
              {{ item.name }}
            </router-link>
          </nav>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <router-view />
    </main>

    <!-- Footer -->
    <footer
      class="bg-surface-100 dark:bg-surface-900 border-t border-surface-200 dark:border-surface-700 mt-16"
    >
      <div class="container mx-auto px-4 py-8">
        <div class="grid md:grid-cols-3 gap-8">
          <div>
            <h3 class="font-semibold text-surface-900 dark:text-surface-100 mb-3">
              Triton Design System
            </h3>
            <p class="text-sm text-surface-600 dark:text-surface-400">
              A modern design system built with PrimeVue 4, Tailwind CSS 4, and Vue 3. Featuring
              design tokens, dark mode, and type-safe components.
            </p>
          </div>
          <div>
            <h4 class="font-medium text-surface-900 dark:text-surface-100 mb-3">Technologies</h4>
            <ul class="space-y-1 text-sm text-surface-600 dark:text-surface-400">
              <li>Vue 3 + TypeScript</li>
              <li>PrimeVue 4 (Styled Mode)</li>
              <li>Tailwind CSS 4</li>
              <li>Design Tokens (dt)</li>
              <li>Vite + Auto-imports</li>
            </ul>
          </div>
          <div>
            <h4 class="font-medium text-surface-900 dark:text-surface-100 mb-3">Features</h4>
            <ul class="space-y-1 text-sm text-surface-600 dark:text-surface-400">
              <li>Dynamic Dark Mode</li>
              <li>Type-safe Components</li>
              <li>Performance Optimized</li>
              <li>Responsive Design</li>
              <li>Accessibility Ready</li>
            </ul>
          </div>
        </div>
        <div class="mt-8 pt-6 border-t border-surface-200 dark:border-surface-700 text-center">
          <p class="text-sm text-surface-500 dark:text-surface-400">
            Built with ❤️ using modern web technologies
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useDarkMode } from '@/composables'
import { AppButton } from '@/components/ui'

const route = useRoute()
const { isDark, toggleDarkMode } = useDarkMode()
const mobileMenuOpen = ref(false)

const navigation = [
  { name: 'Dashboard', to: '/', icon: 'pi pi-home' },
  { name: 'Components', to: '/components', icon: 'pi pi-palette' },
  { name: 'Forms', to: '/forms', icon: 'pi pi-file-edit' },
  { name: 'Tables', to: '/tables', icon: 'pi pi-table' },
]

const themeToggleTokens = {
  root: {
    width: '2.5rem',
    height: '2.5rem',
    borderRadius: '50%',
    background: 'transparent',
    border: '1px solid {surface.300}',
    color: '{surface.600}',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover:not(:disabled)': {
      background: '{surface.100}',
      color: '{surface.900}',
      borderColor: '{surface.400}',
      transform: 'scale(1.05)',
    },
  },
  colorScheme: {
    dark: {
      root: {
        borderColor: '{surface.600}',
        color: '{surface.400}',
        '&:hover:not(:disabled)': {
          background: '{surface.800}',
          color: '{surface.100}',
          borderColor: '{surface.500}',
        },
      },
    },
  },
}

// Close mobile menu when route changes
watch(
  () => route.path,
  () => {
    mobileMenuOpen.value = false
  },
)
</script>


