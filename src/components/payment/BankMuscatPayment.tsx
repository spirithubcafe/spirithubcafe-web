/**
 * Bank Muscat Payment Integration - React Components
 * Example components for frontend integration
 */

import React, { useState, useEffect } from 'react';
import './BankMuscatPayment.css';

// Types for TypeScript projects
interface PaymentFormProps {
  amount: number;
  currency?: 'OMR' | 'USD' | 'EUR' | 'SAR' | 'AED';
  description?: string;
  customerEmail?: string;
  onSuccess?: (result: PaymentResult) => void;
  onError?: (error: PaymentError) => void;
  onCancel?: () => void;
}

interface PaymentResult {
  orderId: string;
  transactionId?: string;
  amount: number;
  currency: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  authorizationCode?: string;
  receipt?: string;
  timestamp: string;
  customerMessage?: string;
}

interface PaymentError {
  code: string;
  message: string;
  details?: string;
  field?: string;
}

interface CreatePaymentResponse {
  success: boolean;
  data?: {
    orderId: string;
    sessionId: string;
    amount: number;
    currency: string;
    redirectUrl: string;
    checkoutUrl: string;
  };
  error?: string;
  message?: string;
}

// 1. Basic Payment Form Component
export const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  currency = 'OMR',
  description = 'SpiritHub Cafe Purchase',
  customerEmail: initialEmail = '',
  onError,
  onCancel
}) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (phone && !/^[+]?[\d\s-()]{8,15}$/.test(phone)) {
      newErrors.phone = 'Invalid phone number format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          orderId,
          customerEmail: email,
          customerPhone: phone,
          description,
          metadata: {
            source: 'web_checkout',
            timestamp: new Date().toISOString()
          }
        }),
      });

      const data: CreatePaymentResponse = await response.json();

      if (data.success && data.data) {
        // Store order info in localStorage for return handling
        localStorage.setItem('spirithub_payment_pending', JSON.stringify({
          orderId: data.data.orderId,
          amount: data.data.amount,
          currency: data.data.currency,
          email,
          timestamp: new Date().toISOString()
        }));

        // Redirect to payment gateway
        window.location.href = data.data.redirectUrl;
      } else {
        onError?.({
          code: data.error || 'PAYMENT_CREATION_FAILED',
          message: data.message || 'Failed to create payment session'
        });
      }
    } catch (error: any) {
      onError?.({
        code: 'NETWORK_ERROR',
        message: 'Network error occurred. Please try again.',
        details: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-form">
      <div className="payment-form__header">
        <h3 className="payment-form__title">Complete Your Payment</h3>
        <div className="payment-form__amount">
          <span className="payment-form__currency">{currency}</span>
          <span className="payment-form__amount-value">{amount.toFixed(2)}</span>
        </div>
      </div>

      <div className="payment-form__form">
        <div className="payment-form__field">
          <label className="payment-form__label">Email Address *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`payment-form__input ${errors.email ? 'payment-form__input--error' : ''}`}
            placeholder="your.email@example.com"
            required
          />
          {errors.email && <span className="payment-form__error">{errors.email}</span>}
        </div>

        <div className="payment-form__field">
          <label className="payment-form__label">Phone Number (Optional)</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={`payment-form__input ${errors.phone ? 'payment-form__input--error' : ''}`}
            placeholder="+968 1234 5678"
          />
          {errors.phone && <span className="payment-form__error">{errors.phone}</span>}
        </div>

        <div className="payment-form__description">
          <strong>Description:</strong> {description}
        </div>
      </div>

      <div className="payment-form__actions">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="payment-form__cancel-button"
            disabled={loading}
          >
            Cancel
          </button>
        )}
        
        <button
          onClick={handlePayment}
          disabled={loading || !email.trim()}
          className="payment-form__pay-button"
        >
          {loading ? (
            <>
              <span className="payment-form__spinner"></span>
              Processing...
            </>
          ) : (
            `Pay ${amount.toFixed(2)} ${currency}`
          )}
        </button>
      </div>

      <div className="payment-form__footer">
        <p className="payment-form__security-note">
          🔒 Your payment is secured by Bank Muscat
        </p>
      </div>
    </div>
  );
};

