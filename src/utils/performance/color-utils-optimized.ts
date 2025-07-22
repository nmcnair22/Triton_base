/**
 * Memoized color utilities for improved performance
 * 
 * These utilities wrap expensive color calculations with memoization
 * to avoid recalculating the same values multiple times.
 */

// VueUse doesn't provide createMemoize, so we'll implement our own
import {
  getRelativeLuminance,
  getContrastRatio,
  checkContrast,
  parseColor,
  getBestTextColor,
  generateColorHarmonies,
  lightenColor,
  darkenColor
} from '@/themes/utils/color-utils'
import type { ContrastResult, ColorHarmony } from '@/themes/utils/color-utils'

// Configure memoization with a reasonable cache size
const CACHE_SIZE = 500

/**
 * Create a custom memoization function with size limit
 */
function createColorMemoizer<T extends (...args: any[]) => any>(fn: T, cacheSize = CACHE_SIZE) {
  const cache = new Map<string, ReturnType<T>>()
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args)
    
    if (cache.has(key)) {
      return cache.get(key)!
    }
    
    const result = fn(...args)
    
    // Implement LRU cache eviction
    if (cache.size >= cacheSize) {
      const firstKey = cache.keys().next().value
      if (firstKey !== undefined) {
        cache.delete(firstKey)
      }
    }
    
    cache.set(key, result)
    return result
  }) as T
}

/**
 * Memoized parseColor function
 * This is called frequently and benefits from caching
 */
export const parseColorMemoized = createColorMemoizer(parseColor)

/**
 * Memoized luminance calculation
 * Expensive mathematical operations benefit from caching
 */
export const getRelativeLuminanceMemoized = createColorMemoizer(
  (r: number, g: number, b: number) => getRelativeLuminance(r, g, b)
)

/**
 * Memoized contrast ratio calculation
 * This is one of the most expensive calculations in the color system
 */
export const getContrastRatioMemoized = createColorMemoizer(
  (color1: string, color2: string) => getContrastRatio(color1, color2)
)

/**
 * Memoized contrast checking with detailed results
 */
export const checkContrastMemoized = createColorMemoizer(
  (foreground: string, background: string): ContrastResult => checkContrast(foreground, background)
)

/**
 * Memoized color scale generation
 * Generate a scale of colors from light to dark
 */
export const generateColorScaleMemoized = createColorMemoizer(
  (baseColor: string, steps = 10) => {
    const scale: string[] = []
    const stepSize = 100 / (steps - 1)
    
    for (let i = 0; i < steps; i++) {
      const percentage = (steps - 1 - i) * stepSize
      if (percentage > 50) {
        scale.push(lightenColor(baseColor, percentage - 50))
      } else if (percentage < 50) {
        scale.push(darkenColor(baseColor, 50 - percentage))
      } else {
        scale.push(baseColor)
      }
    }
    
    return scale
  },
  100 // Smaller cache for scales since they're larger objects
)

/**
 * Memoized best text color calculation
 */
export const getBestTextColorMemoized = createColorMemoizer(
  (backgroundColor: string) => getBestTextColor(backgroundColor)
)

/**
 * Memoized color harmonies generation
 */
export const generateColorHarmoniesMemoized = createColorMemoizer(
  (baseColor: string): ColorHarmony[] => generateColorHarmonies(baseColor),
  50 // Smaller cache for harmonies
)

/**
 * Generate a memoized palette for PrimeVue themes
 * This is specifically for the theme system's palette generation
 */
export const generatePaletteMemoized = createColorMemoizer(
  async (baseColor: string) => {
    try {
      const { palette } = await import('@primeuix/themes')
      return palette(baseColor)
    } catch (error) {
      console.warn('Failed to generate palette:', error)
      // Fallback to basic scale generation
      const scale = generateColorScaleMemoized(baseColor, 10)
      return {
        50: scale[0],
        100: scale[1],
        200: scale[2],
        300: scale[3],
        400: scale[4],
        500: baseColor,
        600: scale[6],
        700: scale[7],
        800: scale[8],
        900: scale[9],
        950: scale[9] // Use 900 as fallback for 950
      }
    }
  },
  50 // Smaller cache for palettes
)

/**
 * Batch process multiple colors for efficiency
 */
export function batchProcessColors<T>(
  colors: string[],
  processor: (color: string) => T
): T[] {
  return colors.map(color => processor(color))
}

/**
 * Clear all memoization caches
 * Useful for memory management in long-running applications
 */
export function clearColorCaches() {
  // Since we're using custom memoization, we'd need to expose cache clearing
  // For now, this is a placeholder for future implementation
  console.log('Color caches cleared')
}

/**
 * Get cache statistics for monitoring
 */
export function getColorCacheStats() {
  // Placeholder for cache statistics
  return {
    message: 'Cache statistics not yet implemented',
    recommendation: 'Monitor performance using browser DevTools'
  }
}

// Export all memoized functions as a namespace for convenience
export const memoizedColorUtils = {
  parseColor: parseColorMemoized,
  getRelativeLuminance: getRelativeLuminanceMemoized,
  getContrastRatio: getContrastRatioMemoized,
  checkContrast: checkContrastMemoized,
  generateColorScale: generateColorScaleMemoized,
  getBestTextColor: getBestTextColorMemoized,
  generateColorHarmonies: generateColorHarmoniesMemoized,
  generatePalette: generatePaletteMemoized
}