// Test Firebase Configuration
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDbYRxCb5FX8-QO_GgwV6mbbWVb-IeZstg",
  authDomain: "spirithub-506f5.firebaseapp.com",
  projectId: "spirithub-506f5",
  storageBucket: "spirithub-506f5.firebasestorage.app",
  messagingSenderId: "920496914548",
  appId: "1:920496914548:web:30f85e360d4e6355f1d121",
  measurementId: "G-NB1HZ7ZRNF"
};

console.log('Testing Firebase Config:', firebaseConfig);

try {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  console.log('✅ Firebase initialized successfully');
  console.log('Auth object:', auth);
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
}

export {};
