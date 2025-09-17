# Bank Muscat Payment Gateway Testing Guide

این فایل راهنمای کاملی برای تست کردن Bank Muscat payment gateway است.

## فهرست

1. [پیش‌نیازها](#prerequisites)
2. [تست Scripts](#test-scripts)
3. [تست Frontend](#frontend-testing)
4. [Test Cards](#test-cards)
5. [Environment Setup](#environment-setup)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

قبل از شروع تست، مطمئن شوید که:

```bash
# Firebase CLI نصب باشد
npm install -g firebase-tools

# Login به Firebase
firebase login

# Dependencies نصب باشد
cd functions
npm install
```

## Test Scripts

### 1. Backend Testing (Node.js)

```bash
# تست کامل
cd functions
node test-bank-muscat.js

# تست‌های جداگانه
node test-bank-muscat.js create        # تست ایجاد پرداخت
node test-bank-muscat.js config        # تست configuration
node test-bank-muscat.js confirm ORDER_ID  # تست تایید پرداخت
node test-bank-muscat.js webhook ORDER_ID  # تست webhook
```

### 2. Firebase Emulator Testing

```bash
# شروع Firebase emulator
firebase emulators:start

# در terminal جدید، تست API endpoints
curl -X POST http://localhost:5001/your-project/us-central1/api/payments/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10.5,
    "currency": "OMR", 
    "orderId": "TEST_123",
    "customerEmail": "test@example.com"
  }'
```

### 3. Environment Testing

```bash
# بررسی environment variables
node -e "console.log('BANK_MUSCAT_MERCHANT_ID:', process.env.BANK_MUSCAT_MERCHANT_ID || 'NOT SET')"
```

## Frontend Testing

### 1. React Test Component

Test component را به App.tsx اضافه کنید:

```tsx
import BankMuscatTestPage from './components/payment/BankMuscatTestPage';

// در component اصلی
<BankMuscatTestPage />
```

### 2. Manual Testing Steps

1. **Environment Check**: بررسی تمام environment variables
2. **Form Validation**: تست validation logic
3. **Payment Creation**: ایجاد payment session
4. **Payment Flow**: باز کردن Bank Muscat payment page
5. **Status Check**: بررسی وضعیت پرداخت

## Test Cards

### Bank Muscat Test Cards

```
# موفقیت‌آمیز
Card Number: 5123456789012346
Expiry: 05/21
CVV: 100
Amount: Any

# ناموفق
Card Number: 5123456789012353  
Expiry: 05/21
CVV: 100
Amount: Any

# Insufficient Funds
Card Number: 5123456789012361
Expiry: 05/21
CVV: 100
Amount: Any
```

### Test Scenarios

```javascript
// Successful Payment
{
  cardNumber: "5123456789012346",
  expiryMonth: "05",
  expiryYear: "21", 
  cvv: "100"
}

// Declined Payment
{
  cardNumber: "5123456789012353",
  expiryMonth: "05", 
  expiryYear: "21",
  cvv: "100"
}
```

## Environment Setup

### Development (.env)

```env
# Bank Muscat Configuration
BANK_MUSCAT_MERCHANT_ID=224
BANK_MUSCAT_ACCESS_CODE=AVDP00LA16BE47PDEB
BANK_MUSCAT_WORKING_KEY=841FEAE32609C3E892C4D0B1393A7ACC
BANK_MUSCAT_API_URL=https://bankalhabib.gateway.mastercard.com/api/rest
BANK_MUSCAT_ENVIRONMENT=UAT

# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_API_KEY=your-api-key
```

### Production

```bash
# Firebase Functions config
firebase functions:config:set \
  bankmuscat.merchant_id="224" \
  bankmuscat.access_code="AVDP00LA16BE47PDEB" \
  bankmuscat.working_key="841FEAE32609C3E892C4D0B1393A7ACC"
```

## Testing Workflow

### 1. Local Development

```bash
# 1. شروع emulator
firebase emulators:start

# 2. تست backend
cd functions
node test-bank-muscat.js

# 3. تست frontend  
npm run dev
# برو به /test صفحه
```

### 2. Staging Testing

```bash
# 1. Deploy به staging
firebase deploy --only functions --project staging

# 2. تست production APIs
node test-bank-muscat.js # با staging URL
```

### 3. Production Testing

```bash
# 1. Deploy
firebase deploy --only functions --project production

# 2. تست با test cards
# از frontend payment form استفاده کنید
```

## Expected Results

### Successful Payment Flow

```
1. ✅ Payment creation successful
2. ✅ Redirect URL generated
3. ✅ User redirected to Bank Muscat
4. ✅ Payment completed with test card
5. ✅ Webhook received
6. ✅ Payment status updated
7. ✅ User redirected back to your site
```

### Payment Creation Response

```json
{
  "success": true,
  "data": {
    "orderId": "TEST_1234567890",
    "sessionId": "SESSION123456789",
    "redirectUrl": "https://bankalhabib.gateway.mastercard.com/checkout/pay/...",
    "checkoutUrl": "https://bankalhabib.gateway.mastercard.com/checkout/entry/...",
    "amount": 10.5,
    "currency": "OMR"
  }
}
```

### Webhook Payload

```json
{
  "orderId": "TEST_1234567890",
  "transactionId": "TXN_123456",
  "result": "SUCCESS",
  "amount": 10.5,
  "currency": "OMR",
  "authorizationCode": "AUTH123456",
  "receipt": "RECEIPT789",
  "responseCode": "00",
  "responseMessage": "Approved"
}
```

## Troubleshooting

### Common Issues

#### 1. Environment Variables Not Set

```bash
# Error: BANK_MUSCAT_MERCHANT_ID is not defined
# Solution:
firebase functions:config:set bankmuscat.merchant_id="224"
```

#### 2. CORS Errors

```javascript
// در functions/src/api/payments.ts
// CORS headers اضافه شده اند:
res.set('Access-Control-Allow-Origin', '*');
```

#### 3. Invalid Signature

```javascript
// بررسی working key در .env
BANK_MUSCAT_WORKING_KEY=841FEAE32609C3E892C4D0B1393A7ACC
```

#### 4. Network Timeout

```javascript
// Timeout افزایش دهید در axios config:
timeout: 30000 // 30 seconds
```

### Debug Steps

```bash
# 1. بررسی Firebase logs
firebase functions:log

# 2. بررسی emulator logs  
# در terminal که emulator اجرا شده

# 3. تست manual با curl
curl -X POST localhost:5001/api/payments/create \
  -H "Content-Type: application/json" \
  -d '{"amount":5,"currency":"OMR","orderId":"TEST"}'

# 4. بررسی network در browser DevTools
# F12 > Network tab
```

### Test Checklist

- [ ] Environment variables تنظیم شده
- [ ] Firebase emulator اجرا می‌شود
- [ ] Payment creation موفق است
- [ ] Redirect URL کار می‌کند  
- [ ] Test card payment موفق است
- [ ] Webhook دریافت می‌شود
- [ ] Status check کار می‌کند
- [ ] Error handling درست است
- [ ] Validation کار می‌کند
- [ ] CORS مشکلی ندارد

## Next Steps

بعد از تست موفق:

1. **Bank Muscat Portal Setup**: webhook URLs را در portal تنظیم کنید
2. **Production Deployment**: به production deploy کنید  
3. **Monitoring**: payment logs را monitor کنید
4. **User Testing**: با real users تست کنید
5. **Documentation**: برای team documentation ایجاد کنید

## Support

برای مشکلات Bank Muscat:
- Documentation: API docs در `functions/PAYMENT_API_DOCUMENTATION.md`
- Setup Guide: `BANK_MUSCAT_SETUP.md`
- Support: Bank Muscat technical support

برای مشکلات Firebase:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Support](https://firebase.google.com/support)