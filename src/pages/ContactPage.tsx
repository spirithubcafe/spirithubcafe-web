import { useState, useEffect } from 'react'
import { MapPin, Phone, Mail, Clock, MessageCircle, Instagram, Navigation, Locate, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useTranslation } from 'react-i18next'
import { useScrollToTopOnRouteChange } from '@/hooks/useSmoothScrollToTop'
import { contactService, type ContactFormData } from '@/services/contact'

// Default coordinates if not loaded from settings
const DEFAULT_COORDINATES = {
  lat: 23.618926,
  lng: 58.256566
}

export function ContactPage() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar' || i18n.language === 'fa'
  const [userLocation, setUserLocation] = useState<string>('')
  const [isLocationLoading, setIsLocationLoading] = useState(false)
  
  // Contact settings state - will be loaded from database
  const [contactSettings, setContactSettings] = useState<any>(null)
  const [isLoadingSettings, setIsLoadingSettings] = useState(true)
  
  // Contact form state
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    phone: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Smooth scroll to top when page loads
  useScrollToTopOnRouteChange()
  const [showDirections, setShowDirections] = useState(false)
  const [isCallModalOpen, setIsCallModalOpen] = useState(false)

  // Load contact settings
  useEffect(() => {
    const loadContactSettings = async () => {
      try {
        setIsLoadingSettings(true)
        const settings = await contactService.getContactSettings()
        if (settings && Object.keys(settings).length > 0) {
          // Use settings from database
          setContactSettings(settings)
        } else {
          // Fallback to default values if no settings found
          setContactSettings({
            phone1: '+968 9190 0005',
            phone2: '+968 7272 6999',
            whatsapp: '+968 7272 6999',
            email: 'info@spirithubcafe.com',
            instagram: '@spirithubcafe',
            address: 'Al Mouj Street, Muscat, Oman',
            address_ar: 'شارع الموج، مسقط، عمان',
            hours: 'Daily: 7 AM - 12 AM',
            hours_ar: 'كل أيام الأسبوع: 7 صباحاً - 12 صباحاً',
            coordinates: DEFAULT_COORDINATES
          })
        }
      } catch (error) {
        console.error('Error loading contact settings:', error)
        // Use default values on error
        setContactSettings({
          phone1: '+968 9190 0005',
          phone2: '+968 7272 6999',
          whatsapp: '+968 7272 6999',
          email: 'info@spirithubcafe.com',
          instagram: '@spirithubcafe',
          address: 'Al Mouj Street, Muscat, Oman',
          address_ar: 'شارع الموج، مسقط، عمان',
          hours: 'Mon-Sun: 7AM-12AM',
          hours_ar: 'الإثنين-الأحد: 7ص-12م',
          coordinates: DEFAULT_COORDINATES
        })
      } finally {
        setIsLoadingSettings(false)
      }
    }

    loadContactSettings()
  }, [])

  const handleOpenMap = () => {
    const coords = contactSettings.coordinates
    const mapUrl = `https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lng}&zoom=16#map=16/${coords.lat}/${coords.lng}`
    window.open(mapUrl, '_blank')
  }

  const handleGetCurrentLocation = () => {
    setIsLocationLoading(true)
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation(`${latitude},${longitude}`)
          setIsLocationLoading(false)
          setShowDirections(true)
        },
        (error) => {
          console.error('Error getting location:', error)
          setIsLocationLoading(false)
          alert(t('contact.map.locationError'))
        }
      )
    } else {
      setIsLocationLoading(false)
      alert(t('contact.map.locationError'))
    }
  }

  const handleGetDirections = () => {
    if (!userLocation) {
      alert(t('contact.map.locationError'))
      return
    }

    const coords = contactSettings.coordinates
    const directionsUrl = `https://www.openstreetmap.org/directions?from=${userLocation}&to=${coords.lat},${coords.lng}&route=foot`
    window.open(directionsUrl, '_blank')
  }

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self')
  }

  const handleCallModalOpen = () => {
    setIsCallModalOpen(true)
  }

  const handleWhatsApp = (phone: string) => {
    window.open(`https://wa.me/${phone.replace(/\s/g, '').replace(/[^\d]/g, '')}`, '_blank')
  }

  const handleEmail = (email: string) => {
    window.open(`mailto:${email}`, '_self')
  }

  const handleInstagram = (username: string) => {
    window.open(`https://instagram.com/${username.replace('@', '')}`, '_blank')
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage(null)

    try {
      await contactService.createMessage(formData)
      setSubmitMessage({
        type: 'success',
        text: isRTL ? 'تم إرسال رسالتك بنجاح. سنتواصل معك قريباً!' : 'Your message has been sent successfully. We will contact you soon!'
      })
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        phone: ''
      })
    } catch (error) {
      console.error('Error sending message:', error)
      setSubmitMessage({
        type: 'error',
        text: isRTL ? 'عذراً، حدث خطأ في إرسال الرسالة. يرجى المحاولة مرة أخرى.' : 'Sorry, there was an error sending your message. Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Show loading if contact settings are not loaded yet
  if (isLoadingSettings || !contactSettings) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-b from-background to-muted/10 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">{isRTL ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-background to-muted/10">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight gradient-text">
              {t('contact.title')}
            </h1>
            <p className="text-xl text-muted-foreground">
              {t('contact.subtitle')}
            </p>
          </div>

          {/* Quick Contact Actions */}
          <div className="contact-quick-actions grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="contact-card contact-action-btn hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={handleCallModalOpen}>
              <CardContent className="p-6 text-center">
                <Phone className="contact-icon h-8 w-8 mx-auto mb-3 text-green-600" />
                <h3 className="font-semibold mb-2">{t('contact.info.callNow')}</h3>
                <p className="text-sm text-muted-foreground currency">{contactSettings.phone1}</p>
                <p className="text-sm text-muted-foreground currency">{contactSettings.phone2}</p>
              </CardContent>
            </Card>

            <Card className="contact-card contact-action-btn hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => handleWhatsApp(contactSettings.whatsapp)}>
              <CardContent className="p-6 text-center">
                <MessageCircle className="contact-icon h-8 w-8 mx-auto mb-3 text-green-500" />
                <h3 className="font-semibold mb-2">{t('contact.info.sendWhatsApp')}</h3>
                <p className="text-sm text-muted-foreground currency">{contactSettings.whatsapp}</p>
              </CardContent>
            </Card>

            <Card className="contact-card contact-action-btn hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => handleEmail(contactSettings.email)}>
              <CardContent className="p-6 text-center">
                <Mail className="contact-icon h-8 w-8 mx-auto mb-3 text-blue-600" />
                <h3 className="font-semibold mb-2">{t('contact.info.sendEmail')}</h3>
                <p className="text-sm text-muted-foreground currency">{contactSettings.email}</p>
              </CardContent>
            </Card>

            <Card className="contact-card contact-action-btn hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => handleInstagram(contactSettings.instagram)}>
              <CardContent className="p-6 text-center">
                <Instagram className="contact-icon h-8 w-8 mx-auto mb-3 text-pink-600" />
                <h3 className="font-semibold mb-2">{t('contact.info.followInstagram')}</h3>
                <p className="text-sm text-muted-foreground currency">{contactSettings.instagram}</p>
              </CardContent>
            </Card>
          </div>

          <div className="contact-main-grid grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Store Location & Map */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {t('contact.map.title')}
                  </CardTitle>
                  <CardDescription>
                    {t('contact.map.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="map-container aspect-video rounded-lg overflow-hidden border bg-muted/30">
                    <iframe
                      width="100%"
                      height="100%"
                      style={{ minHeight: '300px' }}
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${contactSettings.coordinates.lng-0.005},${contactSettings.coordinates.lat-0.005},${contactSettings.coordinates.lng+0.005},${contactSettings.coordinates.lat+0.005}&amp;layer=mapnik&amp;marker=${contactSettings.coordinates.lat},${contactSettings.coordinates.lng}`}
                      allowFullScreen
                      className="border-0"
                      title="Spirit Hub Cafe Location"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 no-flip flex-shrink-0" />
                      <div>
                        <p className="font-medium">{t('contact.info.addressLabel')}</p>
                        <p className="text-muted-foreground">
                          {isRTL ? contactSettings.address_ar : contactSettings.address}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground mt-0.5 no-flip flex-shrink-0" />
                      <div>
                        <p className="font-medium">{t('contact.info.hoursLabel')}</p>
                        <p className="text-muted-foreground">
                          {isRTL ? contactSettings.hours_ar : contactSettings.hours}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="directions-section space-y-3 pt-4 border-t">
                    <h4 className="font-medium">{t('contact.directions')}</h4>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={handleGetCurrentLocation}
                        disabled={isLocationLoading}
                        className="contact-action-btn flex-1"
                      >
                        <Locate className="h-4 w-4 mr-2" />
                        {isLocationLoading ? t('common.loading') : t('contact.map.enableLocation')}
                      </Button>
                      
                      <Button
                        onClick={handleGetDirections}
                        disabled={!userLocation && !showDirections}
                        className="contact-action-btn flex-1"
                      >
                        <Navigation className="h-4 w-4 mr-2" />
                        {t('contact.map.getDirections')}
                      </Button>

                      <Button
                        variant="outline"
                        onClick={handleOpenMap}
                        className="contact-action-btn"
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        {t('contact.map.openMap')}
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="user-location">{t('contact.yourLocation')}</Label>
                      <Input
                        id="user-location"
                        value={userLocation}
                        onChange={(e) => setUserLocation(e.target.value)}
                        placeholder={t('contact.map.yourLocationPlaceholder')}
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>


            </div>

            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>{t('contact.form.send')}</CardTitle>
                <CardDescription>
                  {t('contact.form.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submitMessage && (
                  <div className={`mb-4 p-3 rounded-md ${
                    submitMessage.type === 'success' 
                      ? 'bg-green-50 text-green-800 border border-green-200' 
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {submitMessage.text}
                  </div>
                )}
                
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t('contact.form.name')}</Label>
                      <Input 
                        id="name" 
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder={t('contact.form.namePlaceholder')} 
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t('contact.form.email')}</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder={t('contact.form.emailPlaceholder')} 
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{isRTL ? 'رقم الهاتف (اختياري)' : 'Phone Number (Optional)'}</Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+968 9123 4567" 
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">{t('contact.form.subject')}</Label>
                    <Input 
                      id="subject" 
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      placeholder={t('contact.form.subjectPlaceholder')} 
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">{t('contact.form.message')}</Label>
                    <Textarea 
                      id="message" 
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder={t('contact.form.messagePlaceholder')}
                      className="min-h-[120px]"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting 
                      ? (isRTL ? 'جاري الإرسال...' : 'Sending...') 
                      : t('contact.form.send')
                    }
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Phone Number Selection Modal */}
      <Dialog open={isCallModalOpen} onOpenChange={setIsCallModalOpen}>
        <DialogContent dir={isRTL ? "rtl" : "ltr"} className={`sm:max-w-md ${isRTL ? 'text-right' : ''}`} showCloseButton={!isRTL}>
          {/* Close button positioning */}
          {isRTL && (
            <button
              type="button"
              onClick={() => setIsCallModalOpen(false)}
              className="absolute left-4 top-4 z-10 text-muted-foreground hover:text-primary transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 ${isRTL ? 'justify-end text-right' : ''}`}>
              <Phone className="h-5 w-5" />
              {t('contact.info.callNow')}
            </DialogTitle>
            <DialogDescription className={isRTL ? 'text-right' : ''}>
              {t('contact.modal.selectPhone')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Button
              variant="outline"
              className={`w-full h-12 ${isRTL ? 'justify-end text-right' : 'text-left justify-start'}`}
              onClick={() => {
                handleCall(contactSettings.phone1)
                setIsCallModalOpen(false)
              }}
            >
              <Phone className={`h-4 w-4 ${isRTL ? 'ml-3' : 'mr-3'}`} />
              <div>
                <div className="font-medium">{t('contact.modal.mainLine')}</div>
                <div className="text-sm text-muted-foreground" dir="ltr">{contactSettings.phone1}</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className={`w-full h-12 ${isRTL ? 'justify-end text-right' : 'text-left justify-start'}`}
              onClick={() => {
                handleCall(contactSettings.phone2)
                setIsCallModalOpen(false)
              }}
            >
              <Phone className={`h-4 w-4 ${isRTL ? 'ml-3' : 'mr-3'}`} />
              <div>
                <div className="font-medium">{t('contact.modal.secondLine')}</div>
                <div className="text-sm text-muted-foreground" dir="ltr">{contactSettings.phone2}</div>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
