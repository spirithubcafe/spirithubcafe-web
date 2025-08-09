// Database Types
export type Currency = 'USD' | 'OMR' | 'SAR'
export type UserRole = 'user' | 'shop' | 'admin'
export type Gender = 'male' | 'female' | 'other'
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
export type PaymentStatus = 'unpaid' | 'paid' | 'partially_paid' | 'refunded' | 'failed'
export type PaymentMethod = 'card' | 'paypal' | 'bank_transfer' | 'cash_on_delivery'
export type BeanType = 'Arabica' | 'Robusta' | 'Blend'
export type RoastLevel = 'Light Roast' | 'Medium Roast' | 'Medium-Dark Roast' | 'Dark Roast'
export type TicketStatus = 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'

// User Profile Interface
export interface Profile {
  id: string
  email: string
  full_name: string
  phone: string
  gender?: Gender
  date_of_birth?: string
  profile_image?: string
  national_id?: string
  nationality?: string
  company_name?: string
  job_title?: string
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at: string
}

// Address Interface
export interface Address {
  id: number
  user_id: string
  recipient_name: string
  phone: string
  country: string
  city: string
  district?: string
  postal_code?: string
  full_address: string
  location_lat?: number
  location_lng?: number
  type: 'shipping' | 'billing'
  is_default: boolean
  is_active: boolean
  created_at: string
}

// Category Interface
export interface Category {
  id: number
  name: string
  name_ar?: string
  description?: string
  description_ar?: string
  image_url?: string
  parent_id?: number
  sort_order: number
  is_active: boolean
  created_at: string
}

// Coffee Origin Interface
export interface CoffeeOrigin {
  id: number
  name: string
  name_ar?: string
  country: string
  region?: string
  description?: string
  flavor_notes: string[]
  created_at: string
}

// Roast Level Interface
export interface RoastLevelType {
  id: number
  name: string
  name_ar?: string
  description?: string
  color_code?: string
  created_at: string
}

// Product Property Option Interface
export interface ProductPropertyOption {
  value: string
  label: string
  label_ar: string
  price_modifier?: number // Price change in OMR (for backward compatibility)
  // Price modifiers (for relative pricing - adds to base price)
  price_modifier_omr?: number
  price_modifier_usd?: number
  price_modifier_sar?: number
  sale_price_modifier_omr?: number
  sale_price_modifier_usd?: number
  sale_price_modifier_sar?: number
  // Absolute prices (for property-based pricing - replaces base price)
  price_omr?: number
  price_usd?: number
  price_sar?: number
  sale_price_omr?: number
  sale_price_usd?: number
  sale_price_sar?: number
  on_sale?: boolean
  is_on_sale?: boolean
}

// Coffee Property Option Interface (for coffee-specific properties with individual pricing)
export interface CoffeePropertyOption {
  id: string
  value: string
  label: string
  label_ar: string
  price_omr: number
  price_usd: number
  price_sar: number
  sale_price_omr?: number
  sale_price_usd?: number
  sale_price_sar?: number
  is_on_sale: boolean
  stock?: number
  sku?: string
  is_active: boolean
  sort_order: number
}

// Coffee Property Interface (for coffee-specific properties)
export interface CoffeeProperty {
  id: string
  name: string
  name_ar: string
  type: 'roast_level' | 'process' | 'variety' | 'altitude' | 'notes' | 'farm'
  required: boolean
  multiple_selection: boolean // Allow multiple options
  options: CoffeePropertyOption[]
  is_active: boolean
  sort_order: number
}

// Product Property Interface (for dynamic properties)
export interface ProductProperty {
  name: string
  name_ar: string
  type: 'select' | 'radio' | 'checkbox'
  required: boolean
  affects_price: boolean
  options: ProductPropertyOption[]
}

