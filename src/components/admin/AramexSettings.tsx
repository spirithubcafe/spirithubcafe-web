import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useAramexSettingsJSON } from '@/hooks/useAramexSettingsJSON'
import { useTranslation } from 'react-i18next'
import { Loader2, TestTube, Package, Settings, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'
import { aramexService } from '@/services/aramexService'

export function AramexSettings() {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const { 
    settings, 
    loading, 
    error, 
    updateCredentials,
    updateShipperInfo,
    toggleService,
    updateServiceLabel,
    toggleAutoCreateShipment,
    toggleEnabled
  } = useAramexSettingsJSON()

  const [testing, setTesting] = useState(false)

  const handleTestConnection = async () => {
    if (!settings) return

    setTesting(true)
    try {
      // Test with a sample rate calculation
      const testRequest = {
        originAddress: {
          line1: settings.shipperInfo.addressLine1,
          city: settings.shipperInfo.city,
          stateOrProvinceCode: settings.shipperInfo.stateProvince,
          postalCode: settings.shipperInfo.postalCode,
          countryCode: settings.shipperInfo.countryCode
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
          productGroup: 'EXP',
          productType: 'PPX',
          paymentType: 'P',
          paymentOptions: '',
          services: '',
          descriptionOfGoods: 'Test Package',
          goodsOriginCountry: 'OM'
        }
      }

      await aramexService.calculateShippingRate(testRequest, settings.credentials)
      toast.success(isArabic ? 'تم الاتصال بآرامكس بنجاح' : 'Aramex connection successful')
    } catch (error) {
      console.error('Test connection failed:', error)
      toast.error(isArabic ? 'فشل في الاتصال بآرامكس' : 'Aramex connection failed')
    } finally {
      setTesting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !settings) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">{error || 'Failed to load settings'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {isArabic ? 'إعدادات آرامكس' : 'Aramex Settings'}
          </h1>
          <p className="text-muted-foreground">
            {isArabic ? 'إدارة تكوين شحن آرامكس' : 'Manage Aramex shipping configuration'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleTestConnection}
            disabled={testing || !settings.enabled}
            variant="outline"
          >
            {testing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <TestTube className="h-4 w-4 mr-2" />
            )}
            {isArabic ? 'اختبار الاتصال' : 'Test Connection'}
          </Button>
          <div className="flex items-center gap-2">
            <Label>{isArabic ? 'مفعل' : 'Enabled'}</Label>
            <Switch
              checked={settings.enabled}
              onCheckedChange={toggleEnabled}
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="credentials" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="credentials" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            {isArabic ? 'أوراق الاعتماد' : 'Credentials'}
          </TabsTrigger>
          <TabsTrigger value="shipper" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            {isArabic ? 'معلومات المرسل' : 'Shipper Info'}
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            {isArabic ? 'الخدمات' : 'Services'}
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            {isArabic ? 'عام' : 'General'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="credentials">
          <Card>
            <CardHeader>
              <CardTitle>
                {isArabic ? 'أوراق اعتماد واجهة برمجة التطبيقات' : 'API Credentials'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isArabic ? 'اسم المستخدم' : 'Username'}</Label>
                  <Input
                    value={settings.credentials.username}
                    onChange={(e) => updateCredentials({ username: e.target.value })}
                    placeholder="info@spirithubcafe.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isArabic ? 'كلمة المرور' : 'Password'}</Label>
                  <Input
                    type="password"
                    value={settings.credentials.password}
                    onChange={(e) => updateCredentials({ password: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isArabic ? 'رقم الحساب' : 'Account Number'}</Label>
                  <Input
                    value={settings.credentials.accountNumber}
                    onChange={(e) => updateCredentials({ accountNumber: e.target.value })}
                    placeholder="71925275"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isArabic ? 'رقم PIN للحساب' : 'Account PIN'}</Label>
                  <Input
                    value={settings.credentials.accountPin}
                    onChange={(e) => updateCredentials({ accountPin: e.target.value })}
                    placeholder="617333"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isArabic ? 'كيان الحساب' : 'Account Entity'}</Label>
                  <Input
                    value={settings.credentials.accountEntity}
                    onChange={(e) => updateCredentials({ accountEntity: e.target.value })}
                    placeholder="MCT"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isArabic ? 'كود دولة الحساب' : 'Account Country Code'}</Label>
                  <Input
                    value={settings.credentials.accountCountryCode}
                    onChange={(e) => updateCredentials({ accountCountryCode: e.target.value })}
                    placeholder="OM"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isArabic ? 'إصدار واجهة برمجة التطبيقات' : 'API Version'}</Label>
                  <Input
                    value={settings.credentials.apiVersion}
                    onChange={(e) => updateCredentials({ apiVersion: e.target.value })}
                    placeholder="v1.0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isArabic ? 'المصدر' : 'Source'}</Label>
                  <Input
                    value={settings.credentials.source}
                    onChange={(e) => updateCredentials({ source: e.target.value })}
                    placeholder="24"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipper">
          <Card>
            <CardHeader>
              <CardTitle>
                {isArabic ? 'معلومات المرسل' : 'Shipper Information'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isArabic ? 'اسم الشركة' : 'Company Name'}</Label>
                  <Input
                    value={settings.shipperInfo.companyName}
                    onChange={(e) => updateShipperInfo({ companyName: e.target.value })}
                    placeholder="Spirit Hub"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isArabic ? 'اسم جهة الاتصال' : 'Contact Name'}</Label>
                  <Input
                    value={settings.shipperInfo.contactName}
                    onChange={(e) => updateShipperInfo({ contactName: e.target.value })}
                    placeholder="Said"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isArabic ? 'رقم الهاتف' : 'Phone Number'}</Label>
                  <Input
                    value={settings.shipperInfo.phoneNumber}
                    onChange={(e) => updateShipperInfo({ phoneNumber: e.target.value })}
                    placeholder="92506030"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isArabic ? 'العنوان الأول' : 'Address Line 1'}</Label>
                  <Input
                    value={settings.shipperInfo.addressLine1}
                    onChange={(e) => updateShipperInfo({ addressLine1: e.target.value })}
                    placeholder="Al Hail"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isArabic ? 'العنوان الثاني' : 'Address Line 2'}</Label>
                  <Input
                    value={settings.shipperInfo.addressLine2 || ''}
                    onChange={(e) => updateShipperInfo({ addressLine2: e.target.value })}
                    placeholder={isArabic ? 'اختياري' : 'Optional'}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isArabic ? 'المدينة' : 'City'}</Label>
                  <Input
                    value={settings.shipperInfo.city}
                    onChange={(e) => updateShipperInfo({ city: e.target.value })}
                    placeholder="Muscat"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isArabic ? 'الولاية/المحافظة' : 'State/Province'}</Label>
                  <Input
                    value={settings.shipperInfo.stateProvince}
                    onChange={(e) => updateShipperInfo({ stateProvince: e.target.value })}
                    placeholder="Muscat"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isArabic ? 'الرمز البريدي' : 'Postal Code'}</Label>
                  <Input
                    value={settings.shipperInfo.postalCode}
                    onChange={(e) => updateShipperInfo({ postalCode: e.target.value })}
                    placeholder="111"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isArabic ? 'كود الدولة' : 'Country Code'}</Label>
                  <Input
                    value={settings.shipperInfo.countryCode}
                    onChange={(e) => updateShipperInfo({ countryCode: e.target.value })}
                    placeholder="OM"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>
                {isArabic ? 'تكوين الخدمات' : 'Services Configuration'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {settings.services.map((service) => (
                  <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={service.enabled}
                        onCheckedChange={(enabled) => toggleService(service.id, enabled)}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{service.name}</span>
                          <Badge variant={service.type === 'domestic' ? 'default' : 'secondary'}>
                            {service.type === 'domestic' ? 
                              (isArabic ? 'داخلی' : 'Domestic') : 
                              (isArabic ? 'بین‌المللی' : 'International')
                            }
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {service.id}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        value={service.customLabel}
                        onChange={(e) => updateServiceLabel(service.id, e.target.value)}
                        placeholder={isArabic ? 'تسمية مخصصة' : 'Custom Label'}
                        className="w-64"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>
                {isArabic ? 'الإعدادات العامة' : 'General Settings'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">
                    {isArabic ? 'إنشاء الشحنة تلقائياً' : 'Auto Create Shipment'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? 
                      'إنشاء شحنة آرامكس تلقائياً بعد معالجة الطلب' :
                      'Automatically create Aramex shipment after order processing'
                    }
                  </p>
                </div>
                <Switch
                  checked={settings.autoCreateShipment}
                  onCheckedChange={toggleAutoCreateShipment}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
