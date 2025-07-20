import { onMounted, readonly } from 'vue'
import { useDark, useToggle } from '@vueuse/core'

export function useDarkMode() {
  // Update theme color meta tag for mobile browsers
  const updateThemeColor = (dark: boolean) => {
    const themeColor = dark ? '#0c0a09' : '#ffffff' // surface-950 : surface-0

    let metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta')
      metaThemeColor.setAttribute('name', 'theme-color')
      document.head.appendChild(metaThemeColor)
    }
    metaThemeColor.setAttribute('content', themeColor)
  }

  // Use VueUse's useDark with automatic persistence and system detection
  const isDark = useDark({
    selector: 'html',
    attribute: 'class',
    valueDark: 'dark',
    valueLight: '',
    storageKey: 'triton-color-scheme',
    storage: localStorage,
    onChanged: (dark: boolean) => {
      // Update meta theme-color for mobile browsers
      updateThemeColor(dark)
    },
  })

  const toggleDarkMode = useToggle(isDark)

  // Initialize theme color on mount
  onMounted(() => {
    updateThemeColor(isDark.value)
  })

  return {
    isDark: readonly(isDark),
    toggleDarkMode,
  }
}
