import './assets/main.css'

import { createApp, nextTick } from 'vue'
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

// Configure global error handler
import { useGlobalErrorHandler } from './composables/error'

app.config.errorHandler = (err, _instance, info) => {
  const { handleError } = useGlobalErrorHandler()
  
  handleError(err, {
    context: `Global Vue Error: ${info}`,
    showToast: true,
    logToConsole: true
  })
  
  // In production, send to error tracking service
  if (import.meta.env.PROD) {
    console.log('Sending error to tracking service...', {
      error: err,
      info,
      url: window.location.href,
      timestamp: new Date().toISOString()
    })
  }
}

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  const { handleError } = useGlobalErrorHandler()
  
  handleError(new Error(event.reason), {
    context: 'Unhandled Promise Rejection',
    showToast: true,
    logToConsole: true
  })
  
  // Prevent default browser behavior
  event.preventDefault()
})

// Enable Vue performance tracking in development
if (import.meta.env.DEV) {
  app.config.performance = true
}

app.mount('#app')

// Initialize theme system after app is mounted
import { useThemeConfigStore } from './stores/theme/config.store'

// Wait for app to be ready, then initialize theme store
nextTick(() => {
  const themeConfigStore = useThemeConfigStore()
  themeConfigStore.initialize().catch(console.error)
})
