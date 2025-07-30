import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'

export default function DashboardAdminOrders() {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{isArabic ? 'جميع الطلبات' : 'All Orders'}</CardTitle>
          <CardDescription>
            {isArabic ? 'إدارة جميع طلبات المتجر' : 'Manage all store orders'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            {isArabic ? 'ستتم إضافة إدارة الطلبات قريباً' : 'Order management coming soon'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
