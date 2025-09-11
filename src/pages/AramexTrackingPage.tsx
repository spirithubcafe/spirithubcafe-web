import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useTranslation } from 'react-i18next'
import { Search, Package, MapPin, Clock, AlertCircle, CheckCircle2 } from 'lucide-react'
import { aramexService } from '@/services/aramexService'
import { useAramexSettingsJSON } from '@/hooks/useAramexSettingsJSON'
import type { AramexTrackingResponse } from '@/types/aramex'

export default function AramexTrackingPage() {
  const { trackingNumber } = useParams()
  const [searchParams] = useSearchParams()
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const { settings } = useAramexSettingsJSON()

  const [inputTrackingNumber, setInputTrackingNumber] = useState(trackingNumber || searchParams.get('tracking') || '')
  const [trackingData, setTrackingData] = useState<AramexTrackingResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTrack = async (awbNumber?: string) => {
    const numberToTrack = awbNumber || inputTrackingNumber
    if (!numberToTrack.trim() || !settings) return

    setLoading(true)
    setError(null)

    try {
      const response = await aramexService.trackShipment({
        shipments: [numberToTrack.trim()],
        getLastTrackingUpdateOnly: false
      }, settings.credentials)

      if (response.hasErrors) {
        setError(isArabic ? 'حدث خطأ في الحصول على معلومات التتبع' : 'Error fetching tracking information')
        setTrackingData(null)
      } else {
        setTrackingData(response)
      }
    } catch (err) {
      console.error('Tracking error:', err)
      setError(isArabic ? 'خطأ في الاتصال بالخادم' : 'Connection error')
      setTrackingData(null)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'on vehicle':
      case 'out for delivery':
        return <Package className="h-5 w-5 text-blue-500" />
      case 'exception':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />
    }
  }

  useEffect(() => {
    if (trackingNumber) {
      handleTrack(trackingNumber)
    }
  }, [trackingNumber, settings])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold">
              {isArabic ? 'تتبع شحنات أرامكس' : 'Aramex Shipment Tracking'}
            </h1>
            <p className="text-muted-foreground">
              {isArabic ? 
                'أدخل رقم التتبع الخاص بك لعرض حالة الشحنة' :
                'Enter your tracking number to view shipment status'
              }
            </p>
          </div>

          {/* Search Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-2">
                <Input
                  value={inputTrackingNumber}
                  onChange={(e) => setInputTrackingNumber(e.target.value)}
                  placeholder={isArabic ? 'أدخل رقم التتبع' : 'Enter tracking number'}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleTrack()
                    }
                  }}
                />
                <Button 
                  onClick={() => handleTrack()}
                  disabled={loading || !inputTrackingNumber.trim()}
                >
                  <Search className="h-4 w-4 mr-2" />
                  {loading ? 
                    (isArabic ? 'جاري البحث...' : 'Searching...') :
                    (isArabic ? 'تتبع' : 'Track')
                  }
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <Card className="border-red-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  <span>{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tracking Results */}
          {trackingData && trackingData.shipmentTrackingResults.length > 0 && (
            <div className="space-y-4">
              {trackingData.shipmentTrackingResults.map((result, index) => {
                const statusInfo = aramexService.formatTrackingStatus(result.updateCode)
                
                return (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Package className="h-6 w-6" />
                          <div>
                            <span className="text-lg">
                              {isArabic ? 'رقم بوليصة الشحن:' : 'AWB Number:'}
                            </span>
                            <span className="ml-2 font-mono">{result.waybillNumber}</span>
                          </div>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`${
                            statusInfo.color === 'green' ? 'border-green-500 text-green-600' :
                            statusInfo.color === 'blue' ? 'border-blue-500 text-blue-600' :
                            statusInfo.color === 'red' ? 'border-red-500 text-red-600' :
                            statusInfo.color === 'yellow' ? 'border-yellow-500 text-yellow-600' :
                            'border-gray-500 text-gray-600'
                          }`}
                        >
                          {getStatusIcon(statusInfo.status)}
                          <span className="ml-2">{statusInfo.status}</span>
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Current Status */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h3 className="font-semibold flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {isArabic ? 'آخر حالة' : 'Latest Status'}
                          </h3>
                          <p className="text-sm">{result.updateDescription}</p>
                          {result.comments && (
                            <p className="text-sm text-muted-foreground">{result.comments}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-semibold flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {isArabic ? 'وقت آخر تحديث' : 'Last Update'}
                          </h3>
                          <p className="text-sm">
                            {new Date(result.updateDateTime).toLocaleString(
                              isArabic ? 'ar-SA' : 'en-US'
                            )}
                          </p>
                        </div>
                      </div>

                      <Separator />

                      {/* Location & Weight Info */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {result.updateLocation && (
                          <div className="space-y-1">
                            <h4 className="font-medium text-sm">
                              {isArabic ? 'الموقع' : 'Location'}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {result.updateLocation}
                            </p>
                          </div>
                        )}
                        {result.grossWeight && (
                          <div className="space-y-1">
                            <h4 className="font-medium text-sm">
                              {isArabic ? 'الوزن الإجمالي' : 'Gross Weight'}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {result.grossWeight} {result.weightUnit}
                            </p>
                          </div>
                        )}
                        {result.chargeableWeight && (
                          <div className="space-y-1">
                            <h4 className="font-medium text-sm">
                              {isArabic ? 'الوزن القابل للشحن' : 'Chargeable Weight'}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {result.chargeableWeight} {result.weightUnit}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Problem Code if exists */}
                      {result.problemCode && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                            <span className="font-medium text-yellow-800">
                              {isArabic ? 'رمز المشكلة:' : 'Problem Code:'}
                            </span>
                            <span className="text-yellow-700">{result.problemCode}</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* No Results */}
          {trackingData && trackingData.shipmentTrackingResults.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {isArabic ? 'لم يتم العثور على معلومات' : 'No tracking information found'}
                </h3>
                <p className="text-muted-foreground">
                  {isArabic ? 
                    'يرجى التحقق من رقم التتبع والمحاولة مرة أخرى' :
                    'Please check your tracking number and try again'
                  }
                </p>
              </CardContent>
            </Card>
          )}

          {/* Help Section */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg">
                {isArabic ? 'المساعدة والدعم' : 'Help & Support'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {isArabic ? 
                  'أرقام التتبع تتكون عادة من ١٠-١٢ رقماً ويمكن العثور عليها في بريد تأكيد الطلب الإلكتروني.' :
                  'Tracking numbers are usually 10-12 digits long and can be found in your order confirmation email.'
                }
              </p>
              <p className="text-sm text-muted-foreground">
                {isArabic ? 
                  'في حالة وجود أي مشاكل، اتصل بدعم أرامكس: ٨٠٠-أرامكس (٨٠٠-٤٧٢٦٣٩)' :
                  'For any issues, contact Aramex support: 800-ARAMEX (800-472639)'
                }
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
