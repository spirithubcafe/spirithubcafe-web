import { useState, useEffect } from 'react'

// Import from service directly
interface CheckoutSettings {
  currency: string
  paymentMethods: string[]
  shippingMethods: string[]
  taxRate: number
  freeShippingThreshold: number
  allowGuestCheckout: boolean
  requirePhoneNumber: boolean
  requireAddress: boolean
  allowCouponCodes: boolean
  autoApplyCoupons: boolean
  emailNotifications: boolean
  smsNotifications: boolean
  orderConfirmationMessage: string
  orderConfirmationMessageAr: string
  defaultCountry: string
  supportedCountries: string[]
  minimumOrderAmount: number
  maximumOrderAmount: number
  orderProcessingTime: string
  returnPolicy: string
  privacyPolicy: string
  termsOfService: string
  payment_gateway: {
    enabled: boolean
    provider: string
    sandbox: boolean
  }
  bankMuscat: {
    merchantId: string
    accessCode: string
    workingKey: string
    currency: string
    language: string
    redirectUrl: string
    cancelUrl: string
    enabled: boolean
  }
}

// Import service
const checkoutSettingsService = {
  async getSettings(): Promise<CheckoutSettings> {
    try {
      const response = await fetch('/data/checkout-settings.json')
      if (!response.ok) {
        throw new Error('Failed to load checkout settings')
      }
      return await response.json()
    } catch (error) {
      console.error('Error loading checkout settings:', error)
      return {
        currency: 'OMR',
        paymentMethods: ['cash_on_delivery', 'bank_transfer'],
        shippingMethods: ['standard', 'express'],
        taxRate: 0,
        freeShippingThreshold: 25,
        allowGuestCheckout: true,
        requirePhoneNumber: true,
        requireAddress: true,
        allowCouponCodes: true,
        autoApplyCoupons: false,
        emailNotifications: true,
        smsNotifications: false,
        orderConfirmationMessage: 'Thank you for your order! We will contact you soon.',
        orderConfirmationMessageAr: 'شكراً لطلبك! سنتواصل معك قريباً.',
        defaultCountry: 'OM',
        supportedCountries: ['OM', 'AE', 'SA', 'KW', 'BH', 'QA'],
        minimumOrderAmount: 5,
        maximumOrderAmount: 1000,
        orderProcessingTime: '1-2 business days',
        returnPolicy: 'No returns on coffee products',
        privacyPolicy: '/pages/privacy-policy',
        termsOfService: '/pages/terms-of-service',
        payment_gateway: {
          enabled: false,
          provider: 'bank_muscat',
          sandbox: true
        },
        bankMuscat: {
          merchantId: '',
          accessCode: '',
          workingKey: '',
          currency: 'OMR',
          language: 'en',
          redirectUrl: '/checkout/success',
          cancelUrl: '/checkout/cancel',
          enabled: false
        }
      }
    }
  },
  
  async get() {
    return this.getSettings()
  },
  
  async initialize() {
    try {
      await this.getSettings()
      return true
    } catch {
      return false
    }
  },
  
  async updateSettings(newSettings: Partial<CheckoutSettings>) {
    localStorage.setItem('checkout-settings', JSON.stringify(newSettings))
  },
  
  async update(newSettings: Partial<CheckoutSettings>) {
    try {
      await this.updateSettings(newSettings)
      return true
    } catch {
      return false
    }
  }
}

export interface CategoryTaxRate {
  category_id: string
  category_name: string
  category_name_ar: string
  tax_rate: number // 0.05 for 5%, 0 for 0%
  enabled: boolean
}

export interface ShippingMethod {
  id: string
  name: string
  name_ar: string
  enabled: boolean
  is_free: boolean
  pricing_type: 'flat' | 'api_calculated'
  base_cost_omr: number
  base_cost_usd: number
  base_cost_sar: number
  estimated_delivery_days: string
  description: string
  description_ar: string
  api_settings?: {
    provider: string
    api_url: string
    username?: string
    password?: string
    account_number?: string
  }
}

export interface PaymentGateway {
  provider: string
  enabled: boolean
  test_mode: boolean
  merchant_id: string
  access_code: string
  working_key: string
  supported_currencies: string[]
  additional_settings: {
    return_url: string
    cancel_url: string
    webhook_url: string
  }
}

export const useCheckoutSettings = () => {
  const [settings, setSettings] = useState<CheckoutSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await checkoutSettingsService.get()
      
      // If no settings exist, initialize with defaults
      if (!data || Object.keys(data).length === 0) {
        console.log('No checkout settings found, initializing defaults...')
        const initSuccess = await checkoutSettingsService.initialize()
        if (initSuccess) {
          // Fetch again after initialization
          const newData = await checkoutSettingsService.get()
          setSettings(newData)
        } else {
          throw new Error('Failed to initialize checkout settings')
        }
      } else {
        setSettings(data)
      }
    } catch (err) {
      console.error('Error fetching checkout settings:', err)
      setError('Failed to fetch checkout settings')
      
      // Try to initialize as fallback
      try {
        console.log('Attempting to initialize checkout settings as fallback...')
        const initSuccess = await checkoutSettingsService.initialize()
        if (initSuccess) {
          const newData = await checkoutSettingsService.get()
          setSettings(newData)
        }
      } catch (initErr) {
        console.error('Failed to initialize checkout settings:', initErr)
      }
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (settingsData: Partial<CheckoutSettings>) => {
    try {
      setError(null)
      
      const success = await checkoutSettingsService.update(settingsData)
      if (success) {
        await fetchSettings()
        return true
      }
      return false
    } catch (err) {
      console.error('Error updating checkout settings:', err)
      setError('Failed to update checkout settings')
      return false
    }
  }

  const initializeSettings = async () => {
    try {
      setError(null)
      
      const success = await checkoutSettingsService.initialize()
      if (success) {
        await fetchSettings()
        return true
      }
      return false
    } catch (err) {
      console.error('Error initializing checkout settings:', err)
      setError('Failed to initialize checkout settings')
      return false
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  return {
    settings,
    loading,
    error,
    updateSettings,
    initializeSettings,
    refetch: fetchSettings
  }
}
