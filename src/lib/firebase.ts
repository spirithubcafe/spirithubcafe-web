// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, sendPasswordResetEmail, updatePassword, sendEmailVerification } from "firebase/auth";
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


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const storage = getStorage(app);

// Initialize Firestore with error handling
let db: any = null;
try {
  db = getFirestore(app);
} catch (error) {
  console.error('❌ Firestore initialization failed:', error);
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
  email_verified: boolean;
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

export interface ProductPropertyOption {
  id?: string;
  value: string;
  label: string;
  label_ar: string;
  // Price modifiers (for relative pricing - adds to base price)
  price_modifier?: number; // Backward compatibility - in OMR
  price_modifier_omr?: number; // New explicit pricing
  price_modifier_usd?: number; 
  price_modifier_sar?: number;
  sale_price_modifier_omr?: number;
  sale_price_modifier_usd?: number;
  sale_price_modifier_sar?: number;
  // Absolute prices (for property-based pricing - replaces base price)
  price_omr?: number;
  price_usd?: number;
  price_sar?: number;
  sale_price_omr?: number;
  sale_price_usd?: number;
  sale_price_sar?: number;
  on_sale?: boolean;
  sale_start_date?: string;
  sale_end_date?: string;
  stock?: number;
  sku?: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface ProductProperty {
  id?: string;
  name: string;
  name_ar: string;
  type: 'select' | 'radio' | 'checkbox' | 'color' | 'size';
  required: boolean;
  affects_price: boolean;
  affects_stock?: boolean;
  display_type?: 'dropdown' | 'buttons' | 'color_swatches' | 'size_grid';
  options: ProductPropertyOption[];
  is_active?: boolean;
  sort_order?: number;
}

export interface Product {
  id: string;
  name: string;
  name_ar: string;
  description?: string;
  description_ar?: string;
  category_id: string; 
  price_omr: number; 
  price_usd?: number; 
  price_sar?: number; 
  sale_price_omr?: number; 
  sale_price_usd?: number; 
  sale_price_sar?: number; 
  image?: string;
  image_url?: string;
  images?: string[];
  gallery: string[]; // array of image URLs
  gallery_images?: string[];
  properties?: ProductProperty[];
  is_active: boolean;
  is_featured: boolean;
  is_bestseller: boolean;
  is_new_arrival: boolean;
  is_on_sale: boolean;
  stock_quantity: number;
  stock: number;
  sku?: string;
  weight?: number;
  slug?: string;
  sort_order: number;
  meta_title?: string;
  meta_description?: string;
  bean_type?: string;
  processing_method?: string;
  altitude?: string;
  harvest_year?: number;
  caffeine_content?: string;
  grind_options?: string[];
  package_size?: string[];
  weight_grams?: number;
  // Coffee information fields
  roast_level?: string;
  variety?: string;
  notes?: string;
  farm?: string;
  // Rating fields
  average_rating?: number;
  total_reviews?: number;
  created: Date;
  updated: Date;
}

export interface ProductReview {
  id: string;
  product_id: string;
  user_id?: string;
  rating: number;
  title?: string;
  review_text?: string;
  is_verified_purchase: boolean;
  is_approved: boolean;
  helpful_count: number;
  created_at: string;
  user?: UserProfile;
}

export interface SelectedPropertyOption {
  property_id: string;
  property_name: string;
  property_name_ar: string;
  option_id: string;
  option_value: string;
  option_label: string;
  option_label_ar: string;
  price_modifier_omr: number;
  price_modifier_usd: number;
  price_modifier_sar: number;
  sale_price_modifier_omr?: number;
  sale_price_modifier_usd?: number;
  sale_price_modifier_sar?: number;
  on_sale?: boolean;
  sale_start_date?: string;
  sale_end_date?: string;
}

export interface CartItem {
  id: string;
  user_id: string; // reference to users
  product_id: string; // reference to products
  quantity: number;
  selectedProperties?: Record<string, string>; // For backward compatibility
  selectedPropertyOptions?: SelectedPropertyOption[]; // New detailed property selection
  base_price_omr: number; // Base product price when added to cart
  base_price_usd: number;
  base_price_sar: number;
  total_price_omr: number; // Total including property modifiers
  total_price_usd: number;
  total_price_sar: number;
  created: Date;
  updated: Date;
}

export interface Order {
  id: string;
  user_id?: string; // reference to users
  order_number: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'unpaid' | 'paid' | 'partially_paid' | 'refunded' | 'failed';
  payment_method?: 'card' | 'cash' | 'paypal' | 'bank_transfer';
  total_usd?: number;
  total_omr?: number;
  total_sar?: number;
  subtotal_usd?: number;
  subtotal_omr?: number;
  subtotal_sar?: number;
  shipping_cost_usd?: number;
  shipping_cost_omr?: number;
  shipping_cost_sar?: number;
  tax_amount_usd?: number;
  tax_amount_omr?: number;
  tax_amount_sar?: number;
  discount_amount_usd?: number;
  discount_amount_omr?: number;
  discount_amount_sar?: number;
  total_price_usd?: number;
  total_price_omr?: number;
  total_price_sar?: number;
  currency: 'USD' | 'OMR' | 'SAR';
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  shipping_address?: {
    recipient_name: string;
    phone: string;
    country: string;
    city: string;
    state?: string;
    postal_code?: string;
    full_address: string;
  };
  delivery_address?: string;
  notes?: string;
  admin_notes?: string;
  tracking_number?: string;
  shipped_at?: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
  created: Date;
  updated: Date;
}

export interface OrderItem {
  id: string;
  order_id: string; // reference to orders
  product_id?: string; // reference to products
  product_name: string;
  product_name_ar?: string;
  product_image?: string;
  variant_name?: string;
  quantity: number;
  unit_price_usd?: number;
  unit_price_omr?: number;
  unit_price_sar?: number;
  total_price_usd?: number;
  total_price_omr?: number;
  total_price_sar?: number;
  selected_properties?: Record<string, string>; // For backward compatibility
  selected_property_options?: SelectedPropertyOption[]; // New detailed property selection
  base_unit_price_omr?: number; // Base product price
  base_unit_price_usd?: number;
  base_unit_price_sar?: number;
  properties_price_omr?: number; // Additional price from properties
  properties_price_usd?: number;
  properties_price_sar?: number;
  created_at: string;
  updated_at: string;
  created: Date;
  updated: Date;
}

// Helper functions for product properties and pricing
export function calculatePropertyPrice(
  selectedOptions: SelectedPropertyOption[], 
  currency: 'omr' | 'usd' | 'sar' = 'omr'
): number {
  return selectedOptions.reduce((total, option) => {
    const isOnSale = option.on_sale && 
      (!option.sale_start_date || new Date(option.sale_start_date) <= new Date()) &&
      (!option.sale_end_date || new Date(option.sale_end_date) >= new Date());
    
    if (isOnSale) {
      switch (currency) {
        case 'usd': return total + (option.sale_price_modifier_usd || option.price_modifier_usd);
        case 'sar': return total + (option.sale_price_modifier_sar || option.price_modifier_sar);
        default: return total + (option.sale_price_modifier_omr || option.price_modifier_omr);
      }
    } else {
      switch (currency) {
        case 'usd': return total + option.price_modifier_usd;
        case 'sar': return total + option.price_modifier_sar;
        default: return total + option.price_modifier_omr;
      }
    }
  }, 0);
}

export function getProductFinalPrice(
  product: Product, 
  selectedOptions: SelectedPropertyOption[] = [], 
  currency: 'omr' | 'usd' | 'sar' = 'omr'
): number {
  // Check if product has properties that affect pricing
  const pricingProperties = product.properties?.filter(p => p.affects_price && p.options && p.options.length > 0) || []
  
  if (pricingProperties.length > 0 && selectedOptions.length > 0) {
    // Use property-based pricing - find the first property that affects price
    for (const selectedOption of selectedOptions) {
      const property = product.properties?.find(p => p.name === selectedOption.property_name)
      if (property && property.affects_price) {
        const option = property.options.find(opt => opt.value === selectedOption.option_value)
        if (option) {
          // Check if option has absolute prices (new system) or modifiers (old system)
          const isOnSale = option.on_sale && 
            (!option.sale_start_date || new Date(option.sale_start_date) <= new Date()) &&
            (!option.sale_end_date || new Date(option.sale_end_date) >= new Date())
          
          let absolutePrice = 0
          switch (currency) {
            case 'usd':
              if (option.price_usd) {
                absolutePrice = isOnSale && option.sale_price_usd ? option.sale_price_usd : option.price_usd
              }
              break
            case 'sar':
              if (option.price_sar) {
                absolutePrice = isOnSale && option.sale_price_sar ? option.sale_price_sar : option.price_sar
              }
              break
            default: // omr
              if (option.price_omr) {
                absolutePrice = isOnSale && option.sale_price_omr ? option.sale_price_omr : option.price_omr
              }
              break
          }
          
          // If absolute price exists, use it (new system)
          if (absolutePrice > 0) {
            return absolutePrice
          }
          
          // Fall back to modifier system (old system) — no base price added
          // legacy modifier-only branch
          
          let modifier = 0
          switch (currency) {
            case 'usd': 
              modifier = isOnSale && option.sale_price_modifier_usd ? option.sale_price_modifier_usd : (option.price_modifier_usd || 0)
              break
            case 'sar':
              modifier = isOnSale && option.sale_price_modifier_sar ? option.sale_price_modifier_sar : (option.price_modifier_sar || 0)
              break
            default: // omr
              modifier = isOnSale && option.sale_price_modifier_omr ? option.sale_price_modifier_omr : (option.price_modifier_omr || 0)
              break
          }
          
          // Legacy: treat modifier as standalone price (do not add base)
          return modifier
        }
      }
    }
    
    // If no matching selected option found, use first option of first property
    const firstProperty = pricingProperties[0]
    if (firstProperty && firstProperty.options.length > 0) {
      const firstOption = firstProperty.options[0]
      
      const isOnSale = firstOption.on_sale && 
        (!firstOption.sale_start_date || new Date(firstOption.sale_start_date) <= new Date()) &&
        (!firstOption.sale_end_date || new Date(firstOption.sale_end_date) >= new Date())
      
      let absolutePrice = 0
      switch (currency) {
        case 'usd':
          if (firstOption.price_usd) {
            absolutePrice = isOnSale && firstOption.sale_price_usd ? firstOption.sale_price_usd : firstOption.price_usd
          }
          break
        case 'sar':
          if (firstOption.price_sar) {
            absolutePrice = isOnSale && firstOption.sale_price_sar ? firstOption.sale_price_sar : firstOption.price_sar
          }
          break
        default: // omr
          if (firstOption.price_omr) {
            absolutePrice = isOnSale && firstOption.sale_price_omr ? firstOption.sale_price_omr : firstOption.price_omr
          }
          break
      }
      
      // If absolute price exists, use it (new system)
      if (absolutePrice > 0) {
        return absolutePrice
      }
      
  // Fall back to modifier system (old system) — no base price added
  // legacy modifier-only branch
      
  let modifier = 0
      switch (currency) {
        case 'usd': 
          modifier = isOnSale && firstOption.sale_price_modifier_usd ? firstOption.sale_price_modifier_usd : (firstOption.price_modifier_usd || 0)
          break
        case 'sar':
          modifier = isOnSale && firstOption.sale_price_modifier_sar ? firstOption.sale_price_modifier_sar : (firstOption.price_modifier_sar || 0)
          break
        default: // omr
          modifier = isOnSale && firstOption.sale_price_modifier_omr ? firstOption.sale_price_modifier_omr : (firstOption.price_modifier_omr || 0)
          break
      }
      
  // Legacy: treat modifier as standalone price (do not add base)
  return modifier
    }
  }
  
  // Fallback: Use base product price if no pricing properties
  const isProductOnSale = product.is_on_sale || false
  
  if (isProductOnSale) {
    switch (currency) {
      case 'usd': return product.sale_price_usd || product.price_usd || 0;
      case 'sar': return product.sale_price_sar || product.price_sar || 0;
      default: return product.sale_price_omr || product.price_omr || 0;
    }
  } else {
    switch (currency) {
      case 'usd': return product.price_usd || 0;
      case 'sar': return product.price_sar || 0;
      default: return product.price_omr || 0;
    }
  }
}

export function isPropertyOptionAvailable(option: ProductPropertyOption): boolean {
  if (!option.is_active) return false;
  if (option.stock !== undefined && option.stock <= 0) return false;
  
  if (option.on_sale) {
    const now = new Date();
    if (option.sale_start_date && new Date(option.sale_start_date) > now) return false;
    if (option.sale_end_date && new Date(option.sale_end_date) < now) return false;
  }
  
  return true;
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
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('✅ Firebase login successful');
      console.log('User:', user);
      console.log('Email verified:', user.emailVerified);
      
      // Check if email is verified
      if (!user.emailVerified) {
        console.log('❌ Email not verified');
        return { 
          success: false, 
          error: 'Please verify your email before logging in',
          requiresEmailVerification: true
        };
      }
      
      // Get user profile from Firestore safely
      const userProfile = await safeFirestoreOperation(
        async () => {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            return {
              id: user.uid,
              ...userDoc.data(),
              created: userDoc.data().created?.toDate() || new Date(),
              updated: userDoc.data().updated?.toDate() || new Date(),
              email_verified: user.emailVerified
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
          updated: new Date(),
          email_verified: user.emailVerified
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
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('✅ Firebase registration successful');
      console.log('User:', user);
      
      // Update the user's display name
      await updateProfile(user, {
        displayName: userData.full_name
      });
      
      console.log('✅ User display name updated');
      
      // Send email verification
      await sendEmailVerification(user);
      console.log('📧 Email verification sent');
      
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
        updated: new Date(),
        email_verified: user.emailVerified
      };
      
      await safeFirestoreOperation(
        async () => {
          await setDoc(doc(db, 'users', user.uid), {
            email: userProfile.email,
            full_name: userProfile.full_name,
            phone: userProfile.phone,
            role: userProfile.role,
            email_verified: userProfile.email_verified,
            created: serverTimestamp(),
            updated: serverTimestamp()
          });
          console.log('✅ User profile saved to Firestore');
          return true;
        },
        false,
        'createUserProfile'
      );
      
      return { 
        success: true, 
        user: userProfile,
        requiresEmailVerification: true
      };
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
  },

  // Admin function to send password reset email to any user
  resetUserPassword: async (userEmail: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🔐 Sending password reset email to:', userEmail);
      
      await sendPasswordResetEmail(auth, userEmail);
      
      console.log('✅ Password reset email sent successfully');
      return {
        success: true
      };
    } catch (error: any) {
      console.error('❌ Password reset error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Send email verification to current user
  sendEmailVerification: async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const user = auth.currentUser;
      if (!user) {
        return {
          success: false,
          error: 'No authenticated user found'
        };
      }

      await sendEmailVerification(user);
      console.log('📧 Email verification sent');
      
      return {
        success: true
      };
    } catch (error: any) {
      console.error('❌ Email verification error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Check and update email verification status
  checkEmailVerification: async (): Promise<{ success: boolean; verified: boolean; error?: string }> => {
    try {
      const user = auth.currentUser;
      if (!user) {
        return {
          success: false,
          verified: false,
          error: 'No authenticated user found'
        };
      }

      // Reload user to get latest email verification status
      await user.reload();
      const isVerified = user.emailVerified;
      
      // Update Firestore profile if verification status changed
      if (isVerified) {
        await safeFirestoreOperation(
          async () => {
            await updateDoc(doc(db, 'users', user.uid), {
              email_verified: true,
              updated: serverTimestamp()
            });
            return true;
          },
          false,
          'updateEmailVerificationStatus'
        );
      }
      
      return {
        success: true,
        verified: isVerified
      };
    } catch (error: any) {
      console.error('❌ Check email verification error:', error);
      return {
        success: false,
        verified: false,
        error: error.message
      };
    }
  },

  // User function to change their own password
  changePassword: async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        return {
          success: false,
          error: 'No authenticated user found'
        };
      }

      // Re-authenticate user with current password
      const credential = await signInWithEmailAndPassword(auth, user.email, currentPassword);
      
      // Update password
      await updatePassword(credential.user, newPassword);
      
      console.log('✅ Password changed successfully');
      return {
        success: true
      };
    } catch (error: any) {
      console.error('❌ Password change error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Forgot password function (sends email)
  forgotPassword: async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await sendPasswordResetEmail(auth, email);
      return {
        success: true
      };
    } catch (error: any) {
      console.error('❌ Forgot password error:', error);
      return {
        success: false,
        error: error.message
      };
    }
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
    
    addItem: async (
      userId: string, 
      productId: string, 
      quantity: number = 1, 
      selectedProperties?: Record<string, string>,
      selectedPropertyOptions?: SelectedPropertyOption[]
    ) => {
      try {
        // Get product details for pricing
        const productDoc = await getDoc(doc(db, 'products', productId));
        if (!productDoc.exists()) {
          throw new Error('Product not found');
        }
        const product = { id: productDoc.id, ...productDoc.data() } as Product;
        
        // Calculate prices
        const basePrice = {
          omr: product.price_omr || 0,
          usd: product.price_usd || 0,
          sar: product.price_sar || 0
        };
        
        const totalPrice = {
          omr: getProductFinalPrice(product, selectedPropertyOptions, 'omr'),
          usd: getProductFinalPrice(product, selectedPropertyOptions, 'usd'),
          sar: getProductFinalPrice(product, selectedPropertyOptions, 'sar')
        };
        
        // Check if item already exists in cart with same properties
        const q = query(
          collection(db, 'cart_items'),
          where('user_id', '==', userId),
          where('product_id', '==', productId)
        );
        const existing = await getDocs(q);
        
        // Find exact match including selectedProperties and selectedPropertyOptions
        let existingItem: any = null;
        for (const docSnapshot of existing.docs) {
          const data = docSnapshot.data();
          const existingProps = data.selectedProperties || {};
          const newProps = selectedProperties || {};
          
          // Compare legacy properties
          const propsMatch = JSON.stringify(existingProps) === JSON.stringify(newProps);
          
          // Compare new property options
          const existingOptions = data.selectedPropertyOptions || [];
          const newOptions = selectedPropertyOptions || [];
          const optionsMatch = JSON.stringify(existingOptions) === JSON.stringify(newOptions);
          
          if (propsMatch && optionsMatch) {
            existingItem = { id: docSnapshot.id, ...data };
            break;
          }
        }
        
        if (existingItem) {
          // Update existing item with new prices
          const newQuantity = (existingItem.quantity || 0) + quantity;
          await updateDoc(doc(db, 'cart_items', existingItem.id), {
            quantity: newQuantity,
            total_price_omr: totalPrice.omr,
            total_price_usd: totalPrice.usd,
            total_price_sar: totalPrice.sar,
            updated: serverTimestamp()
          });
          return { 
            ...existingItem, 
            quantity: newQuantity,
            total_price_omr: totalPrice.omr,
            total_price_usd: totalPrice.usd,
            total_price_sar: totalPrice.sar
          };
        } else {
          // Create new item
          const cartItemData: any = {
            user_id: userId,
            product_id: productId,
            quantity,
            base_price_omr: basePrice.omr,
            base_price_usd: basePrice.usd,
            base_price_sar: basePrice.sar,
            total_price_omr: totalPrice.omr,
            total_price_usd: totalPrice.usd,
            total_price_sar: totalPrice.sar,
            created: serverTimestamp(),
            updated: serverTimestamp()
          };
          
          // Add legacy properties for backward compatibility
          if (selectedProperties && Object.keys(selectedProperties).length > 0) {
            cartItemData.selectedProperties = selectedProperties;
          }
          
          // Add new detailed property options
          if (selectedPropertyOptions && selectedPropertyOptions.length > 0) {
            cartItemData.selectedPropertyOptions = selectedPropertyOptions;
          }
          
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
        // Filter out undefined values to prevent Firebase errors
        const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
          if (value !== undefined) {
            acc[key] = value;
          }
          return acc;
        }, {} as any);

        const orderData = {
          ...cleanData,
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
            if (item.product_id) {
              const product = await firestoreService.products.get(item.product_id);
              return {
                ...item,
                product
              };
            }
            return item;
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
        // Filter out undefined values to prevent Firebase errors
        const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
          if (value !== undefined) {
            acc[key] = value;
          }
          return acc;
        }, {} as any);

        const orderItemData = {
          ...cleanData,
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
  },

  // Reviews management
  reviews: {
    async list(productId?: string): Promise<{ items: ProductReview[], total: number }> {
      try {
        let q = query(collection(db, 'reviews'));
        
        if (productId) {
          q = query(collection(db, 'reviews'), where('product_id', '==', productId));
        }
        
        const querySnapshot = await getDocs(q);
        const reviews = querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        } as ProductReview));
        
        return { items: reviews, total: reviews.length };
      } catch (error) {
        console.error('Error listing reviews:', error);
        throw error;
      }
    },

    async get(id: string): Promise<ProductReview | null> {
      try {
        const docRef = doc(db, 'reviews', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          return { id: id, ...docSnap.data() } as ProductReview;
        }
        return null;
      } catch (error) {
        console.error('Error getting review:', error);
        throw error;
      }
    },

    async create(review: Omit<ProductReview, 'id' | 'created_at'>): Promise<ProductReview> {
      try {
        const reviewData = {
          ...review,
          created_at: new Date().toISOString(),
          is_approved: false, // Default to pending approval
        };
        
        const docRef = await addDoc(collection(db, 'reviews'), reviewData);
        return { id: docRef.id, ...reviewData } as ProductReview;
      } catch (error) {
        console.error('Error creating review:', error);
        throw error;
      }
    },

    async update(id: string, updates: Partial<ProductReview>): Promise<void> {
      try {
        const docRef = doc(db, 'reviews', id);
        await updateDoc(docRef, updates);
      } catch (error) {
        console.error('Error updating review:', error);
        throw error;
      }
    },

    async delete(id: string): Promise<void> {
      try {
        const docRef = doc(db, 'reviews', id);
        await deleteDoc(docRef);
      } catch (error) {
        console.error('Error deleting review:', error);
        throw error;
      }
    },

    async getApprovedByProduct(productId: string): Promise<ProductReview[]> {
      try {
        const q = query(
          collection(db, 'reviews'),
          where('product_id', '==', productId),
          where('is_approved', '==', true)
        );
        
        const querySnapshot = await getDocs(q);
        const reviews = querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        } as ProductReview));
        
        return reviews;
      } catch (error) {
        console.error('Error getting approved reviews:', error);
        throw error;
      }
    },

    async getAverageRating(productId: string): Promise<{ average: number, count: number }> {
      try {
        const reviews = await this.getApprovedByProduct(productId);
        
        if (reviews.length === 0) {
          return { average: 0, count: 0 };
        }
        
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const average = totalRating / reviews.length;
        
        return { average: Math.round(average * 10) / 10, count: reviews.length };
      } catch (error) {
        console.error('Error calculating average rating:', error);
        return { average: 0, count: 0 };
      }
    },

    async hasUserReviewed(productId: string, userId: string): Promise<boolean> {
      try {
        const q = query(
          collection(db, 'reviews'),
          where('product_id', '==', productId),
          where('user_id', '==', userId)
        );
        
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
      } catch (error) {
        console.error('Error checking user review:', error);
        return false;
      }
    },

    async incrementHelpfulCount(reviewId: string): Promise<void> {
      try {
        const reviewRef = doc(db, 'reviews', reviewId);
        const reviewDoc = await getDoc(reviewRef);
        
        if (reviewDoc.exists()) {
          const currentCount = reviewDoc.data().helpful_count || 0;
          await updateDoc(reviewRef, {
            helpful_count: currentCount + 1
          });
        }
      } catch (error) {
        console.error('Error incrementing helpful count:', error);
        throw error;
      }
    }
  }
};

