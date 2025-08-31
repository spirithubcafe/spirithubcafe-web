// Auth Debug Utility for Firebase authentication issues
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export const debugAuthState = async () => {
  console.group('🔍 Firebase Auth Debug');
  
  try {
    // Check current user
    const currentUser = auth.currentUser;
    console.log('Current User:', currentUser);
    
    if (currentUser) {
      console.log('User ID:', currentUser.uid);
      console.log('Email:', currentUser.email);
      console.log('Email Verified:', currentUser.emailVerified);
      console.log('Display Name:', currentUser.displayName);
      console.log('Provider Data:', currentUser.providerData);
      
      // Check if user document exists in Firestore
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          console.log('User Document:', userDoc.data());
          const userData = userDoc.data();
          console.log('User Role:', userData.role || 'No role set');
          console.log('User Status:', userData.status || 'No status set');
        } else {
          console.warn('⚠️ User document does not exist in Firestore');
        }
      } catch (error) {
        console.error('❌ Error checking user document:', error);
      }
      
      // Get ID Token for debugging
      try {
        const idToken = await currentUser.getIdToken();
        console.log('ID Token exists:', !!idToken);
        console.log('Token length:', idToken.length);
        
        // Parse token claims (for debugging only)
        const tokenResult = await currentUser.getIdTokenResult();
        console.log('Token Claims:', tokenResult.claims);
      } catch (error) {
        console.error('❌ Error getting ID token:', error);
      }
    } else {
      console.warn('⚠️ No user is currently signed in');
    }
    
    // Check auth configuration
    console.log('Auth App Name:', auth.app.name);
    console.log('Auth Config:', auth.config);
    
  } catch (error) {
    console.error('❌ Auth debug error:', error);
  } finally {
    console.groupEnd();
  }
};

export const testFirestorePermissions = async () => {
  console.group('🔍 Firestore Permissions Test');
  
  try {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      console.warn('⚠️ No authenticated user - cannot test permissions');
      return;
    }
    
    // Test basic read access to users collection
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      console.log('✅ Can read own user document:', userDoc.exists());
    } catch (error: any) {
      console.error('❌ Cannot read own user document:', error.code, error.message);
    }
    
    // Test read access to orders collection
    try {
      const testOrderRef = doc(db, 'orders', 'test-doc-id');
      await getDoc(testOrderRef);
      console.log('✅ Can access orders collection');
    } catch (error: any) {
      console.error('❌ Cannot access orders collection:', error.code, error.message);
    }
    
  } catch (error) {
    console.error('❌ Permission test error:', error);
  } finally {
    console.groupEnd();
  }
};

// Auto-run debug when module is imported (for development)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Wait for auth state to be ready
  auth.onAuthStateChanged((user) => {
    if (user) {
      setTimeout(() => {
        debugAuthState();
        testFirestorePermissions();
      }, 1000);
    }
  });
}
