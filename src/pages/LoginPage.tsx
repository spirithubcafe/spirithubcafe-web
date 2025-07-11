import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Coffee, User, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/components/auth-provider'
import { useTranslation } from 'react-i18next'
import { DEMO_USERS } from '@/types'

export function LoginPage() {
  const { t } = useTranslation()
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const success = await login(formData.email, formData.password)
    
    if (success) {
      navigate('/dashboard')
    } else {
      setError('Invalid email or password')
    }
    
    setLoading(false)
  }

  const handleDemoLogin = async (email: string) => {
    setFormData({ email, password: 'demo123' })
    setLoading(true)
    setError('')

    const success = await login(email, 'demo123')
    
    if (success) {
      navigate('/dashboard')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950/20 dark:to-orange-950/20 py-12 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center space-x-2">
            <Coffee className="h-8 w-8 text-amber-600" />
            <h1 className="text-2xl font-bold">SPIRITHUB ROASTERY</h1>
          </div>
          <p className="text-muted-foreground">{t('auth.login.subtitle')}</p>
        </div>

        {/* Demo Users */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-center">{t('auth.login.demoAccounts')}</h3>
          <div className="grid grid-cols-1 gap-3">
            {DEMO_USERS.map(user => (
              <Button
                key={user.id}
                variant="outline"
                className="flex items-center justify-start space-x-3 h-auto p-4"
                onClick={() => handleDemoLogin(user.email)}
                disabled={loading}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900">
                  {user.role === 'admin' ? 
                    <Shield className="h-5 w-5 text-amber-600" /> : 
                    <User className="h-5 w-5 text-amber-600" />
                  }
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-amber-600">{user.role === 'admin' ? 'Administrator' : 'Regular User'}</p>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>{t('auth.login.title')}</CardTitle>
            <CardDescription>
              {t('auth.login.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.login.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('auth.login.emailPlaceholder')}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.login.password')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('auth.login.passwordPlaceholder')}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('common.loading') : t('auth.login.submit')}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {t('auth.login.noAccount')}{' '}
                <Link to="/register" className="text-amber-600 hover:underline">
                  {t('auth.login.signUp')}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demo Info */}
        <Card className="bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h4 className="font-semibold text-amber-800 dark:text-amber-200">
                {t('auth.login.demoInfo.title')}
              </h4>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                {t('auth.login.demoInfo.description')}
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                {t('auth.login.demoInfo.password')}: demo123
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
