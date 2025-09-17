/**
 * TypeScript Types and Interfaces for Bank Muscat Payment Gateway
 * SmartPay / MPGS Integration
 */

// Base Types
export type Currency = 'OMR' | 'USD' | 'EUR' | 'SAR' | 'AED';
export type PaymentResult = 'SUCCESS' | 'FAILURE' | 'PENDING' | 'CANCELLED' | 'ERROR';
export type OrderStatus = 'CREATED' | 'CAPTURED' | 'AUTHORIZED' | 'FAILED' | 'CANCELLED';
export type TransactionType = 'PURCHASE' | 'AUTHORIZATION' | 'CAPTURE' | 'REFUND' | 'VOID';

// Configuration Interface
export interface BankMuscatConfig {
  merchantId: string;
  apiPassword: string;
  apiUsername: string;
  baseUrl: string;
  apiVersion: string;
  environment: 'UAT' | 'PROD';
  defaultCurrency: Currency;
  returnUrl: string;
  webhookUrl: string;
  webhookSecret?: string;
  hmacSecret?: string;
  timeout?: number;
}

// Payment Request Interfaces
export interface CreatePaymentRequest {
  amount: number;
  currency?: Currency;
  orderId: string;
  customerEmail?: string;
  customerPhone?: string;
  description?: string;
  metadata?: Record<string, any>;
  successUrl?: string;
  failureUrl?: string;
  cancelUrl?: string;
}

export interface OrderDetails {
  id: string;
  amount: number;
  currency: Currency;
  description?: string;
  reference?: string;
  totalAuthorizedAmount?: number;
  totalCapturedAmount?: number;
  totalRefundedAmount?: number;
  creationTime?: string;
  status?: OrderStatus;
}

export interface SessionDetails {
  id: string;
  updateStatus: string;
  version: string;
  order?: {
    id: string;
    amount: number;
    currency: Currency;
  };
}

// API Response Interfaces
export interface CreateOrderResponse {
  merchant: string;
  result: PaymentResult;
  order: OrderDetails;
  session?: SessionDetails;
  timeOfRecord: string;
  version: string;
}

export interface CreateSessionResponse {
  merchant: string;
  result: PaymentResult;
  session: SessionDetails;
  successIndicator?: string;
  timeOfRecord: string;
  version: string;
}

export interface PaymentInquiryResponse {
  merchant: string;
  result: PaymentResult;
  order: OrderDetails & {
    status: OrderStatus;
    totalAuthorizedAmount: number;
    totalCapturedAmount: number;
    totalRefundedAmount: number;
    creationTime: string;
  };
  transaction?: Array<{
    id: string;
    type: TransactionType;
    amount: number;
    currency: Currency;
    authorizationCode?: string;
    receipt?: string;
    timeOfRecord: string;
    result: PaymentResult;
  }>;
  timeOfRecord: string;
  version: string;
}

// Webhook Interfaces
export interface WebhookPayload {
  orderId: string;
  transactionId?: string;
  result: PaymentResult;
  amount?: number;
  currency?: Currency;
  timestamp: string;
  merchantId: string;
  sessionId?: string;
  authorizationCode?: string;
  receipt?: string;
  responseCode?: string;
  responseMessage?: string;
  signature?: string;
  [key: string]: any;
}

export interface WebhookResponse {
  success: boolean;
  message?: string;
  orderId?: string;
  processed?: boolean;
}

// Frontend Integration Types
export interface PaymentSessionData {
  sessionId: string;
  orderId: string;
  amount: number;
  currency: Currency;
  redirectUrl?: string;
  checkoutUrl?: string;
  successIndicator?: string;
}

export interface PaymentConfirmation {
  orderId: string;
  result: PaymentResult;
  transactionId?: string;
  amount: number;
  currency: Currency;
  authorizationCode?: string;
  receipt?: string;
  timestamp: string;
  customerMessage: string;
}

// Error Handling Types
export interface PaymentError {
  code: string;
  message: string;
  details?: string;
  cause?: string;
  field?: string;
  validationType?: string;
}

export interface ApiErrorResponse {
  error: {
    cause: string;
    explanation: string;
    field?: string;
    validationType?: string;
  };
  result: 'ERROR';
  timeOfRecord: string;
  version: string;
}

// Utility Types
export interface PaymentMetadata {
  customerInfo?: {
    email?: string;
    phone?: string;
    name?: string;
    address?: string;
  };
  orderInfo?: {
    description?: string;
    items?: Array<{
      name: string;
      price: number;
      quantity: number;
      sku?: string;
    }>;
  };
  customFields?: Record<string, string>;
}

export interface PaymentOptions {
  captureAmount?: number;
  partialCapture?: boolean;
  description?: string;
  receipt?: string;
  merchantCategoryCode?: string;
  merchantName?: string;
  merchantAddress?: {
    line1?: string;
    line2?: string;
    city?: string;
    postcodeZip?: string;
    country?: string;
  };
}

// Logging and Monitoring Types
export interface PaymentLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  action: string;
  orderId?: string;
  sessionId?: string;
  transactionId?: string;
  result?: PaymentResult;
  duration?: number;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

// Configuration Validation
export interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Export all types
export * from './payment.types';