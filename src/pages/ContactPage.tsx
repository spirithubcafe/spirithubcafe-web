import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useTranslation } from 'react-i18next'

export function ContactPage() {
  const { t } = useTranslation()

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            {t('contact.title')}
          </h1>
          <p className="text-xl text-muted-foreground">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-6">{t('contact.getInTouch')}</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 no-flip" />
                  <div>
                    <p className="font-medium">{t('contact.info.addressLabel')}</p>
                    <p className="text-muted-foreground">{t('contact.info.address')}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5 no-flip" />
                  <div>
                    <p className="font-medium">{t('contact.info.phoneLabel')}</p>
                    <p className="text-muted-foreground currency">{t('contact.info.phone')}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5 no-flip" />
                  <div>
                    <p className="font-medium">{t('contact.info.emailLabel')}</p>
                    <p className="text-muted-foreground currency">{t('contact.info.email')}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5 no-flip" />
                  <div>
                    <p className="font-medium">{t('contact.info.hoursLabel')}</p>
                    <p className="text-muted-foreground">{t('contact.info.hours')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>{t('contact.form.send')}</CardTitle>
              <CardDescription>
                We'll get back to you as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('contact.form.name')}</Label>
                    <Input id="name" placeholder="Your name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('contact.form.email')}</Label>
                    <Input id="email" type="email" placeholder="your@email.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">{t('contact.form.subject')}</Label>
                  <Input id="subject" placeholder="Subject" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">{t('contact.form.message')}</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Your message..."
                    className="min-h-[120px]"
                  />
                </div>
                <Button type="submit" className="w-full">
                  {t('contact.form.send')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
