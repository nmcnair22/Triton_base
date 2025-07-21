import { ref, computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'

// Layout configuration types
export interface LayoutConfig {
  menuMode: 'static' | 'overlay' | 'slim' | 'compact' | 'horizontal'
  colorScheme: 'light' | 'dark' | 'auto'
  theme: string
  scale: number
  menuTheme: 'light' | 'dark'
  topbarTheme: 'light' | 'dark'
  inputStyle: 'outlined' | 'filled'
  ripple: boolean
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
}

// Default layout configuration
const defaultLayoutConfig: LayoutConfig = {
  menuMode: 'static',
  colorScheme: 'auto',
  theme: 'aura-light-blue',
  scale: 14,
  menuTheme: 'light',
  topbarTheme: 'light',
  inputStyle: 'outlined',
  ripple: true
}

// Default layout state
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
  activeMenuItem: null
}

// Global layout state
const layoutConfig = useLocalStorage('triton-layout-config', defaultLayoutConfig)
const layoutState = ref(defaultLayoutState)

export function useLayout() {
  // Computed layout checks
  const isStatic = computed(() => layoutConfig.value.menuMode === 'static')
  const isOverlay = computed(() => layoutConfig.value.menuMode === 'overlay')
  const isSlim = computed(() => layoutConfig.value.menuMode === 'slim')
  const isCompact = computed(() => layoutConfig.value.menuMode === 'compact')
  const isHorizontal = computed(() => layoutConfig.value.menuMode === 'horizontal')
  const isDesktop = computed(() => window.innerWidth > 991)

  // Menu actions
  function toggleMenu() {
    if (isOverlay.value) {
      layoutState.value.overlayMenuActive = !layoutState.value.overlayMenuActive
    } else if (isStatic.value) {
      layoutState.value.staticMenuDesktopInactive = !layoutState.value.staticMenuDesktopInactive
    }
  }

  function toggleMobileMenu() {
    layoutState.value.staticMenuMobileActive = !layoutState.value.staticMenuMobileActive
  }

  function hideMenu() {
    layoutState.value.overlayMenuActive = false
    layoutState.value.staticMenuMobileActive = false
    layoutState.value.menuHoverActive = false
  }

  // Config sidebar actions
  function toggleConfigSidebar() {
    layoutState.value.configSidebarVisible = !layoutState.value.configSidebarVisible
  }

  function hideConfigSidebar() {
    layoutState.value.configSidebarVisible = false
  }

  // Menu item actions
  function setActiveMenuItem(key: string | null) {
    layoutState.value.activeMenuItem = key
  }

  // Search actions
  function toggleSearchBar() {
    layoutState.value.searchBarActive = !layoutState.value.searchBarActive
  }

  // Right menu actions
  function toggleRightMenu() {
    layoutState.value.rightMenuVisible = !layoutState.value.rightMenuVisible
  }

  // Layout config actions
  function setMenuMode(mode: LayoutConfig['menuMode']) {
    layoutConfig.value.menuMode = mode
    
    // Reset state when changing menu mode
    layoutState.value.staticMenuDesktopInactive = false
    layoutState.value.overlayMenuActive = false
    layoutState.value.staticMenuMobileActive = false
  }

  function setScale(scale: number) {
    layoutConfig.value.scale = scale
    document.documentElement.style.fontSize = scale + 'px'
  }

  function setInputStyle(style: 'outlined' | 'filled') {
    layoutConfig.value.inputStyle = style
  }

  function setRipple(enabled: boolean) {
    layoutConfig.value.ripple = enabled
  }

  function setMenuTheme(theme: 'light' | 'dark') {
    layoutConfig.value.menuTheme = theme
  }

  function setTopbarTheme(theme: 'light' | 'dark') {
    layoutConfig.value.topbarTheme = theme
  }

  // Check if menu is currently visible
  const isMenuVisible = computed(() => {
    if (isHorizontal.value) {
      return true
    }
    
    if (isOverlay.value) {
      return layoutState.value.overlayMenuActive
    }
    
    if (isStatic.value) {
      return !layoutState.value.staticMenuDesktopInactive
    }
    
    return true
  })

  // Check layout classes for body
  const layoutClasses = computed(() => {
    return {
      'layout-static': isStatic.value,
      'layout-overlay': isOverlay.value,
      'layout-slim': isSlim.value,
      'layout-compact': isCompact.value,
      'layout-horizontal': isHorizontal.value,
      'layout-menu-active': layoutState.value.overlayMenuActive || layoutState.value.staticMenuMobileActive,
      'layout-config-active': layoutState.value.configSidebarVisible,
      'layout-static-inactive': isStatic.value && layoutState.value.staticMenuDesktopInactive,
      'p-input-filled': layoutConfig.value.inputStyle === 'filled',
      'p-ripple-disabled': !layoutConfig.value.ripple
    }
  })

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
    isDesktop,
    isMenuVisible,
    layoutClasses,
    
    // Actions
    toggleMenu,
    toggleMobileMenu,
    hideMenu,
    toggleConfigSidebar,
    hideConfigSidebar,
    setActiveMenuItem,
    toggleSearchBar,
    toggleRightMenu,
    
    // Config actions
    setMenuMode,
    setScale,
    setInputStyle,
    setRipple,
    setMenuTheme,
    setTopbarTheme
  }
} 