import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'react-hot-toast'
import { Loader2, Save, Settings, Globe, Phone, Mail, Clock, MapPin, Users, Video, Palette } from 'lucide-react'
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
      console.log('FooterManagement - Saving settings:', settings)
      await settingsService.updateFooterSettings(settings)
      
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('footer-settings-updated'))
      localStorage.setItem('footer-settings-updated', Date.now().toString())
      
      toast.success(t('dashboard.admin.footerForm.saveChanges'))
    } catch (error) {
      console.error('Error saving footer settings:', error)
      toast.error(t('common.error'))
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key: keyof FooterSettings, value: string | number | boolean) => {
    if (!settings) return
    console.log('FooterManagement - Updating setting:', key, 'to:', value)
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
          <TabsList className="grid w-full grid-cols-6">
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
            <TabsTrigger value="video" className="flex items-center space-x-2">
              <Video className="h-4 w-4" />
              <span>{t('dashboard.admin.footerTabs.video')}</span>
            </TabsTrigger>
            <TabsTrigger value="colors" className="flex items-center space-x-2">
              <Palette className="h-4 w-4" />
              <span>Color Theme</span>
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
                <RichTextEditor
                  value={settings.description}
                  onChange={(value) => updateSetting('description', value)}
                  placeholder="Premium coffee roasted with passion and expertise."
                  className="min-h-[120px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descriptionAr">{t('dashboard.admin.footerForm.descriptionAr')}</Label>
                <RichTextEditor
                  value={settings.descriptionAr}
                  onChange={(value) => updateSetting('descriptionAr', value)}
                  placeholder="قهوة فاخرة محمصة بشغف وخبرة."
                  className="min-h-[120px]"
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

          <TabsContent value="video" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Video className="h-5 w-5" />
                  <span>{t('dashboard.admin.footerForm.videoSettings')}</span>
                </CardTitle>
                <CardDescription>
                  {t('dashboard.admin.footerForm.videoBlurDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Enable/Disable Video Overlay */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="flex items-center space-x-2">
                        <div className="h-4 w-4 bg-black/50 rounded"></div>
                        <span>{t('dashboard.admin.footerForm.enableVideoOverlay')}</span>
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t('dashboard.admin.footerForm.enableOverlayDescription')}
                      </p>
                    </div>
                    <Switch
                      checked={settings.enableVideoOverlay ?? true}
                      onCheckedChange={(checked) => updateSetting('enableVideoOverlay', checked)}
                    />
                  </div>
                </div>

                {/* Video Overlay Opacity Setting - Only show if overlay is enabled */}
                {(settings.enableVideoOverlay ?? true) && (
                  <div className="space-y-3">
                    <Label htmlFor="videoOverlayOpacity" className="flex items-center space-x-2">
                      <div className="h-4 w-4 bg-black/50 rounded"></div>
                      <span>{t('dashboard.admin.footerForm.videoOverlayOpacity')}</span>
                    </Label>
                    <div className="space-y-2">
                      <input
                        id="videoOverlayOpacity"
                        type="range"
                        min="0"
                        max="80"
                        step="5"
                        value={settings.videoOverlayOpacity || 30}
                        onChange={(e) => updateSetting('videoOverlayOpacity', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        aria-label="Video overlay opacity percentage"
                        title={`Video overlay opacity: ${settings.videoOverlayOpacity || 30}%`}
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>0% (No Overlay)</span>
                        <span className="font-medium">{settings.videoOverlayOpacity || 30}%</span>
                        <span>80% (Maximum Overlay)</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t('dashboard.admin.footerForm.videoOverlayDescription')}
                    </p>
                  </div>
                )}

                {/* Enable/Disable Video Blur */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="flex items-center space-x-2">
                        <Video className="h-4 w-4" />
                        <span>{t('dashboard.admin.footerForm.enableVideoBlur')}</span>
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t('dashboard.admin.footerForm.enableBlurDescription')}
                      </p>
                    </div>
                    <Switch
                      checked={settings.enableVideoBlur ?? true}
                      onCheckedChange={(checked) => updateSetting('enableVideoBlur', checked)}
                    />
                  </div>
                </div>

                {/* Background Video Blur Setting - Only show if blur is enabled */}
                {(settings.enableVideoBlur ?? true) && (
                  <div className="space-y-3">
                    <Label htmlFor="backgroundVideoBlur" className="flex items-center space-x-2">
                      <Video className="h-4 w-4" />
                      <span>{t('dashboard.admin.footerForm.backgroundVideoBlur')}</span>
                    </Label>
                    <div className="space-y-2">
                      <input
                        id="backgroundVideoBlur"
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={settings.backgroundVideoBlur || 50}
                        onChange={(e) => updateSetting('backgroundVideoBlur', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        aria-label="Background video blur percentage"
                        title={`Background video blur: ${settings.backgroundVideoBlur || 50}%`}
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>0% (No Blur)</span>
                        <span className="font-medium">{settings.backgroundVideoBlur || 50}%</span>
                        <span>100% (Maximum Blur)</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t('dashboard.admin.footerForm.videoBlurDescription')}
                    </p>
                  </div>
                )}

                {/* Enable/Disable Gradient Overlay */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="flex items-center space-x-2">
                        <div className="h-4 w-4 bg-gradient-to-b from-gray-500 to-gray-700 rounded"></div>
                        <span>{t('dashboard.admin.footerForm.enableGradientOverlay')}</span>
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t('dashboard.admin.footerForm.enableGradientDescription')}
                      </p>
                    </div>
                    <Switch
                      checked={settings.enableGradientOverlay ?? false}
                      onCheckedChange={(checked) => updateSetting('enableGradientOverlay', checked)}
                    />
                  </div>
                </div>

                {/* Gradient Overlay Opacity Setting - Only show if gradient is enabled */}
                {(settings.enableGradientOverlay ?? false) && (
                  <div className="space-y-3">
                    <Label htmlFor="gradientOverlayOpacity" className="flex items-center space-x-2">
                      <div className="h-4 w-4 bg-gradient-to-b from-gray-500 to-gray-700 rounded"></div>
                      <span>{t('dashboard.admin.footerForm.gradientOverlayOpacity')}</span>
                    </Label>
                    <div className="space-y-2">
                      <input
                        id="gradientOverlayOpacity"
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={settings.gradientOverlayOpacity || 80}
                        onChange={(e) => updateSetting('gradientOverlayOpacity', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        aria-label="Gradient overlay opacity percentage"
                        title={`Gradient overlay opacity: ${settings.gradientOverlayOpacity || 80}%`}
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>0% (No Gradient)</span>
                        <span className="font-medium">{settings.gradientOverlayOpacity || 80}%</span>
                        <span>100% (Maximum Gradient)</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t('dashboard.admin.footerForm.gradientOverlayDescription')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="colors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="h-5 w-5" />
                  <span>Color Theme Settings</span>
                </CardTitle>
                <CardDescription>
                  Control the appearance of text, headings, links, and icons in the footer. This is especially useful when using dark background videos.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Color Theme Mode */}
                <div className="space-y-2">
                  <Label htmlFor="colorTheme">Color Theme Mode</Label>
                  <select 
                    id="colorTheme"
                    className="w-full p-2 border rounded-md"
                    value={settings?.colorTheme || 'auto'}
                    onChange={(e) => setSettings({ 
                      ...settings!, 
                      colorTheme: e.target.value as 'auto' | 'light' | 'dark' | 'custom'
                    })}
                    aria-label="Color Theme Mode"
                  >
                    <option value="auto">Auto (Follow Global Theme)</option>
                    <option value="light">Light Theme</option>
                    <option value="dark">Dark Theme</option>
                    <option value="custom">Custom Colors</option>
                  </select>
                  <p className="text-sm text-muted-foreground">
                    Choose how the footer colors should behave. Auto follows the global theme, while custom allows full control.
                  </p>
                </div>

                {/* Custom Colors Section */}
                {settings?.colorTheme === 'custom' && (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                    <h4 className="font-medium">Custom Color Settings</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Text Colors */}
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="textColor">Text Color</Label>
                          <div className="flex space-x-2">
                            <Input
                              id="textColor"
                              type="color"
                              value={settings?.textColor || '#ffffff'}
                              onChange={(e) => setSettings({ ...settings!, textColor: e.target.value })}
                              className="w-16"
                            />
                            <Input
                              type="text"
                              value={settings?.textColor || '#ffffff'}
                              onChange={(e) => setSettings({ ...settings!, textColor: e.target.value })}
                              placeholder="#ffffff"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="headingColor">Heading Color</Label>
                          <div className="flex space-x-2">
                            <Input
                              id="headingColor"
                              type="color"
                              value={settings?.headingColor || '#ffffff'}
                              onChange={(e) => setSettings({ ...settings!, headingColor: e.target.value })}
                              className="w-16"
                            />
                            <Input
                              type="text"
                              value={settings?.headingColor || '#ffffff'}
                              onChange={(e) => setSettings({ ...settings!, headingColor: e.target.value })}
                              placeholder="#ffffff"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Link Colors */}
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="linkColor">Link Color</Label>
                          <div className="flex space-x-2">
                            <Input
                              id="linkColor"
                              type="color"
                              value={settings?.linkColor || '#cccccc'}
                              onChange={(e) => setSettings({ ...settings!, linkColor: e.target.value })}
                              className="w-16"
                            />
                            <Input
                              type="text"
                              value={settings?.linkColor || '#cccccc'}
                              onChange={(e) => setSettings({ ...settings!, linkColor: e.target.value })}
                              placeholder="#cccccc"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="linkHoverColor">Link Hover Color</Label>
                          <div className="flex space-x-2">
                            <Input
                              id="linkHoverColor"
                              type="color"
                              value={settings?.linkHoverColor || '#ffffff'}
                              onChange={(e) => setSettings({ ...settings!, linkHoverColor: e.target.value })}
                              className="w-16"
                            />
                            <Input
                              type="text"
                              value={settings?.linkHoverColor || '#ffffff'}
                              onChange={(e) => setSettings({ ...settings!, linkHoverColor: e.target.value })}
                              placeholder="#ffffff"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Logo Theme */}
                    <div className="space-y-2">
                      <Label htmlFor="logoTheme">Logo Theme</Label>
                      <select 
                        id="logoTheme"
                        className="w-full p-2 border rounded-md"
                        value={settings?.logoTheme || 'auto'}
                        onChange={(e) => setSettings({ 
                          ...settings!, 
                          logoTheme: e.target.value as 'auto' | 'light' | 'dark'
                        })}
                        aria-label="Logo Theme"
                      >
                        <option value="auto">Auto (Follow Global Theme)</option>
                        <option value="light">Light Logo (White)</option>
                        <option value="dark">Dark Logo (Black)</option>
                      </select>
                    </div>

                    {/* Additional Colors */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="borderColor">Border Color</Label>
                        <div className="flex space-x-2">
                          <Input
                            id="borderColor"
                            type="color"
                            value={settings?.borderColor || '#333333'}
                            onChange={(e) => setSettings({ ...settings!, borderColor: e.target.value })}
                            className="w-16"
                          />
                          <Input
                            type="text"
                            value={settings?.borderColor || '#333333'}
                            onChange={(e) => setSettings({ ...settings!, borderColor: e.target.value })}
                            placeholder="#333333"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="socialIconsColor">Social Icons Color</Label>
                        <div className="flex space-x-2">
                          <Input
                            id="socialIconsColor"
                            type="color"
                            value={settings?.socialIconsColor || '#cccccc'}
                            onChange={(e) => setSettings({ ...settings!, socialIconsColor: e.target.value })}
                            className="w-16"
                          />
                          <Input
                            type="text"
                            value={settings?.socialIconsColor || '#cccccc'}
                            onChange={(e) => setSettings({ ...settings!, socialIconsColor: e.target.value })}
                            placeholder="#cccccc"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Quick Presets */}
                    <div className="space-y-2">
                      <Label>Quick Presets</Label>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSettings({
                            ...settings!,
                            colorTheme: 'custom',
                            textColor: '#ffffff',
                            headingColor: '#ffffff',
                            linkColor: '#cccccc',
                            linkHoverColor: '#ffffff',
                            borderColor: '#333333',
                            socialIconsColor: '#cccccc',
                            logoTheme: 'light'
                          })}
                        >
                          White Theme
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSettings({
                            ...settings!,
                            colorTheme: 'custom',
                            textColor: '#000000',
                            headingColor: '#000000',
                            linkColor: '#666666',
                            linkHoverColor: '#000000',
                            borderColor: '#cccccc',
                            socialIconsColor: '#666666',
                            logoTheme: 'dark'
                          })}
                        >
                          Black Theme
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSettings({
                            ...settings!,
                            colorTheme: 'auto',
                            textColor: undefined,
                            headingColor: undefined,
                            linkColor: undefined,
                            linkHoverColor: undefined,
                            borderColor: undefined,
                            socialIconsColor: undefined,
                            logoTheme: 'auto'
                          })}
                        >
                          Reset to Auto
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
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
