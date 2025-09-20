# Aramex Integration Guide for SpiritHub Cafe / دليل تكامل أرامكس لـ SpiritHub Cafe

## Installation and Setup / التثبيت والإعداد

### 1. Initial Setup / الإعداد الأولي

1. **Enable Firebase Functions / تفعيل Firebase Functions:**
   ```bash
   cd functions
   npm install
   npm run build
   firebase deploy --only functions
   ```

2. **Add Aramex Settings in Dashboard / إضافة إعدادات أرامكس في لوحة التحكم:**
   - Go to Settings / اذهب إلى الإعدادات
   - Select "Aramex" tab / اختر تبويب "أرامكس"
   - Enter your Aramex account information / أدخل معلومات حساب أرامكس

### 2. Created Components / المكونات المُنشأة

#### Frontend (src/) / الواجهة الأمامية:
- `components/admin/aramex-settings.tsx` - Aramex settings in dashboard / إعدادات أرامكس في لوحة التحكم
- `components/admin/aramex-management.tsx` - Shipment management / إدارة الشحنات
- `components/shipping/aramex-shipping.tsx` - Shipping option in checkout / خيار الشحن في الدفع
- `components/cart/cart-weight-display.tsx` - Weight display in cart / عرض الوزن في السلة
- `services/aramex.ts` - Aramex client service / خدمة عميل أرامكس
- `hooks/useAramexShipping.ts` - Shipping management hook / hook إدارة الشحن
- `utils/weight-calculator.ts` - Advanced weight calculation utilities / أدوات حساب الوزن المتقدمة
- `types/aramex.ts` - Aramex types / أنواع أرامكس

#### Backend (functions/src/) / الخلفية:
- `api/aramex.ts` - Aramex Cloud Functions / Cloud Functions أرامكس
- `services/aramex.ts` - Server Aramex service / خدمة أرامكس الخادم
- `types/aramex.ts` - Server types / أنواع الخادم

### 3. Weight Management / إدارة الوزن

**Advanced Weight System using Product Properties / نظام الوزن المتقدم باستخدام خصائص المنتج:**

- Uses `size` property type for weight management / يستخدم نوع خاصية `size` لإدارة الوزن
- Supports multiple weight options per product / يدعم خيارات وزن متعددة لكل منتج
- Different pricing for each weight / تسعير مختلف لكل وزن
- Sale prices and discounts per weight option / أسعار التخفيض والخصومات لكل خيار وزن

**Usage Example / مثال على الاستخدام:**
```tsx
import { calculateCartItemWeight, getWeightDisplayString } from '@/utils/weight-calculator';

// Calculate weight for a cart item
const weight = calculateCartItemWeight(cartItem, product);

// Get display string for UI
const weightDisplay = getWeightDisplayString(cartItem, product, 'en'); // or 'ar'
```

### 4. Features / الميزات

#### For Store Manager / لمدير المتجر:
- ✅ Set Aramex account information / تعيين معلومات حساب أرامكس
- ✅ Test service connection / اختبار اتصال الخدمة
- ✅ View all shipments / عرض جميع الشحنات
- ✅ Print shipping labels / طباعة ملصقات الشحن
- ✅ Schedule pickups / جدولة الاستلام
- ✅ Track shipment status / تتبع حالة الشحنة

#### For Customer / للعميل:
- ✅ Automatic shipping cost calculation / حساب تكلفة الشحن تلقائياً
- ✅ Display estimated delivery time / عرض وقت التسليم المقدر
- ✅ Select Aramex as shipping method / اختيار أرامكس كطريقة شحن
- ✅ Track shipment with AWB code / تتبع الشحنة برمز AWB
- ✅ View cart weight breakdown / عرض تفصيل وزن السلة

### 5. Shipping Process / عملية الشحن

1. **Customer places order / العميل يضع الطلب:**
   - Shipping cost is calculated / يتم حساب تكلفة الشحن
   - Aramex shown as option / يظهر أرامكس كخيار

2. **After order confirmation / بعد تأكيد الطلب:**
   - Shipment created in Aramex system / يتم إنشاء الشحنة في نظام أرامكس
   - AWB number received / يتم استلام رقم AWB
   - Shipping label prepared / يتم إعداد ملصق الشحن

3. **Store manager / مدير المتجر:**
   - Prints the label / يطبع الملصق
   - Schedules pickup / يجدول الاستلام
   - Tracks the shipment / يتتبع الشحنة

### 6. Usage Examples / أمثلة على الاستخدام

#### Add to settings page / إضافة إلى صفحة الإعدادات:
```tsx
import { AramexSettingsComponent } from '@/components/admin/aramex-settings';

// In settings component
<AramexSettingsComponent />
```

