import { type PaymentGateway } from '@/hooks/useCheckoutSettings'

export interface PaymentRequest {
  order_id: string
  amount: number
  currency: 'OMR' | 'USD' | 'SAR'
  customer_email: string
  customer_name: string
  return_url: string
  cancel_url: string
  webhook_url?: string
  description?: string
}

export interface PaymentResponse {
  success: boolean
  payment_url?: string
  transaction_id?: string
  error?: string
  gateway_response?: any
}

export interface PaymentWebhook {
  order_id: string
  transaction_id: string
  status: 'success' | 'failed' | 'cancelled'
  amount: number
  currency: string
  gateway_response: any
}

export class PaymentService {
  /**
   * Process payment through Bank Muscat gateway
   */
  static async processBankMuscatPayment(
    request: PaymentRequest,
    gateway: PaymentGateway
  ): Promise<PaymentResponse> {
    try {
      if (!gateway.merchant_id || !gateway.access_code || !gateway.working_key) {
        throw new Error('Bank Muscat gateway not properly configured')
      }

      // Bank Muscat payment parameters
      const paymentData = {
        merchant_id: gateway.merchant_id,
        access_code: gateway.access_code,
        order_id: request.order_id,
        amount: request.amount,
        currency: request.currency,
        language: 'en', // or 'ar' for Arabic
        billing_name: request.customer_name,
        billing_email: request.customer_email,
        redirect_url: request.return_url,
        cancel_url: request.cancel_url,
        merchant_param1: request.description || 'SpiritHub Cafe Order',
        merchant_param2: new Date().toISOString(),
        promo_code: '',
        customer_identifier: request.customer_email,
        
        // Test mode handling
        command: gateway.test_mode ? 'initiateTransaction' : 'initiateTransaction',
        
        // Integration type
        integration_type: 'hosted_checkout',
        
        // Response format
        response_type: 'form'
      }

      // Generate secure hash (this is a simplified version)
      const secureHash = this.generateBankMuscatHash(paymentData, gateway.working_key)
      
      // In a real implementation, you would:
      // 1. Make API call to Bank Muscat
      // 2. Get payment URL
      // 3. Return the URL for redirect
      
      // For now, simulate the response
      const paymentUrl = gateway.test_mode 
        ? `https://test.bankmuscat.com/payment?merchant_id=${gateway.merchant_id}&order_id=${request.order_id}&hash=${secureHash}`
        : `https://payment.bankmuscat.com/payment?merchant_id=${gateway.merchant_id}&order_id=${request.order_id}&hash=${secureHash}`

      return {
        success: true,
        payment_url: paymentUrl,
        transaction_id: `TXN_${Date.now()}`,
        gateway_response: {
          merchant_id: gateway.merchant_id,
          order_id: request.order_id,
          amount: request.amount,
          currency: request.currency
        }
      }

    } catch (error) {
      console.error('Bank Muscat payment error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed'
      }
    }
  }

  /**
   * Generate secure hash for Bank Muscat
   * This is a simplified version - real implementation would need proper encryption
   */
  private static generateBankMuscatHash(data: any, workingKey: string): string {
    // In real implementation, use proper hashing algorithm as per Bank Muscat documentation
    const sortedKeys = Object.keys(data).sort()
    const queryString = sortedKeys
      .map(key => `${key}=${data[key]}`)
      .join('&')
    
    // This should be SHA256 or other algorithm as specified by Bank Muscat
    return btoa(queryString + workingKey).substring(0, 32)
  }

  /**
   * Verify payment webhook from Bank Muscat
   */
  static verifyBankMuscatWebhook(
    webhookData: any,
    gateway: PaymentGateway
  ): PaymentWebhook | null {
    try {
      // Verify the webhook signature
      const expectedHash = this.generateBankMuscatHash(webhookData, gateway.working_key!)
      
      if (webhookData.hash !== expectedHash) {
        console.error('Invalid webhook signature')
        return null
      }

      // Map Bank Muscat response to our webhook format
      return {
        order_id: webhookData.order_id,
        transaction_id: webhookData.transaction_id || webhookData.bank_ref_no,
        status: this.mapBankMuscatStatus(webhookData.order_status),
        amount: parseFloat(webhookData.amount),
        currency: webhookData.currency,
        gateway_response: webhookData
      }

    } catch (error) {
      console.error('Webhook verification error:', error)
      return null
    }
  }

