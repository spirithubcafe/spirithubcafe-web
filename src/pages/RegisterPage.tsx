import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Coffee } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/components/auth-provider'
import { useTranslation } from 'react-i18next'

export function RegisterPage() {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const { register } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.register.passwordMismatch'))
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError(t('auth.register.passwordTooShort'))
      setLoading(false)
      return
    }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.register.passwordMismatch'))
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError(t('auth.register.passwordTooShort'))
      setLoading(false)
      return
    }

    const result = await register(formData.email, formData.password, {
      full_name: formData.name,
      phone: formData.phone
    })
    
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error || t('auth.register.failed'))
    }
    
    setLoading(false)
  }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center  py-12 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center space-x-2">
            <Coffee className="h-8 w-8 text-amber-600" />
            <h1 className="text-2xl font-bold">{t('common.brandName')}</h1>
          </div>
          <p className="text-muted-foreground">{t('auth.register.subtitle')}</p>
        </div>

        {/* Register Form */}
        <Card>
          <CardHeader>
            <CardTitle>{t('auth.register.title')}</CardTitle>
            <CardDescription>
              {t('auth.register.subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('auth.register.name')}</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder={t('auth.register.namePlaceholder')}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.register.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('auth.register.emailPlaceholder')}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t('auth.register.phone')}</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder={t('auth.register.phonePlaceholder')}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.register.password')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('auth.register.passwordPlaceholder')}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className={`${isArabic ? 'text-right' : 'text-left'}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={`absolute ${isArabic ? 'left-0' : 'right-0'} top-0 h-full px-3 py-2 hover:bg-transparent`}
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('auth.register.confirmPassword')}</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder={t('auth.register.confirmPasswordPlaceholder')}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    className={`${isArabic ? 'text-right' : 'text-left'}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={`absolute ${isArabic ? 'left-0' : 'right-0'} top-0 h-full px-3 py-2 hover:bg-transparent`}
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

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('common.loading') : t('auth.register.registerButton')}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {t('auth.register.hasAccount')}{' '}
                <Link to="/login" className="text-amber-600 hover:underline">
                  {t('auth.register.signIn')}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
