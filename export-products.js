import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Firebase config
const firebaseConfig = {
  // Add your Firebase config here
  projectId: "spirithubcafe",
  // Add other config...
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function exportProducts() {
  try {
    console.log('Exporting products from Firestore...');
    
    // Get all products from Firestore
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    
    const products = [];
    snapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log(`Found ${products.length} products`);

    // Save to JSON file
    const outputPath = join(__dirname, 'public', 'data', 'products.json');
    
    // Ensure directory exists
    const dir = dirname(outputPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    writeFileSync(outputPath, JSON.stringify(products, null, 2));
    
    console.log(`Products exported to: ${outputPath}`);
    console.log('Export completed successfully!');
    
  } catch (error) {
    console.error('Error exporting products:', error);
  }
}

exportProducts();
