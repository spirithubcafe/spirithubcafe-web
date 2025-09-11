import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCheckoutSettings, type ShippingMethod, type CategoryTaxRate } from '@/hooks/useCheckoutSettings'

// Define CheckoutSettings type locally
interface CheckoutSettings {
  currency: string
  paymentMethods: string[]
  shippingMethods: string[]
  shipping_methods: any[] // For legacy compatibility
  taxRate: number
  tax_rate: number // For legacy compatibility
  category_tax_rates: CategoryTaxRate[] // Category-based tax rates
  enabled_countries: string[] // Enabled countries
  freeShippingThreshold: number
  allowGuestCheckout: boolean
  requirePhoneNumber: boolean
  requireAddress: boolean
  allowCouponCodes: boolean
  autoApplyCoupons: boolean
  emailNotifications: boolean
  smsNotifications: boolean
  orderConfirmationMessage: string
  orderConfirmationMessageAr: string
  defaultCountry: string
  supportedCountries: string[]
  minimumOrderAmount: number
  maximumOrderAmount: number
  orderProcessingTime: string
  returnPolicy: string
  privacyPolicy: string
  termsOfService: string
  payment_gateway: {
    enabled: boolean
    provider: string
    sandbox: boolean
    test_mode?: boolean
    merchant_id?: string
    access_code?: string
    working_key?: string
    supported_currencies?: string[]
  }
  bankMuscat: {
    merchantId: string
    accessCode: string
    workingKey: string
    currency: string
    language: string
    redirectUrl: string
    cancelUrl: string
    enabled: boolean
  }
}
import { useTranslation } from 'react-i18next'
import { Loader2, Save, Plus, Trash2, Settings } from 'lucide-react'
import { jsonDataService } from '@/services/jsonDataService'
import toast from 'react-hot-toast'

interface Category {
  id: string
  name: string
  name_ar?: string
  description?: string
  image?: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function CheckoutSettingsPage() {
  const { i18n } = useTranslation()
  const { settings, loading, updateSettings, initializeSettings } = useCheckoutSettings()
  const [localSettings, setLocalSettings] = useState<CheckoutSettings | null>(null)
  const [saving, setSaving] = useState(false)
  
  // Category tax states
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)

  const isArabic = i18n.language === 'ar'

