# 🏦 Bank Muscat Payment Gateway - SpiritHub Cafe

## 📋 اطلاعات Merchant

- **Merchant ID**: `224`
- **Access Code**: `AVDP00LA16BE47PDEB`
- **Working Key**: `841FEAE32609C3E892C4D0B1393A7ACC`

## 🚀 راه‌اندازی سریع

### Windows:
```bash
setup-bank-muscat.bat
```

### Linux/Mac:
```bash
chmod +x setup-bank-muscat.sh
./setup-bank-muscat.sh
```

### دستی:
```bash
# 1. نصب dependencies
npm install axios

# 2. کپی تنظیمات
cp .env.example .env

# 3. Build
npm run build

# 4. Deploy
firebase deploy --only functions
```

## 🔧 تنظیمات محیط

### محیط تست (UAT):
- **Base URL**: `https://test-smartpay.bankmuscat.com`
- **Environment**: `UAT`

### محیط تولید (Production):
- **Base URL**: `https://smartpay.bankmuscat.com`
- **Environment**: `PROD`

## 📡 API Endpoints

### Firebase Functions:
- `POST /api/payments/create` - ایجاد پرداخت
- `POST /api/payments/webhook` - دریافت نتایج
- `GET /api/payments/confirm` - تایید پرداخت

### URLs که در پورتال Bank Muscat ثبت کنید:
- **Webhook URL**: `https://yourdomain.com/api/payments/webhook`
- **Return URL**: `https://yourdomain.com/api/payments/confirm`

## 💳 کارت‌های تست

برای محیط UAT از کارت‌های تست Bank Muscat استفاده کنید:

```
# کارت موفق
Card Number: 5123450000000008
Expiry: 05/25
CVV: 100

# کارت ناموفق
Card Number: 5123450000000016
Expiry: 05/25
CVV: 200
```

## 🔒 امنیت

- همه credentials در environment variables ذخیره شده
- HMAC signature validation پیاده‌سازی شده
- Input validation کامل
- HTTPS الزامی

## 📱 Frontend Integration

```jsx
import { PaymentForm } from './components/payment/BankMuscatPayment';

<PaymentForm 
  amount={25.50}
  currency="OMR"
  customerEmail="customer@example.com"
  description="Coffee purchase"
/>
```

## 🧪 تست

```javascript
// نمونه تست API
const response = await fetch('/api/payments/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 10.50,
    currency: 'OMR',
    orderId: 'ORDER_' + Date.now(),
    customerEmail: 'test@example.com'
  })
});
```

## 🐛 عیب‌یابی

### مشکلات رایج:

1. **"Merchant not found"**
   - Merchant ID را بررسی کنید
   - Environment (UAT/PROD) را بررسی کنید

2. **"Invalid signature"**
   - Working Key را بررسی کنید
   - Username format: `merchant.224`

3. **"Webhook not receiving"**
   - URL accessible از اینترنت باشد
   - HTTPS فعال باشد
   - در پورتال بانک ثبت شده باشد

### Logs:
```bash
firebase functions:log
```

## 🔄 مراحل Production

1. ✅ تست کامل در محیط UAT
2. ✅ تغییر environment به PROD در `.env`
3. ✅ تغییر base URL به production
4. ✅ Deploy مجدد functions
5. ✅ تست در محیط production
6. ✅ Monitoring و alerting

## 📞 پشتیبانی

- **Bank Muscat Technical Support**: [شماره تماس]
- **SpiritHub Cafe Dev Team**: [تماس داخلی]
- **Documentation**: `PAYMENT_API_DOCUMENTATION.md`

## 📊 Monitoring

```bash
# View logs
firebase functions:log --filter="BankMuscat"

# Performance monitoring
firebase performance:report
```

---

**✨ آماده پذیرش پرداخت‌های Bank Muscat! ☕**

*آخرین به‌روزرسانی: ${new Date().toLocaleDateString('fa-IR')}*