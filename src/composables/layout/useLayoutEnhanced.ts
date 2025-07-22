import { ref, computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'

// Enhanced layout configuration types
export interface LayoutConfig {
  menuMode: 'static' | 'overlay' | 'slim' | 'compact' | 'horizontal' | 'reveal' | 'drawer'
  colorScheme: 'light' | 'dark' | 'auto'
  theme: string
  scale: number
  menuTheme: 'light' | 'dark' | 'primary'
  topbarTheme: 'light' | 'dark'
  inputStyle: 'outlined' | 'filled'
  ripple: boolean
  primaryColor: string
  surface: string | null
  cardStyle: 'transparent' | 'filled'
  menuProfile: boolean
}

export interface LayoutState {
  staticMenuDesktopInactive: boolean
  overlayMenuActive: boolean
  configSidebarVisible: boolean
  staticMenuMobileActive: boolean
  menuHoverActive: boolean
  overlaySubmenuActive: boolean
  sidebarActive: boolean
  anchored: boolean
  rightMenuVisible: boolean
  searchBarActive: boolean
  activeMenuItem: string | null
  mouseEnterTimeout: number | null
  mouseLeaveTimeout: number | null
}

// Enhanced default configuration
const defaultLayoutConfig: LayoutConfig = {
  menuMode: 'static',
  colorScheme: 'auto',
  theme: 'aura-light-blue',
  scale: 14,
  menuTheme: 'light',
  topbarTheme: 'light',
  inputStyle: 'outlined',
  ripple: true,
  primaryColor: 'blue',
  surface: null,
  cardStyle: 'transparent',
  menuProfile: true
}

const defaultLayoutState: LayoutState = {
  staticMenuDesktopInactive: false,
  overlayMenuActive: false,
  configSidebarVisible: false,
  staticMenuMobileActive: false,
  menuHoverActive: false,
  overlaySubmenuActive: false,
  sidebarActive: false,
  anchored: true,
  rightMenuVisible: false,
  searchBarActive: false,
  activeMenuItem: null,
  mouseEnterTimeout: null,
  mouseLeaveTimeout: null
}

// Global state
const layoutConfig = useLocalStorage('triton-layout-config-enhanced', defaultLayoutConfig)
const layoutState = ref(defaultLayoutState)

export function useLayoutEnhanced() {
  // Enhanced computed properties with SSR safety
  const isStatic = computed(() => layoutConfig.value.menuMode === 'static')
  const isOverlay = computed(() => layoutConfig.value.menuMode === 'overlay')
  const isSlim = computed(() => layoutConfig.value.menuMode === 'slim')
  const isCompact = computed(() => layoutConfig.value.menuMode === 'compact')
  const isHorizontal = computed(() => layoutConfig.value.menuMode === 'horizontal')
  const isReveal = computed(() => layoutConfig.value.menuMode === 'reveal')
  const isDrawer = computed(() => layoutConfig.value.menuMode === 'drawer')
  
  // SSR-safe window access
  const isDesktop = computed(() => 
    typeof window !== 'undefined' ? window.innerWidth > 991 : true
  )
  const isMobile = computed(() => 
    typeof window !== 'undefined' ? window.innerWidth <= 991 : false
  )

  // Enhanced sidebar logic
  const isSidebarActive = computed(() => 
    layoutState.value.overlayMenuActive || 
    layoutState.value.staticMenuMobileActive || 
    layoutState.value.overlaySubmenuActive ||
    (isReveal.value && layoutState.value.sidebarActive)
  )

  // Main content classes - FIXED to match Demo_Frontend logic
  const mainContentClasses = computed(() => {
    const classes = ['layout-main', 'min-h-screen', 'transition-all', 'duration-300']
    
    // Fix static mode - should push content
    if (isStatic.value) {
      if (isDesktop.value && !layoutState.value.staticMenuDesktopInactive) {
        classes.push('lg:ml-64')
      } else if (!isDesktop.value && layoutState.value.staticMenuMobileActive) {
        classes.push('ml-64')
      }
    }
    
    // Fix slim/compact - should push content when expanded
    else if ((isSlim.value || isCompact.value) && isDesktop.value) {
      if (layoutState.value.menuHoverActive) {
        classes.push('lg:ml-64')
      } else {
        classes.push(isSlim.value ? 'lg:ml-16' : 'lg:ml-20')
      }
    }
    
    // Horizontal has no margin but needs space for menu
    else if (isHorizontal.value) {
      classes.push('pt-16') // Space for horizontal menu
    }

    return classes
  })

  // Sidebar classes
  const sidebarClasses = computed(() => {
    const classes = [
      'layout-sidebar',
      'fixed', 'top-0', 'left-0', 'h-full', 'z-40',
      'transition-all', 'duration-300', 'ease-in-out'
    ]

    // Width classes
    if (isSlim.value && !layoutState.value.menuHoverActive) {
      classes.push('w-16')
    } else if (isCompact.value && !layoutState.value.menuHoverActive) {
      classes.push('w-20')
    } else {
      classes.push('w-64')
    }

    // Position and visibility classes
    if (isOverlay.value) {
      if (layoutState.value.overlayMenuActive) {
        classes.push('translate-x-0')
      } else {
        classes.push('-translate-x-full')
      }
    } else if (isReveal.value) {
      if (layoutState.value.sidebarActive || layoutState.value.anchored) {
        classes.push('translate-x-0')
      } else {
        classes.push('-translate-x-full')
      }
    } else if (isDrawer.value) {
      if (layoutState.value.overlayMenuActive) {
        classes.push('translate-x-0')
      } else {
        classes.push('-translate-x-full')
      }
    } else if (isMobile.value && !layoutState.value.staticMenuMobileActive) {
      classes.push('-translate-x-full')
    } else {
      classes.push('translate-x-0')
    }

    // Theme classes - Fixed for proper contrast
    if (layoutConfig.value.menuTheme === 'dark') {
      classes.push('bg-slate-800', 'text-slate-200', 'border-r', 'border-slate-700')
    } else if (layoutConfig.value.menuTheme === 'primary') {
      classes.push('bg-primary-600', 'text-white', 'border-r', 'border-primary-700')
    } else {
      classes.push('bg-white', 'text-slate-700', 'border-r', 'border-slate-200')
    }

    return classes
  })

  // Mouse interaction handlers - FIXED to match Demo_Frontend
  function handleSidebarMouseEnter() {
    if (isReveal.value && !layoutState.value.anchored) {
      if (layoutState.value.mouseLeaveTimeout) {
        clearTimeout(layoutState.value.mouseLeaveTimeout)
        layoutState.value.mouseLeaveTimeout = null
      }
      layoutState.value.sidebarActive = true
    } else if (isSlim.value || isCompact.value) {
      if (layoutState.value.mouseLeaveTimeout) {
        clearTimeout(layoutState.value.mouseLeaveTimeout)
        layoutState.value.mouseLeaveTimeout = null
      }
      layoutState.value.menuHoverActive = true
    }
  }

  function handleSidebarMouseLeave() {
    if (isReveal.value && !layoutState.value.anchored) {
      layoutState.value.mouseLeaveTimeout = window.setTimeout(() => {
        layoutState.value.sidebarActive = false
        layoutState.value.mouseLeaveTimeout = null
      }, 300)
    } else if (isSlim.value || isCompact.value) {
      layoutState.value.mouseLeaveTimeout = window.setTimeout(() => {
        layoutState.value.menuHoverActive = false
        layoutState.value.mouseLeaveTimeout = null
      }, 300)
    }
  }

  // Anchor toggle functionality
  function toggleAnchor() {
    layoutState.value.anchored = !layoutState.value.anchored
    
    if (!layoutState.value.anchored && (isReveal.value || isSlim.value)) {
      layoutState.value.sidebarActive = false
      layoutState.value.menuHoverActive = false
    } else if (layoutState.value.anchored && (isReveal.value || isSlim.value)) {
      layoutState.value.sidebarActive = true
      layoutState.value.menuHoverActive = true
    }
  }

  // Enhanced menu toggle - FIXED to match Demo_Frontend logic
  function toggleMenu() {
    if (isOverlay.value || isDrawer.value) {
      layoutState.value.overlayMenuActive = !layoutState.value.overlayMenuActive
    } else if (isStatic.value) {
      if (isDesktop.value) {
        layoutState.value.staticMenuDesktopInactive = !layoutState.value.staticMenuDesktopInactive
      } else {
        layoutState.value.staticMenuMobileActive = !layoutState.value.staticMenuMobileActive
      }
    } else if (isReveal.value) {
      layoutState.value.sidebarActive = !layoutState.value.sidebarActive
    } else if (isSlim.value || isCompact.value) {
      // Don't toggle for slim/compact - they work on hover
      layoutState.value.menuHoverActive = !layoutState.value.menuHoverActive
    }
  }

  // Configuration options for the config panel
  const menuModeOptions = computed(() => [
    {
      label: 'Static',
      value: 'static',
      icon: 'pi pi-bars',
      description: 'Fixed sidebar that stays open'
    },
    {
      label: 'Overlay',
      value: 'overlay', 
      icon: 'pi pi-window-maximize',
      description: 'Sidebar overlays content'
    },
    {
      label: 'Slim',
      value: 'slim',
      icon: 'pi pi-arrow-right',
      description: 'Collapsed sidebar that expands on hover'
    },
    {
      label: 'Compact',
      value: 'compact',
      icon: 'pi pi-minus',
      description: 'Reduced width sidebar'
    },
    {
      label: 'Horizontal',
      value: 'horizontal',
      icon: 'pi pi-ellipsis-h',
      description: 'Top horizontal navigation'
    },
    {
      label: 'Reveal',
      value: 'reveal',
      icon: 'pi pi-eye',
      description: 'Hidden sidebar that slides in'
    },
    {
      label: 'Drawer',
      value: 'drawer',
      icon: 'pi pi-window-minimize',
      description: 'Mobile-style drawer'
    }
  ])

  const sidebarThemeOptions = computed(() => [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'Primary', value: 'primary' }
  ])

  const primaryColorOptions = computed(() => [
    { label: 'Blue', value: 'blue', color: '#3b82f6' },
    { label: 'Green', value: 'green', color: '#22c55e' },
    { label: 'Purple', value: 'purple', color: '#a855f7' },
    { label: 'Orange', value: 'orange', color: '#f97316' },
    { label: 'Pink', value: 'pink', color: '#ec4899' },
    { label: 'Teal', value: 'teal', color: '#14b8a6' },
    { label: 'Indigo', value: 'indigo', color: '#6366f1' },
    { label: 'Red', value: 'red', color: '#ef4444' }
  ])

  // Configuration setters
  function setMenuMode(mode: LayoutConfig['menuMode']) {
    layoutConfig.value.menuMode = mode
    layoutState.value.staticMenuDesktopInactive = false
    layoutState.value.overlayMenuActive = false
    layoutState.value.sidebarActive = false
    layoutState.value.menuHoverActive = false
    
    if (mode === 'reveal' || mode === 'slim') {
      layoutState.value.anchored = false
    } else {
      layoutState.value.anchored = true
    }
  }

  function setSidebarTheme(theme: 'light' | 'dark' | 'primary') {
    layoutConfig.value.menuTheme = theme
  }

  function setPrimaryColor(color: string) {
    layoutConfig.value.primaryColor = color
  }

  function resetConfig() {
    Object.assign(layoutConfig.value, defaultLayoutConfig)
    Object.assign(layoutState.value, defaultLayoutState)
  }

  function setActiveMenuItem(key: string | null) {
    layoutState.value.activeMenuItem = key
  }

  return {
    // State
    layoutConfig,
    layoutState,
    
    // Computed
    isStatic,
    isOverlay,
    isSlim,
    isCompact,
    isHorizontal,
    isReveal,
    isDrawer,
    isDesktop,
    isMobile,
    isSidebarActive,
    mainContentClasses,
    sidebarClasses,
    
    // Options
    menuModeOptions,
    sidebarThemeOptions,
    primaryColorOptions,
    
    // Actions
    toggleMenu,
    toggleAnchor,
    handleSidebarMouseEnter,
    handleSidebarMouseLeave,
    setActiveMenuItem,
    
    // Config actions
    setMenuMode,
    setSidebarTheme,
    setPrimaryColor,
    resetConfig,
    
    // Legacy compatibility
    toggleConfigSidebar: () => layoutState.value.configSidebarVisible = !layoutState.value.configSidebarVisible,
    configSidebarVisible: computed(() => layoutState.value.configSidebarVisible),
    menuMode: computed(() => layoutConfig.value.menuMode),
    sidebarTheme: computed(() => layoutConfig.value.menuTheme),
    primaryColor: computed(() => layoutConfig.value.primaryColor),
    menuProfile: computed(() => layoutConfig.value.menuProfile),
    inputStyle: computed(() => layoutConfig.value.inputStyle),
    ripple: computed(() => layoutConfig.value.ripple)
  }
} 