#### Add to checkout / إضافة إلى الدفع:
```tsx
import { AramexShippingComponent } from '@/components/shipping/aramex-shipping';

// In checkout component
<AramexShippingComponent
  cartItems={cartItems}
  products={products}
  shippingAddress={shippingAddress}
  language="en" // or "ar"
  onRateCalculated={(rate, currency) => {
    setShippingCost({ amount: rate, currency });
  }}
  onError={(error) => {
    console.error('Aramex shipping error:', error);
  }}
/>
```

#### Add weight display to cart / إضافة عرض الوزن إلى السلة:
```tsx
import { CartWeightDisplay } from '@/components/cart/cart-weight-display';

// In cart component
<CartWeightDisplay
  cartItems={cartItems}
  products={products}
  language="en" // or "ar"
/>
```

#### Add to order management / إضافة إلى إدارة الطلبات:
```tsx
import { AramexManagementComponent } from '@/components/admin/aramex-management';

// For all shipments / لجميع الشحنات
<AramexManagementComponent />

// For specific order shipments / لشحنات طلب محدد
<AramexManagementComponent orderId="ORDER_ID" />
```

### 7. Test Environment Configuration / تكوين بيئة الاختبار

For Aramex test environment / لبيئة اختبار أرامكس:
- Environment: `test`
- WSDL URL: `https://ws.dev.aramex.net/shippingapi.v2/shipping/service_1_0.svc?wsdl`

For production environment / لبيئة الإنتاج:
- Environment: `production`
- WSDL URL: `https://ws.aramex.net/shippingapi.v2/shipping/service_1_0.svc?wsdl`

### 8. Security / الأمان

- All sensitive information (passwords, keys) stored in Firestore / جميع المعلومات الحساسة مخزنة في Firestore
- API communication only through Cloud Functions / الاتصال مع API فقط عبر Cloud Functions
- No account credentials exposed in frontend / لا تُعرض بيانات الحساب في الواجهة الأمامية

### 9. Troubleshooting / استكشاف الأخطاء وإصلاحها

#### Common Issues / المشاكل الشائعة:
1. **Connection Error / خطأ في الاتصال:** Check account credentials / تحقق من بيانات الحساب
2. **Rate Calculation Error / خطأ في حساب السعر:** Verify origin and destination addresses / تحقق من عناوين المنشأ والوجهة
3. **Shipment Creation Error / خطأ في إنشاء الشحنة:** Check package weight and dimensions / تحقق من وزن وأبعاد الطرد

#### Logs / السجلات:
```bash
# View Functions logs / عرض سجلات Functions
firebase functions:log

# Filter Aramex logs / فلترة سجلات أرامكس
firebase functions:log --only functions:calculateAramexRate,functions:createAramexShipment
```

### 10. Weight Property Setup / إعداد خاصية الوزن

**Product Property Configuration / تكوين خاصية المنتج:**
1. Create a property with type `size` / إنشاء خاصية من نوع `size`
2. Name it "Weight" or "وزن" / تسميتها "Weight" أو "وزن"
3. Add options like "250g", "500g", "1kg" / إضافة خيارات مثل "250g", "500g", "1kg"
4. Set different prices for each option / تعيين أسعار مختلفة لكل خيار

**Example Property Options / مثال على خيارات الخاصية:**
```json
{
  "value": "250g",
  "label": "250 grams",
  "label_ar": "250 جرام",
  "price_modifier_omr": 0,
  "price_modifier_usd": 0,
  "price_modifier_sar": 0
}
```

---

## Important Notes / ملاحظات مهمة

⚠️ **Priorities / الأولويات:**
1. Test in test environment first / اختبر في بيئة الاختبار أولاً
2. Keep account credentials secure / حافظ على أمان بيانات الحساب
3. Always handle errors properly / تعامل مع الأخطاء دائماً بشكل صحيح
4. Set appropriate logs for debugging / ضع سجلات مناسبة لتصحيح الأخطاء

✅ **Benefits of this Implementation / فوائد هذا التنفيذ:**
- Completely secure (no credential exposure) / آمن تماماً (لا كشف للبيانات)
- Highly scalable / قابل للتوسع بدرجة عالية
- Simple and user-friendly interface / واجهة بسيطة وسهلة الاستخدام
- Full multilingual support / دعم كامل متعدد اللغات
- Advanced error handling / تعامل متقدم مع الأخطاء
- Advanced weight management / إدارة متقدمة للوزن

This system is ready to use and covers all essential Aramex features! / هذا النظام جاهز للاستخدام ويغطي جميع ميزات أرامكس الأساسية!