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

class CheckoutSettingsService {
  private settings: CheckoutSettings | null = null

  async getSettings(): Promise<CheckoutSettings> {
    if (this.settings) {
      return this.settings
    }

    try {
      const response = await fetch('/data/checkout-settings.json')
      if (!response.ok) {
        throw new Error('Failed to load checkout settings')
      }
      this.settings = await response.json()
      return this.settings!
    } catch (error) {
      console.error('Error loading checkout settings:', error)
      // Return default settings
      const defaultSettings: CheckoutSettings = {
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
      this.settings = defaultSettings
      return defaultSettings
    }
  }

  // Alias for backward compatibility
  async get(): Promise<CheckoutSettings> {
    return this.getSettings()
  }

  async initialize(): Promise<boolean> {
    try {
      await this.getSettings()
      return true
    } catch (error) {
      console.error('Failed to initialize checkout settings:', error)
      return false
    }
  }

  async updateSettings(newSettings: Partial<CheckoutSettings>): Promise<void> {
    const currentSettings = await this.getSettings()
    this.settings = { ...currentSettings, ...newSettings }
    
    // In a real implementation, this would save to a backend
    localStorage.setItem('checkout-settings', JSON.stringify(this.settings))
  }

  // Alias for backward compatibility
  async update(newSettings: Partial<CheckoutSettings>): Promise<boolean> {
    try {
      await this.updateSettings(newSettings)
      return true
    } catch (error) {
      console.error('Failed to update checkout settings:', error)
      return false
    }
  }

  async getSupportedCountries(): Promise<string[]> {
    const settings = await this.getSettings()
    return settings.supportedCountries
  }

  async getPaymentMethods(): Promise<string[]> {
    const settings = await this.getSettings()
    return settings.paymentMethods
  }

  async getShippingMethods(): Promise<string[]> {
    const settings = await this.getSettings()
    return settings.shippingMethods
  }

  async calculateTax(amount: number): Promise<number> {
    const settings = await this.getSettings()
    return amount * settings.taxRate
  }

  async isFreeShippingEligible(orderTotal: number): Promise<boolean> {
    const settings = await this.getSettings()
    return orderTotal >= settings.freeShippingThreshold
  }

  async validateOrderAmount(amount: number): Promise<{ valid: boolean; message?: string }> {
    const settings = await this.getSettings()
    
    if (amount < settings.minimumOrderAmount) {
      return {
        valid: false,
        message: `Minimum order amount is ${settings.minimumOrderAmount} ${settings.currency}`
      }
    }
    
    if (amount > settings.maximumOrderAmount) {
      return {
        valid: false,
        message: `Maximum order amount is ${settings.maximumOrderAmount} ${settings.currency}`
      }
    }
    
    return { valid: true }
  }
}

export const checkoutSettingsService = new CheckoutSettingsService()
export default checkoutSettingsService
export type { CheckoutSettings }