// Product Interface
export interface Product {
  id: number
  name: string
  name_ar?: string
  description?: string
  description_ar?: string
  image_url?: string
  gallery_images?: string[]
  price_usd: number
  price_omr?: number
  price_sar?: number
  category_id?: number
  origin_id?: number
  roast_level_id?: number
  bean_type?: BeanType
  processing_method?: string
  altitude?: string
  harvest_year?: number
  caffeine_content?: string
  grind_options?: string[]
  package_size?: string[]
  variety?: string
  notes?: string
  farm?: string
  stock: number
  low_stock_threshold: number
  weight_grams?: number
  slug?: string
  meta_title?: string
  meta_description?: string
  featured: boolean
  bestseller: boolean
  new_arrival: boolean
  on_sale: boolean
  sale_price_usd?: number
  sale_price_omr?: number
  sale_price_sar?: number
  sale_start_date?: string
  sale_end_date?: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
  // Relations
  category?: Category
  origin?: CoffeeOrigin
  roast_level?: RoastLevelType
  variants?: ProductVariant[]
  reviews?: ProductReview[]
  tags?: ProductTag[]
  properties?: ProductProperty[]
  average_rating?: number
  review_count?: number
  // Coffee-specific properties with individual pricing
  coffee_properties?: CoffeeProperty[]
  selected_coffee_options?: { [property_id: string]: string[] } // property_id -> option IDs
}

// Product Variant Interface
export interface ProductVariant {
  id: number
  product_id: number
  variant_type: string
  variant_name: string
  variant_value: string
  price_adjustment_usd: number
  price_adjustment_omr: number
  price_adjustment_sar: number
  stock: number
  sku?: string
  weight_grams?: number
  is_active: boolean
  sort_order: number
  created_at: string
}

// Product Review Interface
export interface ProductReview {
  id: string
  product_id: string
  user_id?: string
  rating: number
  title?: string
  review_text?: string
  is_verified_purchase: boolean
  is_approved: boolean
  helpful_count: number
  created_at: string
  user?: Profile
}

// Product Tag Interface
export interface ProductTag {
  id: number
  name: string
  name_ar?: string
  color: string
  created_at: string
}

// Wishlist Interface
export interface Wishlist {
  id: string
  user_id: string
  product_id: string
  created_at: string
  product?: Product
}

// Cart Interface
export interface Cart {
  id: number
  user_id?: string
  session_id?: string
  created_at: string
  updated_at: string
  items?: CartItem[]
}

// Cart Item Interface
export interface CartItem {
  id: number
  cart_id: number
  product_id: number
  variant_id?: number
  quantity: number
  added_at: string
  product?: Product
  variant?: ProductVariant
}

// Coupon Interface
export interface Coupon {
  id: number
  code: string
  name?: string
  name_ar?: string
  description?: string
  discount_type: 'percentage' | 'fixed_amount'
  discount_value: number
  minimum_order_amount: number
  usage_limit?: number
  used_count: number
  user_limit: number
  start_date?: string
  end_date?: string
  is_active: boolean
  created_at: string
}

// Shipping Zone Interface
export interface ShippingZone {
  id: number
  name: string
  name_ar?: string
  countries: string[]
  created_at: string
}

// Shipping Method Interface
export interface ShippingMethod {
  id: number
  zone_id: number
  name: string
  name_ar?: string
  description?: string
  estimated_delivery_days?: string
  price_usd?: number
  price_omr?: number
  price_sar?: number
  free_shipping_threshold?: number
  is_active: boolean
  sort_order: number
  created_at: string
  zone?: ShippingZone
}

// Order Interface
export interface Order {
  id: number
  order_number: string
  user_id?: string
  customer_email?: string
  customer_phone?: string
  customer_name?: string
  shipping_address_id?: number
  billing_address_id?: number
  shipping_method_id?: number
  subtotal_usd?: number
  subtotal_omr?: number
  subtotal_sar?: number
  shipping_cost_usd: number
  shipping_cost_omr: number
  shipping_cost_sar: number
  tax_amount_usd: number
  tax_amount_omr: number
  tax_amount_sar: number
  discount_amount_usd: number
  discount_amount_omr: number
  discount_amount_sar: number
  total_price_usd?: number
  total_price_omr?: number
  total_price_sar?: number
  currency: Currency
  coupon_code?: string
  status: OrderStatus
  payment_status: PaymentStatus
  tracking_number?: string
  shipped_at?: string
  delivered_at?: string
  notes?: string
  admin_notes?: string
  created_at: string
  updated_at: string
  // Relations
  user?: Profile
  shipping_address?: Address
  billing_address?: Address
  shipping_method?: ShippingMethod
  items?: OrderItem[]
  payments?: Payment[]
  status_history?: OrderStatusHistory[]
}

