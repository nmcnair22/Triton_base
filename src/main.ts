import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import { CustomPreset } from './themes/custom-preset'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

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

app.mount('#app')
