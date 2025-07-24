import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth-provider'
import { firestoreService, type UserProfile } from '@/lib/firebase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'
import { Trash2, Shield, User, Users, Crown, Store, Briefcase } from 'lucide-react'

export function AdminPage() {
  const { currentUser, loading } = useAuth()
  const { t } = useTranslation()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [stats, setStats] = useState({ totalUsers: 0, adminUsers: 0, shopOwners: 0, regularUsers: 0 })
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Check if user is admin
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600"></div>
          <p className="mt-4 text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  useEffect(() => {
    loadUsers()
    loadStats()
  }, [])

  const loadUsers = async () => {
    try {
      setLoadingUsers(true)
      const result = await firestoreService.users.list()
      setUsers(result.items)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const loadStats = async () => {
    try {
      const result = await firestoreService.users.getStats()
      setStats(result)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'shop_owner' | 'employee' | 'user') => {
    try {
      await firestoreService.users.updateRole(userId, newRole)
      await loadUsers()
      await loadStats()
    } catch (error) {
      console.error('Error updating user role:', error)
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return
    
    try {
      await firestoreService.users.delete(selectedUser.id)
      await loadUsers()
      await loadStats()
      setShowDeleteDialog(false)
      setSelectedUser(null)
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Crown className="h-6 w-6 text-amber-600" />
        <h1 className="text-3xl font-bold">پنل مدیریت</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">کل کاربران</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مدیران</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.adminUsers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">کاربران فروشگاه</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.shopOwners}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">کاربران عادی</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.regularUsers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>مدیریت کاربران</CardTitle>
          <CardDescription>
            مدیریت دسترسی‌ها و نقش‌های کاربران
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingUsers ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
              <p className="mt-2 text-muted-foreground">در حال بارگذاری...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>نام</TableHead>
                  <TableHead>ایمیل</TableHead>
                  <TableHead>تلفن</TableHead>
                  <TableHead>نقش</TableHead>
                  <TableHead>تاریخ عضویت</TableHead>
                  <TableHead>عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || '-'}</TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(newRole: 'admin' | 'shop_owner' | 'employee' | 'user') => handleRoleChange(user.id, newRole)}
                        disabled={user.id === currentUser.id} // Cannot change own role
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4" />
                              <span>کاربر</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="employee">
                            <div className="flex items-center space-x-2">
                              <Briefcase className="h-4 w-4" />
                              <span>موظف المتجر</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="shop_owner">
                            <div className="flex items-center space-x-2">
                              <Store className="h-4 w-4" />
                              <span>کاربر فروشگاه</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="admin">
                            <div className="flex items-center space-x-2">
                              <Shield className="h-4 w-4" />
                              <span>مدیر</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{formatDate(user.created)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Badge variant={
                          user.role === 'admin' ? 'default' : 
                          user.role === 'shop_owner' ? 'outline' : 
                          user.role === 'employee' ? 'outline' :
                          'secondary'
                        }>
                          {user.role === 'admin' ? 'مدیر' : 
                           user.role === 'shop_owner' ? 'کاربر فروشگاه' : 
                           user.role === 'employee' ? 'موظف المتجر' :
                           'کاربر'}
                        </Badge>
                        {user.id !== currentUser.id && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user)
                              setShowDeleteDialog(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف کاربر</DialogTitle>
            <DialogDescription>
              آیا مطمئن هستید که می‌خواهید کاربر "{selectedUser?.full_name}" را حذف کنید؟
              این عمل غیرقابل برگشت است.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              انصراف
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
