<script setup lang="ts">
import { AppButton, AppCard } from '@/components/ui'
</script>

<template>
  <div class="space-y-8">
    <!-- Welcome Hero -->
    <div
      class="text-center py-12 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-xl"
    >
      <div class="max-w-4xl mx-auto">
        <div class="mb-6">
          <div
            class="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <i class="pi pi-bolt text-white text-2xl font-bold"></i>
          </div>
          <h1 class="text-5xl font-bold text-surface-900 dark:text-surface-100 mb-4">
            Welcome to Triton
          </h1>
          <p class="text-xl text-surface-600 dark:text-surface-400 mb-8">
            A modern design system built with PrimeVue 4, Tailwind CSS 4, and Vue 3
          </p>
        </div>

        <div class="flex flex-wrap justify-center gap-4">
          <AppButton variant="primary" size="large">
            <template #icon><i class="pi pi-palette"></i></template>
            View Components
          </AppButton>
          <AppButton variant="secondary" size="large">
            <template #icon><i class="pi pi-github"></i></template>
            View Source
          </AppButton>
        </div>
      </div>
    </div>

    <!-- Key Features Grid -->
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AppCard elevation="low" hoverable>
        <template #header>
          <div class="p-6 pb-0">
            <div
              class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4"
            >
              <i class="pi pi-desktop text-blue-600 dark:text-blue-400 text-xl"></i>
            </div>
          </div>
        </template>
        <template #title>Modern Architecture</template>
        <template #subtitle>Built with the latest technologies</template>
        <p class="text-surface-600 dark:text-surface-400">
          Vue 3 with Composition API, TypeScript, and Vite for lightning-fast development
          experience.
        </p>
      </AppCard>

      <AppCard elevation="low" hoverable>
        <template #header>
          <div class="p-6 pb-0">
            <div
              class="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4"
            >
              <i class="pi pi-palette text-purple-600 dark:text-purple-400 text-xl"></i>
            </div>
          </div>
        </template>
        <template #title>Design Tokens</template>
        <template #subtitle>Theme-aware customization</template>
        <p class="text-surface-600 dark:text-surface-400">
          Use <code class="bg-surface-200 dark:bg-surface-700 px-1 rounded text-sm">dt</code>
          properties for consistent, theme-aware component styling.
        </p>
      </AppCard>

      <AppCard elevation="low" hoverable>
        <template #header>
          <div class="p-6 pb-0">
            <div
              class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4"
            >
              <i class="pi pi-moon text-green-600 dark:text-green-400 text-xl"></i>
            </div>
          </div>
        </template>
        <template #title>Dark Mode</template>
        <template #subtitle>Automatic theme switching</template>
        <p class="text-surface-600 dark:text-surface-400">
          Built-in dark mode with system detection, localStorage persistence, and smooth
          transitions.
        </p>
      </AppCard>

      <AppCard elevation="low" hoverable>
        <template #header>
          <div class="p-6 pb-0">
            <div
              class="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-4"
            >
              <i class="pi pi-shield text-red-600 dark:text-red-400 text-xl"></i>
            </div>
          </div>
        </template>
        <template #title>Type Safety</template>
        <template #subtitle>Full TypeScript support</template>
        <p class="text-surface-600 dark:text-surface-400">
          Comprehensive TypeScript integration with auto-imports and strict type checking.
        </p>
      </AppCard>

      <AppCard elevation="low" hoverable>
        <template #header>
          <div class="p-6 pb-0">
            <div
              class="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center mb-4"
            >
              <i class="pi pi-bolt text-yellow-600 dark:text-yellow-400 text-xl"></i>
            </div>
          </div>
        </template>
        <template #title>Performance</template>
        <template #subtitle>Optimized for production</template>
        <p class="text-surface-600 dark:text-surface-400">
          Tree-shaking, code splitting, and optimized build configuration for maximum performance.
        </p>
      </AppCard>

      <AppCard elevation="low" hoverable>
        <template #header>
          <div class="p-6 pb-0">
            <div
              class="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-4"
            >
              <i class="pi pi-mobile text-indigo-600 dark:text-indigo-400 text-xl"></i>
            </div>
          </div>
        </template>
        <template #title>Responsive</template>
        <template #subtitle>Mobile-first design</template>
        <p class="text-surface-600 dark:text-surface-400">
          Fully responsive design with mobile-first approach and touch-friendly interactions.
        </p>
      </AppCard>
    </div>

    <!-- Technical Stack -->
    <AppCard elevation="medium">
      <template #title>
        <h2 class="text-2xl font-semibold text-surface-900 dark:text-surface-100 flex items-center">
          <i class="pi pi-cog mr-3 text-primary"></i>
          Technical Stack
        </h2>
      </template>

      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="text-center p-4">
          <div
            class="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-3"
          >
            <svg
              class="w-8 h-8 text-green-600 dark:text-green-400"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M12,2.2467A10.00042,10.00042,0,0,0,8.83752,21.73419c.5.08752.6875-.21247.6875-.475,0-.23749-.01251-1.025-.01251-1.86249C7,19.85919,6.35,18.78423,6.15,18.22173A3.636,3.636,0,0,0,5.125,16.8092c-.35-.1875-.85-.65-.01251-.66248A2.00117,2.00117,0,0,1,6.65,17.17169a2.13742,2.13742,0,0,0,2.91248.825A2.10376,2.10376,0,0,1,10.2,16.65923c-2.225-.25-4.55-1.11254-4.55-4.9375a3.89187,3.89187,0,0,1,1.025-2.6875,3.59373,3.59373,0,0,1,.1-2.65s.83747-.26251,2.75,1.025a9.42747,9.42747,0,0,1,5,0c1.91248-1.3,2.75-1.025,2.75-1.025a3.59323,3.59323,0,0,1,.1,2.65,3.869,3.869,0,0,1,1.025,2.6875c0,3.83747-2.33752,4.6875-4.5625,4.9375a2.36814,2.36814,0,0,1,.675,1.85c0,1.33752-.01251,2.41248-.01251,2.75,0,.26251.1875.575.6875.475A10.0053,10.0053,0,0,0,12,2.2467Z"
              />
            </svg>
          </div>
          <h3 class="font-semibold text-surface-900 dark:text-surface-100">Vue 3</h3>
          <p class="text-sm text-surface-600 dark:text-surface-400">Progressive Framework</p>
        </div>

        <div class="text-center p-4">
          <div
            class="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-3"
          >
            <svg
              class="w-8 h-8 text-blue-600 dark:text-blue-400"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M1.5 6.375c0-1.036.84-1.875 1.875-1.875h17.25c1.035 0 1.875.84 1.875 1.875v3.026a.75.75 0 01-.375.65 2.249 2.249 0 000 3.898.75.75 0 01.375.65v3.026c0 1.035-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 17.625v-3.026a.75.75 0 01.374-.65 2.249 2.249 0 000-3.898.75.75 0 01-.374-.65V6.375z"
              />
            </svg>
          </div>
          <h3 class="font-semibold text-surface-900 dark:text-surface-100">PrimeVue 4</h3>
          <p class="text-sm text-surface-600 dark:text-surface-400">UI Component Library</p>
        </div>

        <div class="text-center p-4">
          <div
            class="w-16 h-16 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center mx-auto mb-3"
          >
            <svg
              class="w-8 h-8 text-cyan-600 dark:text-cyan-400"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 C13.666,10.618,15.027,12,18.001,12c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C16.337,6.182,14.976,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 c1.177,1.194,2.538,2.576,5.512,2.576c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C10.337,13.382,8.976,12,6.001,12z"
              />
            </svg>
          </div>
          <h3 class="font-semibold text-surface-900 dark:text-surface-100">Tailwind CSS 4</h3>
          <p class="text-sm text-surface-600 dark:text-surface-400">Utility-First CSS</p>
        </div>

        <div class="text-center p-4">
          <div
            class="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-3"
          >
            <svg
              class="w-8 h-8 text-purple-600 dark:text-purple-400"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z"
              />
            </svg>
          </div>
          <h3 class="font-semibold text-surface-900 dark:text-surface-100">TypeScript</h3>
          <p class="text-sm text-surface-600 dark:text-surface-400">Type Safety</p>
        </div>
      </div>
    </AppCard>

    <!-- Quick Actions -->
    <AppCard elevation="low">
      <template #title>
        <h2 class="text-2xl font-semibold text-surface-900 dark:text-surface-100 flex items-center">
          <i class="pi pi-bolt mr-3 text-primary"></i>
          Quick Actions
        </h2>
      </template>

      <div class="grid md:grid-cols-3 gap-4">
        <router-link to="/components" class="block">
          <div
            class="p-6 border border-surface-200 dark:border-surface-700 rounded-lg hover:border-primary/50 hover:bg-surface-50 dark:hover:bg-surface-800 transition-all duration-200"
          >
            <i class="pi pi-palette text-primary text-2xl mb-3 block"></i>
            <h3 class="font-semibold text-surface-900 dark:text-surface-100 mb-2">
              View Components
            </h3>
            <p class="text-sm text-surface-600 dark:text-surface-400">
              Explore the complete component library with live examples
            </p>
          </div>
        </router-link>

        <router-link to="/forms" class="block">
          <div
            class="p-6 border border-surface-200 dark:border-surface-700 rounded-lg hover:border-primary/50 hover:bg-surface-50 dark:hover:bg-surface-800 transition-all duration-200"
          >
            <i class="pi pi-file-edit text-primary text-2xl mb-3 block"></i>
            <h3 class="font-semibold text-surface-900 dark:text-surface-100 mb-2">Form Examples</h3>
            <p class="text-sm text-surface-600 dark:text-surface-400">
              See form patterns and validation in action
            </p>
          </div>
        </router-link>

        <router-link to="/tables" class="block">
          <div
            class="p-6 border border-surface-200 dark:border-surface-700 rounded-lg hover:border-primary/50 hover:bg-surface-50 dark:hover:bg-surface-800 transition-all duration-200"
          >
            <i class="pi pi-table text-primary text-2xl mb-3 block"></i>
            <h3 class="font-semibold text-surface-900 dark:text-surface-100 mb-2">Data Tables</h3>
            <p class="text-sm text-surface-600 dark:text-surface-400">
              Advanced data table examples with sorting and filtering
            </p>
          </div>
        </router-link>
      </div>
    </AppCard>
  </div>
</template>
