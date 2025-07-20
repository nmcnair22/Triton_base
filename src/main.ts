import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import Tooltip from 'primevue/tooltip'
import { CustomPreset } from './themes/custom-preset'

import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(ToastService)

// Enhanced PrimeVue configuration
app.use(PrimeVue, {
  theme: {
    preset: CustomPreset,
    options: {
      prefix: 'p',
      darkModeSelector: '.dark',
      cssLayer: {
        name: 'primevue',
        order: 'base, primevue, utilities',
      },
    },
  },
  ripple: true,
  inputStyle: 'outlined',
})

// Register directives
app.directive('tooltip', Tooltip)

app.mount('#app')

// Initialize theme system after app is mounted
import { useThemeStore } from './stores/theme.store'

// Wait for app to be ready, then initialize theme store
app.config.globalProperties.$nextTick(() => {
  const themeStore = useThemeStore()
  themeStore.initialize().catch(console.error)
})
