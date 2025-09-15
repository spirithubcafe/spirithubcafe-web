import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTranslation } from 'react-i18next'
import { authService } from '@/lib/firebase'
import { useScrollToTopOnRouteChange } from '@/hooks/useSmoothScrollToTop'

export function ForgotPasswordPage() {
  useScrollToTopOnRouteChange()
  
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await authService.forgotPassword(email)
      
      if (result.success) {
        setSuccess(true)
      } else {
        setError(result.error || 'Failed to send reset email')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
      console.error('Forgot password error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img 
                src="/images/logo-s.png" 
                alt="SpiritHub Cafe Logo" 
                className="h-16 w-16 object-contain mx-auto mb-4"
              />
            </div>
            <CardTitle className="text-2xl">
              {isArabic ? 'تم إرسال البريد الإلكتروني' : 'Email Sent'}
            </CardTitle>
            <CardDescription>
              {isArabic 
                ? 'تم إرسال رابط استرداد كلمة المرور إلى بريدك الإلكتروني'
                : 'Password recovery link has been sent to your email'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <Mail className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-green-700">
                {isArabic 
                  ? 'يرجى فحص بريدك الإلكتروني والنقر على رابط الاسترداد'
                  : 'Please check your email and click the recovery link'
                }
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                {isArabic 
                  ? 'لم تستلم البريد الإلكتروني؟'
                  : 'Didn\'t receive the email?'
                }
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSuccess(false)
                  setEmail('')
                }}
                className="w-full"
              >
                {isArabic ? 'إعادة الإرسال' : 'Send Again'}
              </Button>
            </div>

            <div className="pt-4">
              <Link to="/login" className="block">
                <Button variant="ghost" className="w-full">
                  {isArabic ? (
                    <>
                      العودة لتسجيل الدخول
                      <ArrowRight className="mr-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Login
                    </>
                  )}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/images/logo-s.png" 
              alt="SpiritHub Cafe Logo" 
              className="h-16 w-16 object-contain mx-auto mb-4"
            />
          </div>
          <CardTitle className="text-2xl">
            {isArabic ? 'نسيت كلمة المرور' : 'Forgot Password'}
          </CardTitle>
          <CardDescription>
            {isArabic 
              ? 'أدخل بريدك الإلكتروني لتلقي رابط استرداد كلمة المرور'
              : 'Enter your email to receive a password recovery link'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">
                {isArabic ? 'عنوان البريد الإلكتروني' : 'Email Address'}
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isArabic ? 'example@email.com' : 'example@email.com'}
                required
                disabled={loading}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !email}
            >
              {loading ? (
                isArabic ? 'جارٍ الإرسال...' : 'Sending...'
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  {isArabic ? 'إرسال رابط الاسترداد' : 'Send Recovery Link'}
                </>
              )}
            </Button>

            <div className="pt-4">
              <Link to="/login" className="block">
                <Button variant="ghost" className="w-full">
                  {isArabic ? (
                    <>
                      العودة لتسجيل الدخول
                      <ArrowRight className="mr-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Login
                    </>
                  )}
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default ForgotPasswordPage
