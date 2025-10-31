export interface CheckoutSettings {
  id?: string
  tax_rate: number // Tax percentage (e.g., 0.1 for 10%)
  enabled_countries: string[]
  shipping_methods: ShippingMethod[]
  payment_gateway: PaymentGateway
  created_at?: string
  updated_at?: string
}

export interface ShippingMethod {
  id: string
  name: string
  name_ar: string
  enabled: boolean
  is_free: boolean
  pricing_type: 'flat' | 'weight_based' | 'order_based' | 'api_calculated'
  
  // Flat rate pricing
  base_cost_omr?: number
  base_cost_usd?: number
  base_cost_sar?: number
  
  // Weight-based pricing
  cost_per_kg_omr?: number
  cost_per_kg_usd?: number
  cost_per_kg_sar?: number
  
  // Order-based pricing (based on order value)
  order_tiers?: OrderTier[]
  
  // API settings
  api_settings?: ShippingApiSettings
  
  // Restrictions
  min_order_value?: number
  max_order_value?: number
  restricted_countries?: string[]
  
  estimated_delivery_days?: string
  description?: string
  description_ar?: string
}

export interface OrderTier {
  min_order_value: number
  max_order_value: number
  cost_omr: number
  cost_usd: number
  cost_sar: number
}

export interface ShippingApiSettings {
  provider: 'nool_oman' | 'custom'
  api_url?: string
  api_key?: string
  username?: string
  password?: string
  account_number?: string
  additional_settings?: Record<string, any>
}

export interface PaymentGateway {
  provider: 'stripe' | 'paypal' | 'custom'
  enabled: boolean
  test_mode: boolean
  
  // Other gateway settings
  api_key?: string
  secret_key?: string
  webhook_url?: string
  
  // Supported currencies
  supported_currencies: string[]
  
  // Additional settings
  additional_settings?: Record<string, any>
}

export interface Country {
  code: string
  name: string
  name_ar: string
  enabled: boolean
  shipping_zone?: string
}
