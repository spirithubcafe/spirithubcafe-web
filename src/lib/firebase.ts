// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, sendPasswordResetEmail, updatePassword, sendEmailVerification } from "firebase/auth";
import type { User } from "firebase/auth";
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, serverTimestamp } from "firebase/firestore/lite";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { logger } from "@/utils/logger";

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

// Initialize Firestore with error handling and offline persistence
let db: any = null;
try {
  db = getFirestore(app);
  
  // Simple error handling for Firestore Lite
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason?.code?.includes('firestore') || 
          event.reason?.message?.includes('Missing or insufficient permissions') ||
          event.reason?.message?.includes('400')) {
        logger.warn('⚠️ Firestore issue detected, continuing with limited functionality:', event.reason?.message);
        event.preventDefault();
      }
    });
  }
} catch (error) {
  logger.error('❌ Firestore initialization failed:', error);
  db = null;
}

// Initialize analytics only in production
let analytics: any = null;
if (typeof window !== 'undefined' && import.meta.env.PROD) {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    logger.warn('Analytics initialization failed:', error);
  }
}

// Simple in-memory cache for frequently accessed data
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

const getCachedData = (key: string) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCachedData = (key: string, data: any, ttlMs: number = 5 * 60 * 1000) => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlMs
  });
};


// Safe Firebase operation wrapper (for future use)
/*
const safeFirebaseOperation = async <T>(
  operation: () => Promise<T>,
  operationName: string,
  fallback: T | null = null
): Promise<T | null> => {
  try {
    if (!db) {
      logger.warn(`Firebase not initialized for ${operationName}`);
      return fallback;
    }
    return await operation();
  } catch (error) {
    return handleFirebaseError(error, operationName) ?? fallback;
  }
};
*/

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
  // SEO Fields
  meta_title?: string;
  meta_title_ar?: string;
  meta_description?: string;
  meta_description_ar?: string;
  meta_keywords?: string;
  meta_keywords_ar?: string;
  slug?: string;
  canonical_url?: string;
  og_title?: string;
  og_title_ar?: string;
  og_description?: string;
  og_description_ar?: string;
  og_image?: string;
  twitter_title?: string;
  twitter_title_ar?: string;
  twitter_description?: string;
  twitter_description_ar?: string;
  twitter_image?: string;
  seo_auto_generated?: boolean;
  seo_generated_at?: string;
  /** Whether this category should be shown on the home page widgets/lists. Defaults to true. */
  showOnHome?: boolean;
  /** UI controls for category header rendering (optional admin-configured) */
  show_title?: boolean;
  show_subtitle?: boolean;
  show_availability_badge?: boolean;
  badge_text_source?: 'total' | 'available';
  badge_variant?: string;
  badge_position?: string;
  item_count_format?: string;
  subtitle_override?: string;
  /** Optional per-category page subtitle for the shop/category page (English) */
  page_subtitle?: string;
  /** Optional per-category page title for the shop/category page (English) */
  page_title?: string;
  /** Optional per-category page subtitle for the shop/category page (Arabic) */
  page_subtitle_ar?: string;
  /** Optional per-category page title for the shop/category page (Arabic) */
  page_title_ar?: string;
  created: Date;
  updated: Date;
}

export interface Page {
  id: string;
  title: string;
  title_ar: string;
  content: string;
  content_ar: string;
  slug: string;
  meta_description?: string;
  meta_description_ar?: string;
  is_active: boolean;
  show_in_footer: boolean;
  sort_order: number;
  // Additional SEO Fields
  meta_title?: string;
  meta_title_ar?: string;
  meta_keywords?: string;
  meta_keywords_ar?: string;
  canonical_url?: string;
  og_title?: string;
  og_title_ar?: string;
  og_description?: string;
  og_description_ar?: string;
  og_image?: string;
  twitter_title?: string;
  twitter_title_ar?: string;
  twitter_description?: string;
  twitter_description_ar?: string;
  twitter_image?: string;
  seo_auto_generated?: boolean;
  seo_generated_at?: string;
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
  sale_start_date?: string;
  sale_end_date?: string;
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
  meta_title_ar?: string;
  meta_description?: string;
  meta_description_ar?: string;
  // Additional SEO Fields
  meta_keywords?: string;
  meta_keywords_ar?: string;
  canonical_url?: string;
  og_title?: string;
  og_title_ar?: string;
  og_description?: string;
  og_description_ar?: string;
  og_image?: string;
  twitter_title?: string;
  twitter_title_ar?: string;
  twitter_description?: string;
  twitter_description_ar?: string;
  twitter_image?: string;
  seo_auto_generated?: boolean;
  seo_generated_at?: string;
  bean_type?: string;
  // Coffee information fields
  roast_level?: string;
  roast_level_ar?: string;
  variety?: string;
  variety_ar?: string;
  notes?: string;
  notes_ar?: string;
  uses?: string;
  uses_ar?: string;
  farm?: string;
  farm_ar?: string;
  aromatic_profile?: string;
  aromatic_profile_ar?: string;
  intensity?: string;
  intensity_ar?: string;
  compatibility?: string;
  compatibility_ar?: string;
  processing_method?: string;
  processing_method_ar?: string;
  altitude?: string;
  altitude_ar?: string;
  harvest_year?: number;
  caffeine_content?: string;
  grind_options?: string[];
  package_size?: string[];
  weight_grams?: number;
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
  transaction_id?: string; // Payment gateway transaction ID
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
          // Check if option has sale price and is currently on sale
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
      