  // Load categories from JSON
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true)
        const categoriesData = await jsonDataService.fetchJSON('categories.json') as Category[]
        setCategories(categoriesData || [])
      } catch (error) {
        console.error('Error loading categories:', error)
        toast.error(isArabic ? 'فشل في تحميل الفئات' : 'Failed to load categories')
      } finally {
        setLoadingCategories(false)
      }
    }

    loadCategories()
  }, [isArabic])

  useEffect(() => {
    if (settings) {
      // Convert settings to local interface format
      const convertedSettings: CheckoutSettings = {
        ...settings,
        shipping_methods: [],
        tax_rate: settings.taxRate || 0,
        category_tax_rates: [],
        enabled_countries: settings.supportedCountries || [],
        payment_gateway: {
          enabled: false,
          provider: 'bank_muscat',
          sandbox: true,
          test_mode: false,
          merchant_id: '',
          access_code: '',
          working_key: '',
          supported_currencies: ['OMR', 'USD', 'SAR']
        }
      }
      setLocalSettings(convertedSettings)
    }
  }, [settings])

  const handleSave = async () => {
    if (!localSettings) return

    try {
      setSaving(true)
      
      // If settings don't exist, initialize first
      if (!settings) {
        console.log('No settings found, initializing first...')
        const initSuccess = await initializeSettings()
        if (!initSuccess) {
          toast.error(isArabic ? 'فشل في التهيئة' : 'Failed to initialize settings')
          return
        }
        // Wait a moment for initialization to complete
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
      const success = await updateSettings(localSettings)
      if (success) {
        toast.success(isArabic ? 'تم حفظ التنظيمات بنجاح' : 'Settings saved successfully')
      } else {
        toast.error(isArabic ? 'فشل حفظ التنظيمات' : 'Failed to save settings')
      }
    } catch (error) {
      console.error('Error in handleSave:', error)
      toast.error(isArabic ? 'خطأ في حفظ التنظيمات' : 'Error saving settings')
    } finally {
      setSaving(false)
    }
  }

  const handleInitialize = async () => {
    try {
      setSaving(true)
      const success = await initializeSettings()
      if (success) {
        toast.success(isArabic ? 'تم تهيئة التنظيمات الافتراضية' : 'Default settings initialized')
      }
    } catch (error) {
      toast.error(isArabic ? 'فشل في تهيئة التنظيمات' : 'Failed to initialize settings')
    } finally {
      setSaving(false)
    }
  }

  const updateTaxRate = (rate: number) => {
    if (localSettings) {
      setLocalSettings({
        ...localSettings,
        tax_rate: rate / 100 // Convert percentage to decimal
      })
    }
  }

  const updateCategoryTaxRate = (categoryId: string, taxRate: number, enabled: boolean) => {
    if (localSettings) {
      const existingRates = localSettings.category_tax_rates || []
      const category = categories.find(c => c.id === categoryId)
      
      if (!category) return
      
      // Check if rate already exists for this category
      const existingIndex = existingRates.findIndex(rate => rate.category_id === categoryId)
      
      if (existingIndex >= 0) {
        // Update existing rate
        const updatedRates = [...existingRates]
        updatedRates[existingIndex] = {
          category_id: categoryId,
          category_name: category.name,
          category_name_ar: category.name_ar || category.name,
          tax_rate: taxRate / 100, // Convert percentage to decimal
          enabled
        }
        setLocalSettings({
          ...localSettings,
          category_tax_rates: updatedRates
        })
      } else {
        // Add new rate
        const newRate: CategoryTaxRate = {
          category_id: categoryId,
          category_name: category.name,
          category_name_ar: category.name_ar || category.name,
          tax_rate: taxRate / 100,
          enabled
        }
        setLocalSettings({
          ...localSettings,
          category_tax_rates: [...existingRates, newRate]
        })
      }
    }
  }

  const removeCategoryTaxRate = (categoryId: string) => {
    if (localSettings) {
      const updatedRates = (localSettings.category_tax_rates || []).filter(
        rate => rate.category_id !== categoryId
      )
      setLocalSettings({
        ...localSettings,
        category_tax_rates: updatedRates
      })
    }
  }

  const getCategoryTaxRate = (categoryId: string): { rate: number; enabled: boolean } => {
    if (!localSettings?.category_tax_rates) return { rate: 0, enabled: false }
    
    const existingRate = localSettings.category_tax_rates.find(
      rate => rate.category_id === categoryId
    )
    
    return {
      rate: existingRate ? existingRate.tax_rate * 100 : 0, // Convert decimal to percentage
      enabled: existingRate ? existingRate.enabled : false
    }
  }

  const updateEnabledCountries = (countries: string[]) => {
    if (localSettings) {
      setLocalSettings({
        ...localSettings,
        enabled_countries: countries
      })
    }
  }

  const updateShippingMethod = (methodId: string, updates: Partial<ShippingMethod>) => {
    if (localSettings) {
      const updatedMethods = localSettings.shipping_methods.map(method =>
        method.id === methodId ? { ...method, ...updates } : method
      )
      setLocalSettings({
        ...localSettings,
        shipping_methods: updatedMethods
      })
    }
  }

  const addShippingMethod = () => {
    if (localSettings) {
      const newMethod: ShippingMethod = {
        id: `custom_${Date.now()}`,
        name: 'New Shipping Method',
        name_ar: 'طريقة شحن جديدة',
        enabled: true,
        is_free: false,
        pricing_type: 'flat',
        base_cost_omr: 0,
        base_cost_usd: 0,
        base_cost_sar: 0,
        estimated_delivery_days: '1-3 days',
        description: 'Custom shipping method',
        description_ar: 'طريقة شحن مخصصة'
      }
      setLocalSettings({
        ...localSettings,
        shipping_methods: [...localSettings.shipping_methods, newMethod]
      })
    }
  }

  const removeShippingMethod = (methodId: string) => {
    if (localSettings) {
      const updatedMethods = localSettings.shipping_methods.filter(method => method.id !== methodId)
      setLocalSettings({
        ...localSettings,
        shipping_methods: updatedMethods
      })
    }
  }

  const updatePaymentGateway = (updates: any) => {
    if (localSettings) {
      setLocalSettings({
        ...localSettings,
        payment_gateway: {
          ...localSettings.payment_gateway,
          ...updates
        }
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>{isArabic ? 'جاري تحميل التنظيمات...' : 'Loading settings...'}</span>
        </div>
      </div>
    )
  }

  if (!localSettings) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold">
                {isArabic ? 'إعدادات الدفع والشحن' : 'Checkout Settings'}
              </h1>
              <p className="text-muted-foreground">
                {isArabic ? 'لم يتم العثور على التنظيمات. قم بتهيئة التنظيمات الافتراضية.' : 'No settings found. Initialize default settings.'}
              </p>
              <Button onClick={handleInitialize} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {isArabic ? 'جاري التهیئة...' : 'Initializing...'}
                  </>
                ) : (
                  <>
                    <Settings className="h-4 w-4 mr-2" />
                    {isArabic ? 'تهيئة التنظيمات الافتراضية' : 'Initialize Default Settings'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const allCountries = [
    { code: 'OM', name: 'Oman', name_ar: 'عمان' },
    { code: 'AE', name: 'UAE', name_ar: 'الإمارات العربية المتحدة' },
    { code: 'SA', name: 'Saudi Arabia', name_ar: 'السعودية' },
    { code: 'KW', name: 'Kuwait', name_ar: 'الكويت' },
    { code: 'IQ', name: 'Iraq', name_ar: 'العراق' },
    { code: 'QA', name: 'Qatar', name_ar: 'قطر' },
    { code: 'BH', name: 'Bahrain', name_ar: 'البحرين' },
    { code: 'JO', name: 'Jordan', name_ar: 'الأردن' },
    { code: 'LB', name: 'Lebanon', name_ar: 'لبنان' },
    { code: 'EG', name: 'Egypt', name_ar: 'مصر' }
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">
                {isArabic ? 'إعدادات الدفع والشحن' : 'Checkout Settings'}
              </h1>
              <p className="text-muted-foreground mt-2">
                {isArabic ? 'إدارة إعدادات المالیة، الشحن، والدفع' : 'Manage tax, shipping, and payment settings'}
              </p>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {isArabic ? 'جاري الحفظ...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isArabic ? 'حفظ التنظيمات' : 'Save Settings'}
                </>
              )}
            </Button>
          </div>

          <Tabs defaultValue="tax" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="tax">{isArabic ? 'الضرائب' : 'Tax'}</TabsTrigger>
              <TabsTrigger value="category-tax">{isArabic ? 'ضرائب الفئات' : 'Category Tax'}</TabsTrigger>
              <TabsTrigger value="countries">{isArabic ? 'البلدان' : 'Countries'}</TabsTrigger>
              <TabsTrigger value="shipping">{isArabic ? 'الشحن' : 'Shipping'}</TabsTrigger>
              <TabsTrigger value="payment">{isArabic ? 'الدفع' : 'Payment'}</TabsTrigger>
            </TabsList>

            {/* Tax Settings */}
            <TabsContent value="tax">
              <Card>
                <CardHeader>
                  <CardTitle>{isArabic ? 'إعدادات الضرائب' : 'Tax Settings'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tax-rate">
                      {isArabic ? 'معدل الضریبة (%)' : 'Tax Rate (%)'}
                    </Label>
                    <Input
                      id="tax-rate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={(localSettings.tax_rate * 100).toFixed(1)}
                      onChange={(e) => updateTaxRate(parseFloat(e.target.value) || 0)}
                      placeholder="10.0"
                    />
                    <p className="text-sm text-muted-foreground">
                      {isArabic ? 'معدل الضریبة یتم تطبیقه على المجموع الفرعي + تكلفة الشحن' : 'Tax rate applied to subtotal + shipping cost'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Category Tax Settings */}
            <TabsContent value="category-tax">
              <Card>
                <CardHeader>
                  <CardTitle>{isArabic ? 'ضرائب الفئات' : 'Category Tax Rates'}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? 'تحديد معدلات ضريبية مختلفة لكل فئة من المنتجات' : 'Set different tax rates for each product category'}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loadingCategories ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>{isArabic ? 'جاري تحميل الفئات...' : 'Loading categories...'}</span>
                    </div>
                  ) : categories.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {isArabic ? 'لا توجد فئات متاحة' : 'No categories available'}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {categories.map((category) => {
                        const { rate, enabled } = getCategoryTaxRate(category.id)
                        return (
                          <div key={category.id} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">
                                  {isArabic ? (category.name_ar || category.name) : category.name}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {isArabic ? category.name : (category.name_ar || category.name)}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                <Switch
                                  checked={enabled}
                                  onCheckedChange={(checked) => 
                                    updateCategoryTaxRate(category.id, rate, checked)
                                  }
                                />
                                <Label>{isArabic ? 'مفعل' : 'Enabled'}</Label>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>{isArabic ? 'معدل الضريبة (%)' : 'Tax Rate (%)'}</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.1"
                                  value={rate.toFixed(1)}
                                  onChange={(e) => 
                                    updateCategoryTaxRate(
                                      category.id, 
                                      parseFloat(e.target.value) || 0, 
                                      enabled
                                    )
                                  }
                                  placeholder="5.0"
                                  disabled={!enabled}
                                />
                              </div>
                              
                              <div className="flex items-end">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => removeCategoryTaxRate(category.id)}
                                  disabled={!enabled}
                                  className="w-full"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  {isArabic ? 'إزالة' : 'Remove'}
                                </Button>
                              </div>
                            </div>
                            
                            {enabled && (
                              <div className="bg-muted p-3 rounded text-sm">
                                <strong>{isArabic ? 'المعاينة:' : 'Preview:'}</strong>{' '}
                                {isArabic 
                                  ? `سيتم تطبيق ضريبة ${rate.toFixed(1)}% على جميع منتجات فئة "${category.name_ar || category.name}"`
                                  : `${rate.toFixed(1)}% tax will be applied to all "${category.name}" category products`
                                }
                              </div>
                            )}
                          </div>
                        )
                      })}
                      
                      <div className="border-t pt-4 mt-6">
                        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                          <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                            {isArabic ? 'ملاحظات مهمة:' : 'Important Notes:'}
                          </h5>
                          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                            <li>• {isArabic ? 'ضرائب الفئات لها أولوية أعلى من الضريبة العامة' : 'Category taxes take priority over global tax rate'}</li>
                            <li>• {isArabic ? 'إذا لم تكن الفئة مُفعّلة، سيتم استخدام الضريبة العامة' : 'If category tax is not enabled, global tax rate will be used'}</li>
                            <li>• {isArabic ? 'يتم حساب الضريبة على المجموع الفرعي + تكلفة الشحن' : 'Tax is calculated on subtotal + shipping cost'}</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Countries Settings */}
            <TabsContent value="countries">
              <Card>
                <CardHeader>
                  <CardTitle>{isArabic ? 'البلدان المدعومة' : 'Supported Countries'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {allCountries.map((country) => (
                      <div key={country.code} className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Switch
                          id={country.code}
                          checked={localSettings.enabled_countries.includes(country.code)}
                          onCheckedChange={(checked) => {
                            const newCountries = checked
                              ? [...localSettings.enabled_countries, country.code]
                              : localSettings.enabled_countries.filter(c => c !== country.code)
                            updateEnabledCountries(newCountries)
                          }}
                        />
                        <Label htmlFor={country.code}>
                          {isArabic ? country.name_ar : country.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Shipping Settings */}
            <TabsContent value="shipping">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    {isArabic ? 'طرق الشحن' : 'Shipping Methods'}
                  </h3>
                  <Button onClick={addShippingMethod} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    {isArabic ? 'إضافة طریقة شحن' : 'Add Shipping Method'}
                  </Button>
                </div>

                <div className="space-y-4">
                  {localSettings.shipping_methods.map((method) => (
                    <Card key={method.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            {isArabic ? method.name_ar : method.name}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={method.enabled}
                              onCheckedChange={(checked) => updateShippingMethod(method.id, { enabled: checked })}
                            />
                            {localSettings.shipping_methods.length > 1 && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removeShippingMethod(method.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>{isArabic ? 'الاسم (انجلیزي)' : 'Name (English)'}</Label>
                            <Input
                              value={method.name}
                              onChange={(e) => updateShippingMethod(method.id, { name: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>{isArabic ? 'الاسم (عربي)' : 'Name (Arabic)'}</Label>
                            <Input
                              value={method.name_ar}
                              onChange={(e) => updateShippingMethod(method.id, { name_ar: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Switch
                            id={`free-${method.id}`}
                            checked={method.is_free}
                            onCheckedChange={(checked) => updateShippingMethod(method.id, { is_free: checked })}
                          />
                          <Label htmlFor={`free-${method.id}`}>
                            {isArabic ? 'مجاني' : 'Free shipping'}
                          </Label>
                        </div>

                        {!method.is_free && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>{isArabic ? 'التكلفة (OMR)' : 'Cost (OMR)'}</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={method.base_cost_omr || 0}
                                onChange={(e) => updateShippingMethod(method.id, { base_cost_omr: parseFloat(e.target.value) || 0 })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>{isArabic ? 'التكلفة (USD)' : 'Cost (USD)'}</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={method.base_cost_usd || 0}
                                onChange={(e) => updateShippingMethod(method.id, { base_cost_usd: parseFloat(e.target.value) || 0 })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>{isArabic ? 'التكلفة (SAR)' : 'Cost (SAR)'}</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={method.base_cost_sar || 0}
                                onChange={(e) => updateShippingMethod(method.id, { base_cost_sar: parseFloat(e.target.value) || 0 })}
                              />
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>{isArabic ? 'مدة التوصیل المتوقعة' : 'Estimated Delivery'}</Label>
                            <Input
                              value={method.estimated_delivery_days || ''}
                              onChange={(e) => updateShippingMethod(method.id, { estimated_delivery_days: e.target.value })}
                              placeholder={isArabic ? '1-3 أیام' : '1-3 days'}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>{isArabic ? 'نوع التسعیر' : 'Pricing Type'}</Label>
                            <Select
                              value={method.pricing_type}
                              onValueChange={(value: any) => updateShippingMethod(method.id, { pricing_type: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="flat">{isArabic ? 'سعر ثابت' : 'Flat Rate'}</SelectItem>
                                <SelectItem value="weight_based">{isArabic ? 'حسب الوزن' : 'Weight Based'}</SelectItem>
                                <SelectItem value="order_based">{isArabic ? 'حسب قیمة الطلب' : 'Order Based'}</SelectItem>
                                <SelectItem value="api_calculated">{isArabic ? 'محسوب بواسطة API' : 'API Calculated'}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {method.pricing_type === 'api_calculated' && method.api_settings && (
                          <div className="space-y-4 p-4 border rounded-lg">
                            <h4 className="font-medium">{isArabic ? 'إعدادات API' : 'API Settings'}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>{isArabic ? 'نوع المزود' : 'Provider'}</Label>
                                <Select
                                  value={method.api_settings.provider}
                                  onValueChange={(value: any) => updateShippingMethod(method.id, {
                                    api_settings: { ...method.api_settings!, provider: value }
                                  })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="aramex">Aramex</SelectItem>
                                    <SelectItem value="nool_oman">NOOL Oman</SelectItem>
                                    <SelectItem value="custom">{isArabic ? 'مخصص' : 'Custom'}</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>{isArabic ? 'رابط API' : 'API URL'}</Label>
                                <Input
                                  value={method.api_settings.api_url || ''}
                                  onChange={(e) => updateShippingMethod(method.id, {
                                    api_settings: { ...method.api_settings!, api_url: e.target.value }
                                  })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>{isArabic ? 'اسم المستخدم' : 'Username'}</Label>
                                <Input
                                  value={method.api_settings.username || ''}
                                  onChange={(e) => updateShippingMethod(method.id, {
                                    api_settings: { ...method.api_settings!, username: e.target.value }
                                  })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>{isArabic ? 'كلمة المرور' : 'Password'}</Label>
                                <Input
                                  type="password"
                                  value={method.api_settings.password || ''}
                                  onChange={(e) => updateShippingMethod(method.id, {
                                    api_settings: { ...method.api_settings!, password: e.target.value }
                                  })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>{isArabic ? 'رقم الحساب' : 'Account Number'}</Label>
                                <Input
                                  value={method.api_settings.account_number || ''}
                                  onChange={(e) => updateShippingMethod(method.id, {
                                    api_settings: { ...method.api_settings!, account_number: e.target.value }
                                  })}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label>{isArabic ? 'الوصف' : 'Description'}</Label>
                          <Textarea
                            value={method.description || ''}
                            onChange={(e) => updateShippingMethod(method.id, { description: e.target.value })}
                            rows={2}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Payment Settings */}
            <TabsContent value="payment">
              <Card>
                <CardHeader>
                  <CardTitle>{isArabic ? 'إعدادات بوابة الدفع' : 'Payment Gateway Settings'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Switch
                      id="payment-enabled"
                      checked={localSettings.payment_gateway.enabled}
                      onCheckedChange={(checked) => updatePaymentGateway({ enabled: checked })}
                    />
                    <Label htmlFor="payment-enabled">
                      {isArabic ? 'تفعیل بوابة الدفع' : 'Enable Payment Gateway'}
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Switch
                      id="test-mode"
                      checked={localSettings.payment_gateway.test_mode}
                      onCheckedChange={(checked) => updatePaymentGateway({ test_mode: checked })}
                    />
                    <Label htmlFor="test-mode">
                      {isArabic ? 'الوضع التجریبي' : 'Test Mode'}
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label>{isArabic ? 'نوع البوابة' : 'Gateway Provider'}</Label>
                    <Select
                      value={localSettings.payment_gateway.provider}
                      onValueChange={(value: any) => updatePaymentGateway({ provider: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bank_muscat">{isArabic ? 'بنك مسقط' : 'Bank Muscat'}</SelectItem>
                        <SelectItem value="stripe">Stripe</SelectItem>
                        <SelectItem value="paypal">PayPal</SelectItem>
                        <SelectItem value="custom">{isArabic ? 'مخصص' : 'Custom'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {localSettings.payment_gateway.provider === 'bank_muscat' && (
                    <div className="space-y-4 p-4 border rounded-lg">
                      <h4 className="font-medium">{isArabic ? 'إعدادات بنك مسقط' : 'Bank Muscat Settings'}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>{isArabic ? 'معرف التاجر' : 'Merchant ID'}</Label>
                          <Input
                            value={localSettings.payment_gateway.merchant_id || ''}
                            onChange={(e) => updatePaymentGateway({ merchant_id: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{isArabic ? 'رمز الوصول' : 'Access Code'}</Label>
                          <Input
                            value={localSettings.payment_gateway.access_code || ''}
                            onChange={(e) => updatePaymentGateway({ access_code: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label>{isArabic ? 'مفتاح العمل' : 'Working Key'}</Label>
                          <Input
                            type="password"
                            value={localSettings.payment_gateway.working_key || ''}
                            onChange={(e) => updatePaymentGateway({ working_key: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>{isArabic ? 'العملات المدعومة' : 'Supported Currencies'}</Label>
                    <div className="flex gap-4">
                      {['OMR', 'USD', 'SAR'].map((curr) => (
                        <div key={curr} className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Switch
                            id={`currency-${curr}`}
                            checked={localSettings.payment_gateway.supported_currencies?.includes(curr) || false}
                            onCheckedChange={(checked) => {
                              const currentCurrencies = localSettings.payment_gateway.supported_currencies || []
                              const newCurrencies = checked
                                ? [...currentCurrencies, curr]
                                : currentCurrencies.filter((c: string) => c !== curr)
                              updatePaymentGateway({ supported_currencies: newCurrencies })
                            }}
                          />
                          <Label htmlFor={`currency-${curr}`}>{curr}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
