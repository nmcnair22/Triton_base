/**
 * Comprehensive color utilities for theme system
 * Provides color manipulation, validation, and accessibility features
 */

export interface ColorSpace {
  hex: string
  rgb: { r: number; g: number; b: number }
  hsl: { h: number; s: number; l: number }
  hsv: { h: number; s: number; v: number }
  lab: { l: number; a: number; b: number }
}

export interface ContrastResult {
  ratio: number
  level: 'AAA' | 'AA' | 'fail'
  score: number
  readable: boolean
  suggestions?: string[]
}

export interface ColorHarmony {
  name: string
  colors: string[]
  description: string
}

/**
 * Parse any color format to RGB
 */
export function parseColor(color: string): { r: number; g: number; b: number } | null {
  const trimmed = color.trim()
  
  // Hex colors
  if (trimmed.startsWith('#')) {
    return parseHexColor(trimmed)
  }
  
  // RGB/RGBA colors
  if (trimmed.startsWith('rgb')) {
    return parseRgbColor(trimmed)
  }
  
  // HSL/HSLA colors
  if (trimmed.startsWith('hsl')) {
    return parseHslColor(trimmed)
  }
  
  // Named colors
  return parseNamedColor(trimmed)
}

/**
 * Parse hex color to RGB
 */
export function parseHexColor(hex: string): { r: number; g: number; b: number } | null {
  const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
  if (!match) {
    // Try 3-digit hex
    const shortMatch = hex.match(/^#?([a-f\d])([a-f\d])([a-f\d])$/i)
    if (!shortMatch) return null
    
    return {
      r: parseInt(shortMatch[1] + shortMatch[1], 16),
      g: parseInt(shortMatch[2] + shortMatch[2], 16),
      b: parseInt(shortMatch[3] + shortMatch[3], 16)
    }
  }
  
  return {
    r: parseInt(match[1], 16),
    g: parseInt(match[2], 16),
    b: parseInt(match[3], 16)
  }
}

/**
 * Parse RGB color to RGB object
 */
export function parseRgbColor(rgb: string): { r: number; g: number; b: number } | null {
  const match = rgb.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*[\d.]+)?\s*\)/)
  if (!match) return null
  
  return {
    r: parseInt(match[1]),
    g: parseInt(match[2]),
    b: parseInt(match[3])
  }
}

/**
 * Parse HSL color to RGB
 */
export function parseHslColor(hsl: string): { r: number; g: number; b: number } | null {
  const match = hsl.match(/hsla?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*[\d.]+)?\s*\)/)
  if (!match) return null
  
  const h = parseInt(match[1]) / 360
  const s = parseInt(match[2]) / 100
  const l = parseInt(match[3]) / 100
  
  return hslToRgb(h, s, l)
}

/**
 * Parse named color to RGB (basic implementation)
 */
export function parseNamedColor(name: string): { r: number; g: number; b: number } | null {
  const namedColors: Record<string, string> = {
    black: '#000000',
    white: '#ffffff',
    red: '#ff0000',
    green: '#008000',
    blue: '#0000ff',
    yellow: '#ffff00',
    cyan: '#00ffff',
    magenta: '#ff00ff',
    silver: '#c0c0c0',
    gray: '#808080',
    grey: '#808080',
    maroon: '#800000',
    olive: '#808000',
    lime: '#00ff00',
    aqua: '#00ffff',
    teal: '#008080',
    navy: '#000080',
    fuchsia: '#ff00ff',
    purple: '#800080'
  }
  
  const hex = namedColors[name.toLowerCase()]
  return hex ? parseHexColor(hex) : null
}

/**
 * Convert RGB to hex
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255
  g /= 255
  b /= 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2
  
  if (max === min) {
    h = s = 0 // achromatic
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
      default: h = 0
    }
    h /= 6
  }
  
  return { h: h * 360, s: s * 100, l: l * 100 }
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1/6) return p + (q - p) * 6 * t
    if (t < 1/2) return q
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
    return p
  }
  
  if (s === 0) {
    // achromatic
    const value = Math.round(l * 255)
    return { r: value, g: value, b: value }
  }
  
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  
  return {
    r: Math.round(hue2rgb(p, q, h + 1/3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1/3) * 255)
  }
}

/**
 * Calculate relative luminance for WCAG contrast calculations
 */
