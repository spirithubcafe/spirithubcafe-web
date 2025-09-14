// Simple test to check if About sections query works
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, orderBy, getDocs } from 'firebase/firestore/lite';

const firebaseConfig = {
  // Add your Firebase config here from .env.local
  apiKey: "AIzaSyBjz-LBqvLkJ8u3Hq-8jOxYwqFHN8-6k3E",
  authDomain: "spirithub-506f5.firebaseapp.com",
  projectId: "spirithub-506f5",
  storageBucket: "spirithub-506f5.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testAboutQuery() {
  try {
    console.log('Testing About sections query...');
    
    const q = query(
      collection(db, 'about_sections'),
      where('is_active', '==', true),
      orderBy('order_index', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    console.log('Query successful! Found', querySnapshot.docs.length, 'sections');
    
    querySnapshot.docs.forEach(doc => {
      console.log('Section:', doc.id, doc.data());
    });
    
  } catch (error) {
    console.error('Query failed:', error);
  }
}

testAboutQuery();