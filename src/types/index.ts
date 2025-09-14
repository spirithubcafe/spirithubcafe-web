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
  /** Whether this category should be shown on the home page widgets/lists. Defaults to true. */
  showOnHome?: boolean
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
  // SEO fields
  meta_title?: string
  meta_title_ar?: string
  meta_description?: string
  meta_description_ar?: string
  meta_keywords?: string
  meta_keywords_ar?: string
  slug?: string
  canonical_url?: string
  og_title?: string
  og_title_ar?: string
  og_description?: string
  og_description_ar?: string
  og_image?: string
  twitter_title?: string
  twitter_title_ar?: string
  twitter_description?: string
  twitter_description_ar?: string
  twitter_image?: string
  seo_auto_generated?: boolean
  seo_generated_at?: string
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
  weight_grams?: number // Add weight for each option
  is_active: boolean
  sort_order: number
}

// Coffee Property Interface (for coffee-specific properties)
export interface CoffeeProperty {
  id: string
  name: string
  name_ar: string
  type: 'roast_level' | 'process' | 'variety' | 'altitude' | 'notes' | 'uses' | 'farm' | 'aromatic_profile' | 'intensity' | 'compatibility'
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
  roast_level_ar?: string
  bean_type?: BeanType
  processing_method?: string
  processing_method_ar?: string
  altitude?: string
  altitude_ar?: string
  harvest_year?: number
  caffeine_content?: string
  grind_options?: string[]
  package_size?: string[]
  variety?: string
  variety_ar?: string
  notes?: string
  notes_ar?: string
  uses?: string
  uses_ar?: string
  farm?: string
  farm_ar?: string
  aromatic_profile?: string
  aromatic_profile_ar?: string
  intensity?: string
  intensity_ar?: string
  compatibility?: string
  compatibility_ar?: string
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
  meta_title_ar?: string
  meta_description?: string
  meta_description_ar?: string
  meta_keywords?: string
  meta_keywords_ar?: string
  canonical_url?: string
  og_title?: string
  og_title_ar?: string
  og_description?: string
  og_description_ar?: string
  og_image?: string
  twitter_title?: string
  twitter_title_ar?: string
  twitter_description?: string
  twitter_description_ar?: string
  twitter_image?: string
  seo_auto_generated?: boolean
  seo_generated_at?: string
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

// Hero Typography Settings Interface
export interface HeroTypography {
  // English Typography
  title_font_family?: string
  title_font_size?: string // CSS font-size values like '3rem', '48px'
  title_font_weight?: number // 100-900
  title_line_height?: number // 1.2, 1.5, etc.
  title_letter_spacing?: string // CSS letter-spacing like '0.05em'
  title_text_transform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize'
  title_color?: string // hex color
  title_shadow?: string // CSS text-shadow
  
  subtitle_font_family?: string
  subtitle_font_size?: string
  subtitle_font_weight?: number
  subtitle_line_height?: number
  subtitle_letter_spacing?: string
  subtitle_text_transform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize'
  subtitle_color?: string
  subtitle_shadow?: string
  
  description_font_family?: string
  description_font_size?: string
  description_font_weight?: number
  description_line_height?: number
  description_letter_spacing?: string
  description_color?: string
  description_shadow?: string
  
  // Arabic Typography
  title_font_family_ar?: string
  title_font_size_ar?: string
  title_font_weight_ar?: number
  title_line_height_ar?: number
  title_letter_spacing_ar?: string
  title_text_transform_ar?: 'none' | 'uppercase' | 'lowercase' | 'capitalize'
  title_color_ar?: string
  title_shadow_ar?: string
  
  subtitle_font_family_ar?: string
  subtitle_font_size_ar?: string
  subtitle_font_weight_ar?: number
  subtitle_line_height_ar?: number
  subtitle_letter_spacing_ar?: string
  subtitle_text_transform_ar?: 'none' | 'uppercase' | 'lowercase' | 'capitalize'
  subtitle_color_ar?: string
  subtitle_shadow_ar?: string
  