// Order Item Interface
export interface OrderItem {
  id: number
  order_id: number
  product_id?: number
  variant_id?: number
  product_name: string
  product_name_ar?: string
  variant_name?: string
  product_image?: string
  quantity: number
  unit_price_usd?: number
  unit_price_omr?: number
  unit_price_sar?: number
  total_price_usd?: number
  total_price_omr?: number
  total_price_sar?: number
  product?: Product
  variant?: ProductVariant
}

// Order Status History Interface
export interface OrderStatusHistory {
  id: number
  order_id: number
  status: OrderStatus
  note?: string
  created_by?: string
  created_at: string
  user?: Profile
}

// Payment Interface
export interface Payment {
  id: number
  order_id: number
  transaction_id?: string
  amount_usd?: number
  amount_omr?: number
  amount_sar?: number
  currency?: Currency
  payment_method?: PaymentMethod
  gateway?: string
  gateway_transaction_id?: string
  gateway_response?: any
  status: PaymentStatus
  paid_at?: string
  created_at: string
}

// Ticket Interface
export interface Ticket {
  id: number
  ticket_number: string
  user_id?: string
  order_id?: number
  customer_name?: string
  customer_email?: string
  customer_phone?: string
  subject: string
  category?: string
  priority: TicketPriority
  status: TicketStatus
  created_at: string
  updated_at: string
  user?: Profile
  order?: Order
  messages?: TicketMessage[]
}

// Ticket Message Interface
export interface TicketMessage {
  id: number
  ticket_id: number
  user_id?: string
  message: string
  attachments?: string[]
  is_admin: boolean
  created_at: string
  user?: Profile
}

// Newsletter Subscriber Interface
export interface NewsletterSubscriber {
  id: number
  email: string
  name?: string
  subscribed_at: string
  is_active: boolean
  unsubscribed_at?: string
}

// Static Page Interface
export interface StaticPage {
  id: number
  slug: string
  title: string
  title_ar?: string
  content?: string
  content_ar?: string
  meta_title?: string
  meta_description?: string
  is_published: boolean
  created_at: string
  updated_at: string
}

// Blog Post Interface
export interface BlogPost {
  id: number
  title: string
  title_ar?: string
  slug: string
  excerpt?: string
  excerpt_ar?: string
  content?: string
  content_ar?: string
  featured_image?: string
  meta_title?: string
  meta_description?: string
  author_id?: string
  category?: string
  tags?: string[]
  is_published: boolean
  published_at?: string
  created_at: string
  updated_at: string
  author?: Profile
}

// Settings Interface
export interface Settings {
  key: string
  value: any
  updated_at: string
}

// Inventory Movement Interface
export interface InventoryMovement {
  id: number
  product_id: number
  variant_id?: number
  movement_type: 'in' | 'out' | 'adjustment'
  quantity: number
  reason?: string
  reference_id?: number
  reference_type?: string
  created_by?: string
  created_at: string
  product?: Product
  variant?: ProductVariant
  user?: Profile
}

// Auth Types
export interface AuthState {
  user: Profile | null
  isAuthenticated: boolean
  loading: boolean
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

// Form Types
export interface ProductForm {
  name: string
  name_ar?: string
  description?: string
  description_ar?: string
  price_usd: number
  price_omr?: number
  price_sar?: number
  category_id?: number
  origin_id?: number
  roast_level_id?: number
  bean_type?: BeanType
  processing_method?: string
  altitude?: string
  harvest_year?: number
  caffeine_content?: string
  grind_options?: string[]
  package_size?: string[]
  variety?: string
  notes?: string
  farm?: string
  stock: number
  weight_grams?: number
  featured: boolean
  bestseller: boolean
  new_arrival: boolean
  on_sale: boolean
  sale_price_usd?: number
  sale_price_omr?: number
  sale_price_sar?: number
  sale_start_date?: string
  sale_end_date?: string
}

export interface ProfileForm {
  full_name: string
  phone: string
  gender?: Gender
  date_of_birth?: string
  national_id?: string
  nationality?: string
  company_name?: string
  job_title?: string
}

export interface AddressForm {
  recipient_name: string
  phone: string
  country: string
  city: string
  district?: string
  postal_code?: string
  full_address: string
  type: 'shipping' | 'billing'
  is_default: boolean
}

export interface OrderForm {
  shipping_address_id: number
  billing_address_id?: number
  shipping_method_id: number
  coupon_code?: string
  notes?: string
  payment_method: PaymentMethod
}


