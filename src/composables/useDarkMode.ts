import { ref, computed, watch } from 'vue'
import { useThemeStore } from '@/stores/theme.store'

/**
 * Enhanced dark mode composable with smooth transitions
 * Integrates with our theme system and provides visual feedback
 */
export function useDarkMode() {
  const themeStore = useThemeStore()

  // Reactive dark mode state
  const isDark = computed(() => themeStore.config.darkMode)
  const isTransitioning = ref(false)
  const supportsViewTransitions = ref('startViewTransition' in document)

  // System preference detection
  const systemPrefersDark = ref(false)
  const followSystemPreference = ref(false)

  // Initialize system preference detection
  function initializeSystemPreference() {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    systemPrefersDark.value = mediaQuery.matches

    // Listen for system changes
    mediaQuery.addEventListener('change', (e) => {
      systemPrefersDark.value = e.matches

      // Auto-apply if following system preference
      if (followSystemPreference.value) {
        setDarkMode(e.matches, true)
      }
    })

    console.log(`🌓 System prefers: ${systemPrefersDark.value ? 'dark' : 'light'}`)
  }

  // Toggle dark mode with smooth transitions
  async function toggle() {
    console.log(`🌗 Toggling dark mode: ${isDark.value} → ${!isDark.value}`)
    await setDarkMode(!isDark.value)
  }

  // Set dark mode with optional smooth transition
  async function setDarkMode(dark: boolean, skipTransition = false) {
    if (isDark.value === dark) return

    console.log(`🌗 Setting dark mode: ${dark}`)

    // Use View Transitions API if available and not skipped
    if (supportsViewTransitions.value && !skipTransition && themeStore.config.smoothTransitions) {
      isTransitioning.value = true

      try {
        // @ts-ignore - View Transitions API
        const transition = document.startViewTransition(() => {
          executeDarkModeToggle(dark)
        })

        await transition.finished
        console.log('✨ Smooth dark mode transition completed')
      } catch (error) {
        console.warn('View transition failed, falling back to instant:', error)
        executeDarkModeToggle(dark)
      } finally {
        isTransitioning.value = false
      }
    } else {
      // Instant toggle
      executeDarkModeToggle(dark)
    }
  }

  // Execute the actual dark mode change
  function executeDarkModeToggle(dark: boolean) {
    // Update theme store (this triggers all reactive updates)
    themeStore.config.darkMode = dark

    // Apply CSS classes
    applyDarkModeClasses(dark)

    // Update theme-color meta tag for browser UI
    updateThemeColorMeta(dark)

    console.log(`✅ Dark mode ${dark ? 'enabled' : 'disabled'}`)
  }

  // Apply CSS classes for dark mode
  function applyDarkModeClasses(dark: boolean) {
    const htmlElement = document.documentElement

    if (dark) {
      htmlElement.classList.add('dark')
      htmlElement.setAttribute('data-theme', 'dark')
    } else {
      htmlElement.classList.remove('dark')
      htmlElement.setAttribute('data-theme', 'light')
    }

    // Add transition class if smooth transitions are enabled
    if (themeStore.config.smoothTransitions) {
      htmlElement.classList.add('theme-transitioning')

      // Remove transition class after transition completes
      setTimeout(() => {
        htmlElement.classList.remove('theme-transitioning')
      }, 300)
    }
  }

  // Update browser theme-color meta tag
  function updateThemeColorMeta(dark: boolean) {
    try {
      let metaThemeColor = document.querySelector('meta[name="theme-color"]')

      if (!metaThemeColor) {
        metaThemeColor = document.createElement('meta')
        metaThemeColor.setAttribute('name', 'theme-color')
        document.head.appendChild(metaThemeColor)
      }

      // Use theme-aware colors
      const lightColor = themeStore.getTokenValue('primary') || '#0B2244'
      const darkColor = themeStore.getTokenValue('surface-900') || '#171717'

      metaThemeColor.setAttribute('content', dark ? darkColor : lightColor)
    } catch (error) {
      console.warn('Failed to update theme-color meta tag:', error)
    }
  }

  // Enable/disable following system preference
  function setFollowSystemPreference(follow: boolean) {
    followSystemPreference.value = follow

    if (follow && systemPrefersDark.value !== isDark.value) {
      setDarkMode(systemPrefersDark.value)
    }

    console.log(`🔄 Follow system preference: ${follow}`)
  }

  // Get current time-based suggestion (evening = dark, morning = light)
  function getTimeBaedSuggestion(): boolean {
    const hour = new Date().getHours()
    // Suggest dark mode between 7 PM and 7 AM
    return hour >= 19 || hour <= 7
  }

  // Schedule automatic dark mode based on time
  function scheduleAutoDarkMode(enable: boolean) {
    if (!enable) return

    const now = new Date()
    const currentHour = now.getHours()

    // Calculate next transition time
    let nextTransitionHour: number
    let nextShouldBeDark: boolean

    if (currentHour >= 19 || currentHour < 7) {
      // Currently in dark period, next transition is to light at 7 AM
      nextTransitionHour = 7
      nextShouldBeDark = false
    } else {
      // Currently in light period, next transition is to dark at 7 PM
      nextTransitionHour = 19
      nextShouldBeDark = true
    }

    // Calculate milliseconds until next transition
    const nextTransition = new Date()
    nextTransition.setHours(nextTransitionHour, 0, 0, 0)

    // If the time has passed today, schedule for tomorrow
    if (nextTransition <= now) {
      nextTransition.setDate(nextTransition.getDate() + 1)
    }

    const msUntilTransition = nextTransition.getTime() - now.getTime()

    console.log(`⏰ Auto dark mode scheduled for ${nextTransition.toLocaleTimeString()}`)

    // Schedule the transition
    setTimeout(() => {
      setDarkMode(nextShouldBeDark)
      // Recursively schedule the next transition
      scheduleAutoDarkMode(true)
    }, msUntilTransition)
  }

  // Get contrast preference for accessibility
  function getContrastPreference(): 'high' | 'normal' | 'low' {
    try {
      if (window.matchMedia('(prefers-contrast: high)').matches) return 'high'
      if (window.matchMedia('(prefers-contrast: low)').matches) return 'low'
      return 'normal'
    } catch {
      return 'normal'
    }
  }

  // Apply high contrast theme if needed
  function applyContrastPreference() {
    const preference = getContrastPreference()

    if (preference === 'high') {
      // Switch to high contrast preset if available
      const highContrastPreset = themeStore.availablePresets.find(
        (p) => p.id === 'triton-high-contrast',
      )

      if (highContrastPreset && themeStore.activePreset?.id !== 'triton-high-contrast') {
        console.log('♿ Applying high contrast theme for accessibility')
        themeStore.activatePreset(highContrastPreset)
      }
    }
  }

  // Initialize on mount
  function initialize() {
    initializeSystemPreference()
    applyContrastPreference()

    // Apply current dark mode state
    applyDarkModeClasses(isDark.value)
    updateThemeColorMeta(isDark.value)

    // Listen for contrast preference changes
    try {
      window
        .matchMedia('(prefers-contrast: high)')
        .addEventListener('change', applyContrastPreference)
      window
        .matchMedia('(prefers-contrast: low)')
        .addEventListener('change', applyContrastPreference)
    } catch {
      // Ignore if not supported
    }

    console.log('🌗 Dark mode system initialized')
  }

  // Watch for theme store changes and apply them
  watch(
    () => themeStore.config.darkMode,
    (newDark) => {
      if (newDark !== isDark.value) {
        applyDarkModeClasses(newDark)
        updateThemeColorMeta(newDark)
      }
    },
    { immediate: true },
  )

  return {
    // State
    isDark,
    isTransitioning,
    systemPrefersDark,
    followSystemPreference,
    supportsViewTransitions,

    // Core Functions
    toggle,
    setDarkMode,
    initialize,

    // System Integration
    setFollowSystemPreference,
    getTimeBaedSuggestion,
    scheduleAutoDarkMode,

    // Accessibility
    getContrastPreference,
    applyContrastPreference,

    // Utilities
    updateThemeColorMeta,
  }
}
