/**
 * Test script for token discovery system
 * Run this to test the discovery functionality
 */

import { TokenDiscovery, TokenRegistry } from '@/themes/core'
import { useThemeAdvancedStore } from '@/stores/theme/advanced.store'

export async function testTokenDiscovery() {
  console.log('🚀 Testing Token Discovery System...\n')
  
  const registry = TokenRegistry.getInstance()
  const advancedStore = useThemeAdvancedStore()
  
  try {
    // Clear any existing cache for fresh discovery
    console.log('🧹 Clearing cache...')
    TokenDiscovery.clearCache()
    registry.clear()
    
    // Run discovery
    console.log('🔍 Starting token discovery...')
    const startTime = performance.now()
    
    const discoveredTokens = await TokenDiscovery.discoverAllTokens()
    
    const endTime = performance.now()
    const duration = Math.round(endTime - startTime)
    
    console.log(`✅ Discovery completed in ${duration}ms\n`)
    
    // Display results
    console.log('📊 Discovery Results:')
    console.log('====================')
    
    const stats = TokenDiscovery.getDiscoveryStats()
    console.log(`Total Components: ${stats.totalComponents}`)
    console.log(`Discovered Components: ${stats.discoveredComponents}`)
    console.log(`Total Tokens: ${stats.totalTokens}`)
    console.log('\nTokens by Category:')
    Object.entries(stats.tokensByCategory).forEach(([category, count]) => {
      console.log(`  ${category}: ${count}`)
    })
    
    // Show sample tokens from each category
    console.log('\n📝 Sample Tokens:')
    console.log('================')
    
    // Primitive tokens
    const primitiveTokens = discoveredTokens.get('primitive') || []
    if (primitiveTokens.length > 0) {
      console.log('\nPrimitive Tokens (first 3):')
      primitiveTokens.slice(0, 3).forEach(token => {
        console.log(`  - ${token.label} (${token.id}): ${token.value}`)
      })
    }
    
    // Semantic tokens
    const semanticTokens = discoveredTokens.get('semantic') || []
    if (semanticTokens.length > 0) {
      console.log('\nSemantic Tokens (first 3):')
      semanticTokens.slice(0, 3).forEach(token => {
        console.log(`  - ${token.label} (${token.id}): ${token.value}`)
      })
    }
    
    // Button tokens
    const buttonTokens = discoveredTokens.get('button') || []
    if (buttonTokens.length > 0) {
      console.log('\nButton Component Tokens:')
      buttonTokens.forEach(token => {
        console.log(`  - ${token.label} (${token.path}): ${token.value} [${token.type}]`)
      })
    }
    
    // DataTable tokens
    const dataTableTokens = discoveredTokens.get('datatable') || []
    if (dataTableTokens.length > 0) {
      console.log('\nDataTable Component Tokens:')
      dataTableTokens.forEach(token => {
        console.log(`  - ${token.label} (${token.path}): ${token.value} [${token.type}]`)
      })
    }
    
    // Test registry integration
    console.log('\n🔧 Testing Registry Integration:')
    console.log('================================')
    
    // Register all discovered tokens
    discoveredTokens.forEach((tokens, component) => {
      registry.registerBatch(tokens)
    })
    
    const registryStats = registry.getStats()
    console.log(`Registry Total Tokens: ${registryStats.totalTokens}`)
    console.log(`Registry Components: ${registryStats.components}`)
    
    // Test token search
    console.log('\n🔎 Testing Token Search:')
    const searchResults = registry.searchTokens('button')
    console.log(`Found ${searchResults.length} tokens matching "button"`)
    
    // Test component tokens retrieval
    const buttonTokensFromRegistry = registry.getTokensByComponent('button')
    console.log(`Button tokens in registry: ${buttonTokensFromRegistry.length}`)
    
    // Update store with discovered tokens
    advancedStore.setDiscoveredTokens(discoveredTokens)
    console.log('\n✅ Updated advanced store with discovered tokens')
    
    // Test cache
    console.log('\n💾 Testing Cache:')
    console.log('================')
    
    // Second discovery should use cache
    const startTime2 = performance.now()
    await TokenDiscovery.discoverAllTokens()
    const endTime2 = performance.now()
    const duration2 = Math.round(endTime2 - startTime2)
    
    console.log(`Cached discovery completed in ${duration2}ms`)
    console.log(`Speed improvement: ${Math.round((duration - duration2) / duration * 100)}%`)
    
    return {
      success: true,
      stats,
      duration
    }
    
  } catch (error) {
    console.error('❌ Discovery failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Helper to run discovery with UI feedback
export async function runDiscoveryTest() {
  const result = await testTokenDiscovery()
  
  if (result.success) {
    alert(`Token Discovery Test Complete!\n\nDiscovered ${result.stats?.totalTokens} tokens in ${result.duration}ms\n\nCheck the console for detailed results.`)
  } else {
    alert(`Token Discovery Test Failed!\n\nError: ${result.error}\n\nCheck the console for details.`)
  }
}

// Export for use in development console
if (import.meta.env.DEV) {
  (window as any).testDiscovery = runDiscoveryTest
  console.log('💡 Run window.testDiscovery() to test the token discovery system')
}