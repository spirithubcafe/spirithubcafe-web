import { useState } from 'react'
import type { FormEvent } from 'react'
import { Crown, User, KeyRound, Mail, MailCheck, Edit } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTranslation } from 'react-i18next'
import type { UserProfile } from '@/types/dashboard'
import { jsonDataService } from '@/services/jsonDataService'

interface DashboardUsersProps {
  users: UserProfile[]
  onUsersUpdate: (users: UserProfile[]) => void
  loading: boolean
}

export default function DashboardUsers({ users, onUsersUpdate, loading }: DashboardUsersProps) {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  
  // State for user editing
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [passwordResetDialogOpen, setPasswordResetDialogOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [passwordResetLoading, setPasswordResetLoading] = useState(false)

  const handleUserEdit = (user: UserProfile) => {
    setSelectedUser(user)
    setEditDialogOpen(true)
  }

  const handleUserView = (user: UserProfile) => {
    setSelectedUser(user)
    setViewDialogOpen(true)
  }

  const handlePasswordReset = (user: UserProfile) => {
    setSelectedUser(user)
    setPasswordResetDialogOpen(true)
  }

  const handlePasswordResetConfirm = async () => {
    if (!selectedUser) return

    try {
      setPasswordResetLoading(true)
      
      // TODO: Implement password reset functionality
      console.log('Password reset would be sent to:', selectedUser.email)
      
      // Simulate success
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('Password reset email sent successfully')
      setPasswordResetDialogOpen(false)
      setSelectedUser(null)
    } catch (error) {
      console.error('Error sending password reset:', error)
    } finally {
      setPasswordResetLoading(false)
    }
  }

  const handleRoleChange = (value: string) => {
    if (selectedUser) {
      setSelectedUser({
        ...selectedUser,
        role: value as UserProfile['role']
      })
    }
  }

  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return

    try {
      setEditLoading(true)
      
      // Update user in the users array
      const updatedUsers = users.map(user => 
        user.id === selectedUser.id 
          ? { ...selectedUser, updated: new Date().toISOString() }
          : user
      )
      
      // Save to JSON file
      await jsonDataService.updateUsers(updatedUsers)
      
      // Update parent component
      onUsersUpdate(updatedUsers)
      
      setEditDialogOpen(false)
      setSelectedUser(null)
    } catch (error) {
      console.error('Error updating user:', error)
    } finally {
      setEditLoading(false)
    }
  }

  const getRoleIcon = (role: UserProfile['role']) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-3 w-3" />
      case 'manager':
        return <User className="h-3 w-3" />
      default:
        return <User className="h-3 w-3" />
    }
  }

  const getRoleLabel = (role: UserProfile['role']) => {
    switch (role) {
      case 'admin':
        return isArabic ? 'مدير' : 'Admin'
      case 'manager':
        return isArabic ? 'مدير' : 'Manager'
      default:
        return isArabic ? 'عضو' : 'User'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>{isArabic ? 'جارٍ التحميل...' : 'Loading...'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">
            {isArabic ? 'إدارة المستخدمين' : 'User Management'}
          </h2>
          <p className="text-muted-foreground">
            {isArabic ? 'إدارة حسابات المستخدمين والأذونات' : 'Manage user accounts and permissions'}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <Card key={user.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="" alt={user.name} />
                  <AvatarFallback>
                    {user.name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Badge variant="outline" className="flex items-center gap-1">
                      {getRoleIcon(user.role)}
                      {getRoleLabel(user.role)}
                    </Badge>
                    {user.is_active && (
                      <Badge variant="default" className="text-xs">
                        {isArabic ? 'نشط' : 'Active'}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUserView(user)}
                  className="flex items-center gap-1"
                >
                  <Mail className="h-3 w-3" />
                  {isArabic ? 'عرض' : 'View'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUserEdit(user)}
                  className="flex items-center gap-1"
                >
                  <Edit className="h-3 w-3" />
                  {isArabic ? 'تعديل' : 'Edit'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePasswordReset(user)}
                  className="flex items-center gap-1"
                >
                  <KeyRound className="h-3 w-3" />
                  {isArabic ? 'إعادة تعيين' : 'Reset'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {isArabic ? 'لا يوجد مستخدمون' : 'No users found'}
          </p>
        </div>
      )}

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isArabic ? 'تعديل المستخدم' : 'Edit User'}
            </DialogTitle>
            <DialogDescription>
              {isArabic ? 'تعديل معلومات المستخدم والأذونات' : 'Update user information and permissions'}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  {isArabic ? 'الاسم' : 'Name'}
                </Label>
                <Input
                  id="name"
                  value={selectedUser.name}
                  onChange={(e) => setSelectedUser({
                    ...selectedUser,
                    name: e.target.value
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  {isArabic ? 'البريد الإلكتروني' : 'Email'}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({
                    ...selectedUser,
                    email: e.target.value
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  {isArabic ? 'رقم الهاتف' : 'Phone'}
                </Label>
                <Input
                  id="phone"
                  value={selectedUser.phone || ''}
                  onChange={(e) => setSelectedUser({
                    ...selectedUser,
                    phone: e.target.value
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">
                  {isArabic ? 'الدور' : 'Role'}
                </Label>
                <Select value={selectedUser.role} onValueChange={handleRoleChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {isArabic ? 'عضو' : 'User'}
                      </div>
                    </SelectItem>
                    <SelectItem value="manager">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {isArabic ? 'مدير' : 'Manager'}
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4" />
                        {isArabic ? 'مدير النظام' : 'Admin'}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditDialogOpen(false)}
                  disabled={editLoading}
                >
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button type="submit" disabled={editLoading}>
                  {editLoading 
                    ? (isArabic ? 'جارٍ الحفظ...' : 'Saving...')
                    : (isArabic ? 'حفظ' : 'Save')
                  }
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* View User Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isArabic ? 'عرض المستخدم' : 'View User'}
            </DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="" alt={selectedUser.name} />
                  <AvatarFallback>
                    {selectedUser.name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      {getRoleIcon(selectedUser.role)}
                      {getRoleLabel(selectedUser.role)}
                    </Badge>
                    {selectedUser.email_verified && (
                      <Badge variant="default" className="flex items-center gap-1">
                        <MailCheck className="h-3 w-3" />
                        {isArabic ? 'تم التحقق' : 'Verified'}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                <div>
                  <Label>{isArabic ? 'تاريخ الإنشاء' : 'Created Date'}</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedUser.created).toLocaleDateString(isArabic ? 'ar-AE' : 'en-US')}
                  </p>
                </div>
                
                {selectedUser.phone && (
                  <div>
                    <Label>{isArabic ? 'رقم الهاتف' : 'Phone'}</Label>
                    <p className="text-sm text-muted-foreground">{selectedUser.phone}</p>
                  </div>
                )}

                {selectedUser.updated && (
                  <div>
                    <Label>{isArabic ? 'آخر تحديث' : 'Last Updated'}</Label>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedUser.updated).toLocaleDateString(isArabic ? 'ar-AE' : 'en-US')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>
              {isArabic ? 'إغلاق' : 'Close'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Reset Dialog */}
      <Dialog open={passwordResetDialogOpen} onOpenChange={setPasswordResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isArabic ? 'إعادة تعيين كلمة المرور' : 'Reset Password'}
            </DialogTitle>
            <DialogDescription>
              {selectedUser && (
                isArabic 
                  ? `إعادة تعيين كلمة المرور للمستخدم: ${selectedUser.name}`
                  : `Reset password for user: ${selectedUser.name}`
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                {isArabic 
                  ? 'سيتم إرسال رابط استرداد كلمة المرور إلى عنوان البريد الإلكتروني للمستخدم.'
                  : 'A password recovery link will be sent to the user\'s email address.'
                }
              </p>
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <code className="text-sm">{selectedUser.email}</code>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPasswordResetDialogOpen(false)}
              disabled={passwordResetLoading}
            >
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              onClick={handlePasswordResetConfirm}
              disabled={passwordResetLoading}
              className="flex items-center gap-2"
            >
              <KeyRound className="h-4 w-4" />
              {passwordResetLoading 
                ? (isArabic ? 'جارٍ الإرسال...' : 'Sending...')
                : (isArabic ? 'إرسال رابط الاسترداد' : 'Send Recovery Link')
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
