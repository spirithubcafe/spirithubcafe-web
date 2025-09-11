import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { KeyRound, Eye, EyeOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { UserProfile } from '@/types/dashboard'

interface DashboardProfileProps {
  user: UserProfile
}

export default function DashboardProfile({ user }: DashboardProfileProps) {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  // Password change state
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  const handlePasswordChange = async () => {
    setPasswordError('')
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError(isArabic ? 'كلمات المرور الجديدة غير متطابقة' : 'New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError(isArabic ? 'يجب أن تكون كلمة المرور 6 أحرف على الأقل' : 'Password must be at least 6 characters')
      return
    }

    try {
      setPasswordLoading(true)
      
      // TODO: Implement password change functionality
      console.log('Password change would be implemented here')
      
      setChangePasswordOpen(false)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      // You might want to add a success toast here
      console.log('Password changed successfully')
    } catch (error) {
      setPasswordError('An error occurred while changing password')
      console.error('Password change error:', error)
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{isArabic ? 'الملف الشخصي' : 'Profile Information'}</CardTitle>
          <CardDescription>
            {isArabic ? 'معلومات حسابك الشخصية' : 'Your personal account information'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar || ''} alt={user.name} />
              <AvatarFallback className="text-lg">
                {user.name.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-2xl font-bold">{user.name}</h3>
              <p className="text-muted-foreground">{user.email}</p>
              <Badge variant="outline" className="mt-1">
                {user.role === 'admin' 
                  ? (isArabic ? 'مدير' : 'Admin')
                  : user.role === 'manager'
                  ? (isArabic ? 'مدير' : 'Manager')
                  : (isArabic ? 'عضو' : 'Member')
                }
              </Badge>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full-name">{isArabic ? 'الاسم الكامل' : 'Full Name'}</Label>
              <Input id="full-name" value={user.name} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{isArabic ? 'البريد الإلكتروني' : 'Email'}</Label>
              <Input id="email" value={user.email} readOnly />
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <Button>
              {isArabic ? 'تعديل الملف الشخصي' : 'Edit Profile'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setChangePasswordOpen(true)}
              className="flex items-center gap-2"
            >
              <KeyRound className="h-4 w-4" />
              {isArabic ? 'تغيير كلمة المرور' : 'Change Password'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isArabic ? 'تغيير كلمة المرور' : 'Change Password'}
            </DialogTitle>
            <DialogDescription>
              {isArabic 
                ? 'أدخل كلمة المرور الجديدة أدناه'
                : 'Enter your new password below'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {passwordError && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                {passwordError}
              </div>
            )}
            
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="current-password">
                {isArabic ? 'كلمة المرور الحالية' : 'Current Password'}
              </Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value
                  })}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="new-password">
                {isArabic ? 'كلمة المرور الجديدة' : 'New Password'}
              </Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value
                  })}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirm-password">
                {isArabic ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}
              </Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value
                  })}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setChangePasswordOpen(false)
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                setPasswordError('')
              }}
              disabled={passwordLoading}
            >
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              onClick={handlePasswordChange}
              disabled={passwordLoading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
              className="flex items-center gap-2"
            >
              <KeyRound className="h-4 w-4" />
              {passwordLoading 
                ? (isArabic ? 'جارٍ التغيير...' : 'Changing...')
                : (isArabic ? 'تغيير كلمة المرور' : 'Change Password')
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
