import { getPropertyPrice } from '@/utils/propertyUtils'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle, ShoppingCart, CreditCard, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useCart } from '@/hooks/useCart'
import { useCurrency } from '@/hooks/useCurrency'
import { useTranslation } from 'react-i18next'
import { useScrollToTopOnRouteChange } from '@/hooks/useSmoothScrollToTop'
import { useAuth } from '@/hooks/useAuth'
import { conversionRates } from '@/lib/currency'
import { firestoreService, type Order, type OrderItem } from '@/lib/firebase'
import toast from 'react-hot-toast'

export default function CheckoutPage() {
  useScrollToTopOnRouteChange()
  const { i18n } = useTranslation()
  const { cart, clearCart, getTotalPrice } = useCart()
  const { formatPrice, currency } = useCurrency()
  const { currentUser } = useAuth()

  const [orderSuccess, setOrderSuccess] = useState(false)
  const [orderLoading, setOrderLoading] = useState(false)
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null)

  const isArabic = i18n.language === 'ar'

  // Helper function to get product price in current currency with properties
  const getProductPrice = (product: any, selectedProperties?: Record<string, string>): number => {
    let basePrice = product.price_omr || 0
    
    // Apply property-based price modifications
    if (product.properties && selectedProperties && Object.keys(selectedProperties).length > 0) {
      for (const [propertyName, selectedValue] of Object.entries(selectedProperties)) {
        const property = product.properties.find((p: any) => p.name === propertyName)
        if (property && property.affects_price) {
          const option = property.options.find((opt: any) => opt.value === selectedValue)
          if (option?.price_modifier_omr || option?.price_modifier) {
            basePrice += getPropertyPrice(option)
          }
        }
      }
    }
    
    if (product.sale_price_omr && product.sale_price_omr < (product.price_omr || 0)) {
      basePrice = product.sale_price_omr
    }
    return basePrice * conversionRates[currency]
  }

  const [formData, setFormData] = useState({
    // Personal Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Address
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    
    // Payment
    paymentMethod: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    
    // Order Notes
    notes: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const calculateTotals = () => {
    const subtotal = getTotalPrice()
    const shippingCost = 5
    const taxAmount = subtotal * 0.1
    const total = subtotal + shippingCost + taxAmount
    
    return {
      subtotal,
      shipping: shippingCost,
      tax: taxAmount,
      total
    }
  }

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      toast.error(isArabic ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields')
      return
    }

    if (!formData.address || !formData.city || !formData.country) {
      toast.error(isArabic ? 'يرجى ملء معلومات التوصيل' : 'Please fill shipping information')
      return
    }

    if (!cart?.items || cart.items.length === 0) {
      toast.error(isArabic ? 'سلة التسوق فارغة' : 'Cart is empty')
      return
    }

    try {
      setOrderLoading(true)
      
      const totals = calculateTotals()
      
      // Generate order number
      const orderNumber = `ORD-${Date.now()}`
      
      // Create order data
      const orderData: Omit<Order, 'id' | 'created' | 'updated'> = {
        order_number: orderNumber,
        user_id: currentUser?.id,
        customer_email: formData.email,
        customer_phone: formData.phone,
        customer_name: `${formData.firstName} ${formData.lastName}`,
        
        // Address data (we'll create proper address records later)
        shipping_address: {
          recipient_name: `${formData.firstName} ${formData.lastName}`,
          phone: formData.phone,
          country: formData.country,
          city: formData.city,
          state: formData.state,
          postal_code: formData.zipCode,
          full_address: formData.address
        },
        
        // Pricing in all currencies
        subtotal_omr: currency === 'OMR' ? totals.subtotal : totals.subtotal / conversionRates.OMR,
        subtotal_usd: currency === 'USD' ? totals.subtotal : totals.subtotal / conversionRates.USD,
        subtotal_sar: currency === 'SAR' ? totals.subtotal : totals.subtotal / conversionRates.SAR,
        
        shipping_cost_omr: currency === 'OMR' ? totals.shipping : totals.shipping / conversionRates.OMR,
        shipping_cost_usd: currency === 'USD' ? totals.shipping : totals.shipping / conversionRates.USD,
        shipping_cost_sar: currency === 'SAR' ? totals.shipping : totals.shipping / conversionRates.SAR,
        
        tax_amount_omr: currency === 'OMR' ? totals.tax : totals.tax / conversionRates.OMR,
        tax_amount_usd: currency === 'USD' ? totals.tax : totals.tax / conversionRates.USD,
        tax_amount_sar: currency === 'SAR' ? totals.tax : totals.tax / conversionRates.SAR,
        
        discount_amount_omr: 0,
        discount_amount_usd: 0,
        discount_amount_sar: 0,
        
        total_price_omr: currency === 'OMR' ? totals.total : totals.total / conversionRates.OMR,
        total_price_usd: currency === 'USD' ? totals.total : totals.total / conversionRates.USD,
        total_price_sar: currency === 'SAR' ? totals.total : totals.total / conversionRates.SAR,
        
        currency: currency as 'USD' | 'OMR' | 'SAR',
        status: 'pending',
        payment_status: formData.paymentMethod === 'cash' ? 'unpaid' : 'paid',
        payment_method: formData.paymentMethod as 'card' | 'cash' | 'paypal' | 'bank_transfer',
        notes: formData.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Create the order
      const order = await firestoreService.orders.create(orderData)
      
      // Create order items
      for (const cartItem of cart.items) {
        if (!cartItem.product) continue
        
        const itemPrice = getProductPrice(cartItem.product, cartItem.selectedProperties)
        const itemTotal = itemPrice * cartItem.quantity
        
        const orderItemData: Omit<OrderItem, 'id' | 'created' | 'updated'> = {
          order_id: order.id,
          product_id: cartItem.product.id,
          product_name: cartItem.product.name,
          product_name_ar: cartItem.product.name_ar || '',
          product_image: cartItem.product.image || '',
          quantity: cartItem.quantity,
          unit_price_omr: currency === 'OMR' ? itemPrice : itemPrice / conversionRates.OMR,
          unit_price_usd: currency === 'USD' ? itemPrice : itemPrice / conversionRates.USD,
          unit_price_sar: currency === 'SAR' ? itemPrice : itemPrice / conversionRates.SAR,
          total_price_omr: currency === 'OMR' ? itemTotal : itemTotal / conversionRates.OMR,
          total_price_usd: currency === 'USD' ? itemTotal : itemTotal / conversionRates.USD,
          total_price_sar: currency === 'SAR' ? itemTotal : itemTotal / conversionRates.SAR,
          selected_properties: cartItem.selectedProperties || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        await firestoreService.orderItems.create(orderItemData)
      }
      
      // Clear cart and show success
      setCreatedOrderId(order.id)
      setOrderSuccess(true)
      clearCart()
      
      toast.success(isArabic ? 'تم إنشاء الطلب بنجاح!' : 'Order created successfully!')
      
    } catch (error) {
      console.error('Error creating order:', error)
      toast.error(isArabic ? 'حدث خطأ أثناء إنشاء الطلب' : 'Error creating order')
    } finally {
      setOrderLoading(false)
    }
  }

  if (!cart || !cart.items || cart.items.length === 0 && !orderSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto" />
              <h1 className="text-2xl font-bold">
                {isArabic ? 'سلة التسوق فارغة' : 'Your cart is empty'}
              </h1>
              <p className="text-muted-foreground">
                {isArabic ? 'أضف بعض المنتجات للبدء' : 'Add some products to get started'}
              </p>
              <Button asChild>
                <Link to="/shop">
                  {isArabic ? 'تسوق الآن' : 'Shop Now'}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h1 className="text-3xl font-bold text-green-600">
                {isArabic ? 'تم الطلب بنجاح!' : 'Order Successful!'}
              </h1>
              {createdOrderId && (
                <p className="text-lg font-medium">
                  {isArabic ? `رقم الطلب: ${createdOrderId}` : `Order ID: ${createdOrderId}`}
                </p>
              )}
              <p className="text-muted-foreground">
                {isArabic ? 'شكراً لك! سيتم التواصل معك قريباً.' : 'Thank you! We will contact you soon.'}
              </p>
              <div className="flex gap-4 justify-center">
                <Button asChild>
                  <Link to="/shop">
                    {isArabic ? 'متابعة التسوق' : 'Continue Shopping'}
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/">
                    {isArabic ? 'العودة للرئيسية' : 'Back to Home'}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {isArabic ? 'إتمام الشراء' : 'Checkout'}
            </h1>
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary">
                {isArabic ? 'الرئيسية' : 'Home'}
              </Link>
              <span>/</span>
              <Link to="/shop" className="hover:text-primary">
                {isArabic ? 'المتجر' : 'Shop'}
              </Link>
              <span>/</span>
              <span className="text-foreground">
                {isArabic ? 'إتمام الشراء' : 'Checkout'}
              </span>
            </nav>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-amber-600 text-white rounded-full flex items-center justify-center text-sm">1</span>
                    {isArabic ? 'المعلومات الشخصية' : 'Personal Information'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">
                        {isArabic ? 'الاسم الأول' : 'First Name'}
                      </Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder={isArabic ? 'أدخل الاسم الأول' : 'Enter first name'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">
                        {isArabic ? 'اسم العائلة' : 'Last Name'}
                      </Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder={isArabic ? 'أدخل اسم العائلة' : 'Enter last name'}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        {isArabic ? 'البريد الإلكتروني' : 'Email'}
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder={isArabic ? 'أدخل البريد الإلكتروني' : 'Enter email'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        {isArabic ? 'رقم الهاتف' : 'Phone Number'}
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder={isArabic ? 'أدخل رقم الهاتف' : 'Enter phone number'}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 2: Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-amber-600 text-white rounded-full flex items-center justify-center text-sm">2</span>
                    <MapPin className="h-5 w-5" />
                    {isArabic ? 'عنوان التوصيل' : 'Shipping Address'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">
                      {isArabic ? 'العنوان' : 'Address'}
                    </Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder={isArabic ? 'أدخل العنوان التفصيلي' : 'Enter detailed address'}
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">
                        {isArabic ? 'المدينة' : 'City'}
                      </Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder={isArabic ? 'أدخل المدينة' : 'Enter city'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">
                        {isArabic ? 'المحافظة/الولاية' : 'State/Province'}
                      </Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        placeholder={isArabic ? 'أدخل المحافظة' : 'Enter state'}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">
                        {isArabic ? 'الرمز البريدي' : 'ZIP Code'}
                      </Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        placeholder={isArabic ? 'أدخل الرمز البريدي' : 'Enter ZIP code'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">
                        {isArabic ? 'البلد' : 'Country'}
                      </Label>
                      <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder={isArabic ? 'اختر البلد' : 'Select country'} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="iraq">{isArabic ? 'العراق' : 'Iraq'}</SelectItem>
                          <SelectItem value="uae">{isArabic ? 'الإمارات العربية المتحدة' : 'UAE'}</SelectItem>
                          <SelectItem value="saudi">{isArabic ? 'السعودية' : 'Saudi Arabia'}</SelectItem>
                          <SelectItem value="kuwait">{isArabic ? 'الكويت' : 'Kuwait'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 3: Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-amber-600 text-white rounded-full flex items-center justify-center text-sm">3</span>
                    <CreditCard className="h-5 w-5" />
                    {isArabic ? 'طريقة الدفع' : 'Payment Method'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup value={formData.paymentMethod} onValueChange={(value: string) => handleInputChange('paymentMethod', value)}>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card">
                        {isArabic ? 'بطاقة ائتمان' : 'Credit Card'}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash">
                        {isArabic ? 'الدفع عند الاستلام' : 'Cash on Delivery'}
                      </Label>
                    </div>
                  </RadioGroup>

                  {formData.paymentMethod === 'card' && (
                    <div className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">
                          {isArabic ? 'رقم البطاقة' : 'Card Number'}
                        </Label>
                        <Input
                          id="cardNumber"
                          value={formData.cardNumber}
                          onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiryDate">
                            {isArabic ? 'تاريخ الانتهاء' : 'Expiry Date'}
                          </Label>
                          <Input
                            id="expiryDate"
                            value={formData.expiryDate}
                            onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                            placeholder="MM/YY"
                            maxLength={5}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv">
                            {isArabic ? 'رمز الأمان' : 'CVV'}
                          </Label>
                          <Input
                            id="cvv"
                            value={formData.cvv}
                            onChange={(e) => handleInputChange('cvv', e.target.value)}
                            placeholder="123"
                            maxLength={3}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Order Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {isArabic ? 'ملاحظات الطلب' : 'Order Notes'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder={isArabic ? 'أضف أي ملاحظات أو طلبات خاصة' : 'Add any special notes or requests'}
                    rows={4}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>
                    {isArabic ? 'ملخص الطلب' : 'Order Summary'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cart Items */}
                  <div className="space-y-3">
                    {cart?.items?.map((item) => (
                      <div key={item.product?.id} className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950 rounded-md flex items-center justify-center flex-shrink-0">
                          <img 
                            src="/images/logo-s.png" 
                            alt="SpiritHub Cafe Logo" 
                            className="h-8 w-8 object-contain"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">
                            {isArabic ? (item.product?.name_ar || item.product?.name) : item.product?.name}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {isArabic ? 'الكمية' : 'Qty'}: {item.quantity}
                          </p>
                          {/* Selected Properties */}
                          {item.selectedProperties && Object.keys(item.selectedProperties).length > 0 && (
                            <div className="text-xs text-muted-foreground mt-1 space-y-1">
                              {Object.entries(item.selectedProperties).map(([propertyName, selectedValue]) => {
                                const property = item.product?.properties?.find((p: any) => p.name === propertyName)
                                const option = property?.options?.find((opt: any) => opt.value === selectedValue)
                                const label = isArabic ? (option?.label_ar || option?.label) : option?.label
                                return (
                                  <div key={propertyName}>
                                    <span className="font-medium">{isArabic ? (property?.name_ar || property?.name) : property?.name}:</span> {label}
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                        <div className="text-sm font-medium currency">
                          {item.product && formatPrice(getProductPrice(item.product, item.selectedProperties) * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{isArabic ? 'المجموع الفرعي' : 'Subtotal'}</span>
                      <span className="currency">{formatPrice(getTotalPrice())}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>{isArabic ? 'الشحن' : 'Shipping'}</span>
                      <span className="currency">{formatPrice(5)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>{isArabic ? 'الضرائب' : 'Tax'}</span>
                      <span className="currency">{formatPrice(getTotalPrice() * 0.1)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold">
                      <span>{isArabic ? 'المجموع الكلي' : 'Total'}</span>
                      <span className="text-amber-600 currency">
                        {formatPrice(getTotalPrice() + 5 + getTotalPrice() * 0.1)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 space-y-2">
                    <Button onClick={handleSubmit} disabled={orderLoading} className="w-full">
                      {orderLoading 
                        ? (isArabic ? 'جاري معالجة الطلب...' : 'Processing Order...')
                        : (isArabic ? 'تأكيد الطلب' : 'Place Order')
                      }
                    </Button>
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/shop" className="flex items-center gap-2">
                        {isArabic ? (
                          <>
                            <ArrowRight className="h-4 w-4" />
                            العودة للمتجر
                          </>
                        ) : (
                          <>
                            <ArrowLeft className="h-4 w-4" />
                            Back to Shop
                          </>
                        )}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
