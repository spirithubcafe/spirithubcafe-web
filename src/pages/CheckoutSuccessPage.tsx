import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'
// Order storage service - will be connected to Google Sheets later
// import { firestoreService } from '@/lib/firebase'
import { bankMuscatPaymentService } from '@/services/bankMuscatPayment'

export default function CheckoutSuccessPage() {
  const { i18n } = useTranslation()
  const [searchParams] = useSearchParams()
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'failed'>('loading')
  const [orderDetails, setOrderDetails] = useState<any>(null)

  const isArabic = i18n.language === 'ar'
  const orderId = searchParams.get('order_id')
  const transactionId = searchParams.get('transaction_id')

  useEffect(() => {
    const verifyPayment = async () => {
      if (!orderId) {
        setVerificationStatus('failed')
        return
      }

      try {
        // Get order details
        // TODO: Connect to Google Sheets API for order management
        // For now, get from localStorage
        const orders = JSON.parse(localStorage.getItem('orders') || '[]')
        const order = orders.find((o: any) => o.id === orderId)
        setOrderDetails(order)

        if (transactionId) {
          // Verify payment with Bank Muscat
          const verification = await bankMuscatPaymentService.verifyPayment(transactionId, orderId)
          
          if (verification.success) {
            // Update order status to paid (placeholder for Google Sheets)
            console.log('Updating order status to paid:', orderId)
            
            // Update localStorage for now
            const orders = JSON.parse(localStorage.getItem('orders') || '[]')
            const updatedOrders = orders.map((o: any) => 
              o.id === orderId 
                ? { ...o, payment_status: 'paid', status: 'confirmed' }
                : o
            )
            localStorage.setItem('orders', JSON.stringify(updatedOrders))
            
            setVerificationStatus('success')
          } else {
            setVerificationStatus('failed')
          }
        } else {
          // No transaction ID - payment might have failed
          setVerificationStatus('failed')
        }
      } catch (error) {
        console.error('Payment verification error:', error)
        setVerificationStatus('failed')
      }
    }

    verifyPayment()
  }, [orderId, transactionId])

  if (verificationStatus === 'loading') {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
              <h1 className="text-2xl font-bold">
                {isArabic ? 'جاري التحقق من الدفع...' : 'Verifying Payment...'}
              </h1>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                {verificationStatus === 'success' ? (
                  <CheckCircle className="h-16 w-16 text-green-500" />
                ) : (
                  <XCircle className="h-16 w-16 text-red-500" />
                )}
              </div>
              <CardTitle className="text-2xl">
                {verificationStatus === 'success' 
                  ? (isArabic ? 'تم الدفع بنجاح!' : 'Payment Successful!')
                  : (isArabic ? 'فشل في الدفع' : 'Payment Failed')
                }
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {verificationStatus === 'success' ? (
                <>
                  <div className="text-center">
                    <p className="text-muted-foreground">
                      {isArabic 
                        ? 'شكراً لك! تم استلام طلبك وسيتم معالجته قريباً.'
                        : 'Thank you! Your order has been received and will be processed soon.'
                      }
                    </p>
                  </div>
                  
                  {orderDetails && (
                    <div className="bg-muted p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">
                        {isArabic ? 'تفاصيل الطلب:' : 'Order Details:'}
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>{isArabic ? 'رقم الطلب:' : 'Order Number:'}</span>
                          <span className="font-mono">{orderDetails.order_number}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{isArabic ? 'المبلغ المدفوع:' : 'Amount Paid:'}</span>
                          <span className="font-semibold">
                            {orderDetails.currency === 'OMR' && `${orderDetails.total_price_omr?.toFixed(2)} OMR`}
                            {orderDetails.currency === 'USD' && `$${orderDetails.total_price_usd?.toFixed(2)}`}
                            {orderDetails.currency === 'SAR' && `${orderDetails.total_price_sar?.toFixed(2)} SAR`}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>{isArabic ? 'البريد الإلكتروني:' : 'Email:'}</span>
                          <span>{orderDetails.customer_email}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">
                    {isArabic 
                      ? 'فشلت عملية الدفع. يرجى المحاولة مرة أخرى أو الاتصال بنا للمساعدة.'
                      : 'Payment failed. Please try again or contact us for assistance.'
                    }
                  </p>
                  {orderDetails && (
                    <p className="text-sm text-muted-foreground">
                      {isArabic ? 'رقم الطلب:' : 'Order Number:'} {orderDetails.order_number}
                    </p>
                  )}
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <Link to="/" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    {isArabic ? 'العودة للرئيسية' : 'Back to Home'}
                  </Link>
                </Button>
                {verificationStatus === 'success' && (
                  <Button variant="outline" asChild>
                    <Link to="/dashboard/orders">
                      {isArabic ? 'عرض طلباتي' : 'View My Orders'}
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
