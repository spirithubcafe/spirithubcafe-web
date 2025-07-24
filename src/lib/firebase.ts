// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "firebase/auth";
import type { User } from "firebase/auth";
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, serverTimestamp, onSnapshot } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Debug: Check if environment variables are loaded
console.log('Firebase Config Debug:', {
  apiKey: firebaseConfig.apiKey ? '✓ Loaded' : '✗ Missing',
  authDomain: firebaseConfig.authDomain ? '✓ Loaded' : '✗ Missing',
  projectId: firebaseConfig.projectId ? '✓ Loaded' : '✗ Missing',
  appId: firebaseConfig.appId ? '✓ Loaded' : '✗ Missing'
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const storage = getStorage(app);

// Initialize Firestore with error handling
let db: any = null;
try {
  db = getFirestore(app);
  console.log('🔥 Firestore initialized successfully');
} catch (error) {
  console.error('❌ Firestore initialization failed:', error);
  // We'll create a mock db for development
  db = null;
}

// Initialize analytics only in production
let analytics: any = null;
if (typeof window !== 'undefined' && import.meta.env.PROD) {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Analytics initialization failed:', error);
  }
}

// Types for our collections
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'admin' | 'shop_owner' | 'employee' | 'user';
  avatar?: string;
  created: Date;
  updated: Date;
}

export interface Category {
  id: string;
  name: string;
  name_ar: string;
  description?: string;
  description_ar?: string;
  image?: string;
  is_active: boolean;
  sort_order: number;
  created: Date;
  updated: Date;
}

export interface Product {
  id: string;
  name: string;
  name_ar: string;
  description?: string;
  description_ar?: string;
  category_id: string; // reference to categories
  price_omr: number; // قیمت اصلی به ریال عمان
  price_usd?: number; // قیمت محاسبه شده به دلار
  price_sar?: number; // قیمت محاسبه شده به ریال سعودی
  sale_price_omr?: number; // قیمت تخفیف به ریال عمان
  sale_price_usd?: number; // قیمت تخفیف محاسبه شده به دلار
  sale_price_sar?: number; // قیمت تخفیف محاسبه شده به ریال سعودی
  image?: string;
  gallery: string[]; // array of image URLs
  is_active: boolean;
  is_featured: boolean;
  is_bestseller: boolean;
  is_new_arrival: boolean;
  is_on_sale: boolean;
  stock_quantity: number;
  sku?: string;
  weight?: number;
  sort_order: number;
  meta_title?: string;
  meta_description?: string;
  created: Date;
  updated: Date;
}

export interface CartItem {
  id: string;
  user_id: string; // reference to users
  product_id: string; // reference to products
  quantity: number;
  created: Date;
  updated: Date;
}

export interface Order {
  id: string;
  user_id: string; // reference to users
  order_number: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  total_usd: number;
  total_omr?: number;
  total_sar?: number;
  currency: 'USD' | 'OMR' | 'SAR';
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address?: string;
  notes?: string;
  created: Date;
  updated: Date;
}

export interface OrderItem {
  id: string;
  order_id: string; // reference to orders
  product_id: string; // reference to products
  quantity: number;
  unit_price_usd: number;
  unit_price_omr?: number;
  unit_price_sar?: number;
  total_price_usd: number;
  total_price_omr?: number;
  total_price_sar?: number;
  created: Date;
  updated: Date;
}

// Helper function to check if Firestore is available
function isFirestoreAvailable(): boolean {
  return db !== null;
}

// Helper function to handle Firestore operations safely
async function safeFirestoreOperation<T>(
  operation: () => Promise<T>,
  fallbackValue: T,
  operationName: string
): Promise<T> {
  if (!isFirestoreAvailable()) {
    console.warn(`⚠️ Firestore not available for operation: ${operationName}`);
    return fallbackValue;
  }
  
  try {
    return await operation();
  } catch (error) {
    console.error(`❌ Firestore operation failed (${operationName}):`, error);
    return fallbackValue;
  }
}

