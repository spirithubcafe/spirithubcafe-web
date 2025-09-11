import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Phone, MapPin, MessageSquare, Reply, Eye, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { contactService } from '@/services/contact'

interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  phone?: string | null
  is_read: boolean
  replied_at?: string | null
  created_at: string
}

interface ContactSettings {
  phone1: string
  phone2: string
  whatsapp: string
  email: string
  instagram: string
  address: string
  address_ar: string
  hours: string
  hours_ar: string
  coordinates: {
    lat: number
    lng: number
  }
}

export function ContactManagement() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  
  const [activeTab, setActiveTab] = useState('settings')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [settings, setSettings] = useState<ContactSettings>({
    phone1: '+968 9123 4567',
    phone2: '+968 9876 5432',
    whatsapp: '+968 9123 4567',
    email: 'info@spirithubcafe.com',
    instagram: '@spirithubcafe',
    address: 'Al Mouj Street, Muscat, Oman',
    address_ar: 'شارع الموج، مسقط، عمان',
    hours: 'Daily: 7:00 AM - 11:00 PM',
    hours_ar: 'يوميا: 7:00 ص - 11:00 م',
    coordinates: {
      lat: 23.618926,
      lng: 58.256566
    }
  })

  // Load contact messages
  const loadMessages = useCallback(async () => {
    try {
      setLoading(true)
      const result = await contactService.getMessages()
      setMessages(result.items)
      setUnreadCount(result.items.filter((msg: any) => !msg.is_read).length)
    } catch (error) {
      console.error('Error loading messages:', error)
      console.error(t('common.error.load'))
    } finally {
      setLoading(false)
    }
  }, [t])

  // Load contact settings
  const loadSettings = useCallback(async () => {
    try {
      const result = await contactService.getContactSettings()
      if (Object.keys(result).length > 0) {
        setSettings(prev => ({ ...prev, ...result }))
      }
    } catch (error) {
      console.error('Error loading contact settings:', error)
    }
  }, [])

  // Save contact settings
  const saveSettings = async () => {
    try {
      setLoading(true)
      await contactService.saveContactSettings(settings)
      console.log(isRTL ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully')
    } catch (error) {
      console.error('Error saving settings:', error)
      console.error(t('common.error.save'))
    } finally {
      setLoading(false)
    }
  }

  // Mark message as read
  const markAsRead = async (messageId: string) => {
    try {
      await contactService.markAsRead(messageId)
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, is_read: true } : msg
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
      console.log(isRTL ? 'تم تمييز الرسالة كمقروءة' : 'Message marked as read')
    } catch (error) {
      console.error('Error marking message as read:', error)
      console.error(t('common.error.update'))
    }
  }

  useEffect(() => {
    loadMessages()
    loadSettings()
  }, [loadMessages, loadSettings])

  const handleReply = (email: string, subject: string) => {
    const mailtoUrl = `mailto:${email}?subject=Re: ${subject}`
    window.open(mailtoUrl, '_self')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return isRTL 
      ? date.toLocaleDateString('ar-SA', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {isRTL ? 'إدارة صفحة التواصل' : 'Contact Management'}
        </h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {isRTL ? 'معلومات التواصل' : 'Contact Info'}
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            {isRTL ? 'الرسائل' : 'Messages'}
            {unreadCount > 0 && (
              <Badge variant="destructive" className="h-5 min-w-[20px] text-xs">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                {isRTL ? 'معلومات الاتصال' : 'Contact Information'}
              </CardTitle>
              <CardDescription>
                {isRTL 
                  ? 'قم بتحديث معلومات التواصل التي تظهر في صفحة التواصل'
                  : 'Update the contact information displayed on the contact page'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone1">{isRTL ? 'رقم الهاتف الأول' : 'Primary Phone'}</Label>
                  <Input
                    id="phone1"
                    value={settings.phone1}
                    onChange={(e) => setSettings({ ...settings, phone1: e.target.value })}
                    placeholder="+968 9123 4567"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone2">{isRTL ? 'رقم الهاتف الثاني' : 'Secondary Phone'}</Label>
                  <Input
                    id="phone2"
                    value={settings.phone2}
                    onChange={(e) => setSettings({ ...settings, phone2: e.target.value })}
                    placeholder="+968 9876 5432"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">{isRTL ? 'رقم الواتساب' : 'WhatsApp Number'}</Label>
                  <Input
                    id="whatsapp"
                    value={settings.whatsapp}
                    onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                    placeholder="+968 9123 4567"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{isRTL ? 'البريد الإلكتروني' : 'Email Address'}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    placeholder="info@spirithubcafe.com"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram">{isRTL ? 'حساب الإنستغرام' : 'Instagram Account'}</Label>
                <Input
                  id="instagram"
                  value={settings.instagram}
                  onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
                  placeholder="@spirithubcafe"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address">{isRTL ? 'العنوان (الإنجليزية)' : 'Address (English)'}</Label>
                  <Textarea
                    id="address"
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    placeholder="Al Mouj Street, Muscat, Oman"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address_ar">{isRTL ? 'العنوان (العربية)' : 'Address (Arabic)'}</Label>
                  <Textarea
                    id="address_ar"
                    value={settings.address_ar}
                    onChange={(e) => setSettings({ ...settings, address_ar: e.target.value })}
                    placeholder="شارع الموج، مسقط، عمان"
                    rows={3}
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hours">{isRTL ? 'ساعات العمل (الإنجليزية)' : 'Working Hours (English)'}</Label>
                  <Input
                    id="hours"
                    value={settings.hours}
                    onChange={(e) => setSettings({ ...settings, hours: e.target.value })}
                    placeholder="Daily: 7:00 AM - 11:00 PM"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hours_ar">{isRTL ? 'ساعات العمل (العربية)' : 'Working Hours (Arabic)'}</Label>
                  <Input
                    id="hours_ar"
                    value={settings.hours_ar}
                    onChange={(e) => setSettings({ ...settings, hours_ar: e.target.value })}
                    placeholder="يوميا: 7:00 ص - 11:00 م"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lat">{isRTL ? 'خط العرض' : 'Latitude'}</Label>
                  <Input
                    id="lat"
                    type="number"
                    step="any"
                    value={settings.coordinates.lat}
                    onChange={(e) => setSettings({ 
                      ...settings, 
                      coordinates: { ...settings.coordinates, lat: parseFloat(e.target.value) }
                    })}
                    placeholder="23.618926"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lng">{isRTL ? 'خط الطول' : 'Longitude'}</Label>
                  <Input
                    id="lng"
                    type="number"
                    step="any"
                    value={settings.coordinates.lng}
                    onChange={(e) => setSettings({ 
                      ...settings, 
                      coordinates: { ...settings.coordinates, lng: parseFloat(e.target.value) }
                    })}
                    placeholder="58.256566"
                    dir="ltr"
                  />
                </div>
              </div>

              <Button onClick={saveSettings} disabled={loading} className="w-full">
                {loading ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ الإعدادات' : 'Save Settings')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                {isRTL ? 'رسائل التواصل' : 'Contact Messages'}
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="h-5 min-w-[20px] text-xs">
                    {unreadCount} {isRTL ? 'غير مقروءة' : 'unread'}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {isRTL 
                  ? 'عرض وإدارة الرسائل المرسلة من صفحة التواصل'
                  : 'View and manage messages sent from the contact page'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  {isRTL ? 'جاري التحميل...' : 'Loading...'}
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">
                    {isRTL ? 'لا توجد رسائل' : 'No messages yet'}
                  </p>
                  <p className="text-sm">
                    {isRTL 
                      ? 'ستظهر هنا الرسائل التي يتم إرسالها من صفحة التواصل'
                      : 'Messages sent from the contact page will appear here'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <Card key={message.id} className={`${!message.is_read ? 'border-primary' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold">{message.name}</h3>
                              {!message.is_read && (
                                <Badge variant="default" className="text-xs">
                                  {isRTL ? 'جديد' : 'New'}
                                </Badge>
                              )}
                              {message.replied_at && (
                                <Badge variant="secondary" className="text-xs">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  {isRTL ? 'تم الرد' : 'Replied'}
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-sm text-muted-foreground" dir="ltr">
                              {message.email}
                              {message.phone && ` • ${message.phone}`}
                            </p>
                            
                            <div className="space-y-1">
                              <p className="font-medium text-sm">{message.subject}</p>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {message.message}
                              </p>
                            </div>
                            
                            <p className="text-xs text-muted-foreground">
                              {formatDate(message.created_at)}
                            </p>
                          </div>
                          
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>{message.subject}</DialogTitle>
                                  <DialogDescription>
                                    {isRTL ? 'من' : 'From'}: {message.name} ({message.email})
                                    {message.phone && ` • ${message.phone}`}
                                    <br />
                                    {formatDate(message.created_at)}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="bg-muted/50 p-4 rounded-lg">
                                    <p className="whitespace-pre-wrap">{message.message}</p>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button 
                                      onClick={() => handleReply(message.email, message.subject)}
                                      className="flex-1"
                                    >
                                      <Reply className="h-4 w-4 mr-2" />
                                      {isRTL ? 'رد' : 'Reply'}
                                    </Button>
                                    {!message.is_read && (
                                      <Button 
                                        variant="outline" 
                                        onClick={() => markAsRead(message.id)}
                                      >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        {isRTL ? 'تمييز كمقروء' : 'Mark as Read'}
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReply(message.email, message.subject)}
                            >
                              <Reply className="h-4 w-4" />
                            </Button>
                            
                            {!message.is_read && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => markAsRead(message.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}