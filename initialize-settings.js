// Quick script to initialize checkout settings manually
// Copy and paste this in browser console on localhost:5175

const initializeCheckoutSettings = async () => {
  try {
    console.log('🚀 Initializing checkout settings...');
    
    const { firestoreService } = await import('/src/lib/firebase.ts');
    
    const success = await firestoreService.checkoutSettings.initialize();
    
    if (success) {
      console.log('✅ Checkout settings initialized successfully!');
      // Refresh the page to see the changes
      window.location.reload();
    } else {
      console.error('❌ Failed to initialize checkout settings');
    }
  } catch (error) {
    console.error('❌ Error initializing checkout settings:', error);
  }
};

// Run the initialization
initializeCheckoutSettings();