  /**
   * Map Bank Muscat status to our standard status
   */
  private static mapBankMuscatStatus(bankStatus: string): 'success' | 'failed' | 'cancelled' {
    switch (bankStatus?.toLowerCase()) {
      case 'success':
      case 'completed':
      case 'authorized':
        return 'success'
      case 'cancelled':
      case 'aborted':
        return 'cancelled'
      case 'failed':
      case 'declined':
      case 'invalid':
      default:
        return 'failed'
    }
  }

  /**
   * Process refund through Bank Muscat
   */
  static async processBankMuscatRefund(
    transactionId: string,
    amount: number,
    currency: string,
    gateway: PaymentGateway
  ): Promise<PaymentResponse> {
    try {
      const refundData = {
        merchant_id: gateway.merchant_id,
        access_code: gateway.access_code,
        command: 'refund',
        reference_no: transactionId,
        refund_amount: amount,
        currency: currency,
        refund_ref: `REF_${Date.now()}`
      }

      // Generate secure hash
      // const secureHash = this.generateBankMuscatHash(refundData, gateway.working_key!)

      // In real implementation, make API call to Bank Muscat for refund
      // For now, simulate success
      return {
        success: true,
        transaction_id: `REF_${Date.now()}`,
        gateway_response: {
          refund_status: 'success',
          refund_amount: amount,
          refund_reference: refundData.refund_ref
        }
      }

    } catch (error) {
      console.error('Refund processing error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Refund processing failed'
      }
    }
  }

  /**
   * Get payment status from Bank Muscat
   */
  static async getBankMuscatPaymentStatus(
    orderId: string,
    _gateway: PaymentGateway
  ): Promise<PaymentResponse> {
    try {
      /*
      const statusData = {
        merchant_id: gateway.merchant_id,
        access_code: gateway.access_code,
        command: 'orderStatusTracker',
        order_id: orderId,
        reference_no: orderId
      }
      */

      // const secureHash = this.generateBankMuscatHash(statusData, gateway.working_key!)

      // In real implementation, make API call to Bank Muscat
      // For now, simulate response
      return {
        success: true,
        gateway_response: {
          order_status: 'success',
          order_id: orderId,
          transaction_id: `TXN_${Date.now()}`,
          amount: 0, // Would be returned from API
          currency: 'OMR'
        }
      }

    } catch (error) {
      console.error('Status check error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Status check failed'
      }
    }
  }
}

/**
 * Hook for payment processing
 */
export const usePaymentProcessing = () => {
  const processPayment = async (
    request: PaymentRequest,
    gateway: PaymentGateway
  ): Promise<PaymentResponse> => {
    switch (gateway.provider) {
      case 'bank_muscat':
        return await PaymentService.processBankMuscatPayment(request, gateway)
      default:
        return {
          success: false,
          error: 'Unsupported payment gateway'
        }
    }
  }

  const verifyWebhook = (
    webhookData: any,
    gateway: PaymentGateway
  ): PaymentWebhook | null => {
    switch (gateway.provider) {
      case 'bank_muscat':
        return PaymentService.verifyBankMuscatWebhook(webhookData, gateway)
      default:
        return null
    }
  }

  const processRefund = async (
    transactionId: string,
    amount: number,
    currency: string,
    gateway: PaymentGateway
  ): Promise<PaymentResponse> => {
    switch (gateway.provider) {
      case 'bank_muscat':
        return await PaymentService.processBankMuscatRefund(transactionId, amount, currency, gateway)
      default:
        return {
          success: false,
          error: 'Unsupported payment gateway for refunds'
        }
    }
  }

  return {
    processPayment,
    verifyWebhook,
    processRefund
  }
}
