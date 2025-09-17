/**
 * Bank Muscat Payment Gateway Service
 * SmartPay / MPGS Integration Service
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { logger } from 'firebase-functions';
import * as functions from 'firebase-functions';
import {
  BankMuscatConfig,
  CreatePaymentRequest,
  CreateOrderResponse,
  CreateSessionResponse,
  PaymentInquiryResponse,
  PaymentError,
  ApiErrorResponse,
  Currency,
  PaymentLog
} from '../types/payment.types';

export class BankMuscatService {
  private config: BankMuscatConfig;
  private axiosInstance: AxiosInstance;

  constructor() {
    this.config = this.loadConfiguration();
    this.axiosInstance = this.createAxiosInstance();
  }

  /**
   * Load configuration from environment variables
   */
  private loadConfiguration(): BankMuscatConfig {
    const env = functions.config();
    
    return {
      merchantId: env.bankmuscat?.mid || process.env.BANK_MUSCAT_MERCHANT_ID || '224',
      apiPassword: env.bankmuscat?.secret || process.env.BANK_MUSCAT_API_PASSWORD || '841FEAE32609C3E892C4D0B1393A7ACC',
      apiUsername: env.bankmuscat?.username || process.env.BANK_MUSCAT_API_USERNAME || 'merchant.224',
      baseUrl: env.bankmuscat?.baseurl || (
        process.env.BANK_MUSCAT_ENVIRONMENT === 'PROD' 
          ? 'https://smartpay.bankmuscat.com'
          : 'https://test-smartpay.bankmuscat.com'
      ) || 'https://test-smartpay.bankmuscat.com',
      apiVersion: env.bankmuscat?.version || process.env.BANK_MUSCAT_API_VERSION || '71',
      environment: (env.bankmuscat?.environment || process.env.BANK_MUSCAT_ENVIRONMENT || 'UAT') as 'UAT' | 'PROD',
      defaultCurrency: (env.bankmuscat?.currency || process.env.BANK_MUSCAT_DEFAULT_CURRENCY || 'OMR') as Currency,
      returnUrl: env.bankmuscat?.returnurl || process.env.BANK_MUSCAT_RETURN_URL || '',
      webhookUrl: env.bankmuscat?.webhookurl || process.env.BANK_MUSCAT_WEBHOOK_URL || '',
      webhookSecret: env.bankmuscat?.webhooksecret || process.env.BANK_MUSCAT_WEBHOOK_SECRET,
      hmacSecret: env.bankmuscat?.hmacsecret || process.env.BANK_MUSCAT_HMAC_SECRET,
      timeout: parseInt(env.bankmuscat?.timeout || process.env.BANK_MUSCAT_API_TIMEOUT || '30000')
    };
  }

  /**
   * Create axios instance with authentication
   */
  private createAxiosInstance(): AxiosInstance {
    const instance = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      auth: {
        username: this.config.apiUsername || `merchant.${this.config.merchantId}`,
        password: this.config.apiPassword
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Request interceptor for logging
    instance.interceptors.request.use(
      (config: any) => {
        this.logPaymentAction('api_request', {
          url: config.url,
          method: config.method?.toUpperCase(),
          baseURL: config.baseURL
        });
        return config;
      },
      (error: any) => {
        this.logPaymentError('api_request_error', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging
    instance.interceptors.response.use(
      (response: any) => {
        this.logPaymentAction('api_response', {
          status: response.status,
          result: response.data?.result
        });
        return response;
      },
      (error: any) => {
        this.logPaymentError('api_response_error', error, {
          status: error.response?.status,
          data: error.response?.data
        });
        return Promise.reject(error);
      }
    );

    return instance;
  }

  /**
   * Create a new order with Bank Muscat
   */
  async createOrder(orderData: {
    orderId: string;
    amount: number;
    currency?: Currency;
    description?: string;
  }): Promise<CreateOrderResponse> {
    try {
      const { orderId, amount, currency = this.config.defaultCurrency, description } = orderData;

      const payload = {
        amount: amount,
        currency: currency,
        id: orderId,
        ...(description && { description })
      };

      const url = `/api/rest/version/${this.config.apiVersion}/merchant/${this.config.merchantId}/order/${orderId}`;
      
      this.logPaymentAction('create_order', { orderId, amount, currency });

      const response: AxiosResponse<CreateOrderResponse> = await this.axiosInstance.put(url, payload);

      this.logPaymentAction('order_created', {
        orderId,
        result: response.data.result,
        timeOfRecord: response.data.timeOfRecord
      });

      return response.data;
    } catch (error) {
      this.logPaymentError('create_order_failed', error, { orderId: orderData.orderId });
      throw this.handleApiError(error);
    }
  }

  /**
   * Create a new session for hosted checkout
   */
  async createSession(orderId: string): Promise<CreateSessionResponse> {
    try {
      const payload = {
        order: {
          id: orderId
        }
      };

      const url = `/api/rest/version/${this.config.apiVersion}/merchant/${this.config.merchantId}/session`;
      
      this.logPaymentAction('create_session', { orderId });

      const response: AxiosResponse<CreateSessionResponse> = await this.axiosInstance.post(url, payload);

      this.logPaymentAction('session_created', {
        orderId,
        sessionId: response.data.session.id,
        result: response.data.result
      });

      return response.data;
    } catch (error) {
      this.logPaymentError('create_session_failed', error, { orderId });
      throw this.handleApiError(error);
    }
  }

  /**
   * Inquire payment status
   */
  async inquirePayment(orderId: string): Promise<PaymentInquiryResponse> {
    try {
      const url = `/api/rest/version/${this.config.apiVersion}/merchant/${this.config.merchantId}/order/${orderId}`;
      
      this.logPaymentAction('inquire_payment', { orderId });

      const response: AxiosResponse<PaymentInquiryResponse> = await this.axiosInstance.get(url);

      this.logPaymentAction('payment_inquiry_completed', {
        orderId,
        result: response.data.result,
        status: response.data.order.status,
        authorizedAmount: response.data.order.totalAuthorizedAmount,
        capturedAmount: response.data.order.totalCapturedAmount
      });

      return response.data;
    } catch (error) {
      this.logPaymentError('inquire_payment_failed', error, { orderId });
      throw this.handleApiError(error);
    }
  }

  /**
   * Create complete payment session (order + session)
   */
  async createPayment(request: CreatePaymentRequest): Promise<{
    order: CreateOrderResponse;
    session: CreateSessionResponse;
    redirectUrl: string;
    checkoutUrl: string;
  }> {
    try {
      const startTime = Date.now();
      
      this.logPaymentAction('create_payment_started', {
        orderId: request.orderId,
        amount: request.amount,
        currency: request.currency
      });

      // Step 1: Create Order
      const order = await this.createOrder({
        orderId: request.orderId,
        amount: request.amount,
        currency: request.currency,
        description: request.description
      });

      if (order.result !== 'SUCCESS') {
        throw new Error(`Order creation failed: ${order.result}`);
      }

      // Step 2: Create Session
      const session = await this.createSession(request.orderId);

      if (session.result !== 'SUCCESS') {
        throw new Error(`Session creation failed: ${session.result}`);
      }

      // Step 3: Generate URLs
      const redirectUrl = this.generateRedirectUrl(session.session.id, request.successUrl, request.failureUrl, request.cancelUrl);
      const checkoutUrl = this.generateCheckoutUrl(session.session.id);

      const duration = Date.now() - startTime;

      this.logPaymentAction('create_payment_completed', {
        orderId: request.orderId,
        sessionId: session.session.id,
        duration,
        redirectUrl,
        checkoutUrl
      });

      return {
        order,
        session,
        redirectUrl,
        checkoutUrl
      };
    } catch (error) {
      this.logPaymentError('create_payment_failed', error, {
        orderId: request.orderId,
        amount: request.amount
      });
      throw error;
    }
  }

  /**
   * Generate redirect URL for hosted checkout
   */
  private generateRedirectUrl(sessionId: string, successUrl?: string, failureUrl?: string, cancelUrl?: string): string {
    const params = new URLSearchParams();
    
    if (successUrl) params.append('successUrl', successUrl);
    if (failureUrl) params.append('failureUrl', failureUrl);  
    if (cancelUrl) params.append('cancelUrl', cancelUrl);
    params.append('returnUrl', this.config.returnUrl);

    const queryString = params.toString();
    
    return `${this.config.baseUrl}/checkout/payment/${this.config.merchantId}/${sessionId}${queryString ? '?' + queryString : ''}`;
  }

  /**
   * Generate checkout URL for embedded payments
   */
  private generateCheckoutUrl(sessionId: string): string {
    return `${this.config.baseUrl}/static/checkout/checkout.html?sessionId=${sessionId}&merchantId=${this.config.merchantId}`;
  }

  /**
   * Validate webhook signature (if HMAC is configured)
   */
  validateWebhookSignature(payload: string, signature: string): boolean {
    if (!this.config.hmacSecret) {
      logger.warn('HMAC secret not configured, skipping signature validation');
      return true;
    }

    try {
      const crypto = require('crypto');
      const computedSignature = crypto
        .createHmac('sha256', this.config.hmacSecret)
        .update(payload)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(computedSignature, 'hex')
      );
    } catch (error) {
      this.logPaymentError('webhook_signature_validation_failed', error);
      return false;
    }
  }

  /**
   * Handle API errors and convert to PaymentError
   */
  private handleApiError(error: any): PaymentError {
    if (error.response?.data) {
      const apiError = error.response.data as ApiErrorResponse;
      return {
        code: 'API_ERROR',
        message: apiError.error.explanation || 'Payment gateway error',
        details: apiError.error.cause,
        field: apiError.error.field,
        validationType: apiError.error.validationType
      };
    }

    if (error.code === 'ECONNABORTED') {
      return {
        code: 'TIMEOUT',
        message: 'Payment gateway request timeout',
        details: 'The request to the payment gateway timed out'
      };
    }

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return {
        code: 'CONNECTION_ERROR',
        message: 'Unable to connect to payment gateway',
        details: error.message
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'Unknown payment error occurred',
      details: error.stack
    };
  }

  /**
   * Log payment actions
   */
  private logPaymentAction(action: string, metadata: Record<string, any> = {}): void {
    const logEntry: PaymentLog = {
      timestamp: new Date().toISOString(),
      level: 'info',
      action,
      ...metadata
    };

    logger.info(`[BankMuscat] ${action}`, logEntry);
  }

  /**
   * Log payment errors
   */
  private logPaymentError(action: string, error: any, metadata: Record<string, any> = {}): void {
    const logEntry: PaymentLog = {
      timestamp: new Date().toISOString(),
      level: 'error',
      action,
      errorMessage: error.message || error.toString(),
      ...metadata
    };

    logger.error(`[BankMuscat] ${action}`, logEntry, error);
  }

  /**
   * Get service configuration (for debugging)
   */
  getConfig(): Partial<BankMuscatConfig> {
    return {
      merchantId: this.config.merchantId,
      baseUrl: this.config.baseUrl,
      apiVersion: this.config.apiVersion,
      environment: this.config.environment,
      defaultCurrency: this.config.defaultCurrency,
      returnUrl: this.config.returnUrl,
      webhookUrl: this.config.webhookUrl
    };
  }
}

// Singleton instance
export const bankMuscatService = new BankMuscatService();