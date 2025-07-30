import { DollarSign, Users, Package, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'
import type { UserProfile, Product } from '@/lib/firebase'

interface DashboardAnalyticsProps {
  users: UserProfile[]
  products: Product[]
}

export default function DashboardAnalytics({ users, products }: DashboardAnalyticsProps) {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'إجمالي المبيعات' : 'Total Sales'}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0</div>
            <p className="text-xs text-muted-foreground">
              +0% {isArabic ? 'من الشهر الماضي' : 'from last month'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'إجمالي المستخدمين' : 'Total Users'}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              +{users.filter(u => new Date(u.created).getTime() > Date.now() - 30*24*60*60*1000).length} {isArabic ? 'هذا الشهر' : 'this month'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'إجمالي المنتجات' : 'Total Products'}
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">
              {isArabic ? 'المنتجات النشطة' : 'Active products'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'معدل النمو' : 'Growth Rate'}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+0%</div>
            <p className="text-xs text-muted-foreground">
              +0% {isArabic ? 'من الشهر الماضي' : 'from last month'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isArabic ? 'التحليلات التفصيلية' : 'Detailed Analytics'}</CardTitle>
          <CardDescription>
            {isArabic ? 'إحصائيات مفصلة عن أداء المتجر' : 'Detailed statistics about store performance'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            {isArabic ? 'ستتم إضافة التحليلات التفصيلية قريباً' : 'Detailed analytics coming soon'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
