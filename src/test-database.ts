/**
 * Test script for database initialization functions
 * This can be used to test the admin functions directly
 */

import { firestoreService } from './lib/firebase'

async function testDatabaseFunctions() {
  console.log('🧪 Testing database functions...')

  try {
    // Test the admin functions
    const adminService = (firestoreService as any).admin

    if (!adminService) {
      console.error('❌ Admin service not found')
      return
    }

    console.log('✅ Admin service found')
    console.log('Available methods:', Object.keys(adminService))

    // Test sample data initialization
    console.log('🚀 Testing sample data initialization...')
    const success = await adminService.initializeSampleData()
    
    if (success) {
      console.log('✅ Sample data initialization test passed')
      
      // Test products retrieval
      const productsResult = await firestoreService.products.list()
      console.log(`✅ Products created: ${productsResult.items.length}`)
      
      // Test categories retrieval
      const categoriesResult = await firestoreService.categories.list()
      console.log(`✅ Categories created: ${categoriesResult.items.length}`)
      
    } else {
      console.error('❌ Sample data initialization test failed')
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error)
  }
}

// Export for use in other files
export { testDatabaseFunctions }

// Run if called directly (uncomment to test)
// testDatabaseFunctions()
