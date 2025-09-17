/**
 * Utility Functions for Payment Gateway
 * Common helpers for validation, formatting, and processing
 */

import { logger } from 'firebase-functions';
import { Currency, PaymentError } from '../types/payment.types';

/**
 * Validation Utilities
 */
export class PaymentValidators {
  /**
   * Validate amount format and range
   */
  static validateAmount(amount: any): { isValid: boolean; error?: string; normalizedAmount?: number } {
    if (amount === null || amount === undefined) {
      return { isValid: false, error: 'Amount is required' };
    }

    const numAmount = Number(amount);
    
    if (isNaN(numAmount)) {
      return { isValid: false, error: 'Amount must be a valid number' };
    }

    if (numAmount <= 0) {
      return { isValid: false, error: 'Amount must be greater than zero' };
    }

    if (numAmount > 999999.99) {
      return { isValid: false, error: 'Amount exceeds maximum limit' };
    }

    // Round to 2 decimal places for currency
    const rounded = Math.round(numAmount * 100) / 100;
    
    return { isValid: true, normalizedAmount: rounded };
  }

  /**
   * Validate currency code
   */
  static validateCurrency(currency: string): { isValid: boolean; error?: string } {
    const validCurrencies: Currency[] = ['OMR', 'USD', 'EUR', 'SAR', 'AED'];
    
    if (!currency) {
      return { isValid: false, error: 'Currency is required' };
    }

    if (!validCurrencies.includes(currency.toUpperCase() as Currency)) {
      return { 
        isValid: false, 
        error: `Invalid currency. Supported currencies: ${validCurrencies.join(', ')}` 
      };
    }

    return { isValid: true };
  }

  /**
   * Validate order ID format
   */
  static validateOrderId(orderId: string): { isValid: boolean; error?: string; normalizedOrderId?: string } {
    if (!orderId || typeof orderId !== 'string') {
      return { isValid: false, error: 'Order ID is required and must be a string' };
    }

    const trimmed = orderId.trim();
    
    if (trimmed.length === 0) {
      return { isValid: false, error: 'Order ID cannot be empty' };
    }

    if (trimmed.length > 40) {
      return { isValid: false, error: 'Order ID cannot exceed 40 characters' };
    }

    // Check for valid characters (alphanumeric, hyphens, underscores)
    const validPattern = /^[a-zA-Z0-9_-]+$/;
    if (!validPattern.test(trimmed)) {
      return { 
        isValid: false, 
        error: 'Order ID can only contain letters, numbers, hyphens, and underscores' 
      };
    }

    return { isValid: true, normalizedOrderId: trimmed };
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): { isValid: boolean; error?: string } {
    if (!email || typeof email !== 'string') {
      return { isValid: false, error: 'Email must be a string' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email.trim())) {
      return { isValid: false, error: 'Invalid email format' };
    }

    return { isValid: true };
  }

  /**
   * Validate phone number format
   */
  static validatePhone(phone: string): { isValid: boolean; error?: string; normalizedPhone?: string } {
    if (!phone || typeof phone !== 'string') {
      return { isValid: false, error: 'Phone number must be a string' };
    }

    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length < 8 || cleaned.length > 15) {
      return { isValid: false, error: 'Phone number must be between 8 and 15 digits' };
    }

    return { isValid: true, normalizedPhone: cleaned };
  }
}

/**
 * Formatting Utilities
 */
