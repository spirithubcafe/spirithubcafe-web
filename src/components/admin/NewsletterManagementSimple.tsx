import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Mail, 
  Download, 
  Trash2, 
  Users, 
  Calendar,
  MoreHorizontal,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { jsonDataService } from '@/services/jsonDataService'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface NewsletterSubscription {
  id: string
  email: string
  status: 'active' | 'inactive'
  subscribed_at: string
  ip_address?: string
  user_agent?: string
  source?: string
}

export default function NewsletterManagement() {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  
  const [subscriptions, setSubscriptions] = useState<NewsletterSubscription[]>([])
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<NewsletterSubscription[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  useEffect(() => {
    loadSubscriptions()
  }, [])

  useEffect(() => {
    filterSubscriptions()
  }, [subscriptions, searchTerm, statusFilter])

  const loadSubscriptions = async () => {
    try {
      setLoading(true)
      const data = await jsonDataService.fetchJSON('/data/newsletter-subscriptions.json')
      if (data && Array.isArray(data)) {
        setSubscriptions(data)
      }
    } catch (error) {
      console.error('Error loading newsletter subscriptions:', error)
      setSubscriptions([])
    } finally {
      setLoading(false)
    }
  }

  const filterSubscriptions = () => {
    let filtered = subscriptions

    if (searchTerm) {
      filtered = filtered.filter(sub => 
        sub.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(sub => sub.status === statusFilter)
    }

    setFilteredSubscriptions(filtered)
  }

  const handleDeleteSubscription = async (id: string) => {
    try {
      const updatedSubscriptions = subscriptions.filter(sub => sub.id !== id)
      await jsonDataService.saveJSON('/data/newsletter-subscriptions.json', updatedSubscriptions)
      setSubscriptions(updatedSubscriptions)
      console.log(isArabic ? 'تم حذف الاشتراك بنجاح' : 'Subscription deleted successfully')
    } catch (error) {
      console.error('Error deleting subscription:', error)
    }
  }

  const handleToggleStatus = async (id: string, newStatus: 'active' | 'inactive') => {
    try {
      const updatedSubscriptions = subscriptions.map(sub =>
        sub.id === id ? { ...sub, status: newStatus } : sub
      )
      await jsonDataService.saveJSON('/data/newsletter-subscriptions.json', updatedSubscriptions)
      setSubscriptions(updatedSubscriptions)
      console.log(isArabic ? 'تم تحديث حالة الاشتراك' : 'Subscription status updated')
    } catch (error) {
      console.error('Error updating subscription status:', error)
    }
  }

  const exportToCSV = () => {
    const csvContent = [
      ['Email', 'Status', 'Subscribed At', 'Source'].join(','),
      ...filteredSubscriptions.map(sub => [
        sub.email,
        sub.status,
        sub.subscribed_at,
        sub.source || 'Website'
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = 'newsletter-subscriptions.csv'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const getStats = () => {
    const total = subscriptions.length
    const active = subscriptions.filter(sub => sub.status === 'active').length
    const inactive = subscriptions.filter(sub => sub.status === 'inactive').length
    
    return { total, active, inactive }
  }

  const stats = getStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">{isArabic ? 'جارٍ التحميل...' : 'Loading...'}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">
            {isArabic ? 'إدارة النشرة البريدية' : 'Newsletter Management'}
          </h2>
          <p className="text-muted-foreground">
            {isArabic ? 'إدارة اشتراكات النشرة البريدية' : 'Manage newsletter subscriptions'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadSubscriptions} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            {isArabic ? 'تحديث' : 'Refresh'}
          </Button>
          <Button onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            {isArabic ? 'تصدير CSV' : 'Export CSV'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'إجمالي الاشتراكات' : 'Total Subscriptions'}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'الاشتراكات النشطة' : 'Active Subscriptions'}
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'الاشتراكات غير النشطة' : 'Inactive Subscriptions'}
            </CardTitle>
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            {isArabic ? 'قائمة الاشتراكات' : 'Subscriptions List'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder={isArabic ? 'البحث بالبريد الإلكتروني...' : 'Search by email...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <select 
              className="px-3 py-2 border rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">{isArabic ? 'جميع الحالات' : 'All Status'}</option>
              <option value="active">{isArabic ? 'نشط' : 'Active'}</option>
              <option value="inactive">{isArabic ? 'غير نشط' : 'Inactive'}</option>
            </select>
          </div>

          <div className="space-y-4">
            {filteredSubscriptions.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {isArabic ? 'لا توجد اشتراكات' : 'No subscriptions found'}
                </p>
              </div>
            ) : (
              filteredSubscriptions.map((subscription) => (
                <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{subscription.email}</span>
                      <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                        {subscription.status === 'active' 
                          ? (isArabic ? 'نشط' : 'Active')
                          : (isArabic ? 'غير نشط' : 'Inactive')
                        }
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(subscription.subscribed_at).toLocaleDateString()}
                      </div>
                      {subscription.source && (
                        <span>Source: {subscription.source}</span>
                      )}
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleToggleStatus(
                          subscription.id,
                          subscription.status === 'active' ? 'inactive' : 'active'
                        )}
                      >
                        {subscription.status === 'active' ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-2" />
                            {isArabic ? 'إلغاء التفعيل' : 'Deactivate'}
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            {isArabic ? 'تفعيل' : 'Activate'}
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteSubscription(subscription.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {isArabic ? 'حذف' : 'Delete'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