      // Check if option has sale price and is currently on sale
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

// Function to get detailed pricing information including sale status
export function getProductPriceDetails(
  product: Product, 
  selectedProperties: Record<string, string> = {}, 
  currency: 'omr' | 'usd' | 'sar' = 'omr'
): {
  finalPrice: number
  originalPrice: number
  isOnSale: boolean
  discountAmount: number
  discountPercentage: number
} {
  const pricingProperties = product.properties?.filter(p => p.affects_price && p.options && p.options.length > 0) || []
  
  if (pricingProperties.length > 0) {
    // Use property-based pricing
    for (const property of pricingProperties) {
      const selectedValue = selectedProperties[property.name]
      if (selectedValue) {
        const option = property.options.find(opt => opt.value === selectedValue)
        if (option) {
          const isOnSale = option.on_sale
          
          let originalPrice = 0
          let salePrice = 0
          
          switch (currency) {
            case 'usd':
              originalPrice = option.price_usd || (option.price_modifier_usd || (option.price_modifier_omr || option.price_modifier || 0) * 2.6)
              salePrice = option.sale_price_usd || (option.sale_price_modifier_usd || (option.sale_price_modifier_omr || 0) * 2.6)
              break
            case 'sar':
              originalPrice = option.price_sar || (option.price_modifier_sar || (option.price_modifier_omr || option.price_modifier || 0) * 9.75)
              salePrice = option.sale_price_sar || (option.sale_price_modifier_sar || (option.sale_price_modifier_omr || 0) * 9.75)
              break
            default: // omr
              originalPrice = option.price_omr || (option.price_modifier_omr || option.price_modifier || 0)
              salePrice = option.sale_price_omr || option.sale_price_modifier_omr || 0
              break
          }
          
          const finalPrice = isOnSale && salePrice > 0 ? salePrice : originalPrice
          const discountAmount = isOnSale && salePrice > 0 && salePrice < originalPrice ? originalPrice - salePrice : 0
          const discountPercentage = discountAmount > 0 ? Math.round((discountAmount / originalPrice) * 100) : 0
          
          return {
            finalPrice,
            originalPrice,
            isOnSale: !!(isOnSale && salePrice > 0 && salePrice < originalPrice),
            discountAmount,
            discountPercentage
          }
        }
      }
    }
    
    // Fallback to first option if no selection
    const firstProperty = pricingProperties[0]
    if (firstProperty && firstProperty.options.length > 0) {
      const firstOption = firstProperty.options[0]
      
      const isOnSale = firstOption.on_sale
      
      let originalPrice = 0
      let salePrice = 0
      
      switch (currency) {
        case 'usd':
          originalPrice = firstOption.price_usd || (firstOption.price_modifier_usd || (firstOption.price_modifier_omr || firstOption.price_modifier || 0) * 2.6)
          salePrice = firstOption.sale_price_usd || (firstOption.sale_price_modifier_usd || (firstOption.sale_price_modifier_omr || 0) * 2.6)
          break
        case 'sar':
          originalPrice = firstOption.price_sar || (firstOption.price_modifier_sar || (firstOption.price_modifier_omr || firstOption.price_modifier || 0) * 9.75)
          salePrice = firstOption.sale_price_sar || (firstOption.sale_price_modifier_sar || (firstOption.sale_price_modifier_omr || 0) * 9.75)
          break
        default: // omr
          originalPrice = firstOption.price_omr || (firstOption.price_modifier_omr || firstOption.price_modifier || 0)
          salePrice = firstOption.sale_price_omr || firstOption.sale_price_modifier_omr || 0
          break
      }
      
      const finalPrice = isOnSale && salePrice > 0 ? salePrice : originalPrice
      const discountAmount = isOnSale && salePrice > 0 && salePrice < originalPrice ? originalPrice - salePrice : 0
      const discountPercentage = discountAmount > 0 ? Math.round((discountAmount / originalPrice) * 100) : 0
      
      return {
        finalPrice,
        originalPrice,
        isOnSale: !!(isOnSale && salePrice > 0 && salePrice < originalPrice),
        discountAmount,
        discountPercentage
      }
    }
  }
  
  // Fallback to base product price
  let basePrice = 0
  let baseSalePrice = 0
  
  switch (currency) {
    case 'usd':
      basePrice = product.price_usd || 0
      baseSalePrice = product.sale_price_usd || 0
      break
    case 'sar':
      basePrice = product.price_sar || 0
      baseSalePrice = product.sale_price_sar || 0
      break
    default: // omr
      basePrice = product.price_omr || 0
      baseSalePrice = product.sale_price_omr || 0
      break
  }
  
  const isProductOnSale = product.is_on_sale && baseSalePrice > 0 &&
    (!product.sale_start_date || new Date(product.sale_start_date) <= new Date()) &&
    (!product.sale_end_date || new Date(product.sale_end_date) >= new Date())
  
  const finalPrice = isProductOnSale && baseSalePrice < basePrice ? baseSalePrice : basePrice
  const discountAmount = isProductOnSale && baseSalePrice < basePrice ? basePrice - baseSalePrice : 0
  const discountPercentage = discountAmount > 0 ? Math.round((discountAmount / basePrice) * 100) : 0
  
  return {
    finalPrice,
    originalPrice: basePrice,
    isOnSale: !!(isProductOnSale && baseSalePrice < basePrice),
    discountAmount,
    discountPercentage
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
    logger.warn(`⚠️ Firestore not available for operation: ${operationName}`);
    return fallbackValue;
  }
  
  try {
    return await operation();
  } catch (error: any) {
    // Handle quota exceeded errors gracefully
    if (error?.code === 'resource-exhausted' || 
        error?.message?.includes('Quota exceeded') ||
        error?.message?.includes('quota')) {
      logger.warn(`⚠️ Firebase quota exceeded for ${operationName}, using fallback`);
      return fallbackValue;
    }
    
    // Handle other specific errors
    if (error?.code === 'permission-denied') {
      logger.warn(`⚠️ Permission denied for ${operationName}, using fallback`);
      return fallbackValue;
    }
    
    if (error?.code === 'unavailable') {
      logger.warn(`⚠️ Firebase unavailable for ${operationName}, using fallback`);
      return fallbackValue;
    }
    
    // For other errors, log as error but still return fallback
    logger.error(`❌ Firestore operation failed (${operationName}):`, error);
    return fallbackValue;
  }
}

// Auth helpers
export const authService = {
  login: async (email: string, password: string) => {
    try {
      logger.log('🔐 Attempting login with Firebase...');
      logger.log('Email:', email);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      logger.log('✅ Firebase login successful');
      logger.log('User:', user);
      logger.log('Email verified:', user.emailVerified);
      
      // Check if email is verified
      if (!user.emailVerified) {
        logger.log('❌ Email not verified');
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
      logger.error('❌ Firebase login error:', error);
      logger.error('Error code:', error.code);
      logger.error('Error message:', error.message);
      return { success: false, error: error.message };
    }
  },

  register: async (email: string, password: string, userData: { full_name: string; phone?: string }) => {
    try {
      logger.log('📝 Attempting registration with Firebase...');
      logger.log('Email:', email);
      logger.log('User data:', userData);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      logger.log('✅ Firebase registration successful');
      logger.log('User:', user);
      
      // Update the user's display name
      await updateProfile(user, {
        displayName: userData.full_name
      });
      
      logger.log('✅ User display name updated');
      
      // Send email verification
      await sendEmailVerification(user);
      logger.log('📧 Email verification sent');
      
      // Check if this is the first user (admin) BEFORE creating the user document
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await safeFirestoreOperation(
        async () => await getDocs(query(usersCollection, limit(1))),
        { docs: [] } as any,
        'checkFirstUser'
      );
      
      const isFirstUser = usersSnapshot.docs.length === 0;
      const userRole = isFirstUser ? 'admin' : 'user';
      
      logger.log(`👤 User role: ${userRole} (First user: ${isFirstUser})`);
      
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
          logger.log('✅ User profile saved to Firestore');
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
      logger.error('❌ Firebase registration error:', error);
      logger.error('Error code:', error.code);
      logger.error('Error message:', error.message);
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

  // Manual auth state check (replaces real-time listener)
  checkAuthState: async (): Promise<User | null> => {
    try {
      // Force a refresh of the current user
      if (auth.currentUser) {
        await auth.currentUser.reload();
        return auth.currentUser;
      }
      return null;
    } catch (error) {
      console.error('Error checking auth state:', error);
      return null;
    }
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
      logger.log('🔐 Sending password reset email to:', userEmail);
      
      await sendPasswordResetEmail(auth, userEmail);
      
      logger.log('✅ Password reset email sent successfully');
      return {
        success: true
      };
    } catch (error: any) {
      logger.error('❌ Password reset error:', error);
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
      logger.log('📧 Email verification sent');
      
      return {
        success: true
      };
    } catch (error: any) {
      logger.error('❌ Email verification error:', error);
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
      logger.error('❌ Check email verification error:', error);
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
      
      logger.log('✅ Password changed successfully');
      return {
        success: true
      };
    } catch (error: any) {
      logger.error('❌ Password change error:', error);
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
      logger.error('❌ Forgot password error:', error);
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
          logger.log(`✅ User ${userId} role updated to ${newRole}`);
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
          logger.log(`✅ User ${userId} profile updated`);
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
          logger.log(`✅ User ${userId} deleted`);
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
      } catch (error: any) {
        // Handle quota exceeded errors gracefully
        if (error?.code === 'resource-exhausted' || 
            error?.message?.includes('Quota exceeded') ||
            error?.message?.includes('quota')) {
          logger.warn('⚠️ Firebase quota exceeded for categories, returning empty list');
          return {
            items: [],
            totalItems: 0
          };
        }
        
        logger.error('Error getting categories:', error);
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
      } catch (error: any) {
        // Handle quota exceeded errors gracefully
        if (error?.code === 'resource-exhausted' || 
            error?.message?.includes('Quota exceeded') ||
            error?.message?.includes('quota')) {
          logger.warn(`⚠️ Firebase quota exceeded for category: ${id}`);
          return null;
        }
        
        logger.error('Error getting category:', error);
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
        logger.error('Error creating category:', error);
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
        logger.error('Error updating category:', error);
        throw error;
      }
    },
    
    delete: async (id: string) => {
      try {
        await deleteDoc(doc(db, 'categories', id));
      } catch (error) {
        logger.error('Error deleting category:', error);
        throw error;
      }
    }
  },

  // Products
  products: {
    list: async (filters?: { category?: string; featured?: boolean; bestseller?: boolean; new_arrival?: boolean; search?: string }) => {
      try {
        // Create cache key based on filters
        const cacheKey = `products_list_${JSON.stringify(filters || {})}`;
        const cachedResult = getCachedData(cacheKey);
        if (cachedResult) {
          logger.log('🚀 Returning cached products');
          return cachedResult;
        }

        // Simplified query to avoid index requirements during development
        let q = query(
          collection(db, 'products'),
          where('is_active', '==', true),
          limit(50)
        );
        
        // Apply single filter at a time to avoid complex index requirements
        if (filters?.category) {
          q = query(
            collection(db, 'products'),
            where('is_active', '==', true),
            where('category_id', '==', filters.category),
            limit(50)
          );
        } else if (filters?.featured) {
          q = query(
            collection(db, 'products'),
            where('is_active', '==', true),
            where('is_featured', '==', true),
            limit(50)
          );
        } else if (filters?.bestseller) {
          q = query(
            collection(db, 'products'),
            where('is_active', '==', true),
            where('is_bestseller', '==', true),
            limit(50)
          );
        } else if (filters?.new_arrival) {
          q = query(
            collection(db, 'products'),
            where('is_active', '==', true),
            where('is_new_arrival', '==', true),
            limit(50)
          );
        }
        
        const querySnapshot = await getDocs(q);
        
        let products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        
        // Sort client-side to avoid index requirements
        products.sort((a, b) => {
          if (a.sort_order !== b.sort_order) {
            return a.sort_order - b.sort_order;
          }
          // Fallback to creation date if available
          if (a.created && b.created) {
            return new Date(b.created).getTime() - new Date(a.created).getTime();
          }
          return 0;
        });
        
        // Filter by search term if provided (client-side filtering for now)
        if (filters?.search) {
          const searchTerm = filters.search.toLowerCase();
          products = products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            (product.name_ar && product.name_ar.toLowerCase().includes(searchTerm))
          );
        }
        
        const result = {
          items: products,
          totalItems: products.length
        };

        // Cache the result for 10 minutes (increased from 3 minutes)
        setCachedData(cacheKey, result, 10 * 60 * 1000);
        
        return result;
      } catch (error: any) {
        // Handle quota exceeded errors gracefully
        if (error?.code === 'resource-exhausted' || 
            error?.message?.includes('Quota exceeded') ||
            error?.message?.includes('quota')) {
          logger.warn('⚠️ Firebase quota exceeded, using cached data');
          
          // Try to return cached results even if expired
          const cacheKey = `products_list_${JSON.stringify(filters || {})}`;
          const staleCache = cache.get(cacheKey);
          if (staleCache) {
            logger.info('📦 Returning stale cached data due to quota limit');
            return staleCache.data;
          }
          
          // If no cache available, return empty results with a warning
          logger.warn('⚠️ No cached data available, returning empty results');
          return {
            items: [],
            totalItems: 0
          };
        }
        
        logger.error('Error getting products:', error);
        
        // Try to return cached results for other errors
        const cacheKey = `products_list_${JSON.stringify(filters || {})}`;
        const staleCache = cache.get(cacheKey);
        if (staleCache) {
          logger.warn('⚠️ Returning stale cached data due to error');
          return staleCache.data;
        }
        
        throw error;
      }
    },
    
    get: async (id: string): Promise<Product | null> => {
      try {
        const cacheKey = `product_${id}`;
        const cachedResult = getCachedData(cacheKey);
        if (cachedResult) {
          logger.log(`🚀 Returning cached product: ${id}`);
          return cachedResult;
        }

        const docSnap = await getDoc(doc(db, 'products', id));
        
        if (docSnap.exists()) {
          const product = { id: docSnap.id, ...docSnap.data() } as Product;
          // Cache for 10 minutes (increased from 5 minutes)
          setCachedData(cacheKey, product, 10 * 60 * 1000);
          return product;
        }
        return null;
      } catch (error: any) {
        // Handle quota exceeded errors gracefully
        if (error?.code === 'resource-exhausted' || 
            error?.message?.includes('Quota exceeded') ||
            error?.message?.includes('quota')) {
          logger.warn(`⚠️ Firebase quota exceeded for product: ${id}`);
          
          // Try to return cached result even if expired
          const cacheKey = `product_${id}`;
          const staleCache = cache.get(cacheKey);
          if (staleCache) {
            logger.info(`📦 Returning stale cached product: ${id}`);
            return staleCache.data;
          }
          
          // Return null if no cache available
          logger.warn(`⚠️ No cached data available for product: ${id}`);
          return null;
        }
        
        logger.error('Error getting product:', error);
        
        // Try to return cached result for other errors
        const cacheKey = `product_${id}`;
        const staleCache = cache.get(cacheKey);
        if (staleCache) {
          logger.warn(`⚠️ Returning stale cached product: ${id}`);
          return staleCache.data;
        }
        
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
        logger.error('Error creating product:', error);
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
        logger.error('Error updating product:', error);
        throw error;
      }
    },
    
    delete: async (id: string) => {
      try {
        await deleteDoc(doc(db, 'products', id));
      } catch (error) {
        logger.error('Error deleting product:', error);
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
        logger.error('Error getting user cart:', error);
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
        logger.error('Error adding cart item:', error);
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
        logger.error('Error updating cart item:', error);
        throw error;
      }
    },
    
    removeItem: async (itemId: string) => {
      try {
        await deleteDoc(doc(db, 'cart_items', itemId));
      } catch (error) {
        logger.error('Error removing cart item:', error);
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
        logger.error('Error clearing cart:', error);
        throw error;
      }
    }
  },

  // Newsletter subscriptions
  newsletters: {
    list: async (): Promise<{ items: any[]; total: number }> => {
      return await safeFirestoreOperation(
        async () => {
          const q = query(
            collection(db, 'newsletters'),
            orderBy('subscribed_at', 'desc')
          );
          const querySnapshot = await getDocs(q);
          const subscriptions = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            subscribed_at: doc.data().subscribed_at || new Date().toISOString()
          }));
          
          return {
            items: subscriptions,
            total: subscriptions.length
          };
        },
        { items: [], total: 0 },
        'getNewslettersList'
      );
    },

    create: async (data: any): Promise<string> => {
      return await safeFirestoreOperation(
        async () => {
          const docRef = await addDoc(collection(db, 'newsletters'), {
            ...data,
            subscribed_at: data.subscribed_at || new Date().toISOString(),
            status: data.status || 'active'
          });
          logger.log('✅ Newsletter subscription created:', docRef.id);
          return docRef.id;
        },
        '',
        'createNewsletterSubscription'
      );
    },

    delete: async (id: string): Promise<boolean> => {
      return await safeFirestoreOperation(
        async () => {
          await deleteDoc(doc(db, 'newsletters', id));
          logger.log('✅ Newsletter subscription deleted:', id);
          return true;
        },
        false,
        'deleteNewsletterSubscription'
      );
    },

    updateStatus: async (id: string, status: 'active' | 'inactive'): Promise<boolean> => {
      return await safeFirestoreOperation(
        async () => {
          await updateDoc(doc(db, 'newsletters', id), {
            status,
            updated_at: new Date().toISOString()
          });
          logger.log('✅ Newsletter subscription status updated:', id);
          return true;
        },
        false,
        'updateNewsletterStatus'
      );
    }
  },

  // Orders
  orders: {
    list: async (userId?: string) => {
      try {
        // Check if user is authenticated for orders
        const currentUser = auth.currentUser;
        if (!currentUser) {
          logger.warn('⚠️ User not authenticated for orders');
          return { items: [], totalItems: 0 };
        }

        let q = query(collection(db, 'orders'), orderBy('created', 'desc'));
        
        if (userId) {
          q = query(q, where('user_id', '==', userId));
        } else {
          // If no userId specified, only return current user's orders
          q = query(q, where('user_id', '==', currentUser.uid));
        }
        
        const querySnapshot = await getDocs(q);
        return {
          items: querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)),
          totalItems: querySnapshot.docs.length
        };
      } catch (error: any) {
        logger.error('Error getting orders:', error);
        
        // Return empty result for permission errors instead of throwing
        if (error.code === 'permission-denied' || error.message?.includes('Missing or insufficient permissions')) {
          logger.warn('⚠️ Permission denied for orders, returning empty result');
          return { items: [], totalItems: 0 };
        }
        
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
        logger.error('Error getting order:', error);
        throw error;
      }
    },
    
    create: async (data: Omit<Order, 'id' | 'created' | 'updated'>) => {
      try {
        // Check if user is authenticated
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error('User must be authenticated to create orders');
        }

        // Ensure user_id is set to current user
        const orderData = {
          ...data,
          user_id: currentUser.uid, // Always use current user's ID
          created: serverTimestamp(),
          updated: serverTimestamp()
        };

        // Filter out undefined values to prevent Firebase errors
        const cleanData = Object.entries(orderData).reduce((acc, [key, value]) => {
          if (value !== undefined) {
            acc[key] = value;
          }
          return acc;
        }, {} as any);

        const docRef = await addDoc(collection(db, 'orders'), cleanData);
        return { id: docRef.id, ...cleanData };
      } catch (error: any) {
        logger.error('Error creating order:', error);
        
        if (error.code === 'permission-denied' || error.message?.includes('Missing or insufficient permissions')) {
          throw new Error('Permission denied: Unable to create order. Please ensure you are logged in.');
        }
        
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
        logger.error('Error updating order:', error);
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
        logger.error('Error getting order items:', error);
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
        logger.error('Error creating order item:', error);
        throw error;
      }
    }
  },

  // Pages management
  pages: {
    list: async (): Promise<{ items: Page[]; total: number }> => {
      return await safeFirestoreOperation(
        async () => {
          const q = query(
            collection(db, 'pages'),
            orderBy('sort_order', 'asc')
          );
          const querySnapshot = await getDocs(q);
          const pages = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            created: doc.data().created?.toDate() || new Date(),
            updated: doc.data().updated?.toDate() || new Date()
          } as Page));
          
          return {
            items: pages,
            total: pages.length
          };
        },
        { items: [], total: 0 },
        'getPagesList'
      );
    },

    get: async (id: string): Promise<Page | null> => {
      return await safeFirestoreOperation(
        async () => {
          const docSnap = await getDoc(doc(db, 'pages', id));
          if (docSnap.exists()) {
            return {
              id: docSnap.id,
              ...docSnap.data(),
              created: docSnap.data().created?.toDate() || new Date(),
              updated: docSnap.data().updated?.toDate() || new Date()
            } as Page;
          }
          return null;
        },
        null,
        'getPage'
      );
    },

    getBySlug: async (slug: string): Promise<Page | null> => {
      return await safeFirestoreOperation(
        async () => {
          const q = query(
            collection(db, 'pages'),
            where('slug', '==', slug),
            where('is_active', '==', true),
            limit(1)
          );
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return {
              id: doc.id,
              ...doc.data(),
              created: doc.data().created?.toDate() || new Date(),
              updated: doc.data().updated?.toDate() || new Date()
            } as Page;
          }
          return null;
        },
        null,
        'getPageBySlug'
      );
    },

    getFooterPages: async (): Promise<Page[]> => {
      return await safeFirestoreOperation(
        async () => {
          const q = query(
            collection(db, 'pages'),
            where('is_active', '==', true),
            where('show_in_footer', '==', true),
            orderBy('sort_order', 'asc')
          );
          const querySnapshot = await getDocs(q);
          return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            created: doc.data().created?.toDate() || new Date(),
            updated: doc.data().updated?.toDate() || new Date()
          } as Page));
        },
        [],
        'getFooterPages'
      );
    },

    create: async (data: Omit<Page, 'id' | 'created' | 'updated'>): Promise<Page | null> => {
      return await safeFirestoreOperation(
        async () => {
          const pageData = {
            ...data,
            created: serverTimestamp(),
            updated: serverTimestamp()
          };
          const docRef = await addDoc(collection(db, 'pages'), pageData);
          return {
            id: docRef.id,
            ...data,
            created: new Date(),
            updated: new Date()
          } as Page;
        },
        null,
        'createPage'
      );
    },

    update: async (id: string, data: Partial<Page>): Promise<boolean> => {
      return await safeFirestoreOperation(
        async () => {
          const updateData = {
            ...data,
            updated: serverTimestamp()
          };
          // Remove fields that shouldn't be updated directly
          delete updateData.id;
          delete updateData.created;
          
          await updateDoc(doc(db, 'pages', id), updateData);
          logger.log(`✅ Page ${id} updated`);
          return true;
        },
        false,
        'updatePage'
      );
    },

    delete: async (id: string): Promise<boolean> => {
      return await safeFirestoreOperation(
        async () => {
          await deleteDoc(doc(db, 'pages', id));
          logger.log(`✅ Page ${id} deleted`);
          return true;
        },
        false,
        'deletePage'
      );
    }
  },

  // Settings management  
  settings: {
    async get(key: string): Promise<any> {
      return await safeFirestoreOperation(
        async () => {
          const docSnap = await getDoc(doc(db, 'settings', key));
          if (docSnap.exists()) {
            return docSnap.data();
          }
          return null;
        },
        null,
        'getSettings'
      );
    },

    async set(key: string, value: any): Promise<boolean> {
      return await safeFirestoreOperation(
        async () => {
          await setDoc(doc(db, 'settings', key), value);
          return true;
        },
        false,
        'setSettings'
      );
    },

    async update(key: string, value: any): Promise<boolean> {
      return await safeFirestoreOperation(
        async () => {
          await updateDoc(doc(db, 'settings', key), value);
          return true;
        },
        false,
        'updateSettings'
      );
    }
  },

  // Generic document operations
  async getDocument(collection: string, id: string): Promise<any> {
    return await safeFirestoreOperation(
      async () => {
        return await getDoc(doc(db, collection, id));
      },
      null,
      'getDocument'
    );
  },

  async setDocument(collection: string, id: string, data: any): Promise<boolean> {
    return await safeFirestoreOperation(
      async () => {
        await setDoc(doc(db, collection, id), data);
        return true;
      },
      false,
      'setDocument'
    );
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
        logger.error('Error listing reviews:', error);
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
        logger.error('Error getting review:', error);
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
        logger.error('Error creating review:', error);
        throw error;
      }
    },

    async update(id: string, updates: Partial<ProductReview>): Promise<void> {
      try {
        const docRef = doc(db, 'reviews', id);
        await updateDoc(docRef, updates);
      } catch (error) {
        logger.error('Error updating review:', error);
        throw error;
      }
    },

    async delete(id: string): Promise<void> {
      try {
        const docRef = doc(db, 'reviews', id);
        await deleteDoc(docRef);
      } catch (error) {
        logger.error('Error deleting review:', error);
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
        logger.error('Error getting approved reviews:', error);
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
        logger.error('Error calculating average rating:', error);
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
        logger.error('Error checking user review:', error);
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
        logger.error('Error incrementing helpful count:', error);
        throw error;
      }
    }
  },

  // Checkout Settings
  checkoutSettings: {
    // Get checkout settings
    get: async (): Promise<any> => {
      return await safeFirestoreOperation(
        async () => {
          const settingsDoc = await getDoc(doc(db, 'settings', 'checkout'));
          if (settingsDoc.exists()) {
            return {
              id: settingsDoc.id,
              ...settingsDoc.data(),
              created_at: settingsDoc.data().created_at?.toDate() || new Date(),
              updated_at: settingsDoc.data().updated_at?.toDate() || new Date()
            };
          }
          
          // Return default settings if none exist
          return {
            tax_rate: 0.1, // 10% tax
            enabled_countries: ['OM', 'AE', 'SA', 'KW', 'IQ'],
            shipping_methods: [
              {
                id: 'pickup',
                name: 'Pickup from our Cafe',
                name_ar: 'الاستلام من المقهى',
                enabled: true,
                is_free: true,
                pricing_type: 'flat',
                base_cost_omr: 0,
                base_cost_usd: 0,
                base_cost_sar: 0,
                estimated_delivery_days: 'Same day',
                description: 'Free pickup from our cafe',
                description_ar: 'استلام مجاني من المقهى'
              },
              {
                id: 'nool_oman',
                name: 'NOOL OMAN',
                name_ar: 'نول عمان',
                enabled: true,
                is_free: false,
                pricing_type: 'flat',
                base_cost_omr: 2,
                base_cost_usd: 5.2,
                base_cost_sar: 19.5,
                estimated_delivery_days: '1-2 days',
                description: 'Fast delivery within Oman',
                description_ar: 'توصيل سريع داخل عمان',
                api_settings: {
                  provider: 'nool_oman',
                  api_url: 'https://api.nool.om',
                  account_number: '71925275'
                }
              },
              {
                id: 'aramex',
                name: 'Aramex',
                name_ar: 'أرامكس',
                enabled: true,
                is_free: false,
                pricing_type: 'api_calculated',
                base_cost_omr: 1.73,
                base_cost_usd: 4.5,
                base_cost_sar: 16.86,
                estimated_delivery_days: '2-3 days',
                description: 'International shipping via Aramex',
                description_ar: 'شحن دولي عبر أرامكس',
                api_settings: {
                  provider: 'aramex',
                  api_url: 'https://ws.aramex.net/ShippingAPI.V2/RateCalculator/Service_1_0.svc',
                  username: 'aramex_username',
                  password: 'aramex_password',
                  account_number: 'aramex_account'
                }
              }
            ],
            payment_gateway: {
              provider: 'bank_muscat',
              enabled: true,
              test_mode: false,
              merchant_id: '224',
              access_code: 'AVDP00LA16BE47PDEB',
              working_key: '841FEAE32609C3E892C4D0B1393A7ACC',
              supported_currencies: ['OMR', 'USD', 'SAR'],
              additional_settings: {
                return_url: 'https://spirithubcafe.com/checkout/success',
                cancel_url: 'https://spirithubcafe.com/checkout/cancel',
                webhook_url: 'https://spirithubcafe.com/api/payment/webhook'
              }
            },
            created_at: new Date(),
            updated_at: new Date()
          };
        },
        null,
        'getCheckoutSettings'
      );
    },

    // Update checkout settings
    update: async (settingsData: any): Promise<boolean> => {
      return await safeFirestoreOperation(
        async () => {
          const settingsRef = doc(db, 'settings', 'checkout');
          await updateDoc(settingsRef, {
            ...settingsData,
            updated_at: serverTimestamp()
          });
          logger.log('✅ Checkout settings updated successfully');
          return true;
        },
        false,
        'updateCheckoutSettings'
      );
    },

    // Initialize default checkout settings
    initialize: async (): Promise<boolean> => {
      return await safeFirestoreOperation(
        async () => {
          const settingsDoc = await getDoc(doc(db, 'settings', 'checkout'));
          
          if (!settingsDoc.exists()) {
            const defaultSettings = {
              tax_rate: 0.1, // 10% tax
              enabled_countries: ['OM', 'AE', 'SA', 'KW', 'IQ'],
              shipping_methods: [
                {
                  id: 'pickup',
                  name: 'Pickup from our Cafe',
                  name_ar: 'الاستلام من المقهى',
                  enabled: true,
                  is_free: true,
                  pricing_type: 'flat',
                  base_cost_omr: 0,
                  base_cost_usd: 0,
                  base_cost_sar: 0,
                  estimated_delivery_days: 'Same day',
                  description: 'Free pickup from our cafe',
                  description_ar: 'استلام مجاني من المقهى'
                },
                {
                  id: 'nool_oman',
                  name: 'NOOL OMAN',
                  name_ar: 'نول عمان',
                  enabled: true,
                  is_free: false,
                  pricing_type: 'flat',
                  base_cost_omr: 2,
                  base_cost_usd: 5.2,
                  base_cost_sar: 19.5,
                  estimated_delivery_days: '1-2 days',
                  description: 'Fast delivery within Oman',
                  description_ar: 'توصيل سريع داخل عمان',
                  api_settings: {
                    provider: 'nool_oman',
                    api_url: 'https://api.nool.om',
                    account_number: '71925275'
                  }
                },
                {
                  id: 'aramex',
                  name: 'Aramex',
                  name_ar: 'أرامكس',
                  enabled: true,
                  is_free: false,
                  pricing_type: 'api_calculated',
                  base_cost_omr: 1.73,
                  base_cost_usd: 4.5,
                  base_cost_sar: 16.86,
                  estimated_delivery_days: '2-3 days',
                  description: 'International shipping via Aramex',
                  description_ar: 'شحن دولي عبر أرامكس',
                  api_settings: {
                    provider: 'aramex',
                    api_url: 'https://ws.aramex.net/ShippingAPI.V2/RateCalculator/Service_1_0.svc',
                    username: 'aramex_username',
                    password: 'aramex_password',
                    account_number: 'aramex_account'
                  }
                }
              ],
              payment_gateway: {
                provider: 'bank_muscat',
                enabled: true,
                test_mode: false,
                merchant_id: '224',
                access_code: 'AVDP00LA16BE47PDEB',
                working_key: '841FEAE32609C3E892C4D0B1393A7ACC',
                supported_currencies: ['OMR', 'USD', 'SAR'],
                additional_settings: {
                  return_url: 'https://spirithubcafe.com/checkout/success',
                  cancel_url: 'https://spirithubcafe.com/checkout/cancel',
                  webhook_url: 'https://spirithubcafe.com/api/payment/webhook'
                }
              },
              created_at: serverTimestamp(),
              updated_at: serverTimestamp()
            };
            
            await setDoc(doc(db, 'settings', 'checkout'), defaultSettings);
            logger.log('✅ Default checkout settings initialized');
          }
          return true;
        },
        false,
        'initializeCheckoutSettings'
      );
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
        // Simple timeout for user to be loaded instead of listener
        setTimeout(() => {
          resolve(true);
        }, 100);
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
      logger.error('Error uploading file:', error);
      
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
      logger.error('Error uploading multiple files:', error);
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
      logger.warn('Firebase Storage not available:', error);
      return false;
    }
  },
  
  deleteFile: async (url: string) => {
    try {
      const fileRef = ref(storage, url);
      await deleteObject(fileRef);
    } catch (error) {
      logger.error('Error deleting file:', error);
      throw error;
    }
  },

  // Checkout Settings
  checkoutSettings: {
    // Get checkout settings
    get: async (): Promise<any> => {
      return await safeFirestoreOperation(
        async () => {
          const settingsDoc = await getDoc(doc(db, 'settings', 'checkout'));
          if (settingsDoc.exists()) {
            return {
              id: settingsDoc.id,
              ...settingsDoc.data(),
              created_at: settingsDoc.data().created_at?.toDate() || new Date(),
              updated_at: settingsDoc.data().updated_at?.toDate() || new Date()
            };
          }
          
          // Return default settings if none exist
          return {
            tax_rate: 0.1, // 10% tax
            enabled_countries: ['OM', 'AE', 'SA', 'KW', 'IQ'],
            shipping_methods: [
              {
                id: 'pickup',
                name: 'Pickup from our Cafe',
                name_ar: 'الاستلام من المقهى',
                enabled: true,
                is_free: true,
                pricing_type: 'flat',
                base_cost_omr: 0,
                base_cost_usd: 0,
                base_cost_sar: 0,
                estimated_delivery_days: 'Same day',
                description: 'Free pickup from our cafe',
                description_ar: 'استلام مجاني من المقهى'
              },
              {
                id: 'nool_oman',
                name: 'NOOL OMAN',
                name_ar: 'نول عمان',
                enabled: true,
                is_free: false,
                pricing_type: 'flat',
                base_cost_omr: 2,
                base_cost_usd: 5.2,
                base_cost_sar: 19.5,
                estimated_delivery_days: '1-2 days',
                description: 'Fast delivery within Oman',
                description_ar: 'توصيل سريع داخل عمان',
                api_settings: {
                  provider: 'nool_oman',
                  api_url: 'https://api.nool.om',
                  account_number: '71925275'
                }
              },
              {
                id: 'aramex',
                name: 'Aramex',
                name_ar: 'أرامكس',
                enabled: true,
                is_free: false,
                pricing_type: 'api_calculated',
                base_cost_omr: 1.73,
                base_cost_usd: 4.5,
                base_cost_sar: 16.86,
                estimated_delivery_days: '2-3 days',
                description: 'International shipping via Aramex',
                description_ar: 'شحن دولي عبر أرامكس',
                api_settings: {
                  provider: 'aramex',
                  api_url: 'https://ws.aramex.net/ShippingAPI.V2/RateCalculator/Service_1_0.svc',
                  username: 'aramex_username',
                  password: 'aramex_password',
                  account_number: 'aramex_account'
                }
              }
            ],
            payment_gateway: {
              provider: 'bank_muscat',
              enabled: true,
              test_mode: false,
              merchant_id: '224',
              access_code: 'AVDP00LA16BE47PDEB',
              working_key: '841FEAE32609C3E892C4D0B1393A7ACC',
              supported_currencies: ['OMR', 'USD', 'SAR'],
              additional_settings: {
                return_url: 'https://spirithubcafe.com/checkout/success',
                cancel_url: 'https://spirithubcafe.com/checkout/cancel',
                webhook_url: 'https://spirithubcafe.com/api/payment/webhook'
              }
            },
            created_at: new Date(),
            updated_at: new Date()
          };
        },
        null,
        'getCheckoutSettings'
      );
    },

    // Update checkout settings
    update: async (settingsData: any): Promise<boolean> => {
      return await safeFirestoreOperation(
        async () => {
          const settingsRef = doc(db, 'settings', 'checkout');
          await updateDoc(settingsRef, {
            ...settingsData,
            updated_at: serverTimestamp()
          });
          logger.log('✅ Checkout settings updated successfully');
          return true;
        },
        false,
        'updateCheckoutSettings'
      );
    },

    // Initialize default checkout settings
    initialize: async (): Promise<boolean> => {
      return await safeFirestoreOperation(
        async () => {
          const settingsDoc = await getDoc(doc(db, 'settings', 'checkout'));
          
          if (!settingsDoc.exists()) {
            const defaultSettings = {
              tax_rate: 0.1, // 10% tax
              enabled_countries: ['OM', 'AE', 'SA', 'KW', 'IQ'],
              shipping_methods: [
                {
                  id: 'pickup',
                  name: 'Pickup from our Cafe',
                  name_ar: 'الاستلام من المقهى',
                  enabled: true,
                  is_free: true,
                  pricing_type: 'flat',
                  base_cost_omr: 0,
                  base_cost_usd: 0,
                  base_cost_sar: 0,
                  estimated_delivery_days: 'Same day',
                  description: 'Free pickup from our cafe',
                  description_ar: 'استلام مجاني من المقهى'
                },
                {
                  id: 'nool_oman',
                  name: 'NOOL OMAN',
                  name_ar: 'نول عمان',
                  enabled: true,
                  is_free: false,
                  pricing_type: 'flat',
                  base_cost_omr: 2,
                  base_cost_usd: 5.2,
                  base_cost_sar: 19.5,
                  estimated_delivery_days: '1-2 days',
                  description: 'Fast delivery within Oman',
                  description_ar: 'توصيل سريع داخل عمان',
                  api_settings: {
                    provider: 'nool_oman',
                    api_url: 'https://api.nool.om',
                    account_number: '71925275'
                  }
                },
                {
                  id: 'aramex',
                  name: 'Aramex',
                  name_ar: 'أرامكس',
                  enabled: true,
                  is_free: false,
                  pricing_type: 'api_calculated',
                  base_cost_omr: 1.73,
                  base_cost_usd: 4.5,
                  base_cost_sar: 16.86,
                  estimated_delivery_days: '2-3 days',
                  description: 'International shipping via Aramex',
                  description_ar: 'شحن دولي عبر أرامكس',
                  api_settings: {
                    provider: 'aramex',
                    api_url: 'https://ws.aramex.net/ShippingAPI.V2/RateCalculator/Service_1_0.svc',
                    username: 'aramex_username',
                    password: 'aramex_password',
                    account_number: 'aramex_account'
                  }
                }
              ],
              payment_gateway: {
                provider: 'bank_muscat',
                enabled: true,
                test_mode: false,
                merchant_id: '224',
                access_code: 'AVDP00LA16BE47PDEB',
                working_key: '841FEAE32609C3E892C4D0B1393A7ACC',
                supported_currencies: ['OMR', 'USD', 'SAR'],
                additional_settings: {
                  return_url: 'https://spirithubcafe.com/checkout/success',
                  cancel_url: 'https://spirithubcafe.com/checkout/cancel',
                  webhook_url: 'https://spirithubcafe.com/api/payment/webhook'
                }
              },
              created_at: serverTimestamp(),
              updated_at: serverTimestamp()
            };
            
            await setDoc(doc(db, 'settings', 'checkout'), defaultSettings);
            logger.log('✅ Default checkout settings initialized');
          }
          return true;
        },
        false,
        'initializeCheckoutSettings'
      );
    }
  }
};

export { auth, db, storage, analytics };
export default app;
