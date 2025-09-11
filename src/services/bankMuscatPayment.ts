// Local fallback for checkoutSettingsService when './checkoutSettings' module is missing.
// Replace this stub with the real import when the actual module is available.
const checkoutSettingsService = {
  async get() {
    // Minimal default settings to avoid runtime errors; adjust as needed.
    return {
      payment_gateway: { enabled: false },
      bankMuscat: {
        enabled: false,
        merchantId: '',
        accessCode: '',
        workingKey: ''
      }
    }
  }
}
import * as CryptoJS from 'crypto-js'

// Bank Muscat Payment Gateway Configuration
const BANK_MUSCAT_URL = 'https://www.bankmuscat.com/egate'

export interface PaymentRequest {
  order_id: string
  amount: number
  currency: 'OMR' | 'USD' | 'SAR'
  customer_email: string
  customer_name: string
  customer_phone: string
  return_url?: string
  cancel_url?: string
}

export interface PaymentResponse {
  success: boolean
  payment_url?: string
  transaction_id?: string
  error?: string
}

class BankMuscatPaymentService {
  private checkoutSettingsService = checkoutSettingsService

  private generateHash(data: string, workingKey: string): string {
    return CryptoJS.HmacSHA256(data, workingKey).toString(CryptoJS.enc.Hex).toUpperCase()
  }

  private getCurrencyCode(currency: string): string {
    switch (currency) {
      case 'OMR':
        return '512' // Omani Rial
      case 'USD':
        return '840' // US Dollar
      case 'SAR':
        return '682' // Saudi Riyal
      default:
        return '512' // Default to OMR
    }
  }

  async createPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Get checkout settings to get payment gateway config
          const settings = await this.checkoutSettingsService.get()
      
      if (!settings?.payment_gateway || !settings.payment_gateway.enabled) {
        return {
          success: false,
          error: 'Payment gateway is not configured or disabled'
        }
      }

      if (!settings?.bankMuscat || !settings.bankMuscat.enabled) {
        return {
          success: false,
          error: 'Bank Muscat payment gateway is not configured or disabled'
        }
      }

      const bankMuscat = settings.bankMuscat
      
      // Validate Bank Muscat specific settings
      if (!bankMuscat.merchantId || !bankMuscat.accessCode || !bankMuscat.workingKey) {
        return {
          success: false,
          error: 'Bank Muscat payment gateway is not properly configured'
        }
      }
      
      // Generate unique transaction reference
      const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      // Prepare payment data
      const baseUrl = window.location.origin
      const paymentData = {
        merchant_id: bankMuscat.merchantId,
        order_id: paymentRequest.order_id,
        currency: this.getCurrencyCode(paymentRequest.currency),
        amount: paymentRequest.amount.toFixed(2),
        redirect_url: paymentRequest.return_url || `${baseUrl}/checkout-success`,
        cancel_url: paymentRequest.cancel_url || `${baseUrl}/checkout-success`,
        language: 'EN',
        billing_name: paymentRequest.customer_name,
        billing_email: paymentRequest.customer_email,
        billing_tel: paymentRequest.customer_phone,
        merchant_param1: paymentRequest.order_id,
        merchant_param2: transactionId
      }

      // Create query string for hash generation
      const queryString = Object.keys(paymentData)
        .sort()
        .map(key => `${key}=${paymentData[key as keyof typeof paymentData]}`)
        .join('&')

      // Generate hash
      const hash = this.generateHash(queryString, bankMuscat.workingKey)

      // Create payment form data
      const formData = {
        ...paymentData,
        access_code: bankMuscat.accessCode,
        enc_val: hash
      }

      // In a real implementation, you would redirect to Bank Muscat's payment page
      // For now, we'll create a form and submit it
      const paymentUrl = this.createPaymentForm(formData)

      return {
        success: true,
        payment_url: paymentUrl,
        transaction_id: transactionId
      }

    } catch (error) {
      console.error('Bank Muscat payment error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed'
      }
    }
  }

  private createPaymentForm(formData: Record<string, string>): string {
    // Create a form that will be submitted to Bank Muscat
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = 'https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction' // Test URL
    form.style.display = 'none'

    // Add all form fields
    Object.entries(formData).forEach(([key, value]) => {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = key
      input.value = value
      form.appendChild(input)
    })

    // Add form to document and submit
    document.body.appendChild(form)
    form.submit()

    return 'Redirecting to payment gateway...'
  }

  async verifyPayment(transactionId: string, orderId: string): Promise<{
    success: boolean
    status: string
    message: string
  }> {
    try {
      const settings = await this.checkoutSettingsService.get()
      
      // Create verification request
      const verificationData = {
        merchant_id: settings.bankMuscat.merchantId,
        order_id: orderId,
        transaction_id: transactionId,
        access_code: settings.bankMuscat.accessCode
      }

      // Generate hash for verification
      const hashString = `${verificationData.access_code}${verificationData.merchant_id}${verificationData.order_id}${verificationData.transaction_id}${settings.bankMuscat.workingKey}`
      const hash = CryptoJS.SHA256(hashString).toString(CryptoJS.enc.Hex).toUpperCase()

      const verificationRequest = {
        ...verificationData,
        hash
      }

      // Make verification request to Bank Muscat
      const response = await fetch(`${BANK_MUSCAT_URL}/transaction/statusEnquiry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(verificationRequest).toString()
      })

      const result = await response.text()
      
      // Parse Bank Muscat response (usually in form data format)
      const responseData = new URLSearchParams(result)
      const orderStatus = responseData.get('order_status')
      const paymentStatus = responseData.get('payment_status') || responseData.get('status_message')

      return {
        success: orderStatus === 'Shipped' || paymentStatus === 'Success',
        status: orderStatus || paymentStatus || 'Unknown',
        message: responseData.get('status_message') || 'Payment verification completed'
      }
    } catch (error) {
      console.error('Payment verification error:', error)
      return {
        success: false,
        status: 'Error',
        message: 'Failed to verify payment'
      }
    }
  }
}

export const bankMuscatPaymentService = new BankMuscatPaymentService()
