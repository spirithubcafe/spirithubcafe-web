// Test to verify cart functionality
import { firestoreService } from './lib/firebase'

async function testCart() {
  try {
    console.log('Testing cart functionality...')
    
    // Test getting an empty cart
    const emptyCart = await firestoreService.cart.getUserCart('test-user-id')
    console.log('Empty cart:', emptyCart)
    
    console.log('Cart test completed successfully!')
  } catch (error) {
    console.error('Cart test failed:', error)
  }
}

// Run test in browser console: testCart()
console.log('Cart test function available. Run testCart() to test.')
