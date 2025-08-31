import { auth, db } from '@/lib/firebase';
import { connectAuthEmulator } from 'firebase/auth';
import { connectFirestoreEmulator } from 'firebase/firestore';

/**
 * Initialize Firebase emulators for development
 */
export const initializeEmulators = () => {
  if (typeof window === 'undefined') return;
  
  // Only connect to emulators in development mode
  if (import.meta.env.DEV) {
    try {
      // Check if we want to use emulators (can be controlled via env var)
      const useEmulators = import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true' || 
                          window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1';
      
      if (useEmulators) {
        // Connect to Auth emulator (only if not already connected)
        try {
          connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
          console.log('🔧 Connected to Firebase Auth Emulator');
        } catch (error: any) {
          if (error.code !== 'auth/emulator-config-failed') {
            console.warn('⚠️ Auth emulator connection issue:', error.message);
          }
        }
        
        // Connect to Firestore emulator (only if not already connected)
        try {
          connectFirestoreEmulator(db, 'localhost', 8080);
          console.log('🔧 Connected to Firebase Firestore Emulator');
        } catch (error: any) {
          if (!error.message?.includes('Firestore has already been started')) {
            console.warn('⚠️ Firestore emulator connection issue:', error.message);
          }
        }
        
        console.log('🚀 Firebase Emulators initialized for development');
        console.log('📍 Emulator UI: http://localhost:4000');
      } else {
        console.log('🌐 Using production Firebase services');
      }
    } catch (error: any) {
      if (error.code === 'auth/emulator-config-failed') {
        console.warn('⚠️ Auth emulator already configured');
      } else if (error.message?.includes('Firestore has already been started')) {
        console.warn('⚠️ Firestore emulator already configured');
      } else {
        console.error('❌ Error initializing emulators:', error);
      }
    }
  }
};

/**
 * Check if we're currently using emulators
 */
export const isUsingEmulators = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return import.meta.env.DEV && (
    import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );
};

/**
 * Get current Firebase environment info
 */
export const getFirebaseEnvironment = () => {
  const isEmulator = isUsingEmulators();
  
  return {
    environment: isEmulator ? 'emulator' : 'production',
    isEmulator,
    authEmulator: isEmulator ? 'http://localhost:9099' : null,
    firestoreEmulator: isEmulator ? 'localhost:8080' : null,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'unknown'
  };
};

// Auto-initialize emulators when module is imported in development
if (import.meta.env.DEV) {
  // Wait for next tick to ensure Firebase is fully initialized
  setTimeout(initializeEmulators, 100);
}