  description_font_family_ar?: string
  description_font_size_ar?: string
  description_font_weight_ar?: number
  description_line_height_ar?: number
  description_letter_spacing_ar?: string
  description_color_ar?: string
  description_shadow_ar?: string
}

// Hero Animation Settings Interface
export interface HeroAnimation {
  title_animation?: 'none' | 'fadeIn' | 'slideIn' | 'zoomIn' | 'bounceIn' | 'rotateIn' | 'flipIn'
  title_animation_delay?: number // in milliseconds
  title_animation_duration?: number // in milliseconds
  subtitle_animation?: 'none' | 'fadeIn' | 'slideIn' | 'zoomIn' | 'bounceIn' | 'rotateIn' | 'flipIn'
  subtitle_animation_delay?: number
  subtitle_animation_duration?: number
  description_animation?: 'none' | 'fadeIn' | 'slideIn' | 'zoomIn' | 'bounceIn' | 'rotateIn' | 'flipIn'
  description_animation_delay?: number
  description_animation_duration?: number
  buttons_animation?: 'none' | 'fadeIn' | 'slideIn' | 'zoomIn' | 'bounceIn' | 'rotateIn' | 'flipIn'
  buttons_animation_delay?: number
  buttons_animation_duration?: number
}

// Hero Button Settings Interface
export interface HeroButtonSettings {
  primary_button_style?: {
    background_color?: string
    background_gradient?: string // CSS gradient
    text_color?: string
    border_color?: string
    border_width?: number
    border_radius?: string
    font_family?: string
    font_size?: string
    font_weight?: number
    padding?: string
    margin?: string
    shadow?: string // CSS box-shadow
    hover_background_color?: string
    hover_background_gradient?: string
    hover_text_color?: string
    hover_border_color?: string
    hover_shadow?: string
    hover_transform?: string // CSS transform
    transition_duration?: number // in milliseconds
  }
  
  secondary_button_style?: {
    background_color?: string
    background_gradient?: string
    text_color?: string
    border_color?: string
    border_width?: number
    border_radius?: string
    font_family?: string
    font_size?: string
    font_weight?: number
    padding?: string
    margin?: string
    shadow?: string
    hover_background_color?: string
    hover_background_gradient?: string
    hover_text_color?: string
    hover_border_color?: string
    hover_shadow?: string
    hover_transform?: string
    transition_duration?: number
  }
}

// Hero Layout Settings Interface
export interface HeroLayoutSettings {
  container_max_width?: string // CSS max-width like '1200px', '100%'
  content_padding?: string // CSS padding
  content_margin?: string // CSS margin
  vertical_alignment?: 'top' | 'center' | 'bottom'
  horizontal_alignment?: 'left' | 'center' | 'right'
  content_width?: string // CSS width for content area
  background_overlay_shape?: 'none' | 'circle' | 'rectangle' | 'polygon' | 'custom'
  background_overlay_shape_color?: string
  background_overlay_shape_opacity?: number
  responsive_breakpoints?: {
    mobile?: {
      title_font_size?: string
      subtitle_font_size?: string
      description_font_size?: string
      content_padding?: string
      content_margin?: string
    }
    tablet?: {
      title_font_size?: string
      subtitle_font_size?: string
      description_font_size?: string
      content_padding?: string
      content_margin?: string
    }
    desktop?: {
      title_font_size?: string
      subtitle_font_size?: string
      description_font_size?: string
      content_padding?: string
      content_margin?: string
    }
  }
}

// Hero Advanced Effects Interface
export interface HeroAdvancedEffects {
  parallax_enabled?: boolean
  parallax_speed?: number // 0.1 to 2.0
  ken_burns_effect?: boolean // Slow zoom effect on images
  ken_burns_direction?: 'zoom-in' | 'zoom-out' | 'zoom-in-out'
  ken_burns_duration?: number // in seconds
  particle_system?: {
    enabled?: boolean
    type?: 'stars' | 'dots' | 'lines' | 'bubbles' | 'snow' | 'rain'
    density?: number // 1-100
    speed?: number // 1-10
    color?: string
    opacity?: number // 0-100
  }
  gradient_overlay?: {
    enabled?: boolean
    type?: 'linear' | 'radial' | 'conic'
    colors?: string[] // Array of hex colors
    direction?: string // CSS gradient direction
    opacity?: number // 0-100
  }
}

// Enhanced Hero Slide Interface
export interface HeroSlide {
  id: string
  title: string
  title_ar?: string
  subtitle?: string
  subtitle_ar?: string
  description?: string
  description_ar?: string
  media_type: 'image' | 'video'
  media_url: string
  media_thumbnail?: string // For videos
  blur_intensity: number // 0-100
  brightness: number // 0-200, default 100
  contrast: number // 0-200, default 100
  saturation: number // 0-200, default 100
  hue_rotation?: number // 0-360 degrees
  sepia?: number // 0-100
  grayscale?: number // 0-100
  invert?: boolean
  duration: number // Display duration in seconds, default 5
  button_text?: string
  button_text_ar?: string
  button_link?: string
  button_variant?: 'primary' | 'secondary' | 'outline'
  secondary_button_text?: string
  secondary_button_text_ar?: string
  secondary_button_link?: string
  text_position: 'left' | 'center' | 'right'
  text_alignment: 'left' | 'center' | 'right'
  overlay_opacity: number // 0-100
  overlay_color: string // hex color
  
