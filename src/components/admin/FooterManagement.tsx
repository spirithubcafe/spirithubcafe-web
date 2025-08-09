import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'react-hot-toast'
import { Loader2, Save, Settings, Globe, Phone, Mail, Clock, MapPin, Users } from 'lucide-react'
import { settingsService, type FooterSettings } from '@/services/settings'

export function FooterManagement() {
  const { t } = useTranslation()
  const [settings, setSettings] = useState<FooterSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadSettingsAsync = async () => {
      try {
        setLoading(true)
        const footerSettings = await settingsService.getFooterSettings()
        setSettings(footerSettings)
      } catch (error) {
        console.error('Error loading footer settings:', error)
        toast.error(t('common.error'))
      } finally {
        setLoading(false)
      }
    }

    loadSettingsAsync()
  }, [t])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const footerSettings = await settingsService.getFooterSettings()
      setSettings(footerSettings)
    } catch (error) {
      console.error('Error loading footer settings:', error)
      toast.error(t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!settings) return

    try {
      setSaving(true)
      await settingsService.updateFooterSettings(settings)
      toast.success(t('dashboard.admin.footerForm.saveChanges'))
    } catch (error) {
      console.error('Error saving footer settings:', error)
      toast.error(t('common.error'))
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key: keyof FooterSettings, value: string) => {
    if (!settings) return
    setSettings({
      ...settings,
      [key]: value
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!settings) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">{t('common.error')}</p>
          <Button onClick={loadSettings} className="mt-4 mx-auto block">
            {t('common.retry')}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <CardTitle>{t('dashboard.admin.footerSettings')}</CardTitle>
        </div>
        <CardDescription>
          {t('dashboard.admin.footerSettings')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general" className="flex items-center space-x-2">
              <Globe className="h-4 w-4" />
              <span>{t('dashboard.admin.footerTabs.general')}</span>
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span>{t('dashboard.admin.footerTabs.contact')}</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>{t('dashboard.admin.footerTabs.social')}</span>
            </TabsTrigger>
            <TabsTrigger value="hours" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>{t('dashboard.admin.footerTabs.hours')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="companyName">{t('dashboard.admin.footerForm.companyNameEn')}</Label>
                <Input
                  id="companyName"
                  value={settings.companyName}
                  onChange={(e) => updateSetting('companyName', e.target.value)}
                  placeholder="SpiritHub"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyNameAr">{t('dashboard.admin.footerForm.companyNameAr')}</Label>
                <Input
                  id="companyNameAr"
                  value={settings.companyNameAr}
                  onChange={(e) => updateSetting('companyNameAr', e.target.value)}
                  placeholder="سبيريت هاب"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="description">{t('dashboard.admin.footerForm.descriptionEn')}</Label>
                <Textarea
                  id="description"
                  value={settings.description}
                  onChange={(e) => updateSetting('description', e.target.value)}
                  placeholder="Premium coffee roasted with passion and expertise."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descriptionAr">{t('dashboard.admin.footerForm.descriptionAr')}</Label>
                <Textarea
                  id="descriptionAr"
                  value={settings.descriptionAr}
                  onChange={(e) => updateSetting('descriptionAr', e.target.value)}
                  placeholder="قهوة فاخرة محمصة بشغف وخبرة."
                  rows={3}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>{t('dashboard.admin.footerForm.addressEn')}</span>
                </Label>
                <Input
                  id="address"
                  value={settings.address}
                  onChange={(e) => updateSetting('address', e.target.value)}
                  placeholder="Al Mouj Street, Muscat, Oman"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addressAr" className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>{t('dashboard.admin.footerForm.addressAr')}</span>
                </Label>
                <Input
                  id="addressAr"
                  value={settings.addressAr}
                  onChange={(e) => updateSetting('addressAr', e.target.value)}
                  placeholder="شارع الموج، مسقط، عمان"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>{t('dashboard.admin.footerForm.mainPhone')}</span>
                </Label>
                <Input
                  id="phone"
                  value={settings.phone}
                  onChange={(e) => updateSetting('phone', e.target.value)}
                  placeholder="+968 9190 0005"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone2">{t('dashboard.admin.footerForm.secondPhone')}</Label>
                <Input
                  id="phone2"
                  value={settings.phone2 || ''}
                  onChange={(e) => updateSetting('phone2', e.target.value)}
                  placeholder="+968 7272 6999"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>{t('dashboard.admin.footerForm.email')}</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => updateSetting('email', e.target.value)}
                  placeholder="info@spirithubcafe.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">{t('dashboard.admin.footerForm.whatsapp')}</Label>
              <Input
                id="whatsapp"
                value={settings.whatsapp || ''}
                onChange={(e) => updateSetting('whatsapp', e.target.value)}
                placeholder="+968 7272 6999"
              />
            </div>
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="instagram">{t('dashboard.admin.footerForm.instagram')}</Label>
                <Input
                  id="instagram"
                  value={settings.instagram || ''}
                  onChange={(e) => updateSetting('instagram', e.target.value)}
                  placeholder="@spirithubcafe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebook">{t('dashboard.admin.footerForm.facebook')}</Label>
                <Input
                  id="facebook"
                  value={settings.facebook || ''}
                  onChange={(e) => updateSetting('facebook', e.target.value)}
                  placeholder="spirithubcafe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter">{t('dashboard.admin.footerForm.twitter')}</Label>
                <Input
                  id="twitter"
                  value={settings.twitter || ''}
                  onChange={(e) => updateSetting('twitter', e.target.value)}
                  placeholder="spirithubcafe"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="hours" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="workingHours" className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>{t('dashboard.admin.footerForm.workingHoursEn')}</span>
                </Label>
                <Input
                  id="workingHours"
                  value={settings.workingHours}
                  onChange={(e) => updateSetting('workingHours', e.target.value)}
                  placeholder="Daily: 8 AM - 11 PM"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workingHoursAr" className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>{t('dashboard.admin.footerForm.workingHoursAr')}</span>
                </Label>
                <Input
                  id="workingHoursAr"
                  value={settings.workingHoursAr}
                  onChange={(e) => updateSetting('workingHoursAr', e.target.value)}
                  placeholder="كل أيام الأسبوع: 8 صباحاً - 11 مساءً"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-6 border-t">
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="flex items-center space-x-2"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{saving ? t('dashboard.admin.footerForm.saving') : t('dashboard.admin.footerForm.saveChanges')}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