// Auth helpers
export const authService = {
  login: async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting login with Firebase...');
      console.log('Email:', email);
      console.log('Auth object:', auth);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('✅ Firebase login successful');
      console.log('User:', user);
      
      // Get user profile from Firestore safely
      const userProfile = await safeFirestoreOperation(
        async () => {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            return {
              id: user.uid,
              ...userDoc.data(),
              created: userDoc.data().created?.toDate() || new Date(),
              updated: userDoc.data().updated?.toDate() || new Date()
            } as UserProfile;
          }
          return null;
        },
        null,
        'getUserProfile'
      );
      
      // If no profile exists in Firestore, create a basic one
      let finalProfile = userProfile;
      if (!finalProfile) {
        finalProfile = {
          id: user.uid,
          email: user.email || email,
          full_name: user.displayName || email.split('@')[0],
          role: 'user' as const,
          created: new Date(),
          updated: new Date()
        };
      }
      
      return { success: true, user: finalProfile };
    } catch (error: any) {
      console.error('❌ Firebase login error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      return { success: false, error: error.message };
    }
  },

  register: async (email: string, password: string, userData: { full_name: string; phone?: string }) => {
    try {
      console.log('📝 Attempting registration with Firebase...');
      console.log('Email:', email);
      console.log('User data:', userData);
      console.log('Auth object:', auth);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('✅ Firebase registration successful');
      console.log('User:', user);
      
      // Update the user's display name
      await updateProfile(user, {
        displayName: userData.full_name
      });
      
      console.log('✅ User display name updated');
      
      // Check if this is the first user (admin) BEFORE creating the user document
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await safeFirestoreOperation(
        async () => await getDocs(query(usersCollection, limit(1))),
        { docs: [] } as any,
        'checkFirstUser'
      );
      
      const isFirstUser = usersSnapshot.docs.length === 0;
      const userRole = isFirstUser ? 'admin' : 'user';
      
      console.log(`👤 User role: ${userRole} (First user: ${isFirstUser})`);
      
      // Create user profile in Firestore safely
      const userProfile: UserProfile = {
        id: user.uid,
        email: user.email!,
        full_name: userData.full_name,
        phone: userData.phone,
        role: userRole,
        created: new Date(),
        updated: new Date()
      };
      
      await safeFirestoreOperation(
        async () => {
          await setDoc(doc(db, 'users', user.uid), {
            email: userProfile.email,
            full_name: userProfile.full_name,
            phone: userProfile.phone,
            role: userProfile.role,
            created: serverTimestamp(),
            updated: serverTimestamp()
          });
          console.log('✅ User profile saved to Firestore');
          return true;
        },
        false,
        'createUserProfile'
      );
      
      return { success: true, user: userProfile };
    } catch (error: any) {
      console.error('❌ Firebase registration error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      return { success: false, error: error.message };
    }
  },

  logout: async () => {
    await signOut(auth);
  },

  getCurrentUser: (): User | null => {
    return auth.currentUser;
  },

  isAuthenticated: (): boolean => {
    return !!auth.currentUser;
  },

  onAuthChange: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
  },

  getUserProfile: async (userId: string): Promise<UserProfile | null> => {
    return await safeFirestoreOperation(
      async () => {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          return {
            id: userId,
            ...userDoc.data(),
            created: userDoc.data().created?.toDate() || new Date(),
            updated: userDoc.data().updated?.toDate() || new Date()
          } as UserProfile;
        }
        return null;
      },
      null,
      'getUserProfile'
    );
  }
};

