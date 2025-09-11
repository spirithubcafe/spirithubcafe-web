import React, { useState } from 'react'
import { Save, AlertCircle, CheckCircle, TestTube } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAramexSettingsJSON } from '@/hooks/useAramexSettingsJSON'
import { aramexService } from '@/services/aramexService'
import { useTranslation } from 'react-i18next'
import type { AramexSettings, AramexCredentials } from '@/types/aramex'

const AramexSettingsPage: React.FC = () => {
  const { settings, saveSettings, loading, error } = useAramexSettingsJSON()
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [formData, setFormData] = useState<AramexSettings>(settings || {
    credentials: {
      username: '',
      password: '',
      accountNumber: '',
      accountPin: '',
      accountEntity: '',
      accountCountryCode: '',
      apiVersion: 'v1.0',
      source: '24'
    },
    shipperInfo: {
      companyName: '',
      contactName: '',
      phoneNumber: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      stateProvince: '',
      postalCode: '',
      countryCode: ''
    },
    services: [],
    autoCreateShipment: true,
    enabled: true
  })

  React.useEffect(() => {
    if (settings) {
      setFormData(settings)
    }
  }, [settings])

  const handleInputChange = (section: keyof AramexSettings, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: typeof prev[section] === 'object' && prev[section] !== null ? {
        ...prev[section],
        [field]: value
      } : value
    }))
  }

  const handleCredentialsChange = (field: keyof AramexCredentials, value: string) => {
    setFormData(prev => ({
      ...prev,
      credentials: {
        ...prev.credentials,
        [field]: value
      }
    }))
  }

  const handleServiceToggle = (serviceId: string, enabled: boolean) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map(service =>
        service.id === serviceId ? { ...service, enabled } : service
      )
    }))
  }

  const handleServiceLabelChange = (serviceId: string, customLabel: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map(service =>
        service.id === serviceId ? { ...service, customLabel } : service
      )
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await saveSettings(formData)
      setTestResult({ 
        success: true, 
        message: isArabic ? 'تم حفظ إعدادات أرامكس بنجاح' : 'Aramex settings saved successfully' 
      })
    } catch (error) {
      setTestResult({ 
        success: false, 
        message: isArabic 
          ? `خطأ في حفظ الإعدادات: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`
          : `Error saving settings: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestConnection = async () => {
    setIsTesting(true)
    setTestResult(null)
    
    try {
      // Test with a simple rate calculation
      const testRequest = {
        originAddress: {
          line1: formData.shipperInfo.addressLine1,
          city: formData.shipperInfo.city,
          stateOrProvinceCode: formData.shipperInfo.stateProvince,
          postalCode: formData.shipperInfo.postalCode,
          countryCode: formData.shipperInfo.countryCode
        },
        destinationAddress: {
          line1: 'Test Address',
          city: 'Muscat',
          stateOrProvinceCode: 'Muscat',
          postalCode: '111',
          countryCode: 'OM'
        },
        shipmentDetails: {
          dimensions: {
            length: 10,
            width: 10,
            height: 10,
            unit: 'CM' as const
          },
          actualWeight: {
            value: 1,
            unit: 'KG' as const
          },
          productGroup: 'DOM',
          productType: 'OND',
          paymentType: 'P',
          paymentOptions: '',
          services: '',
          descriptionOfGoods: 'Test Package',
          goodsOriginCountry: 'OM'
        }
      }

      await aramexService.calculateShippingRate(testRequest, formData.credentials)
      setTestResult({ 
        success: true, 
        message: isArabic ? 'تم اختبار الاتصال بـ أرامكس بنجاح' : 'Aramex connection test successful' 
      })
    } catch (error) {
      setTestResult({ 
        success: false, 
        message: isArabic 
          ? `فشل اختبار الاتصال: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`
          : `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    } finally {
      setIsTesting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">
                {isArabic ? 'جاري التحميل...' : 'Loading...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {isArabic ? 'إعدادات أرامكس' : 'Aramex Settings'}
          </h1>
          <p className="text-muted-foreground">
            {isArabic 
              ? 'تكوين خدمات الشحن والتتبع مع أرامكس' 
              : 'Configure shipping and tracking services with Aramex'
            }
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <Button 
            variant="outline" 
            onClick={handleTestConnection}
            disabled={isTesting}
          >
            {isTesting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
            ) : (
              <TestTube className="h-4 w-4 mr-2" />
            )}
            {isArabic ? 'اختبار الاتصال' : 'Test Connection'}
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isArabic ? 'حفظ الإعدادات' : 'Save Settings'}
          </Button>
        </div>

        {/* Test Result Alert */}
        {testResult && (
          <Alert className={`mb-6 ${testResult.success ? 'border-green-200 bg-green-50 dark:bg-green-900/20' : 'border-red-200 bg-red-50 dark:bg-red-900/20'}`}>
            {testResult.success ? (
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            )}
            <AlertDescription className={testResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}>
              {testResult.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Settings Tabs */}
        <Tabs defaultValue="credentials" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="credentials">
              {isArabic ? 'بيانات الاعتماد' : 'Credentials'}
            </TabsTrigger>
            <TabsTrigger value="shipper">
              {isArabic ? 'معلومات الشاحن' : 'Shipper Info'}
            </TabsTrigger>
            <TabsTrigger value="services">
              {isArabic ? 'الخدمات' : 'Services'}
            </TabsTrigger>
            <TabsTrigger value="general">
              {isArabic ? 'عام' : 'General'}
            </TabsTrigger>
          </TabsList>

          {/* API Credentials */}
          <TabsContent value="credentials">
            <Card>
              <CardHeader>
                <CardTitle>
                  {isArabic ? 'بيانات اعتماد API أرامكس' : 'Aramex API Credentials'}
                </CardTitle>
                <CardDescription>
                  {isArabic 
                    ? 'أدخل بيانات اعتماد حساب أرامكس الخاص بك'
                    : 'Enter your Aramex account credentials'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">
                      {isArabic ? 'اسم المستخدم' : 'Username'}
                    </Label>
                    <Input
                      id="username"
                      value={formData.credentials.username}
                      onChange={(e) => handleCredentialsChange('username', e.target.value)}
                      placeholder="info@spirithubcafe.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      {isArabic ? 'كلمة المرور' : 'Password'}
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.credentials.password}
                      onChange={(e) => handleCredentialsChange('password', e.target.value)}
                      placeholder="••••••••••"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">
                      {isArabic ? 'رقم الحساب' : 'Account Number'}
                    </Label>
                    <Input
                      id="accountNumber"
                      value={formData.credentials.accountNumber}
                      onChange={(e) => handleCredentialsChange('accountNumber', e.target.value)}
                      placeholder="71925275"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountPin">
                      {isArabic ? 'رقم PIN للحساب' : 'Account PIN'}
                    </Label>
                    <Input
                      id="accountPin"
                      value={formData.credentials.accountPin}
                      onChange={(e) => handleCredentialsChange('accountPin', e.target.value)}
                      placeholder="617333"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accountEntity">
                      {isArabic ? 'كيان الحساب' : 'Account Entity'}
                    </Label>
                    <Input
                      id="accountEntity"
                      value={formData.credentials.accountEntity}
                      onChange={(e) => handleCredentialsChange('accountEntity', e.target.value)}
                      placeholder="MCT"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountCountryCode">
                      {isArabic ? 'رمز بلد الحساب' : 'Country Code'}
                    </Label>
                    <Input
                      id="accountCountryCode"
                      value={formData.credentials.accountCountryCode}
                      onChange={(e) => handleCredentialsChange('accountCountryCode', e.target.value)}
                      placeholder="OM"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="source">
                      {isArabic ? 'مصدر' : 'Source'}
                    </Label>
                    <Input
                      id="source"
                      value={formData.credentials.source}
                      onChange={(e) => handleCredentialsChange('source', e.target.value)}
                      placeholder="24"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apiVersion">
                    {isArabic ? 'إصدار API' : 'API Version'}
                  </Label>
                  <Input
                    id="apiVersion"
                    value={formData.credentials.apiVersion}
                    onChange={(e) => handleCredentialsChange('apiVersion', e.target.value)}
                    placeholder="v1.0"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shipper Information */}
          <TabsContent value="shipper">
            <Card>
              <CardHeader>
                <CardTitle>
                  {isArabic ? 'معلومات الشاحن' : 'Shipper Information'}
                </CardTitle>
                <CardDescription>
                  {isArabic 
                    ? 'تكوين معلومات أصل الشحن الخاصة بك'
                    : 'Configure your shipping origin information'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">
                      {isArabic ? 'اسم الشركة' : 'Company Name'}
                    </Label>
                    <Input
                      id="companyName"
                      value={formData.shipperInfo.companyName}
                      onChange={(e) => handleInputChange('shipperInfo', 'companyName', e.target.value)}
                      placeholder="Spirit Hub"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactName">
                      {isArabic ? 'اسم جهة الاتصال' : 'Contact Name'}
                    </Label>
                    <Input
                      id="contactName"
                      value={formData.shipperInfo.contactName}
                      onChange={(e) => handleInputChange('shipperInfo', 'contactName', e.target.value)}
                      placeholder="Said"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">
                    {isArabic ? 'رقم الهاتف' : 'Phone Number'}
                  </Label>
                  <Input
                    id="phoneNumber"
                    value={formData.shipperInfo.phoneNumber}
                    onChange={(e) => handleInputChange('shipperInfo', 'phoneNumber', e.target.value)}
                    placeholder="92506030"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressLine1">
                    {isArabic ? 'العنوان - السطر الأول' : 'Address Line 1'}
                  </Label>
                  <Input
                    id="addressLine1"
                    value={formData.shipperInfo.addressLine1}
                    onChange={(e) => handleInputChange('shipperInfo', 'addressLine1', e.target.value)}
                    placeholder="Al Hail"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressLine2">
                    {isArabic ? 'العنوان - السطر الثاني (اختياري)' : 'Address Line 2 (Optional)'}
                  </Label>
                  <Input
                    id="addressLine2"
                    value={formData.shipperInfo.addressLine2}
                    onChange={(e) => handleInputChange('shipperInfo', 'addressLine2', e.target.value)}
                    placeholder={isArabic ? 'السطر الثاني للعنوان' : 'Second address line'}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">
                      {isArabic ? 'المدينة' : 'City'}
                    </Label>
                    <Input
                      id="city"
                      value={formData.shipperInfo.city}
                      onChange={(e) => handleInputChange('shipperInfo', 'city', e.target.value)}
                      placeholder="Muscat"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stateProvince">
                      {isArabic ? 'الولاية/المحافظة' : 'State/Province'}
                    </Label>
                    <Input
                      id="stateProvince"
                      value={formData.shipperInfo.stateProvince}
                      onChange={(e) => handleInputChange('shipperInfo', 'stateProvince', e.target.value)}
                      placeholder="Muscat"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">
                      {isArabic ? 'الرمز البريدي' : 'Postal Code'}
                    </Label>
                    <Input
                      id="postalCode"
                      value={formData.shipperInfo.postalCode}
                      onChange={(e) => handleInputChange('shipperInfo', 'postalCode', e.target.value)}
                      placeholder="111"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="countryCode">
                      {isArabic ? 'رمز البلد' : 'Country Code'}
                    </Label>
                    <Input
                      id="countryCode"
                      value={formData.shipperInfo.countryCode}
                      onChange={(e) => handleInputChange('shipperInfo', 'countryCode', e.target.value)}
                      placeholder="OM"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Configuration */}
          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle>
                  {isArabic ? 'تكوين الخدمات' : 'Services Configuration'}
                </CardTitle>
                <CardDescription>
                  {isArabic 
                    ? 'تكوين خدمات أرامكس المتاحة وتسمياتها المخصصة'
                    : 'Configure available Aramex services and their custom labels'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">
                    {isArabic ? 'الخدمات المحلية' : 'Domestic Services'}
                  </h3>
                  <div className="space-y-4">
                    {formData.services.filter(service => service.type === 'domestic').map(service => (
                      <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <Checkbox
                            checked={service.enabled}
                            onCheckedChange={(checked) => handleServiceToggle(service.id, !!checked)}
                          />
                          <div>
                            <div className="font-medium">{service.name}</div>
                            <div className="text-sm text-gray-500">
                              {isArabic ? 'كود:' : 'Code:'} {service.id}
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 max-w-md mr-4">
                          <Input
                            value={service.customLabel}
                            onChange={(e) => handleServiceLabelChange(service.id, e.target.value)}
                            placeholder={isArabic ? 'تسمية مخصصة' : 'Custom label'}
                            disabled={!service.enabled}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">
                    {isArabic ? 'الخدمات الدولية' : 'International Services'}
                  </h3>
                  <div className="space-y-4">
                    {formData.services.filter(service => service.type === 'international').map(service => (
                      <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <Checkbox
                            checked={service.enabled}
                            onCheckedChange={(checked) => handleServiceToggle(service.id, !!checked)}
                          />
                          <div>
                            <div className="font-medium">{service.name}</div>
                            <div className="text-sm text-gray-500">
                              {isArabic ? 'كود:' : 'Code:'} {service.id}
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 max-w-md mr-4">
                          <Input
                            value={service.customLabel}
                            onChange={(e) => handleServiceLabelChange(service.id, e.target.value)}
                            placeholder={isArabic ? 'تسمية مخصصة' : 'Custom label'}
                            disabled={!service.enabled}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* General Settings */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>
                  {isArabic ? 'الإعدادات العامة' : 'General Settings'}
                </CardTitle>
                <CardDescription>
                  {isArabic 
                    ? 'إعدادات عامة للمكون الإضافي وسلوكه'
                    : 'General plugin settings and behavior'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">
                      {isArabic ? 'إنشاء الشحنة تلقائياً' : 'Auto Create Shipment'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {isArabic 
                        ? 'إنشاء شحنة أرامكس تلقائياً عند معالجة الطلب'
                        : 'Automatically create Aramex shipment when order is processed'
                      }
                    </div>
                  </div>
                  <Checkbox
                    checked={formData.autoCreateShipment}
                    onCheckedChange={(checked) => setFormData(prev => ({ 
                      ...prev, 
                      autoCreateShipment: !!checked 
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">
                      {isArabic ? 'وضع الاختبار' : 'Test Mode'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {isArabic 
                        ? 'استخدام خادم أرامكس للاختبار بدلاً من الإنتاج'
                        : 'Use Aramex test server instead of production'
                      }
                    </div>
                  </div>
                  <Checkbox
                    checked={formData.testMode || false}
                    onCheckedChange={(checked) => setFormData(prev => ({ 
                      ...prev, 
                      testMode: !!checked 
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">
                      {isArabic ? 'تسجيل العمليات' : 'Enable Logging'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {isArabic 
                        ? 'حفظ سجل مفصل لجميع عمليات أرامكس'
                        : 'Keep detailed log of all Aramex operations'
                      }
                    </div>
                  </div>
                  <Checkbox
                    checked={formData.enableLogging || false}
                    onCheckedChange={(checked) => setFormData(prev => ({ 
                      ...prev, 
                      enableLogging: !!checked 
                    }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default AramexSettingsPage