export class PaymentFormatters {
  /**
   * Format amount for display
   */
  static formatAmount(amount: number, currency: Currency): string {
    const formatter = new Intl.NumberFormat('en-OM', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    return formatter.format(amount);
  }

  /**
   * Format amount for API (remove currency symbols, ensure decimal format)
   */
  static formatAmountForAPI(amount: number): string {
    return amount.toFixed(2);
  }

  /**
   * Generate unique order ID
   */
  static generateOrderId(prefix: string = 'ORDER'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}_${timestamp}_${random}`;
  }

  /**
   * Format date for display
   */
  static formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-OM', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Muscat'
      });
    } catch (error) {
      return dateString;
    }
  }

  /**
   * Mask sensitive data for logging
   */
  static maskSensitiveData(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const masked = { ...data };
    const sensitiveFields = [
      'password', 'secret', 'token', 'key', 'authorization',
      'cardNumber', 'cvv', 'pin', 'account', 'signature'
    ];

    for (const field of sensitiveFields) {
      if (masked[field]) {
        masked[field] = '***MASKED***';
      }
    }

    return masked;
  }
}

/**
 * Error Handling Utilities
 */
export class PaymentErrorHandler {
  /**
   * Create standardized payment error
   */
  static createPaymentError(
    code: string,
    message: string,
    details?: string,
    field?: string
  ): PaymentError {
    return {
      code,
      message,
      details,
      field
    };
  }

  /**
   * Handle and log payment errors
   */
  static handleError(error: any, context: string, metadata?: Record<string, any>): PaymentError {
    const sanitizedMetadata = PaymentFormatters.maskSensitiveData(metadata);
    
    logger.error(`Payment error in ${context}`, {
      error: error.message || error.toString(),
      stack: error.stack,
      metadata: sanitizedMetadata
    });

    // If it's already a PaymentError, return as-is
    if (error.code && error.message) {
      return error as PaymentError;
    }

    // Convert various error types to PaymentError
    if (error.response?.data) {
      return this.createPaymentError(
        'API_ERROR',
        error.response.data.message || 'Payment gateway error',
        error.response.data.details || error.message
      );
    }

    if (error.code === 'ECONNABORTED') {
      return this.createPaymentError(
        'TIMEOUT',
        'Payment request timeout',
        'The payment gateway did not respond within the expected time'
      );
    }

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return this.createPaymentError(
        'CONNECTION_ERROR',
        'Unable to connect to payment gateway',
        error.message
      );
    }

    return this.createPaymentError(
      'UNKNOWN_ERROR',
      'An unexpected error occurred',
      error.message || 'Unknown error'
    );
  }
}

/**
 * Security Utilities
 */
export class PaymentSecurity {
  /**
   * Generate secure random string
   */
  static generateSecureRandom(length: number = 32): string {
    const crypto = require('crypto');
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Create HMAC signature
   */
  static createHMACSignature(data: string, secret: string, algorithm: string = 'sha256'): string {
    const crypto = require('crypto');
    return crypto.createHmac(algorithm, secret).update(data).digest('hex');
  }

  /**
   * Verify HMAC signature
   */
  static verifyHMACSignature(
    data: string,
    signature: string,
    secret: string,
    algorithm: string = 'sha256'
  ): boolean {
    try {
      const crypto = require('crypto');
      const expectedSignature = crypto.createHmac(algorithm, secret).update(data).digest('hex');
      
      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
    } catch (error) {
      logger.error('HMAC verification failed', error);
      return false;
    }
  }

  /**
   * Sanitize input data
   */
  static sanitizeInput(input: any): any {
    if (typeof input === 'string') {
      return input.trim().replace(/[<>\"'&]/g, '');
    }

    if (typeof input === 'object' && input !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        sanitized[key] = this.sanitizeInput(value);
      }
      return sanitized;
    }

    return input;
  }
}

/**
 * Configuration Utilities
 */
export class PaymentConfig {
  /**
   * Validate payment gateway configuration
   */
  static validateConfig(config: any): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!config.merchantId) errors.push('BANK_MUSCAT_MERCHANT_ID is required');
    if (!config.apiPassword) errors.push('BANK_MUSCAT_API_PASSWORD is required');
    if (!config.baseUrl) errors.push('Base URL is required');

    // URL validations
    if (config.baseUrl && !this.isValidUrl(config.baseUrl)) {
      errors.push('Base URL format is invalid');
    }

    if (config.returnUrl && !this.isValidUrl(config.returnUrl)) {
      errors.push('Return URL format is invalid');
    }

    if (config.webhookUrl && !this.isValidUrl(config.webhookUrl)) {
      errors.push('Webhook URL format is invalid');
    }

    // Security warnings
    if (!config.webhookSecret) {
      warnings.push('Webhook secret not configured - webhooks will not be verified');
    }

    if (!config.hmacSecret) {
      warnings.push('HMAC secret not configured - signature verification disabled');
    }

    if (config.environment === 'PROD' && config.baseUrl.includes('test')) {
      warnings.push('Production environment configured but using test URL');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Check if URL is valid
   */
  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Retry Utilities
 */
export class PaymentRetry {
  /**
   * Retry function with exponential backoff
   */
  static async withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        logger.warn(`Attempt ${attempt} failed`, {
          error: (error as Error).message || 'Unknown error',
          attempt,
          maxRetries
        });

        if (attempt === maxRetries) {
          break;
        }

        // Exponential backoff: 1s, 2s, 4s, etc.
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  /**
   * Sleep utility
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Export all utilities
 */
export {
  PaymentValidators as Validators,
  PaymentFormatters as Formatters,
  PaymentErrorHandler as ErrorHandler,
  PaymentSecurity as Security,
  PaymentConfig as Config,
  PaymentRetry as Retry
};