// Database helpers
export const firestoreService = {
  // Users (Admin only)
  users: {
    // Get all users (Admin only)
    list: async (): Promise<{ items: UserProfile[]; total: number }> => {
      return await safeFirestoreOperation(
        async () => {
          const q = query(
            collection(db, 'users'),
            orderBy('created', 'desc')
          );
          const querySnapshot = await getDocs(q);
          const users = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            created: doc.data().created?.toDate() || new Date(),
            updated: doc.data().updated?.toDate() || new Date()
          } as UserProfile));
          
          return {
            items: users,
            total: users.length
          };
        },
        { items: [], total: 0 },
        'getUsersList'
      );
    },

    // Update user role (Admin only)
    updateRole: async (userId: string, newRole: 'admin' | 'shop_owner' | 'employee' | 'user'): Promise<boolean> => {
      return await safeFirestoreOperation(
        async () => {
          await updateDoc(doc(db, 'users', userId), {
            role: newRole,
            updated: serverTimestamp()
          });
          console.log(`✅ User ${userId} role updated to ${newRole}`);
          return true;
        },
        false,
        'updateUserRole'
      );
    },

    // Update user profile
    update: async (userId: string, data: Partial<UserProfile>): Promise<boolean> => {
      return await safeFirestoreOperation(
        async () => {
          const updateData: any = {
            ...data,
            updated: serverTimestamp()
          };
          
          // Remove fields that shouldn't be updated directly
          delete updateData.id;
          delete updateData.created;
          
          await updateDoc(doc(db, 'users', userId), updateData);
          console.log(`✅ User ${userId} profile updated`);
          return true;
        },
        false,
        'updateUserProfile'
      );
    },

    // Get single user (for viewing/editing)
    get: async (userId: string): Promise<UserProfile | null> => {
      return await safeFirestoreOperation(
        async () => {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            return {
              id: userId,
              ...userDoc.data(),
              created: userDoc.data().created?.toDate() || new Date(),
              updated: userDoc.data().updated?.toDate() || new Date()
            } as UserProfile;
          }
          return null;
        },
        null,
        'getUser'
      );
    },

    // Delete user (Admin only)
    delete: async (userId: string): Promise<boolean> => {
      return await safeFirestoreOperation(
        async () => {
          await deleteDoc(doc(db, 'users', userId));
          console.log(`✅ User ${userId} deleted`);
          return true;
        },
        false,
        'deleteUser'
      );
    },

    // Get user stats (Admin only)
    getStats: async (): Promise<{ totalUsers: number; adminUsers: number; shopOwners: number; employees: number; regularUsers: number }> => {
      return await safeFirestoreOperation(
        async () => {
          const q = query(collection(db, 'users'));
          const querySnapshot = await getDocs(q);
          const users = querySnapshot.docs.map(doc => doc.data());
          
          const totalUsers = users.length;
          const adminUsers = users.filter(user => user.role === 'admin').length;
          const shopOwners = users.filter(user => user.role === 'shop_owner').length;
          const employees = users.filter(user => user.role === 'employee').length;
          const regularUsers = users.filter(user => user.role === 'user').length;
          
          return { totalUsers, adminUsers, shopOwners, employees, regularUsers };
        },
        { totalUsers: 0, adminUsers: 0, shopOwners: 0, employees: 0, regularUsers: 0 },
        'getUserStats'
      );
    }
  },

  // Categories
  categories: {
    list: async () => {
      try {
        // Temporarily simplified query to avoid index requirement
        const q = query(
          collection(db, 'categories'),
          where('is_active', '==', true)
        );
        const querySnapshot = await getDocs(q);
        const categories = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
        
        // Sort in memory for now
        categories.sort((a, b) => a.sort_order - b.sort_order);
        
        return {
          items: categories,
          totalItems: categories.length
        };
      } catch (error) {
        console.error('Error getting categories:', error);
        throw error;
      }
    },
    
    get: async (id: string): Promise<Category | null> => {
      try {
        const docSnap = await getDoc(doc(db, 'categories', id));
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as Category;
        }
        return null;
      } catch (error) {
        console.error('Error getting category:', error);
        throw error;
      }
    },
    
    create: async (data: Omit<Category, 'id' | 'created' | 'updated'>) => {
      try {
        const categoryData = {
          ...data,
          created: serverTimestamp(),
          updated: serverTimestamp()
        };
        const docRef = await addDoc(collection(db, 'categories'), categoryData);
        return { id: docRef.id, ...categoryData };
      } catch (error) {
        console.error('Error creating category:', error);
        throw error;
      }
    },
    
    update: async (id: string, data: Partial<Category>) => {
      try {
        const updateData = {
          ...data,
          updated: serverTimestamp()
        };
        await updateDoc(doc(db, 'categories', id), updateData);
        return { id, ...updateData };
      } catch (error) {
        console.error('Error updating category:', error);
        throw error;
      }
    },
    
    delete: async (id: string) => {
      try {
        await deleteDoc(doc(db, 'categories', id));
      } catch (error) {
        console.error('Error deleting category:', error);
        throw error;
      }
    }
  },

  // Products
  products: {
    list: async (filters?: { category?: string; featured?: boolean; bestseller?: boolean; new_arrival?: boolean; search?: string }) => {
      try {
        let q = query(
          collection(db, 'products'),
          where('is_active', '==', true)
        );
        
        if (filters?.category) {
          q = query(q, where('category_id', '==', filters.category));
        }
        
        if (filters?.featured) {
          q = query(q, where('is_featured', '==', true));
        }
        
        if (filters?.bestseller) {
          q = query(q, where('is_bestseller', '==', true));
        }
        
        if (filters?.new_arrival) {
          q = query(q, where('is_new_arrival', '==', true));
        }
        
        // Temporarily simplify ordering until indexes are built
        // q = query(q, orderBy('sort_order'), orderBy('created', 'desc'), limit(50));
        q = query(q, limit(50));
        
        const querySnapshot = await getDocs(q);
        let products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        
        // Sort client-side temporarily until indexes are ready
        products.sort((a, b) => {
          if (a.sort_order !== b.sort_order) {
            return a.sort_order - b.sort_order;
          }
          return new Date(b.created).getTime() - new Date(a.created).getTime();
        });
        
        // Filter by search term if provided (client-side filtering for now)
        if (filters?.search) {
          const searchTerm = filters.search.toLowerCase();
          products = products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.name_ar.toLowerCase().includes(searchTerm)
          );
        }
        
        return {
          items: products,
          totalItems: products.length
        };
      } catch (error) {
        console.error('Error getting products:', error);
        throw error;
      }
    },
    
    get: async (id: string): Promise<Product | null> => {
      try {
        const docSnap = await getDoc(doc(db, 'products', id));
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as Product;
        }
        return null;
      } catch (error) {
        console.error('Error getting product:', error);
        throw error;
      }
    },
    
    create: async (data: Omit<Product, 'id' | 'created' | 'updated'>) => {
      try {
        const productData = {
          ...data,
          created: serverTimestamp(),
          updated: serverTimestamp()
        };
        const docRef = await addDoc(collection(db, 'products'), productData);
        return { id: docRef.id, ...productData };
      } catch (error) {
        console.error('Error creating product:', error);
        throw error;
      }
    },
    
    update: async (id: string, data: Partial<Product>) => {
      try {
        const updateData = {
          ...data,
          updated: serverTimestamp()
        };
        await updateDoc(doc(db, 'products', id), updateData);
        return { id, ...updateData };
      } catch (error) {
        console.error('Error updating product:', error);
        throw error;
      }
    },
    
    delete: async (id: string) => {
      try {
        await deleteDoc(doc(db, 'products', id));
      } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
      }
    }
  },

  // Cart
  cart: {
    getUserCart: async (userId: string) => {
      try {
        const q = query(
          collection(db, 'cart_items'),
          where('user_id', '==', userId)
        );
        const querySnapshot = await getDocs(q);
        const cartItems = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CartItem));
        
        // Get product details for each cart item
        const itemsWithProducts = await Promise.all(
          cartItems.map(async (item) => {
            // Ensure product_id is a string
            const productId = String(item.product_id);
            const product = await firestoreService.products.get(productId);
            return {
              ...item,
              product
            };
          })
        );
        
        return {
          items: itemsWithProducts,
          totalItems: itemsWithProducts.length
        };
      } catch (error) {
        console.error('Error getting user cart:', error);
        throw error;
      }
    },
    
    addItem: async (userId: string, productId: string, quantity: number = 1) => {
      try {
        // Check if item already exists in cart
        const q = query(
          collection(db, 'cart_items'),
          where('user_id', '==', userId),
          where('product_id', '==', productId)
        );
        const existing = await getDocs(q);
        
        if (!existing.empty) {
          // Update existing item
          const existingItem = existing.docs[0];
          const currentQuantity = existingItem.data().quantity;
          await updateDoc(existingItem.ref, {
            quantity: currentQuantity + quantity,
            updated: serverTimestamp()
          });
          return { id: existingItem.id, ...existingItem.data(), quantity: currentQuantity + quantity };
        } else {
          // Create new item
          const cartItemData = {
            user_id: userId,
            product_id: productId,
            quantity,
            created: serverTimestamp(),
            updated: serverTimestamp()
          };
          const docRef = await addDoc(collection(db, 'cart_items'), cartItemData);
          return { id: docRef.id, ...cartItemData };
        }
      } catch (error) {
        console.error('Error adding cart item:', error);
        throw error;
      }
    },
    
    updateQuantity: async (itemId: string, quantity: number) => {
      try {
        await updateDoc(doc(db, 'cart_items', itemId), {
          quantity,
          updated: serverTimestamp()
        });
      } catch (error) {
        console.error('Error updating cart item:', error);
        throw error;
      }
    },
    
    removeItem: async (itemId: string) => {
      try {
        await deleteDoc(doc(db, 'cart_items', itemId));
      } catch (error) {
        console.error('Error removing cart item:', error);
        throw error;
      }
    },
    
    clearCart: async (userId: string) => {
      try {
        const q = query(
          collection(db, 'cart_items'),
          where('user_id', '==', userId)
        );
        const querySnapshot = await getDocs(q);
        const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
      } catch (error) {
        console.error('Error clearing cart:', error);
        throw error;
      }
    }
  },

  // Orders
  orders: {
    list: async (userId?: string) => {
      try {
        let q = query(collection(db, 'orders'), orderBy('created', 'desc'));
        
        if (userId) {
          q = query(q, where('user_id', '==', userId));
        }
        
        const querySnapshot = await getDocs(q);
        return {
          items: querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)),
          totalItems: querySnapshot.docs.length
        };
      } catch (error) {
        console.error('Error getting orders:', error);
        throw error;
      }
    },
    
    get: async (id: string): Promise<Order | null> => {
      try {
        const docSnap = await getDoc(doc(db, 'orders', id));
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as Order;
        }
        return null;
      } catch (error) {
        console.error('Error getting order:', error);
        throw error;
      }
    },
    
    create: async (data: Omit<Order, 'id' | 'created' | 'updated'>) => {
      try {
        const orderData = {
          ...data,
          created: serverTimestamp(),
          updated: serverTimestamp()
        };
        const docRef = await addDoc(collection(db, 'orders'), orderData);
        return { id: docRef.id, ...orderData };
      } catch (error) {
        console.error('Error creating order:', error);
        throw error;
      }
    },
    
    update: async (id: string, data: Partial<Order>) => {
      try {
        const updateData = {
          ...data,
          updated: serverTimestamp()
        };
        await updateDoc(doc(db, 'orders', id), updateData);
        return { id, ...updateData };
      } catch (error) {
        console.error('Error updating order:', error);
        throw error;
      }
    }
  },

  // Order Items
  orderItems: {
    getByOrder: async (orderId: string) => {
      try {
        const q = query(
          collection(db, 'order_items'),
          where('order_id', '==', orderId)
        );
        const querySnapshot = await getDocs(q);
        const orderItems = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as OrderItem));
        
        // Get product details for each order item
        const itemsWithProducts = await Promise.all(
          orderItems.map(async (item) => {
            const product = await firestoreService.products.get(item.product_id);
            return {
              ...item,
              product
            };
          })
        );
        
        return {
          items: itemsWithProducts,
          totalItems: itemsWithProducts.length
        };
      } catch (error) {
        console.error('Error getting order items:', error);
        throw error;
      }
    },
    
    create: async (data: Omit<OrderItem, 'id' | 'created' | 'updated'>) => {
      try {
        const orderItemData = {
          ...data,
          created: serverTimestamp(),
          updated: serverTimestamp()
        };
        const docRef = await addDoc(collection(db, 'order_items'), orderItemData);
        return { id: docRef.id, ...orderItemData };
      } catch (error) {
        console.error('Error creating order item:', error);
        throw error;
      }
    }
  }
};

// File upload helpers
export const storageService = {
  upload: async (path: string, file: File): Promise<string> => {
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },
  
  uploadMultiple: async (basePath: string, files: File[]): Promise<string[]> => {
    try {
      const uploadPromises = files.map(async (file, index) => {
        const fileName = `${Date.now()}_${index}_${file.name}`;
        const filePath = `${basePath}/${fileName}`;
        return storageService.upload(filePath, file);
      });
      
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading multiple files:', error);
      throw error;
    }
  },
  
  delete: async (url: string) => {
    try {
      const fileRef = ref(storage, url);
      await deleteObject(fileRef);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }
};

// Real-time subscriptions
export const subscriptions = {
  onCartChange: (userId: string, callback: (cartItems: any[]) => void) => {
    const q = query(
      collection(db, 'cart_items'),
      where('user_id', '==', userId)
    );
    
    return onSnapshot(q, (snapshot) => {
      const cartItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(cartItems);
    });
  },
  
  onOrderChange: (orderId: string, callback: (order: Order | null) => void) => {
    const orderDoc = doc(db, 'orders', orderId);
    
    return onSnapshot(orderDoc, (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() } as Order);
      } else {
        callback(null);
      }
    });
  }
};

export { auth, db, storage, analytics };
export default app;
