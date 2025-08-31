import { CreditCard, MapPin, Settings as SettingsIcon } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import { AdminDebugControlPanel } from '@/components/admin/admin-debug-control-panel'

export default function DashboardSettings() {
  const { i18n } = useTranslation()
  const { currentUser } = useAuth()
  const isArabic = i18n.language === 'ar'
  const isAdmin = currentUser?.role === 'admin'

  return (
    <div className="space-y-6">
      {/* Admin Debug Control Panel - Only visible for admins */}
      {isAdmin && (
        <AdminDebugControlPanel />
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>{isArabic ? 'الإعدادات' : 'Settings'}</CardTitle>
          <CardDescription>
            {isArabic ? 'إدارة تفضيلات حسابك' : 'Manage your account preferences'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">
              {isArabic ? 'الإشعارات' : 'Notifications'}
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {isArabic ? 'إشعارات الطلبات' : 'Order Updates'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? 'تلقي إشعارات حول حالة طلباتك' : 'Receive updates about your orders'}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  {isArabic ? 'تفعيل' : 'Enable'}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {isArabic ? 'العروض الترويجية' : 'Promotional Offers'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? 'تلقي إشعارات حول العروض والخصومات' : 'Get notified about special offers and discounts'}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  {isArabic ? 'تفعيل' : 'Enable'}
                </Button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">
              {isArabic ? 'الخصوصية والأمان' : 'Privacy & Security'}
            </h3>
            <div className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                <CreditCard className="h-4 w-4 mr-2" />
                {isArabic ? 'إدارة طرق الدفع' : 'Manage Payment Methods'}
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MapPin className="h-4 w-4 mr-2" />
                {isArabic ? 'إدارة العناوين' : 'Manage Addresses'}
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <SettingsIcon className="h-4 w-4 mr-2" />
                {isArabic ? 'تغيير كلمة المرور' : 'Change Password'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
