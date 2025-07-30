import { useState } from 'react'
import type { FormEvent } from 'react'
import { Crown, Briefcase, User } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTranslation } from 'react-i18next'
import type { UserProfile } from '@/lib/firebase'
import { firestoreService } from '@/lib/firebase'

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
  const [editLoading, setEditLoading] = useState(false)

  const handleUserEdit = (user: UserProfile) => {
    setSelectedUser(user)
    setEditDialogOpen(true)
  }

  const handleUserView = (user: UserProfile) => {
    setSelectedUser(user)
    setViewDialogOpen(true)
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
      
      await firestoreService.users.update(selectedUser.id, {
        full_name: selectedUser.full_name,
        email: selectedUser.email,
        role: selectedUser.role
      })

      const allUsers = await firestoreService.users.list()
      onUsersUpdate(allUsers.items)
      
      setEditDialogOpen(false)
      setSelectedUser(null)
    } catch (error) {
      console.error('Error updating user:', error)
    } finally {
      setEditLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{isArabic ? 'إدارة المستخدمين' : 'User Management'}</CardTitle>
          <CardDescription>
            {isArabic ? 'عرض وإدارة جميع المستخدمين' : 'View and manage all users'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              {isArabic ? 'لا يوجد مستخدمين' : 'No users found'}
            </p>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <Card key={user.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={user.avatar} alt={user.full_name} />
                          <AvatarFallback>
                            {user.full_name.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{user.full_name}</h3>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <Badge variant="outline" className="mt-1">
                            <div className="flex items-center gap-1">
                              {user.role === 'admin' && <Crown className="h-3 w-3" />}
                              {user.role === 'employee' && <Briefcase className="h-3 w-3" />}
                              {user.role === 'user' && <User className="h-3 w-3" />}
                              {user.role === 'admin' 
                                ? (isArabic ? 'مدير' : 'Admin')
                                : user.role === 'employee'
                                ? (isArabic ? 'موظف' : 'Employee')
                                : (isArabic ? 'عضو' : 'Member')
                              }
                            </div>
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUserView(user)}
                        >
                          {isArabic ? 'عرض' : 'View'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUserEdit(user)}
                        >
                          {isArabic ? 'تعديل' : 'Edit'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isArabic ? 'تعديل المستخدم' : 'Edit User'}
            </DialogTitle>
            <DialogDescription>
              {isArabic ? 'تعديل معلومات المستخدم ودوره' : 'Edit user information and role'}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">
                  {isArabic ? 'الاسم الكامل' : 'Full Name'}
                </Label>
                <Input
                  id="edit-name"
                  value={selectedUser.full_name}
                  onChange={(e) => setSelectedUser({
                    ...selectedUser,
                    full_name: e.target.value
                  })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">
                  {isArabic ? 'البريد الإلكتروني' : 'Email'}
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({
                    ...selectedUser,
                    email: e.target.value
                  })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">
                  {isArabic ? 'الدور' : 'Role'}
                </Label>
                <Select onValueChange={handleRoleChange} value={selectedUser.role}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {isArabic ? 'عضو' : 'Member'}
                      </div>
                    </SelectItem>
                    <SelectItem value="employee">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        {isArabic ? 'موظف' : 'Employee'}
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4" />
                        {isArabic ? 'مدير' : 'Admin'}
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
                >
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button type="submit" disabled={editLoading}>
                  {editLoading 
                    ? (isArabic ? 'جاري الحفظ...' : 'Saving...')
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
              {isArabic ? 'تفاصيل المستخدم' : 'User Details'}
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedUser.avatar} alt={selectedUser.full_name} />
                  <AvatarFallback>
                    {selectedUser.full_name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedUser.full_name}</h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                  <Badge variant="outline" className="mt-1">
                    <div className="flex items-center gap-1">
                      {selectedUser.role === 'admin' && <Crown className="h-3 w-3" />}
                      {selectedUser.role === 'employee' && <Briefcase className="h-3 w-3" />}
                      {selectedUser.role === 'user' && <User className="h-3 w-3" />}
                      {selectedUser.role === 'admin' 
                        ? (isArabic ? 'مدير' : 'Admin')
                        : selectedUser.role === 'employee'
                        ? (isArabic ? 'موظف' : 'Employee')
                        : (isArabic ? 'عضو' : 'Member')
                      }
                    </div>
                  </Badge>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>{isArabic ? 'تاريخ التسجيل' : 'Registration Date'}</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedUser.created 
                      ? new Date(selectedUser.created).toLocaleDateString()
                      : 'N/A'
                    }
                  </p>
                </div>
                <div>
                  <Label>{isArabic ? 'آخر تسجيل دخول' : 'Last Login'}</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    N/A
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewDialogOpen(false)}
            >
              {isArabic ? 'إغلاق' : 'Close'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