export function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = parseColor(color1)
  const rgb2 = parseColor(color2)
  
  if (!rgb1 || !rgb2) return 1
  
  const lum1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b)
  const lum2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b)
  
  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)
  
  return (brightest + 0.05) / (darkest + 0.05)
}

/**
 * Check color contrast with detailed results
 */
export function checkContrast(foreground: string, background: string): ContrastResult {
  const ratio = getContrastRatio(foreground, background)
  
  let level: 'AAA' | 'AA' | 'fail'
  let score: number
  let suggestions: string[] = []
  
  if (ratio >= 7) {
    level = 'AAA'
    score = 100
  } else if (ratio >= 4.5) {
    level = 'AA'
    score = Math.round((ratio - 4.5) / (7 - 4.5) * 40 + 60)
  } else {
    level = 'fail'
    score = Math.round((ratio - 1) / (4.5 - 1) * 60)
    
    // Generate suggestions
    if (ratio < 3) {
      suggestions.push('Try using a much darker or lighter color')
      suggestions.push('Consider using our high contrast preset')
    } else {
      suggestions.push('Slightly adjust the color brightness')
      suggestions.push('Consider using a darker shade')
    }
  }
  
  return {
    ratio: Math.round(ratio * 100) / 100,
    level,
    score,
    readable: ratio >= 4.5,
    suggestions: suggestions.length > 0 ? suggestions : undefined
  }
}

/**
 * Lighten a color by percentage
 */
export function lightenColor(color: string, percentage: number): string {
  const rgb = parseColor(color)
  if (!rgb) return color
  
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  hsl.l = Math.min(100, hsl.l + percentage)
  
  const newRgb = hslToRgb(hsl.h / 360, hsl.s / 100, hsl.l / 100)
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b)
}

/**
 * Darken a color by percentage
 */
export function darkenColor(color: string, percentage: number): string {
  return lightenColor(color, -percentage)
}

/**
 * Saturate a color by percentage
 */
export function saturateColor(color: string, percentage: number): string {
  const rgb = parseColor(color)
  if (!rgb) return color
  
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  hsl.s = Math.min(100, Math.max(0, hsl.s + percentage))
  
  const newRgb = hslToRgb(hsl.h / 360, hsl.s / 100, hsl.l / 100)
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b)
}

/**
 * Desaturate a color by percentage
 */
export function desaturateColor(color: string, percentage: number): string {
  return saturateColor(color, -percentage)
}

/**
 * Adjust color opacity
 */
