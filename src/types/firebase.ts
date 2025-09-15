// Re-export Firebase types to maintain compatibility
export type {
  UserProfile as Profile,
  Product,
  Category,
  CartItem,
  Order,
  OrderItem
} from '@/lib/firebase'

import type { Product, CartItem } from '@/lib/firebase'

// Keep additional types that are specific to the application
export type Currency = 'USD' | 'OMR' | 'SAR'
export type UserRole = 'user' | 'admin'
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
export type PaymentStatus = 'unpaid' | 'paid' | 'partially_paid' | 'refunded' | 'failed'
export type PaymentMethod = 'card' | 'paypal' | 'bank_transfer' | 'cash_on_delivery'

// Cart interface for compatibility
export interface Cart {
  id: string
  user_id: string
  items: Array<CartItem & { product: Product | null }>
}

// Product Variant Interface (simplified for Firebase)
export interface ProductVariant {
  id: string
  name: string
  price_adjustment_usd: number
  price_adjustment_omr?: number
  price_adjustment_sar?: number
}

// API Response Types
export interface ApiResponse<T> {
  data: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  total_pages: number
}