// File upload helpers
export const storageService = {
  upload: async (path: string, file: File): Promise<string> => {
    try {
      // Check if user is authenticated
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User must be authenticated to upload files');
      }

      // Wait for user to be fully loaded
      await new Promise((resolve) => {
        if (currentUser.emailVerified !== undefined) {
          resolve(true);
        } else {
          const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
              unsubscribe();
              resolve(true);
            }
          });
        }
      });

      const storageRef = ref(storage, path);
      
      // Add metadata
      const metadata = {
        contentType: file.type,
        customMetadata: {
          uploadedBy: currentUser.uid,
          uploadedAt: new Date().toISOString()
        }
      };
      
      const snapshot = await uploadBytes(storageRef, file, metadata);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error: any) {
      console.error('Error uploading file:', error);
      
      // Provide more specific error messages
      if (error.code === 'storage/unauthorized') {
        throw new Error('Unauthorized: Please make sure you are logged in and have permission to upload files');
      } else if (error.code === 'storage/quota-exceeded') {
        throw new Error('Storage quota exceeded');
      } else if (error.code === 'storage/unauthenticated') {
        throw new Error('Authentication required');
      } else if (error.code === 'storage/retry-limit-exceeded') {
        throw new Error('Upload failed: Too many retries');
      } else if (error.code === 'storage/invalid-format') {
        throw new Error('Invalid file format');
      } else if (error.code === 'storage/invalid-checksum') {
        throw new Error('File upload failed: Invalid checksum');
      } else if (error.message.includes('CORS')) {
        throw new Error('CORS error: Please check Firebase Storage configuration');
      } else {
        throw new Error(`Upload failed: ${error.message || 'Unknown error'}`);
      }
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

  // Fallback method for development - converts file to base64 data URL
  uploadAsDataURL: async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to data URL'));
        }
      };
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsDataURL(file);
    });
  },

  // Check if we can use Firebase Storage or need fallback
  canUseFirebaseStorage: async (): Promise<boolean> => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return false;
      
      // Try to create a test reference
      ref(storage, 'test/connection.txt');
      return true;
    } catch (error) {
      console.warn('Firebase Storage not available:', error);
      return false;
    }
  },
  
  deleteFile: async (url: string) => {
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
