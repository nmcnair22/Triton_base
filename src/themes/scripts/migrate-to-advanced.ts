/**
 * Migration script to transition from legacy theme system to advanced token system
 * Run this after implementing Phase 1 to migrate existing data
 */

import { TokenMigration } from '@/themes/core/token-migration'
import { TokenRegistry } from '@/themes/core/token-registry'
import { useThemePresetStore } from '@/stores/theme/preset.store'
import { useThemeAdvancedStore } from '@/stores/theme/advanced.store'
import type { ColorToken, ThemePreset } from '@/themes/presets/preset.types'

// Import existing color tokens from the configuration
import { editableColorTokens } from '@/themes/config/theme.config'

export async function migrateToAdvancedThemeSystem() {
  console.log('🚀 Starting migration to advanced theme system...')
  
  const presetStore = useThemePresetStore()
  const advancedStore = useThemeAdvancedStore()
  const registry = TokenRegistry.getInstance()
  
  try {
    // Step 1: Migrate color tokens to design tokens
    console.log('📦 Step 1: Migrating color tokens...')
    const designTokens = TokenMigration.migrateColorTokens(editableColorTokens as ColorToken[])
    
    // Register migrated tokens
    registry.registerBatch(designTokens)
    console.log(`✅ Migrated ${designTokens.length} color tokens`)
    
    // Step 2: Migrate existing presets
    console.log('🎨 Step 2: Migrating theme presets...')
    await presetStore.initialize()
    
    const allPresets = [...presetStore.builtInPresets, ...presetStore.userPresets]
    const migratedPresets: ThemePreset[] = []
    
    for (const preset of allPresets) {
      const migrated = TokenMigration.migrateThemePreset(preset)
      migratedPresets.push(migrated)
      
      // Validate migration
      const validation = TokenMigration.validateMigration(preset, migrated)
      if (!validation.valid) {
        console.warn(`⚠️  Issues migrating preset "${preset.name}":`, validation.errors)
      }
    }
    
    console.log(`✅ Migrated ${migratedPresets.length} presets`)
    
    // Step 3: Generate migration report
    console.log('📊 Step 3: Generating migration report...')
    const report = TokenMigration.generateMigrationReport(allPresets, migratedPresets)
    
    console.log('📈 Migration Report:')
    console.log(`   Total Presets: ${report.totalPresets}`)
    console.log(`   Successful: ${report.successfulMigrations}`)
    console.log(`   Failed: ${report.failedMigrations}`)
    console.log(`   Original Tokens: ${report.tokenCounts.original}`)
    console.log(`   Migrated Tokens: ${report.tokenCounts.migrated}`)
    
    if (report.errors.length > 0) {
      console.error('❌ Migration errors:')
      report.errors.forEach(error => {
        console.error(`   Preset ${error.presetId}:`, error.errors)
      })
    }
    
    // Step 4: Update stores with migrated data
    console.log('💾 Step 4: Updating stores...')
    
    // Update presets in store
    for (const migrated of migratedPresets) {
      if (migrated.metadata.isBuiltIn) {
        // Built-in presets are handled differently
        continue
      }
      
      // Update user preset
      await presetStore.updatePreset(migrated)
    }
    
    // Export registry state for advanced store
    const registryState = registry.export()
    advancedStore.importTokenState({ registry: registryState })
    
    // Step 5: Create token ID mapping for backward compatibility
    console.log('🔗 Step 5: Creating token mappings...')
    const tokenMapping = TokenMigration.createTokenMapping(editableColorTokens as ColorToken[])
    
    // Save mapping for reference
    localStorage.setItem('theme-token-mapping', JSON.stringify(Array.from(tokenMapping.entries())))
    
    console.log('✨ Migration completed successfully!')
    console.log('📌 Token Registry Stats:', registry.getStats())
    
    return {
      success: true,
      report,
      tokenMapping
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Helper function to run migration with user confirmation
export async function runMigrationWithConfirmation() {
  const confirmed = confirm(
    'This will migrate your theme system to the new advanced token infrastructure.\n\n' +
    'Your existing themes and settings will be preserved.\n\n' +
    'Do you want to continue?'
  )
  
  if (!confirmed) {
    console.log('Migration cancelled by user')
    return
  }
  
  const result = await migrateToAdvancedThemeSystem()
  
  if (result.success) {
    alert('Migration completed successfully! Please refresh the page.')
  } else {
    alert(`Migration failed: ${result.error}\n\nCheck the console for details.`)
  }
}

// Export for use in development console
if (import.meta.env.DEV) {
  (window as any).migrateTheme = runMigrationWithConfirmation
  console.log('💡 Run window.migrateTheme() to start the migration process')
}