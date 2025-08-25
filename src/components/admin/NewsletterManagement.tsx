import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Mail, 
  Download, 
  Trash2, 
  Search, 
  Users, 
  Calendar,
  Filter,
  MoreHorizontal,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { firestoreService } from '@/lib/firebase'
import toast from 'react-hot-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface NewsletterSubscription {
  id: string
  email: string
  subscribed_at: string
  status: 'active' | 'inactive'
  source: string
}

export function NewsletterManagement() {
  const { i18n } = useTranslation()
  const [subscriptions, setSubscriptions] = useState<NewsletterSubscription[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const isArabic = i18n.language === 'ar'

  useEffect(() => {
    loadSubscriptions(false)
    
    // Set up interval to refresh data every 30 seconds
    const interval = setInterval(() => {
      loadSubscriptions(true)
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const loadSubscriptions = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      console.log('Loading newsletter subscriptions...')
      const result = await firestoreService.newsletters.list()
      console.log('Newsletter subscriptions loaded:', result)
      setSubscriptions(result.items)
    } catch (error) {
      console.error('Error loading newsletter subscriptions:', error)
      toast.error(isArabic ? 'خطأ في تحميل الاشتراكات' : 'Error loading subscriptions')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleDelete = async (id: string) => {
    const confirmMessage = isArabic 
      ? 'هل أنت متأكد من أنك تريد حذف هذا الاشتراك؟'
      : 'Are you sure you want to delete this subscription?'
    
    if (!window.confirm(confirmMessage)) {
      return
    }

    try {
      await firestoreService.newsletters.delete(id)
      setSubscriptions(prev => prev.filter(sub => sub.id !== id))
      toast.success(isArabic ? 'تم حذف الاشتراك بنجاح' : 'Subscription deleted successfully')
    } catch (error) {
      console.error('Error deleting subscription:', error)
      toast.error(isArabic ? 'خطأ في حذف الاشتراك' : 'Error deleting subscription')
    }
  }

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
      await firestoreService.newsletters.updateStatus(id, newStatus)
      setSubscriptions(prev => 
        prev.map(sub => 
          sub.id === id ? { ...sub, status: newStatus } : sub
        )
      )
      toast.success(isArabic ? 'تم تحديث حالة الاشتراك' : 'Subscription status updated')
    } catch (error) {
      console.error('Error updating subscription status:', error)
      toast.error(isArabic ? 'خطأ في تحديث الحالة' : 'Error updating status')
    }
  }

  const downloadEmails = () => {
    const filteredEmails = filteredSubscriptions.map(sub => sub.email).join('\n')
    const blob = new Blob([filteredEmails], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `newsletter-emails-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    
    toast.success(isArabic ? 'تم تحميل قائمة الإيميلات' : 'Email list downloaded')
  }

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const activeCount = subscriptions.filter(sub => sub.status === 'active').length
  const inactiveCount = subscriptions.filter(sub => sub.status === 'inactive').length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isArabic ? 'إدارة النشرة الإخبارية' : 'Newsletter Management'}
          </h1>
          <p className="text-muted-foreground">
            {isArabic ? 'إدارة اشتراكات النشرة الإخبارية' : 'Manage newsletter subscriptions'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => loadSubscriptions(true)} 
            variant="outline"
            className="flex items-center gap-2"
            disabled={loading || refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${(loading || refreshing) ? 'animate-spin' : ''}`} />
            {isArabic ? 'تحديث' : 'Refresh'}
          </Button>
          <Button onClick={downloadEmails} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            {isArabic ? 'تحميل الإيميلات' : 'Download Emails'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? 'إجمالي الاشتراكات' : 'Total Subscriptions'}
                </p>
                <p className="text-2xl font-bold">{subscriptions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Eye className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? 'النشطة' : 'Active'}
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{activeCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-100 dark:bg-gray-900/20 rounded-lg">
                <EyeOff className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? 'غير النشطة' : 'Inactive'}
                </p>
                <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{inactiveCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            {isArabic ? 'قائمة المشتركين' : 'Subscriber List'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={isArabic ? 'البحث بالإيميل...' : 'Search by email...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                {isArabic ? 'الكل' : 'All'}
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('active')}
              >
                {isArabic ? 'النشطة' : 'Active'}
              </Button>
              <Button
                variant={statusFilter === 'inactive' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('inactive')}
              >
                {isArabic ? 'غير النشطة' : 'Inactive'}
              </Button>
            </div>
          </div>

          {/* Subscriptions Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium">
                      {isArabic ? 'البريد الإلكتروني' : 'Email'}
                    </th>
                    <th className="text-left p-4 font-medium">
                      {isArabic ? 'تاريخ الاشتراك' : 'Subscribed Date'}
                    </th>
                    <th className="text-left p-4 font-medium">
                      {isArabic ? 'الحالة' : 'Status'}
                    </th>
                    <th className="text-left p-4 font-medium">
                      {isArabic ? 'المصدر' : 'Source'}
                    </th>
                    <th className="text-left p-4 font-medium">
                      {isArabic ? 'الإجراءات' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscriptions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-muted-foreground">
                        {isArabic ? 'لا توجد اشتراكات' : 'No subscriptions found'}
                      </td>
                    </tr>
                  ) : (
                    filteredSubscriptions.map((subscription) => (
                      <tr key={subscription.id} className="border-t hover:bg-muted/25">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{subscription.email}</span>
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {new Date(subscription.subscribed_at).toLocaleDateString(
                              isArabic ? 'ar-SA' : 'en-US'
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge 
                            variant={subscription.status === 'active' ? 'default' : 'secondary'}
                            className={subscription.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : ''}
                          >
                            {subscription.status === 'active' 
                              ? (isArabic ? 'نشط' : 'Active')
                              : (isArabic ? 'غير نشط' : 'Inactive')
                            }
                          </Badge>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {subscription.source || 'homepage'}
                        </td>
                        <td className="p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleStatusToggle(subscription.id, subscription.status)}
                              >
                                {subscription.status === 'active' 
                                  ? (isArabic ? 'إلغاء التفعيل' : 'Deactivate')
                                  : (isArabic ? 'تفعيل' : 'Activate')
                                }
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(subscription.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {isArabic ? 'حذف' : 'Delete'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