export function adjustOpacity(color: string, opacity: number): string {
  const rgb = parseColor(color)
  if (!rgb) return color
  
  const alpha = Math.max(0, Math.min(1, opacity))
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`
}

/**
 * Get complementary color
 */
export function getComplementaryColor(color: string): string {
  const rgb = parseColor(color)
  if (!rgb) return color
  
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  hsl.h = (hsl.h + 180) % 360
  
  const newRgb = hslToRgb(hsl.h / 360, hsl.s / 100, hsl.l / 100)
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b)
}

/**
 * Generate color harmonies
 */
export function generateColorHarmonies(baseColor: string): ColorHarmony[] {
  const rgb = parseColor(baseColor)
  if (!rgb) return []
  
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  const harmonies: ColorHarmony[] = []
  
  // Monochromatic
  harmonies.push({
    name: 'Monochromatic',
    description: 'Different shades and tints of the same color',
    colors: [
      darkenColor(baseColor, 30),
      darkenColor(baseColor, 15),
      baseColor,
      lightenColor(baseColor, 15),
      lightenColor(baseColor, 30)
    ]
  })
  
  // Analogous
  const analogousColors = [-30, -15, 0, 15, 30].map(offset => {
    const newHue = (hsl.h + offset + 360) % 360
    const newRgb = hslToRgb(newHue / 360, hsl.s / 100, hsl.l / 100)
    return rgbToHex(newRgb.r, newRgb.g, newRgb.b)
  })
  
  harmonies.push({
    name: 'Analogous',
    description: 'Colors that are adjacent on the color wheel',
    colors: analogousColors
  })
  
  // Triadic
  const triadicColors = [0, 120, 240].map(offset => {
    const newHue = (hsl.h + offset) % 360
    const newRgb = hslToRgb(newHue / 360, hsl.s / 100, hsl.l / 100)
    return rgbToHex(newRgb.r, newRgb.g, newRgb.b)
  })
  
  harmonies.push({
    name: 'Triadic',
    description: 'Three colors equally spaced on the color wheel',
    colors: triadicColors
  })
  
  // Complementary
  harmonies.push({
    name: 'Complementary',
    description: 'Opposite colors on the color wheel',
    colors: [baseColor, getComplementaryColor(baseColor)]
  })
  
  // Split Complementary
  const splitComplementaryColors = [0, 150, 210].map(offset => {
    const newHue = (hsl.h + offset) % 360
    const newRgb = hslToRgb(newHue / 360, hsl.s / 100, hsl.l / 100)
    return rgbToHex(newRgb.r, newRgb.g, newRgb.b)
  })
  
  harmonies.push({
    name: 'Split Complementary',
    description: 'Base color plus two colors adjacent to its complement',
    colors: splitComplementaryColors
  })
  
  return harmonies
}

/**
 * Find the best text color (black or white) for a background
 */
export function getBestTextColor(backgroundColor: string): string {
  const whiteContrast = getContrastRatio('#ffffff', backgroundColor)
  const blackContrast = getContrastRatio('#000000', backgroundColor)
  
  return whiteContrast > blackContrast ? '#ffffff' : '#000000'
}

/**
 * Generate accessible color palette from base color
 */
export function generateAccessiblePalette(baseColor: string): {
  primary: string
  secondary: string
  success: string
  warning: string
  danger: string
  text: string
  background: string
} {
  const rgb = parseColor(baseColor)
  if (!rgb) {
    // Return default palette if parsing fails
    return {
      primary: '#0B2244',
      secondary: '#297FB7',
      success: '#10B981',
      warning: '#FFB400',
      danger: '#F60D03',
      text: '#374151',
      background: '#FFFFFF'
    }
  }
  
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  
  // Ensure primary color has good contrast
  const adjustedPrimary = hsl.l > 50 ? darkenColor(baseColor, 20) : lightenColor(baseColor, 20)
  
  return {
    primary: adjustedPrimary,
    secondary: lightenColor(adjustedPrimary, 15),
    success: '#10B981', // Keep status colors consistent
    warning: '#FFB400',
    danger: '#F60D03',
    text: getBestTextColor('#FFFFFF'),
    background: '#FFFFFF'
  }
}

/**
 * Convert color to all formats
 */
export function convertToAllFormats(color: string): ColorSpace | null {
  const rgb = parseColor(color)
  if (!rgb) return null
  
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  
  // Basic HSV conversion (simplified)
  const hsv = {
    h: hsl.h,
    s: hsl.s,
    v: hsl.l + (hsl.s * Math.min(hsl.l, 100 - hsl.l)) / 100
  }
  
  // Basic LAB conversion (simplified)
  const lab = {
    l: hsl.l,
    a: 0, // Simplified - would need proper XYZ conversion
    b: 0
  }
  
  return {
    hex: rgbToHex(rgb.r, rgb.g, rgb.b),
    rgb,
    hsl,
    hsv,
    lab
  }
}

/**
 * Validate if a color string is valid
 */
export function isValidColor(color: string): boolean {
  return parseColor(color) !== null
}

/**
 * Get color temperature (warm/cool)
 */
export function getColorTemperature(color: string): 'warm' | 'cool' | 'neutral' {
  const rgb = parseColor(color)
  if (!rgb) return 'neutral'
  
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  
  // Warm colors: red, orange, yellow (0-60, 300-360)
  // Cool colors: blue, green, purple (120-300)
  if ((hsl.h >= 0 && hsl.h <= 60) || (hsl.h >= 300 && hsl.h <= 360)) {
    return 'warm'
  } else if (hsl.h >= 120 && hsl.h <= 300) {
    return 'cool'
  } else {
    return 'neutral'
  }
} 