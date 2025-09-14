import { useState, useEffect } from 'react'
import { checkoutSettingsService } from '@/services/checkoutSettings'

export interface CheckoutSettings {
  tax_rate: number // Legacy global tax rate (keep for backward compatibility)
  category_tax_rates: CategoryTaxRate[] // New category-based tax rates
  enabled_countries: string[]
  shipping_methods: ShippingMethod[]
  payment_gateway: PaymentGateway
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