  // Enhanced Typography for this slide
  typography?: HeroTypography
  
  // Enhanced Animation for this slide
  animation?: HeroAnimation
  
  // Enhanced Button Settings for this slide
  button_settings?: HeroButtonSettings
  
  // Enhanced Layout for this slide
  layout?: HeroLayoutSettings
  
  // Advanced Effects for this slide
  effects?: HeroAdvancedEffects
  
  // Custom CSS for advanced users
  custom_css?: string
  custom_css_mobile?: string
  custom_css_tablet?: string
  
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

// Enhanced Hero Settings Interface
export interface HeroSettings {
  autoplay: boolean
  autoplay_delay: number // in milliseconds
  show_arrows: boolean
  show_dots: boolean
  show_progress: boolean
  transition_effect: 'slide' | 'fade' | 'zoom' | 'flip' | 'cube' | 'coverflow'
  transition_duration: number // in milliseconds
  transition_easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'cubic-bezier'
  enable_swipe: boolean
  pause_on_hover: boolean
  infinite_loop: boolean
  
  // Global Typography Settings (defaults for all slides)
  global_typography?: HeroTypography
  
  // Global Animation Settings
  global_animation?: HeroAnimation
  
  // Global Button Settings
  global_button_settings?: HeroButtonSettings
  
  // Global Layout Settings
  global_layout?: HeroLayoutSettings
  
  // Global Advanced Effects
  global_effects?: HeroAdvancedEffects
  
  // Navigation Settings
  navigation_settings?: {
    arrows_style?: {
      color?: string
      background_color?: string
      border_color?: string
      border_radius?: string
      size?: string
      padding?: string
      shadow?: string
      hover_color?: string
      hover_background_color?: string
      hover_shadow?: string
      position_offset?: string // Distance from edges
    }
    dots_style?: {
      color?: string
      active_color?: string
      size?: string
      spacing?: string
      border_radius?: string
      border_color?: string
      border_width?: number
      shadow?: string
      hover_color?: string
      position_offset?: string // Distance from bottom
    }
    progress_style?: {
      color?: string
      background_color?: string
      height?: string
      border_radius?: string
      shadow?: string
      gradient?: string
    }
  }
  
  // Responsive Settings
  responsive_settings?: {
    mobile?: {
      show_arrows?: boolean
      show_dots?: boolean
      show_progress?: boolean
      autoplay?: boolean
      transition_duration?: number
    }
    tablet?: {
      show_arrows?: boolean
      show_dots?: boolean
      show_progress?: boolean
      autoplay?: boolean
      transition_duration?: number
    }
  }
  
  // Performance Settings
  performance_settings?: {
    lazy_loading?: boolean
    preload_next_slide?: boolean
    optimize_images?: boolean
    reduce_motion_respect?: boolean // Respect user's prefers-reduced-motion
  }
  
  slides: HeroSlide[]
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
  uses?: string
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


