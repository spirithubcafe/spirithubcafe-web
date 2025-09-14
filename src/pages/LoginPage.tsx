import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuth } from '@/hooks/useAuth'
import { useTranslation } from 'react-i18next'
import { useScrollToTopOnRouteChange } from '@/hooks/useSmoothScrollToTop'

export function LoginPage() {
  const { t, i18n } = useTranslation()
  const { login, sendEmailVerification, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showEmailVerificationDialog, setShowEmailVerificationDialog] = useState(false)
  const [verificationEmailSent, setVerificationEmailSent] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  // Smooth scroll to top when page loads
  useScrollToTopOnRouteChange()

  const isArabic = i18n.language === 'ar'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    console.log('Login attempt started')
    console.log('Login credentials:', { email: formData.email, passwordLength: formData.password.length })

    try {
      const result = await login(formData.email, formData.password)
      
      console.log('Login result received:', result)
      
      if (result.success) {
        console.log('Login successful, navigating to dashboard')
        navigate('/dashboard')
      } else {
        if (result.requiresEmailVerification) {
          console.log('Email verification required')
          setShowEmailVerificationDialog(true)
        } else {
          console.log('Login failed:', result.error)
          setError(result.error || t('auth.login.invalidCredentials'))
        }
      }
    } catch (error: any) {
      console.error('Login exception:', error)
      setError(error.message || t('auth.login.invalidCredentials'))
    }
    
    setLoading(false)
    console.log('Login attempt completed')
  }

  const handleSendVerificationEmail = async () => {
    try {
      const result = await sendEmailVerification()
      if (result.success) {
        setVerificationEmailSent(true)
      } else {
        setError(result.error || 'Failed to send verification email')
      }
    } catch (error: any) {
      console.error('Send verification email error:', error)
      setError(error.message || 'Failed to send verification email')
    }
  }

  const handleCheckVerificationStatus = async () => {
    try {
      await refreshUser()
      // Try to login again to see if verification is now complete
      const result = await login(formData.email, formData.password)
      if (result.success) {
        setShowEmailVerificationDialog(false)
        navigate('/dashboard')
      } else if (!result.requiresEmailVerification) {
        setError(result.error || 'Login failed')
        setShowEmailVerificationDialog(false)
      }
      // If still requires verification, keep dialog open
    } catch (error: any) {
      console.error('Check verification status error:', error)
      setError(error.message || 'Failed to check verification status')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center  py-12 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center space-x-2">
            <img 
              src="/images/logo-s.png" 
              alt="SpiritHub Cafe Logo" 
              className="h-12 w-12 object-contain mx-auto mb-2"
            />
            <h1 className="text-2xl font-bold">{t('common.brandName')}</h1>
          </div>
          <p className="text-muted-foreground">{t('auth.login.subtitle')}</p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>{t('auth.login.title')}</CardTitle>
            <CardDescription>
              {t('auth.login.subtitle')}
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

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('common.loading') : t('auth.login.loginButton')}
              </Button>
              
              <div className="text-center">
                <Link to="/forgot-password" className="text-sm text-amber-600 hover:underline">
                  {isArabic ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
                </Link>
              </div>
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
      </div>

      {/* Email Verification Required Dialog */}
      <Dialog open={showEmailVerificationDialog} onOpenChange={setShowEmailVerificationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {isArabic ? 'تأكيد البريد الإلكتروني مطلوب' : 'Email Verification Required'}
            </DialogTitle>
            <DialogDescription>
              {isArabic 
                ? 'يجب تأكيد بريدك الإلكتروني قبل تسجيل الدخول.'
                : 'You must verify your email address before logging in.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              {isArabic 
                ? 'سيتم إرسال رابط التأكيد إلى بريدك الإلكتروني:'
                : 'A verification link will be sent to your email address:'
              }
            </p>
            <div className="p-3 bg-muted rounded-lg">
              <code className="text-sm">{formData.email}</code>
            </div>
            
            {verificationEmailSent && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  {isArabic 
                    ? '✅ تم إرسال رابط التأكيد بنجاح. تحقق من بريدك الإلكتروني.'
                    : '✅ Verification email sent successfully. Check your inbox.'
                  }
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEmailVerificationDialog(false)}
            >
              {isArabic ? 'إغلاق' : 'Close'}
            </Button>
            <Button
              variant="outline"
              onClick={handleCheckVerificationStatus}
              className="flex items-center gap-2"
            >
              {isArabic ? 'تحقق من التأكيد' : 'Check Verification'}
            </Button>
            {!verificationEmailSent && (
              <Button
                onClick={handleSendVerificationEmail}
                className="flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                {isArabic ? 'إرسال رابط التأكيد' : 'Send Verification Link'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