// 2. Payment Status Component (for confirmation page)
export const PaymentStatus: React.FC<{
  orderId?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
}> = ({ orderId, onRetry, onGoHome }) => {
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'pending'>('loading');
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!orderId) {
        // Try to get orderId from URL or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const urlOrderId = urlParams.get('orderId');
        const pendingPayment = localStorage.getItem('spirithub_payment_pending');
        
        if (urlOrderId) {
          await fetchPaymentStatus(urlOrderId);
        } else if (pendingPayment) {
          const pending = JSON.parse(pendingPayment);
          await fetchPaymentStatus(pending.orderId);
        } else {
          setStatus('failed');
          setError('No payment information found');
        }
      } else {
        await fetchPaymentStatus(orderId);
      }
    };

    checkPaymentStatus();
  }, [orderId]);

  const fetchPaymentStatus = async (orderIdToCheck: string) => {
    try {
      const response = await fetch(
        `/api/payments/confirm?orderId=${orderIdToCheck}`,
        { headers: { 'Accept': 'application/json' } }
      );

      const data = await response.json();
      
      if (data.success && data.data) {
        setPaymentResult(data.data);
        
        if (data.data.result === 'SUCCESS') {
          setStatus('success');
          // Clear pending payment
          localStorage.removeItem('spirithub_payment_pending');
        } else if (data.data.result === 'PENDING') {
          setStatus('pending');
        } else {
          setStatus('failed');
        }
      } else {
        setStatus('failed');
        setError('Unable to verify payment status');
      }
    } catch (err: any) {
      setStatus('failed');
      setError(err.message || 'Network error occurred');
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success': return '✅';
      case 'failed': return '❌';
      case 'pending': return '⏳';
      default: return '⏳';
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'success': return 'Payment Successful!';
      case 'failed': return 'Payment Failed';
      case 'pending': return 'Payment Pending';
      default: return 'Checking Payment Status...';
    }
  };

  const getStatusMessage = () => {
    if (paymentResult?.customerMessage) {
      return paymentResult.customerMessage;
    }
    
    switch (status) {
      case 'success': return 'Thank you for your purchase! Your order has been confirmed.';
      case 'failed': return error || 'Your payment could not be processed. Please try again.';
      case 'pending': return 'Your payment is being processed. Please wait for confirmation.';
      default: return 'Please wait while we verify your payment...';
    }
  };

  return (
    <div className="payment-status">
      <div className="payment-status__card">
        <div className="payment-status__icon">
          {status === 'loading' ? <div className="payment-status__spinner"></div> : getStatusIcon()}
        </div>
        
        <h2 className={`payment-status__title payment-status__title--${status}`}>
          {getStatusTitle()}
        </h2>
        
        <p className="payment-status__message">
          {getStatusMessage()}
        </p>

        {paymentResult && (
          <div className="payment-status__details">
            <div className="payment-status__detail-row">
              <span className="payment-status__detail-label">Order ID:</span>
              <span className="payment-status__detail-value">{paymentResult.orderId}</span>
            </div>
            <div className="payment-status__detail-row">
              <span className="payment-status__detail-label">Amount:</span>
              <span className="payment-status__detail-value">{paymentResult.amount} {paymentResult.currency}</span>
            </div>
            {paymentResult.transactionId && (
              <div className="payment-status__detail-row">
                <span className="payment-status__detail-label">Transaction ID:</span>
                <span className="payment-status__detail-value">{paymentResult.transactionId}</span>
              </div>
            )}
            {paymentResult.authorizationCode && (
              <div className="payment-status__detail-row">
                <span className="payment-status__detail-label">Authorization:</span>
                <span className="payment-status__detail-value">{paymentResult.authorizationCode}</span>
              </div>
            )}
            <div className="payment-status__detail-row">
              <span className="payment-status__detail-label">Date & Time:</span>
              <span className="payment-status__detail-value">{new Date(paymentResult.timestamp).toLocaleString()}</span>
            </div>
          </div>
        )}

        <div className="payment-status__actions">
          {status === 'failed' && onRetry && (
            <button onClick={onRetry} className="payment-status__retry-button">
              Try Again
            </button>
          )}
          
          <button onClick={onGoHome || (() => window.location.href = '/')} className="payment-status__home-button">
            {status === 'success' ? 'Continue Shopping' : 'Return to Home'}
          </button>
        </div>
      </div>
    </div>
  );
};

// 3. Payment Hook for React apps
export const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<PaymentError | null>(null);

  const createPayment = async (paymentData: {
    amount: number;
    currency?: string;
    orderId?: string;
    customerEmail?: string;
    customerPhone?: string;
    description?: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const orderId = paymentData.orderId || 
        `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...paymentData,
          orderId,
          currency: paymentData.currency || 'OMR'
        })
      });

      const result: CreatePaymentResponse = await response.json();

      if (result.success && result.data) {
        return result.data;
      } else {
        throw new Error(result.message || 'Payment creation failed');
      }
    } catch (err: any) {
      const paymentError: PaymentError = {
        code: 'PAYMENT_CREATION_FAILED',
        message: err.message || 'Failed to create payment',
        details: err.toString()
      };
      setError(paymentError);
      throw paymentError;
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async (orderId: string) => {
    try {
      const response = await fetch(
        `/api/payments/confirm?orderId=${orderId}`,
        { headers: { 'Accept': 'application/json' } }
      );

      const result = await response.json();
      
      if (result.success) {
        return result.data as PaymentResult;
      } else {
        throw new Error('Unable to check payment status');
      }
    } catch (err: any) {
      throw new Error(err.message || 'Failed to check payment status');
    }
  };

  return {
    createPayment,
    checkPaymentStatus,
    loading,
    error,
    clearError: () => setError(null)
  };
};