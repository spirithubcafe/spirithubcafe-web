import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, ShoppingCart, MapPin } from 'lucide-react'
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
import { useCheckoutSettings } from '@/hooks/useCheckoutSettings'
import { bankMuscatPaymentService, type PaymentRequest } from '@/services/bankMuscatPayment'
import toast from 'react-hot-toast'

export default function CheckoutPage() {
  useScrollToTopOnRouteChange()
  const { i18n } = useTranslation()
  const { cart, clearCart, getTotalPrice } = useCart()
  const { formatPrice, currency } = useCurrency()
  const { currentUser } = useAuth()
  const { settings: checkoutSettings } = useCheckoutSettings()

  const [orderSuccess, setOrderSuccess] = useState(false)
  const [orderLoading, setOrderLoading] = useState(false)
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null)

  const isArabic = i18n.language === 'ar'

  // Helper: get item unit price in CURRENT currency (no base+modifier sums)
  const getProductPrice = (product: any, selectedProperties?: Record<string, string>): number => {
    let finalPrice = 0

    const withPricingProps = product.properties && product.properties.some((p: any) => p.affects_price && p.options && p.options.length > 0)

    // If product has advanced properties, use selected option's absolute price or modifier-only
    if (withPricingProps) {
      // Use selected property if available
      if (selectedProperties && Object.keys(selectedProperties).length > 0) {
        for (const [propertyName, selectedValue] of Object.entries(selectedProperties)) {
          const property = product.properties.find((p: any) => p.name === propertyName)
          if (property && property.affects_price) {
            const option = property.options.find((opt: any) => opt.value === selectedValue)
            if (option) {
              const onSale = option.on_sale && (!option.sale_start_date || new Date(option.sale_start_date) <= new Date()) && (!option.sale_end_date || new Date(option.sale_end_date) >= new Date())
              if (currency === 'OMR') {
                if (option.price_omr) {
                  finalPrice = onSale && option.sale_price_omr ? option.sale_price_omr : option.price_omr
                } else if (option.price_modifier_omr || option.price_modifier) {
                  // Legacy: modifier is standalone price
                  finalPrice = option.price_modifier_omr ?? option.price_modifier ?? 0
                }
              } else if (currency === 'SAR') {
                if (option.price_sar) {
                  finalPrice = onSale && option.sale_price_sar ? option.sale_price_sar : option.price_sar
                } else if (option.price_modifier_sar || option.price_modifier_omr || option.price_modifier) {
                  const modifier = option.price_modifier_sar ?? ((option.price_modifier_omr ?? option.price_modifier ?? 0) * 9.75)
                  finalPrice = modifier
                }
              } else {
                if (option.price_usd) {
                  finalPrice = onSale && option.sale_price_usd ? option.sale_price_usd : option.price_usd
                } else if (option.price_modifier_usd || option.price_modifier_omr || option.price_modifier) {
                  const modifier = option.price_modifier_usd ?? ((option.price_modifier_omr ?? option.price_modifier ?? 0) * 2.6)
                  finalPrice = modifier
                }
              }
              break
            }
          }
        }
      }

      // If nothing selected or no valid price found, use first option of first pricing property
      if (finalPrice === 0) {
        const firstProp = product.properties.find((p: any) => p.affects_price && p.options && p.options.length > 0)
        const firstOption = firstProp?.options?.[0]
        if (firstOption) {
          const onSale = firstOption.on_sale && (!firstOption.sale_start_date || new Date(firstOption.sale_start_date) <= new Date()) && (!firstOption.sale_end_date || new Date(firstOption.sale_end_date) >= new Date())
          if (currency === 'OMR') {
            if (firstOption.price_omr) {
              finalPrice = onSale && firstOption.sale_price_omr ? firstOption.sale_price_omr : firstOption.price_omr
            } else if (firstOption.price_modifier_omr || firstOption.price_modifier) {
              finalPrice = firstOption.price_modifier_omr ?? firstOption.price_modifier ?? 0
            }
          } else if (currency === 'SAR') {
            if (firstOption.price_sar) {
              finalPrice = onSale && firstOption.sale_price_sar ? firstOption.sale_price_sar : firstOption.price_sar
            } else if (firstOption.price_modifier_sar || firstOption.price_modifier_omr || firstOption.price_modifier) {
              const modifier = firstOption.price_modifier_sar ?? ((firstOption.price_modifier_omr ?? firstOption.price_modifier ?? 0) * 9.75)
              finalPrice = modifier
            }
          } else {
            if (firstOption.price_usd) {
              finalPrice = onSale && firstOption.sale_price_usd ? firstOption.sale_price_usd : firstOption.price_usd
            } else if (firstOption.price_modifier_usd || firstOption.price_modifier_omr || firstOption.price_modifier) {
              const modifier = firstOption.price_modifier_usd ?? ((firstOption.price_modifier_omr ?? firstOption.price_modifier ?? 0) * 2.6)
              finalPrice = modifier
            }
          }
        }
      }
    }

    // If still zero (no advanced pricing), use base product price in current currency
    if (finalPrice === 0) {
      if (currency === 'OMR') {
        finalPrice = (product.sale_price_omr && product.sale_price_omr < (product.price_omr || 0)) ? product.sale_price_omr : (product.price_omr || 0)
      } else if (currency === 'SAR') {
        finalPrice = product.sale_price_sar ?? product.price_sar ?? ((product.sale_price_omr ?? product.price_omr ?? 0) * 9.75)
      } else {
        finalPrice = product.sale_price_usd ?? product.price_usd ?? ((product.sale_price_omr ?? product.price_omr ?? 0) * 2.6)
      }
    }

    return finalPrice
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
    
    // Shipping
    shippingMethod: 'pickup', // pickup, nool_oman, aramex
    
    // Order Notes
    notes: ''
  })

  // Oman cities with delivery pricing
  const omanCities = [
    { value: 'al-burimi', name: 'Al-Burimi', name_ar: 'البريمي', price: 2 },
    { value: 'shinas', name: 'Shinas', name_ar: 'شناص', price: 2 },
    { value: 'suhar', name: 'Suhar', name_ar: 'صحار', price: 2 },
    { value: 'saham', name: 'Saham', name_ar: 'صحم', price: 2 },
    { value: 'al-suwaiq', name: 'Al-Suwaiq', name_ar: 'الصويق', price: 2 },
    { value: 'al-rustaq', name: 'Al-Rustaq', name_ar: 'الرستاق', price: 2 },
    { value: 'al-khaburah', name: 'Al Khaburah', name_ar: 'الخابورة', price: 2 },
    { value: 'barka', name: 'Barka', name_ar: 'بركاء', price: 2 },
    { value: 'al-mubilah', name: 'Al-Mubilah', name_ar: 'المبيلة', price: 2 },
    { value: 'qurayyat', name: 'Qurayyat', name_ar: 'قريات', price: 2 },
    { value: 'al-khoudh', name: 'Al-Khoudh', name_ar: 'الخوض', price: 2 },
    { value: 'al-amrat', name: 'Al-Amrat', name_ar: 'العامرات', price: 2 },
    { value: 'busher', name: 'Busher', name_ar: 'بوشر', price: 2 },
    { value: 'nizwa', name: 'Nizwa', name_ar: 'نزوى', price: 2 },
    { value: 'izki', name: 'Izki', name_ar: 'إزكي', price: 2 },
    { value: 'bahla', name: 'Bahla', name_ar: 'بهلاء', price: 2 },
    { value: 'ibra', name: 'Ibra', name_ar: 'إبراء', price: 2 },
    { value: 'jalan', name: 'Jalan', name_ar: 'جعلان', price: 2 },
    { value: 'sur', name: 'Sur', name_ar: 'صور', price: 2 },
    { value: 'al-kamil', name: 'Al Kamil', name_ar: 'الكامل', price: 2 },
    { value: 'sinaw', name: 'Sinaw', name_ar: 'سناو', price: 2 },
    { value: 'ibri', name: 'Ibri', name_ar: 'عبري', price: 2 },
    { value: 'yanqul', name: 'Yanqul', name_ar: 'ينقل', price: 2 },
    { value: 'salalah', name: 'Salalah', name_ar: 'صلالة', price: 2 },
    { value: 'khasab', name: 'Khasab', name_ar: 'خصب', price: 3 } // Special pricing for Khasab
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      
      // When country changes to Oman, reset city if it was previously selected
      if (field === 'country') {
        if (value === 'OM') {
          // Keep existing city if it's valid for Oman, otherwise reset
          const validOmanCity = omanCities.find(city => city.value === prev.city)
          if (!validOmanCity) {
            newData.city = ''
          }
        } else {
          // For non-Oman countries, keep the city as free text
          // Reset shipping method if it was nool_oman
          if (prev.shippingMethod === 'nool_oman') {
            newData.shippingMethod = 'pickup'
          }
        }
      }
      
      return newData
    })
  }

  const calculateTotals = () => {
    const subtotal = getTotalPrice()
    
    // Calculate shipping cost based on method and settings
    let shippingCost = 0
    if (checkoutSettings && checkoutSettings.shipping_methods) {
      const selectedMethod = checkoutSettings.shipping_methods.find(
        method => method.id === formData.shippingMethod && method.enabled
      )
      
      if (selectedMethod && !selectedMethod.is_free) {
        // Special handling for Nool Oman delivery
        if (formData.shippingMethod === 'nool_oman' && formData.country === 'OM' && formData.city) {
          const selectedCity = omanCities.find(city => city.value === formData.city)
          if (selectedCity) {
            // Use city-specific pricing
            shippingCost = selectedCity.price
            // Convert to current currency if needed
            if (currency !== 'OMR') {
              shippingCost = shippingCost * conversionRates[currency as keyof typeof conversionRates]
            }
          }
        } else {
          // Regular shipping method pricing
          switch (currency) {
            case 'OMR':
              shippingCost = selectedMethod.base_cost_omr || 0
              break
            case 'SAR':
              shippingCost = selectedMethod.base_cost_sar || 0
              break
            case 'USD':
              shippingCost = selectedMethod.base_cost_usd || 0
              break
            default:
              shippingCost = selectedMethod.base_cost_omr || 0
          }
        }
      }
    }
    
    // Calculate tax based on settings
    const taxRate = checkoutSettings?.tax_rate || 0.1
    const taxableAmount = subtotal + shippingCost
    const taxAmount = taxableAmount * taxRate
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
        payment_status: 'unpaid', // Will be handled by payment gateway
        payment_method: 'card' as 'card' | 'cash' | 'paypal' | 'bank_transfer', // Using payment gateway
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
      
      // Create payment request
      const paymentRequest: PaymentRequest = {
        order_id: order.id,
        amount: totals.total,
        currency: currency as 'OMR' | 'USD' | 'SAR',
        customer_email: formData.email,
        customer_name: `${formData.firstName} ${formData.lastName}`,
        customer_phone: formData.phone,
        return_url: `${window.location.origin}/checkout-success?order_id=${order.id}`,
        cancel_url: `${window.location.origin}/checkout-success?order_id=${order.id}`
      }

      // Process payment
      const paymentResponse = await bankMuscatPaymentService.createPayment(paymentRequest)
      
      if (paymentResponse.success && paymentResponse.payment_url) {
        // Update order with payment info
        await firestoreService.orders.update(order.id, {
          payment_status: 'unpaid', // Will be updated when payment is confirmed
          transaction_id: paymentResponse.transaction_id
        })
        
        // Clear cart before redirecting to payment
        clearCart()
        
        // Show processing message
        toast.success(isArabic ? 'جاري تحويلك إلى بوابة الدفع...' : 'Redirecting to payment gateway...')
        
        // Redirect to payment gateway will happen automatically in the service
        // The form submission will redirect the user
        
      } else {
        // Payment initiation failed
        toast.error(isArabic ? 'فشل في بدء عملية الدفع' : 'Failed to initiate payment')
        console.error('Payment error:', paymentResponse.error)
        
        // Still show success for order creation but inform about payment issue
        setCreatedOrderId(order.id)
        setOrderSuccess(true)
        clearCart()
      }
      
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
                      {formData.country === 'OM' ? (
                        <Select value={formData.city} onValueChange={(value) => handleInputChange('city', value)}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={isArabic ? 'اختر المدينة' : 'Select city'} />
                          </SelectTrigger>
                          <SelectContent>
                            {omanCities.map((city) => (
                              <SelectItem key={city.value} value={city.value}>
                                {isArabic ? city.name_ar : city.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          placeholder={isArabic ? 'أدخل المدينة' : 'Enter city'}
                        />
                      )}
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
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={isArabic ? 'اختر البلد' : 'Select country'} />
                        </SelectTrigger>
                        <SelectContent>
                          {checkoutSettings?.enabled_countries?.map((countryCode) => {
                            const countryNames: Record<string, {name: string, name_ar: string}> = {
                              'OM': {name: 'Oman', name_ar: 'عمان'},
                              'AE': {name: 'UAE', name_ar: 'الإمارات العربية المتحدة'},
                              'SA': {name: 'Saudi Arabia', name_ar: 'السعودية'},
                              'KW': {name: 'Kuwait', name_ar: 'الكويت'},
                              'IQ': {name: 'Iraq', name_ar: 'العراق'}
                            }
                            const country = countryNames[countryCode]
                            if (!country) return null
                            
                            return (
                              <SelectItem key={countryCode} value={countryCode}>
                                {isArabic ? country.name_ar : country.name}
                              </SelectItem>
                            )
                          }) || [
                            <SelectItem key="OM" value="OM">{isArabic ? 'عمان' : 'Oman'}</SelectItem>,
                            <SelectItem key="AE" value="AE">{isArabic ? 'الإمارات العربية المتحدة' : 'UAE'}</SelectItem>,
                            <SelectItem key="SA" value="SA">{isArabic ? 'السعودية' : 'Saudi Arabia'}</SelectItem>,
                            <SelectItem key="KW" value="KW">{isArabic ? 'الكويت' : 'Kuwait'}</SelectItem>,
                            <SelectItem key="IQ" value="IQ">{isArabic ? 'العراق' : 'Iraq'}</SelectItem>
                          ]}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 3: Order Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-amber-600 text-white rounded-full flex items-center justify-center text-sm">3</span>
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
                    {isArabic ? 'طلبك' : 'Your Order'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cart Items */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm font-medium border-b pb-2">
                      <span>{isArabic ? 'المنتج' : 'Product'}</span>
                      <span>{isArabic ? 'المجموع الفرعي' : 'Subtotal'}</span>
                    </div>
                    {cart?.items?.map((item) => (
                      <div key={item.product?.id} className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">
                            {isArabic ? (item.product?.name_ar || item.product?.name) : item.product?.name}
                            {item.selectedProperties && Object.keys(item.selectedProperties).length > 0 && (
                              <span className="text-xs text-muted-foreground">
                                {Object.entries(item.selectedProperties).map(([propertyName, selectedValue]) => {
                                  const property = item.product?.properties?.find((p: any) => p.name === propertyName)
                                  const option = property?.options?.find((opt: any) => opt.value === selectedValue)
                                  const label = isArabic ? (option?.label_ar || option?.label) : option?.label
                                  return ` - ${label}`
                                }).join(', ')}
                              </span>
                            )}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            × {item.quantity}
                          </p>
                        </div>
                        <div className="text-sm font-medium">
                          {item.product && formatPrice(getProductPrice(item.product, item.selectedProperties) * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Subtotal */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-sm">
                      <span>{isArabic ? 'المجموع الفرعي' : 'Subtotal'}</span>
                      <span>{formatPrice(getTotalPrice())}</span>
                    </div>
                  </div>

                  {/* Shipping Section */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-sm">{isArabic ? 'الشحن' : 'Shipping'}</h3>
                    <RadioGroup 
                      value={formData.shippingMethod} 
                      onValueChange={(value: string) => handleInputChange('shippingMethod', value)}
                    >
                      {checkoutSettings?.shipping_methods?.filter(method => {
                        // Only show enabled methods
                        if (!method.enabled) return false
                        
                        // Only show nool_oman for Oman
                        if (method.id === 'nool_oman' && formData.country !== 'OM') return false
                        
                        return true
                      }).map((method) => {
                        let cost = 0
                        if (!method.is_free) {
                          // Special handling for nool_oman with city-specific pricing
                          if (method.id === 'nool_oman' && formData.country === 'OM' && formData.city) {
                            const selectedCity = omanCities.find(city => city.value === formData.city)
                            if (selectedCity) {
                              cost = selectedCity.price
                              // Convert to current currency if needed
                              if (currency !== 'OMR') {
                                cost = cost * conversionRates[currency as keyof typeof conversionRates]
                              }
                            }
                          } else {
                            switch (currency) {
                              case 'OMR':
                                cost = method.base_cost_omr || 0
                                break
                              case 'SAR':
                                cost = method.base_cost_sar || 0
                                break
                              case 'USD':
                                cost = method.base_cost_usd || 0
                                break
                              default:
                                cost = method.base_cost_omr || 0
                            }
                          }
                        }

                        return (
                          <div key={method.id} className="flex items-center justify-between space-x-2 rtl:space-x-reverse">
                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                              <RadioGroupItem 
                                value={method.id} 
                                id={method.id}
                                disabled={method.id === 'nool_oman' && (!formData.city || formData.country !== 'OM')}
                              />
                              <Label 
                                htmlFor={method.id} 
                                className={`text-sm ${method.id === 'nool_oman' && (!formData.city || formData.country !== 'OM') ? 'text-muted-foreground' : ''}`}
                              >
                                {isArabic ? method.name_ar : method.name}
                                {method.id === 'nool_oman' && formData.country === 'OM' && !formData.city && (
                                  <span className="text-xs text-muted-foreground block">
                                    {isArabic ? 'يرجى اختيار المدينة أولاً' : 'Please select city first'}
                                  </span>
                                )}
                              </Label>
                            </div>
                            <span className={`text-sm font-medium ${method.is_free ? 'text-green-600' : ''}`}>
                              {method.is_free 
                                ? (isArabic ? 'مجاناً' : 'Free')
                                : formatPrice(cost)
                              }
                            </span>
                          </div>
                        )
                      }) || [
                        // Fallback options if settings not loaded
                        <div key="pickup" className="flex items-center justify-between space-x-2 rtl:space-x-reverse">
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <RadioGroupItem value="pickup" id="pickup" />
                            <Label htmlFor="pickup" className="text-sm">
                              {isArabic ? 'الاستلام من المقهى' : 'Pickup from our Cafe'}
                            </Label>
                          </div>
                          <span className="text-sm font-medium text-green-600">
                            {isArabic ? 'مجاناً' : 'Free'}
                          </span>
                        </div>
                      ]}
                    </RadioGroup>
                  </div>

                  {/* Tax Section */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-sm">
                      <span>
                        {isArabic ? 'الضريبة' : 'Tax'} ({((checkoutSettings?.tax_rate || 0.1) * 100).toFixed(0)}%)
                      </span>
                      <span>{formatPrice(calculateTotals().tax)}</span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between font-bold text-lg">
                      <span>{isArabic ? 'المجموع' : 'Total'}</span>
                      <span className="text-amber-600">
                        {formatPrice(calculateTotals().total)}
                      </span>
                    </div>
                  </div>

                  {/* Payment Methods Display */}
                  <div className="border-t pt-4">
                    <div className="flex justify-center items-center gap-2 mb-4">
                      <img src="/images/apple-pay.png" alt="Apple Pay" className="h-8" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
                      <img src="/images/visa.png" alt="Visa" className="h-8" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
                      <img src="/images/mastercard.png" alt="Mastercard" className="h-8" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
                    </div>
                    
                    <Button onClick={handleSubmit} disabled={orderLoading} className="w-full bg-green-600 hover:bg-green-700">
                      {orderLoading 
                        ? (isArabic ? 'جاري معالجة الطلب...' : 'Processing Order...')
                        : (isArabic ? 'المتابعة للدفع' : 'Proceed to Pay')
                      }
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
