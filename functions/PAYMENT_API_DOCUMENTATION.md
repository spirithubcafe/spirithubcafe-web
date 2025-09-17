# Bank Muscat Payment Gateway API Documentation
## Firebase Functions Integration Guide

This documentation provides comprehensive information about integrating Bank Muscat's SmartPay/MPGS payment gateway with Firebase Functions.

## Table of Contents
- [Setup & Configuration](#setup--configuration)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Request/Response Examples](#requestresponse-examples)
- [Frontend Integration](#frontend-integration)
- [Error Handling](#error-handling)
- [Security Considerations](#security-considerations)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## Setup & Configuration

### 1. Firebase Functions Setup

```bash
# Install dependencies
cd functions
npm install axios

# Configure Firebase Functions environment variables
firebase functions:config:set bankmuscat.mid="YOUR_MERCHANT_ID"
firebase functions:config:set bankmuscat.secret="YOUR_API_PASSWORD"
firebase functions:config:set bankmuscat.baseurl="https://test-gateway.mastercard.com"
firebase functions:config:set bankmuscat.returnurl="https://yourdomain.com/api/payments/confirm"
firebase functions:config:set bankmuscat.webhookurl="https://yourdomain.com/api/payments/webhook"

# Deploy functions
firebase deploy --only functions
```

### 2. Bank Muscat Portal Configuration

1. Log into your Bank Muscat merchant portal
2. Configure webhook URL: `https://yourdomain.com/api/payments/webhook`
3. Configure return URL: `https://yourdomain.com/api/payments/confirm`
4. Enable required currencies (OMR, USD, EUR, SAR, AED)
5. Set up IP allowlisting (if required)

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Bank Muscat Configuration
BANK_MUSCAT_MERCHANT_ID=your_merchant_id_here
BANK_MUSCAT_API_PASSWORD=your_api_password_here
BANK_MUSCAT_API_USERNAME=merchant.your_merchant_id_here

# Environment URLs
BANK_MUSCAT_BASE_URL_UAT=https://test-gateway.mastercard.com
BANK_MUSCAT_BASE_URL_PROD=https://gateway.mastercard.com

# Environment Setting
BANK_MUSCAT_ENVIRONMENT=UAT  # or PROD

# URLs
BANK_MUSCAT_RETURN_URL=https://yourdomain.com/api/payments/confirm
BANK_MUSCAT_WEBHOOK_URL=https://yourdomain.com/api/payments/webhook

# Security
BANK_MUSCAT_WEBHOOK_SECRET=your_webhook_secret_key_here
BANK_MUSCAT_HMAC_SECRET=your_hmac_secret_key_here
```

## API Endpoints

### 1. Create Payment - `POST /api/payments/create`

Creates a new payment session with Bank Muscat.

**Request:**
```typescript
interface CreatePaymentRequest {
  amount: number;              // Required: Payment amount
  currency?: string;           // Optional: Default "OMR"
  orderId: string;            // Required: Unique order identifier
  customerEmail?: string;     // Optional: Customer email
  customerPhone?: string;     // Optional: Customer phone
  description?: string;       // Optional: Payment description
  metadata?: object;          // Optional: Additional data
  successUrl?: string;        // Optional: Custom success URL
  failureUrl?: string;        // Optional: Custom failure URL
  cancelUrl?: string;         // Optional: Custom cancel URL
}
```

**Response:**
```typescript
{
  "success": true,
  "data": {
    "orderId": "ORDER_1726587445123_A7B9C2",
    "sessionId": "SESSION_0000123456789ABC",
    "amount": 25.50,
    "currency": "OMR",
    "redirectUrl": "https://test-gateway.mastercard.com/checkout/payment/MERCHANT123/SESSION_0000123456789ABC",
    "checkoutUrl": "https://test-gateway.mastercard.com/static/checkout/checkout.html?sessionId=SESSION_0000123456789ABC&merchantId=MERCHANT123",
    "order": {
      "id": "ORDER_1726587445123_A7B9C2",
      "status": "CREATED",
      "creationTime": "2024-09-17T12:30:45.123Z"
    },
    "session": {
      "id": "SESSION_0000123456789ABC",
      "updateStatus": "SUCCESS",
      "version": "71"
    }
  },
  "message": "Payment session created successfully"
}
```

### 2. Payment Webhook - `POST /api/payments/webhook`

Receives payment notifications from Bank Muscat (server-to-server).

**Headers:**
```
Content-Type: application/json
X-Signature: hmac_sha256_signature (if HMAC configured)
```

**Request Body:**
```typescript
{
  "orderId": "ORDER_1726587445123_A7B9C2",
  "transactionId": "TXN_987654321",
  "result": "SUCCESS",
  "amount": 25.50,
  "currency": "OMR",
  "timestamp": "2024-09-17T12:35:22.456Z",
  "merchantId": "MERCHANT123",
  "sessionId": "SESSION_0000123456789ABC",
  "authorizationCode": "AUTH123456",
  "receipt": "RECEIPT789",
  "responseCode": "00",
  "responseMessage": "Approved"
}
```

**Response:**
```typescript
{
  "success": true,
  "message": "Webhook processed successfully",
  "orderId": "ORDER_1726587445123_A7B9C2",
  "processed": true
}
```

### 3. Payment Confirmation - `GET /api/payments/confirm`

Handles user return after payment and displays confirmation page.

**Query Parameters:**
- `orderId` (required): Order identifier
- `sessionId` (optional): Session identifier
- `result` (optional): Preliminary result from gateway

**HTML Response:**
Returns a styled HTML confirmation page with payment details.

**JSON Response** (if `Accept: application/json`):
```typescript
{
  "success": true,
  "data": {
    "orderId": "ORDER_1726587445123_A7B9C2",
    "result": "SUCCESS",
    "transactionId": "TXN_987654321",
    "amount": 25.50,
    "currency": "OMR",
    "authorizationCode": "AUTH123456",
    "receipt": "RECEIPT789",
    "timestamp": "2024-09-17T12:35:22.456Z",
    "customerMessage": "Your payment has been processed successfully. Thank you for your purchase!"
  }
}
```

## Request/Response Examples

### Creating a Payment (JavaScript)

```javascript
// Frontend - Create payment
async function createPayment() {
  const response = await fetch('/api/payments/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount: 25.50,
      currency: 'OMR',
      orderId: 'ORDER_' + Date.now(),
      customerEmail: 'customer@example.com',
      description: 'Coffee and pastries'
    })
  });

  const data = await response.json();
  
  if (data.success) {
    // Redirect to payment gateway
    window.location.href = data.data.redirectUrl;
  } else {
    console.error('Payment creation failed:', data.message);
  }
}
```

### Using Hosted Checkout SDK (Alternative)

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://test-gateway.mastercard.com/static/checkout/checkout.min.js"></script>
</head>
<body>
    <script>
        async function payWithCard() {
            // Create payment session
            const response = await fetch('/api/payments/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: 25.50,
                    currency: 'OMR',
                    orderId: 'ORDER_' + Date.now()
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Initialize hosted checkout
                Checkout.configure({
                    merchant: 'MERCHANT123',
                    session: {
                        id: data.data.sessionId
                    },
                    interaction: {
                        operation: 'PURCHASE',
                        merchant: {
                            name: 'SpiritHub Cafe',
                            address: {
                                line1: 'Your Address',
                                line2: 'Muscat, Oman'
                            }
                        }
                    }
                });
                
                Checkout.showPaymentPage();
            }
        }
    </script>
    
    <button onclick="payWithCard()">Pay with Card</button>
</body>
</html>
```

## Frontend Integration

### React Component Example

```tsx
import React, { useState } from 'react';

interface PaymentFormProps {
  amount: number;
  currency?: string;
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  currency = 'OMR',
  onSuccess,
  onError
}) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      
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
          description: 'SpiritHub Cafe Purchase'
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to payment gateway
        window.location.href = data.data.redirectUrl;
      } else {
        onError?.(data);
      }
    } catch (error) {
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-form">
      <h3>Complete Your Payment</h3>
      <p>Amount: {amount} {currency}</p>
      
      <div>
        <label>Email Address:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <button 
        onClick={handlePayment}
        disabled={loading || !email}
        className="pay-button"
      >
        {loading ? 'Processing...' : `Pay ${amount} ${currency}`}
      </button>
    </div>
  );
};
```

## Error Handling

### Common Error Responses

```typescript
// Validation Error
{
  "success": false,
  "error": "INVALID_AMOUNT",
  "message": "Amount must be a positive number",
  "field": "amount"
}

// Gateway Error
{
  "success": false,
  "error": "API_ERROR",
  "message": "Payment gateway error",
  "details": "Invalid merchant configuration"
}

// Network Error
{
  "success": false,
  "error": "CONNECTION_ERROR",
  "message": "Unable to connect to payment gateway",
  "details": "Request timeout"
}
```

### Error Handling in Frontend

```javascript
async function handlePaymentError(error) {
  console.error('Payment error:', error);
  
  switch (error.error) {
    case 'INVALID_AMOUNT':
      alert('Please enter a valid amount');
      break;
    case 'CONNECTION_ERROR':
      alert('Network error. Please check your connection and try again.');
      break;
    case 'API_ERROR':
      alert('Payment service temporarily unavailable. Please try again later.');
      break;
    default:
      alert('An unexpected error occurred. Please contact support.');
  }
}
```

## Security Considerations

### 1. Environment Variables
- Never expose sensitive credentials in frontend code
- Use Firebase Functions config or environment variables
- Rotate API credentials regularly

### 2. HMAC Signature Verification
```javascript
// Webhook signature verification is automatically handled
// Configure BANK_MUSCAT_HMAC_SECRET for additional security
```

### 3. HTTPS Requirements
- All endpoints must use HTTPS in production
- Bank Muscat requires SSL certificates for webhooks
- Implement proper CORS headers

### 4. Input Validation
- All payment amounts are validated server-side
- Order IDs are sanitized and checked for uniqueness
- Email addresses are validated before processing

## Testing

### 1. UAT Environment
```bash
# Use test credentials provided by Bank Muscat
BANK_MUSCAT_ENVIRONMENT=UAT
BANK_MUSCAT_BASE_URL_UAT=https://test-gateway.mastercard.com
```

### 2. Test Cards (Bank Muscat UAT)
```
# Successful Payment
Card Number: 5123450000000008
Expiry: 05/25
CVV: 100

# Failed Payment
Card Number: 5123450000000016
Expiry: 05/25
CVV: 200
```

### 3. Testing Webhooks
```bash
# Use ngrok for local testing
ngrok http 5001
# Update webhook URL in Bank Muscat portal to ngrok URL
```

## Troubleshooting

### Common Issues

#### 1. "Merchant not found" Error
```
Solution: Verify BANK_MUSCAT_MERCHANT_ID is correct
Check: Ensure environment (UAT/PROD) matches merchant configuration
```

#### 2. "Invalid signature" Error
```
Solution: Check BANK_MUSCAT_API_PASSWORD
Verify: API username format is "merchant.{MERCHANT_ID}"
```

#### 3. Webhook Not Receiving
```
Check: Webhook URL is accessible from internet
Verify: HTTPS is enabled
Confirm: URL is registered in Bank Muscat portal
```

#### 4. CORS Issues
```
Solution: Ensure proper CORS headers in functions
Check: Origin whitelist in Firebase hosting
```

### Debug Mode

Enable detailed logging:
```javascript
// Set log level to debug in environment
BANK_MUSCAT_LOG_LEVEL=debug
```

### Support Contacts

- **Bank Muscat Technical Support**: [Contact Information]
- **MPGS Documentation**: https://test-gateway.mastercard.com/api/documentation
- **Firebase Functions Support**: https://firebase.google.com/support

---

## Production Deployment Checklist

- [ ] Update environment variables to production values
- [ ] Change `BANK_MUSCAT_ENVIRONMENT` to `PROD`
- [ ] Update base URL to production gateway
- [ ] Configure production webhook and return URLs
- [ ] Test all payment flows in production
- [ ] Set up monitoring and alerting
- [ ] Implement proper error logging
- [ ] Configure IP allowlisting (if required)
- [ ] Review and test security configurations
- [ ] Document production deployment process

---

*This documentation is maintained by the SpiritHub Cafe development team. Last updated: September 2024*