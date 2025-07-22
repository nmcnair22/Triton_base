import { useLayoutEnhanced } from './useLayoutEnhanced'
import { useToast } from 'primevue/usetoast'

export interface LayoutPreset {
  id: string
  name: string
  description: string
  icon: string
  config: {
    menuMode: string
    menuTheme: string
    primaryColor: string
    inputStyle: string
    scale: number
    ripple: boolean
    menuProfile: boolean
  }
  tags: string[]
  preview?: string
}

export const useLayoutPresets = () => {
  const toast = useToast()
  const { setMenuMode, setSidebarTheme, setPrimaryColor, layoutConfig } = useLayoutEnhanced()

  // Predefined presets
  const presets: LayoutPreset[] = [
    {
      id: 'modern-dashboard',
      name: 'Modern Dashboard',
      description: 'Clean and modern with slim sidebar',
      icon: 'pi pi-sparkles',
      config: {
        menuMode: 'slim',
        menuTheme: 'dark',
        primaryColor: 'blue',
        inputStyle: 'outlined',
        scale: 14,
        ripple: true,
        menuProfile: true,
      },
      tags: ['modern', 'professional', 'clean'],
      preview: '/images/presets/modern-dashboard.png',
    },
    {
      id: 'enterprise-classic',
      name: 'Enterprise Classic',
      description: 'Traditional enterprise layout with static sidebar',
      icon: 'pi pi-building',
      config: {
        menuMode: 'static',
        menuTheme: 'light',
        primaryColor: 'indigo',
        inputStyle: 'filled',
        scale: 16,
        ripple: true,
        menuProfile: false,
      },
      tags: ['enterprise', 'classic', 'traditional'],
    },
    {
      id: 'creative-studio',
      name: 'Creative Studio',
      description: 'Bold and creative with primary theme',
      icon: 'pi pi-palette',
      config: {
        menuMode: 'reveal',
        menuTheme: 'primary',
        primaryColor: 'purple',
        inputStyle: 'outlined',
        scale: 15,
        ripple: true,
        menuProfile: true,
      },
      tags: ['creative', 'bold', 'modern'],
    },
    {
      id: 'mobile-first',
      name: 'Mobile First',
      description: 'Optimized for mobile with drawer navigation',
      icon: 'pi pi-mobile',
      config: {
        menuMode: 'drawer',
        menuTheme: 'dark',
        primaryColor: 'teal',
        inputStyle: 'outlined',
        scale: 14,
        ripple: true,
        menuProfile: false,
      },
      tags: ['mobile', 'responsive', 'touch'],
    },
    {
      id: 'data-analytics',
      name: 'Data Analytics',
      description: 'Compact layout for data-heavy applications',
      icon: 'pi pi-chart-line',
      config: {
        menuMode: 'compact',
        menuTheme: 'dark',
        primaryColor: 'green',
        inputStyle: 'outlined',
        scale: 13,
        ripple: false,
        menuProfile: false,
      },
      tags: ['data', 'analytics', 'compact'],
    },
    {
      id: 'minimal-focus',
      name: 'Minimal Focus',
      description: 'Distraction-free with horizontal navigation',
      icon: 'pi pi-minus-circle',
      config: {
        menuMode: 'horizontal',
        menuTheme: 'light',
        primaryColor: 'gray',
        inputStyle: 'outlined',
        scale: 14,
        ripple: false,
        menuProfile: false,
      },
      tags: ['minimal', 'focus', 'clean'],
    },
  ]

  // Apply preset
  function applyPreset(presetId: string) {
    const preset = presets.find(p => p.id === presetId)
    if (!preset) return

    // Apply configuration with animation
    setMenuMode(preset.config.menuMode as any)
    setSidebarTheme(preset.config.menuTheme as any)
    setPrimaryColor(preset.config.primaryColor)

    // Apply other settings
    layoutConfig.value.inputStyle = preset.config.inputStyle as any
    layoutConfig.value.scale = preset.config.scale
    layoutConfig.value.ripple = preset.config.ripple
    layoutConfig.value.menuProfile = preset.config.menuProfile

    // Update body classes
    const body = document.body
    body.classList.remove('p-input-filled')
    if (preset.config.inputStyle === 'filled') {
      body.classList.add('p-input-filled')
    }

    // Update scale
    document.documentElement.style.fontSize = preset.config.scale + 'px'

    // Show success message
    toast.add({
      severity: 'success',
      summary: 'Preset Applied',
      detail: `${preset.name} layout has been applied`,
      life: 3000,
    })
  }

  // Save current as preset
  function saveAsPreset(name: string, description: string) {
    const customPreset: LayoutPreset = {
      id: `custom-${Date.now()}`,
      name,
      description,
      icon: 'pi pi-star',
      config: {
        menuMode: layoutConfig.value.menuMode,
        menuTheme: layoutConfig.value.menuTheme,
        primaryColor: layoutConfig.value.primaryColor,
        inputStyle: layoutConfig.value.inputStyle,
        scale: layoutConfig.value.scale,
        ripple: layoutConfig.value.ripple,
        menuProfile: layoutConfig.value.menuProfile,
      },
      tags: ['custom'],
    }

    // Save to localStorage
    const savedPresets = localStorage.getItem('triton-custom-presets')
    const customPresets = savedPresets ? JSON.parse(savedPresets) : []
    customPresets.push(customPreset)
    localStorage.setItem('triton-custom-presets', JSON.stringify(customPresets))

    toast.add({
      severity: 'success',
      summary: 'Preset Saved',
      detail: `${name} has been saved to your custom presets`,
      life: 3000,
    })

    return customPreset
  }

  // Get all presets including custom ones
  function getAllPresets() {
    const savedPresets = localStorage.getItem('triton-custom-presets')
    const customPresets = savedPresets ? JSON.parse(savedPresets) : []
    return [...presets, ...customPresets]
  }

  // Delete custom preset
  function deleteCustomPreset(presetId: string) {
    const savedPresets = localStorage.getItem('triton-custom-presets')
    if (!savedPresets) return

    const customPresets = JSON.parse(savedPresets)
    const filtered = customPresets.filter((p: LayoutPreset) => p.id !== presetId)
    localStorage.setItem('triton-custom-presets', JSON.stringify(filtered))

    toast.add({
      severity: 'info',
      summary: 'Preset Deleted',
      detail: 'Custom preset has been removed',
      life: 3000,
    })
  }

  return {
    presets,
    applyPreset,
    saveAsPreset,
    getAllPresets,
    deleteCustomPreset,
  }
}
