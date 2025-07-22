/**
 * Legacy theme store wrapper for backward compatibility
 * 
 * This file provides a compatibility layer during the migration
 * from the monolithic theme store to the split theme stores.
 * 
 * @deprecated Please use the individual stores from '@/stores/theme' instead:
 * - useThemeConfigStore() for configuration
 * - useThemeUIStore() for UI state  
 * - useThemePresetStore() for preset management
 * - useThemeEditorStore() for theme editing
 */

import { defineStore } from 'pinia'
import { useThemeStore as useCompositeStore } from './theme'

// Migration complete - deprecation warning removed
// All components have been successfully migrated to use the split stores

export const useThemeStore = defineStore('theme', () => {
  // Return the composite store that provides backward compatibility
  return useCompositeStore()
})