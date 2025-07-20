import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import { PrimeVueResolver } from '@primevue/auto-import-resolver'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    // Tailwind CSS 4 Vite plugin (performance optimized)
    tailwindcss(),
    // Auto-import composables and utilities
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        '@vueuse/core',
        '@vueuse/head'
      ],
      dts: true,
      vueTemplate: true,
      eslintrc: {
        enabled: true
      }
    }),
    // Auto-import components with TypeScript support
    Components({
      resolvers: [PrimeVueResolver()],
      dts: true,
      dirs: ['src/components', 'src/components/ui']
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // Build optimization for production
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('vue')) return 'vue-vendor'
            if (id.includes('primevue')) return 'primevue-vendor'
            if (id.includes('@vueuse')) return 'vueuse-vendor'
            if (id.includes('lodash') || id.includes('dayjs')) return 'utils-vendor'
            return 'vendor'
          }
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  // Development optimization
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      '@vueuse/core',
      'primevue/button',
      'primevue/card',
      'primevue/inputtext',
      'primevue/dropdown',
      'primevue/datatable'
    ]
  }
})
