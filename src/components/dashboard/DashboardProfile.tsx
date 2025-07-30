import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTranslation } from 'react-i18next'
import type { UserProfile } from '@/lib/firebase'

interface DashboardProfileProps {
  user: UserProfile
}

export default function DashboardProfile({ user }: DashboardProfileProps) {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

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
              <AvatarImage src={user.avatar} alt={user.full_name} />
              <AvatarFallback className="text-lg">
                {user.full_name.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-2xl font-bold">{user.full_name}</h3>
              <p className="text-muted-foreground">{user.email}</p>
              <Badge variant="outline" className="mt-1">
                {user.role === 'admin' 
                  ? (isArabic ? 'مدير' : 'Admin')
                  : user.role === 'employee'
                  ? (isArabic ? 'موظف' : 'Employee')
                  : (isArabic ? 'عضو' : 'Member')
                }
              </Badge>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full-name">{isArabic ? 'الاسم الكامل' : 'Full Name'}</Label>
              <Input id="full-name" value={user.full_name} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{isArabic ? 'البريد الإلكتروني' : 'Email'}</Label>
              <Input id="email" value={user.email} readOnly />
            </div>
          </div>

          <div className="pt-4">
            <Button>
              {isArabic ? 'تعديل الملف الشخصي' : 'Edit Profile'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
