<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="text-center py-8">
      <h1 class="text-4xl font-bold text-surface-900 dark:text-surface-100 mb-4">
        Design System Components
      </h1>
      <p class="text-lg text-surface-600 dark:text-surface-400 max-w-2xl mx-auto">
        Built with PrimeVue 4 + Tailwind CSS 4 + Design Tokens. Showcasing
        <code class="bg-primary/10 text-primary px-2 py-1 rounded text-sm">dt</code>
        customization for theme-aware styling.
      </p>
    </div>

    <!-- Buttons Section -->
    <AppCard elevation="low">
      <template #title>
        <h2 class="text-2xl font-semibold text-surface-900 dark:text-surface-100 flex items-center">
          <i class="pi pi-circle mr-3 text-primary"></i>
          Button Variants
        </h2>
      </template>

      <div class="space-y-6">
        <!-- Primary buttons -->
        <div class="space-y-3">
          <h3 class="text-lg font-medium text-surface-700 dark:text-surface-300">Sizes</h3>
          <div class="flex flex-wrap gap-4 items-center">
            <AppButton variant="primary" size="small">Small</AppButton>
            <AppButton variant="primary" size="medium">Medium</AppButton>
            <AppButton variant="primary" size="large">Large</AppButton>
            <AppButton variant="primary" size="medium" rounded>Rounded</AppButton>
          </div>
        </div>

        <!-- All variants -->
        <div class="space-y-3">
          <h3 class="text-lg font-medium text-surface-700 dark:text-surface-300">Variants</h3>
          <div class="flex flex-wrap gap-4">
            <AppButton variant="primary">Primary</AppButton>
            <AppButton variant="secondary">Secondary</AppButton>
            <AppButton variant="success">Success</AppButton>
            <AppButton variant="warning">Warning</AppButton>
            <AppButton variant="danger">Danger</AppButton>
            <AppButton variant="ghost">Ghost</AppButton>
          </div>
        </div>

        <!-- With icons -->
        <div class="space-y-3">
          <h3 class="text-lg font-medium text-surface-700 dark:text-surface-300">With Icons</h3>
          <div class="flex flex-wrap gap-4">
            <AppButton variant="primary">
              <template #icon><i class="pi pi-save"></i></template>
              Save
            </AppButton>
            <AppButton variant="secondary">
              <template #icon><i class="pi pi-download"></i></template>
              Download
            </AppButton>
            <AppButton variant="danger">
              <template #icon><i class="pi pi-trash"></i></template>
              Delete
            </AppButton>
          </div>
        </div>
      </div>
    </AppCard>

    <!-- Cards Section -->
    <AppCard elevation="low">
      <template #title>
        <h2 class="text-2xl font-semibold text-surface-900 dark:text-surface-100 flex items-center">
          <i class="pi pi-clone mr-3 text-primary"></i>
          Card Elevations
        </h2>
      </template>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AppCard elevation="flat" padding="small">
          <template #title>Flat</template>
          <p class="text-surface-600 dark:text-surface-400">No shadow elevation</p>
          <template #footer>
            <AppButton variant="ghost" size="small" class="w-full">Action</AppButton>
          </template>
        </AppCard>

        <AppCard elevation="low" padding="small" hoverable>
          <template #title>Low</template>
          <p class="text-surface-600 dark:text-surface-400">Subtle shadow with hover effect</p>
          <template #footer>
            <AppButton variant="secondary" size="small" class="w-full">Action</AppButton>
          </template>
        </AppCard>

        <AppCard elevation="medium" padding="small">
          <template #title>Medium</template>
          <p class="text-surface-600 dark:text-surface-400">Standard shadow elevation</p>
          <template #footer>
            <AppButton variant="primary" size="small" class="w-full">Action</AppButton>
          </template>
        </AppCard>

        <AppCard elevation="high" padding="small">
          <template #title>High</template>
          <p class="text-surface-600 dark:text-surface-400">Prominent shadow elevation</p>
          <template #footer>
            <AppButton variant="success" size="small" class="w-full">Action</AppButton>
          </template>
        </AppCard>
      </div>
    </AppCard>

    <!-- Input Fields Section -->
    <AppCard elevation="low">
      <template #title>
        <h2 class="text-2xl font-semibold text-surface-900 dark:text-surface-100 flex items-center">
          <i class="pi pi-file-edit mr-3 text-primary"></i>
          Input Fields
        </h2>
      </template>

      <div class="grid md:grid-cols-2 gap-6">
        <div class="space-y-4">
          <AppInput
            v-model="inputValue"
            label="Default Input"
            placeholder="Enter some text..."
            help-text="This is a helper text"
          />

          <AppInput
            v-model="inputValue"
            label="Success State"
            placeholder="Valid input"
            state="success"
          />

          <AppInput
            v-model="inputValue"
            label="Error State"
            placeholder="Invalid input"
            state="error"
            error-message="This field is required"
          />
        </div>

        <div class="space-y-4">
          <AppInput
            v-model="inputValue"
            label="Required Field"
            placeholder="This field is required"
            required
          />

          <AppInput
            v-model="inputValue"
            label="Disabled Input"
            placeholder="This is disabled"
            disabled
          />

          <AppInput
            v-model="inputValue"
            label="Half Width"
            placeholder="Not full width"
            :full-width="false"
          />
        </div>
      </div>
    </AppCard>

    <!-- Theme Demo -->
    <AppCard elevation="medium">
      <template #title>
        <h2 class="text-2xl font-semibold text-surface-900 dark:text-surface-100 flex items-center">
          <i class="pi pi-palette mr-3 text-primary"></i>
          Theme System Demo
        </h2>
      </template>

      <div class="space-y-6">
        <div class="p-6 bg-primary/10 border border-primary/20 rounded-lg">
          <h4 class="font-semibold text-primary mb-3 text-lg">🎨 Design Token Architecture</h4>
          <div class="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 class="font-medium text-surface-900 dark:text-surface-100 mb-2">
                Using dt (Design Tokens):
              </h5>
              <ul class="list-disc list-inside space-y-1 text-surface-700 dark:text-surface-300">
                <li>Theme-aware customization</li>
                <li>Automatic dark mode support</li>
                <li>Type-safe token references</li>
                <li>Consistent design system</li>
              </ul>
            </div>
            <div>
              <h5 class="font-medium text-surface-900 dark:text-surface-100 mb-2">Benefits:</h5>
              <ul class="list-disc list-inside space-y-1 text-surface-700 dark:text-surface-300">
                <li>Single source of truth</li>
                <li>Dynamic theme switching</li>
                <li>Better maintainability</li>
                <li>Accessibility compliance</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="grid md:grid-cols-2 gap-6">
          <div class="p-4 bg-surface-100 dark:bg-surface-800 rounded-lg">
            <h5 class="font-medium text-surface-900 dark:text-surface-100 mb-3">
              Light Theme Colors
            </h5>
            <div class="space-y-2">
              <div class="flex items-center space-x-3">
                <div class="w-4 h-4 bg-primary rounded"></div>
                <span class="text-sm text-surface-700 dark:text-surface-300">Primary</span>
              </div>
              <div class="flex items-center space-x-3">
                <div class="w-4 h-4 bg-surface-600 rounded"></div>
                <span class="text-sm text-surface-700 dark:text-surface-300">Surface</span>
              </div>
              <div class="flex items-center space-x-3">
                <div class="w-4 h-4 bg-green-500 rounded"></div>
                <span class="text-sm text-surface-700 dark:text-surface-300">Success</span>
              </div>
            </div>
          </div>

          <div class="p-4 bg-surface-100 dark:bg-surface-800 rounded-lg">
            <h5 class="font-medium text-surface-900 dark:text-surface-100 mb-3">Key Features</h5>
            <div class="space-y-2 text-sm text-surface-700 dark:text-surface-300">
              <div class="flex items-center space-x-2">
                <i class="pi pi-check text-green-500"></i>
                <span>CSS-first Tailwind CSS 4</span>
              </div>
              <div class="flex items-center space-x-2">
                <i class="pi pi-check text-green-500"></i>
                <span>PrimeVue 4 styled mode</span>
              </div>
              <div class="flex items-center space-x-2">
                <i class="pi pi-check text-green-500"></i>
                <span>Auto-imports & TypeScript</span>
              </div>
              <div class="flex items-center space-x-2">
                <i class="pi pi-check text-green-500"></i>
                <span>Performance optimized</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { AppButton, AppCard, AppInput } from '@/components/ui'

const inputValue = ref('')
</script>

<style scoped>
code {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
}
</style>
