import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { toast } from 'react-hot-toast'
import { 
  Loader2, 
  Save, 
  Search, 
  Globe, 
  Share2, 
  BarChart3, 
  Settings,
  FileText,
  Code
} from 'lucide-react'
import { useSEOSettings } from '@/hooks/useSEO'
import type { SEOSettings } from '@/types/seo'

export function SEOManagement() {
  const { settings, loading, updateSettings } = useSEOSettings()
  const [saving, setSaving] = useState(false)
  const [localSettings, setLocalSettings] = useState<SEOSettings | null>(null)

  // Update local settings when settings change
  if (settings && !localSettings) {
    setLocalSettings(settings)
  }

  const handleSave = async () => {
    if (!localSettings) return

    try {
      setSaving(true)
      await updateSettings(localSettings)
      toast.success('SEO settings saved successfully')
    } catch (error) {
      console.error('Error saving SEO settings:', error)
      toast.error('Failed to save SEO settings')
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = <K extends keyof SEOSettings>(key: K, value: SEOSettings[K]) => {
    if (!localSettings) return
    setLocalSettings({
      ...localSettings,
      [key]: value
    })
  }

  const updateAddressSetting = (key: keyof SEOSettings['address'], value: string) => {
    if (!localSettings) return
    setLocalSettings({
      ...localSettings,
      address: {
        ...localSettings.address,
        [key]: value
      }
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!localSettings) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Failed to load SEO settings</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Search className="h-5 w-5" />
          <CardTitle>SEO Management</CardTitle>
        </div>
        <CardDescription>
          Comprehensive SEO settings for better search engine optimization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general" className="flex items-center space-x-2">
              <Globe className="h-4 w-4" />
              <span>General</span>
            </TabsTrigger>
            <TabsTrigger value="meta" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Meta Tags</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center space-x-2">
              <Share2 className="h-4 w-4" />
              <span>Social Media</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="organization" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Organization</span>
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center space-x-2">
              <Code className="h-4 w-4" />
              <span>Features</span>
            </TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name (English)</Label>
                <Input
                  id="siteName"
                  value={localSettings.siteName}
                  onChange={(e) => updateSetting('siteName', e.target.value)}
                  placeholder="SpiritHub Cafe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteNameAr">Site Name (Arabic)</Label>
                <Input
                  id="siteNameAr"
                  value={localSettings.siteNameAr}
                  onChange={(e) => updateSetting('siteNameAr', e.target.value)}
                  placeholder="مقهى سبيريت هاب"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description (English)</Label>
                <Textarea
                  id="siteDescription"
                  value={localSettings.siteDescription}
                  onChange={(e) => updateSetting('siteDescription', e.target.value)}
                  placeholder="Premium coffee roasted with passion and expertise"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteDescriptionAr">Site Description (Arabic)</Label>
                <Textarea
                  id="siteDescriptionAr"
                  value={localSettings.siteDescriptionAr}
                  onChange={(e) => updateSetting('siteDescriptionAr', e.target.value)}
                  placeholder="قهوة فاخرة محمصة بشغف وخبرة"
                  rows={3}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="siteUrl">Site URL</Label>
                <Input
                  id="siteUrl"
                  type="url"
                  value={localSettings.siteUrl}
                  onChange={(e) => updateSetting('siteUrl', e.target.value)}
                  placeholder="https://spirithubcafe.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultImage">Default Image URL</Label>
                <Input
                  id="defaultImage"
                  type="url"
                  value={localSettings.defaultImage}
                  onChange={(e) => updateSetting('defaultImage', e.target.value)}
                  placeholder="/images/logo.png"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="robotsTxt">Robots.txt Content</Label>
              <Textarea
                id="robotsTxt"
                value={localSettings.robotsTxt}
                onChange={(e) => updateSetting('robotsTxt', e.target.value)}
                placeholder="User-agent: *&#10;Allow: /&#10;Sitemap: https://spirithubcafe.com/sitemap.xml"
                rows={4}
              />
            </div>
          </TabsContent>

          {/* Meta Tags Tab */}
          <TabsContent value="meta" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="defaultTitle">Default Title (English)</Label>
                <Input
                  id="defaultTitle"
                  value={localSettings.defaultTitle}
                  onChange={(e) => updateSetting('defaultTitle', e.target.value)}
                  placeholder="SpiritHub Cafe - Premium Coffee in Oman"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultTitleAr">Default Title (Arabic)</Label>
                <Input
                  id="defaultTitleAr"
                  value={localSettings.defaultTitleAr}
                  onChange={(e) => updateSetting('defaultTitleAr', e.target.value)}
                  placeholder="مقهى سبيريت هاب - قهوة فاخرة في عمان"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="defaultDescription">Default Description (English)</Label>
                <Textarea
                  id="defaultDescription"
                  value={localSettings.defaultDescription}
                  onChange={(e) => updateSetting('defaultDescription', e.target.value)}
                  placeholder="Discover premium coffee beans, expertly roasted and brewed to perfection"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultDescriptionAr">Default Description (Arabic)</Label>
                <Textarea
                  id="defaultDescriptionAr"
                  value={localSettings.defaultDescriptionAr}
                  onChange={(e) => updateSetting('defaultDescriptionAr', e.target.value)}
                  placeholder="اكتشف حبوب القهوة الفاخرة، المحمصة والمحضرة بإتقان"
                  rows={3}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="defaultKeywords">Default Keywords (English)</Label>
                <Input
                  id="defaultKeywords"
                  value={localSettings.defaultKeywords}
                  onChange={(e) => updateSetting('defaultKeywords', e.target.value)}
                  placeholder="coffee, cafe, roastery, Oman, Muscat, premium coffee"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultKeywordsAr">Default Keywords (Arabic)</Label>
                <Input
                  id="defaultKeywordsAr"
                  value={localSettings.defaultKeywordsAr}
                  onChange={(e) => updateSetting('defaultKeywordsAr', e.target.value)}
                  placeholder="قهوة، مقهى، محمصة، عمان، مسقط، قهوة فاخرة"
                />
              </div>
            </div>
          </TabsContent>

          {/* Social Media Tab */}
          <TabsContent value="social" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="twitterHandle">Twitter Handle</Label>
                <Input
                  id="twitterHandle"
                  value={localSettings.twitterHandle}
                  onChange={(e) => updateSetting('twitterHandle', e.target.value)}
                  placeholder="@spirithubcafe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebookAppId">Facebook App ID</Label>
                <Input
                  id="facebookAppId"
                  value={localSettings.facebookAppId}
                  onChange={(e) => updateSetting('facebookAppId', e.target.value)}
                  placeholder="123456789"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebookPageId">Facebook Page ID</Label>
                <Input
                  id="facebookPageId"
                  value={localSettings.facebookPageId}
                  onChange={(e) => updateSetting('facebookPageId', e.target.value)}
                  placeholder="spirithubcafe"
                />
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                <Input
                  id="googleAnalyticsId"
                  value={localSettings.googleAnalyticsId}
                  onChange={(e) => updateSetting('googleAnalyticsId', e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="googleTagManagerId">Google Tag Manager ID</Label>
                <Input
                  id="googleTagManagerId"
                  value={localSettings.googleTagManagerId}
                  onChange={(e) => updateSetting('googleTagManagerId', e.target.value)}
                  placeholder="GTM-XXXXXXX"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="googleSearchConsoleId">Google Search Console ID</Label>
                <Input
                  id="googleSearchConsoleId"
                  value={localSettings.googleSearchConsoleId}
                  onChange={(e) => updateSetting('googleSearchConsoleId', e.target.value)}
                  placeholder="google-site-verification=xxxxxx"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebookPixelId">Facebook Pixel ID</Label>
                <Input
                  id="facebookPixelId"
                  value={localSettings.facebookPixelId}
                  onChange={(e) => updateSetting('facebookPixelId', e.target.value)}
                  placeholder="123456789012345"
                />
              </div>
            </div>
          </TabsContent>

          {/* Organization Tab */}
          <TabsContent value="organization" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="organizationName">Organization Name (English)</Label>
                <Input
                  id="organizationName"
                  value={localSettings.organizationName}
                  onChange={(e) => updateSetting('organizationName', e.target.value)}
                  placeholder="SpiritHub Cafe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="organizationNameAr">Organization Name (Arabic)</Label>
                <Input
                  id="organizationNameAr"
                  value={localSettings.organizationNameAr}
                  onChange={(e) => updateSetting('organizationNameAr', e.target.value)}
                  placeholder="مقهى سبيريت هاب"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizationLogo">Organization Logo URL</Label>
              <Input
                id="organizationLogo"
                type="url"
                value={localSettings.organizationLogo}
                onChange={(e) => updateSetting('organizationLogo', e.target.value)}
                placeholder="/images/logo.png"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="organizationDescription">Organization Description (English)</Label>
                <Textarea
                  id="organizationDescription"
                  value={localSettings.organizationDescription}
                  onChange={(e) => updateSetting('organizationDescription', e.target.value)}
                  placeholder="Premium coffee shop and roastery in Muscat, Oman"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="organizationDescriptionAr">Organization Description (Arabic)</Label>
                <Textarea
                  id="organizationDescriptionAr"
                  value={localSettings.organizationDescriptionAr}
                  onChange={(e) => updateSetting('organizationDescriptionAr', e.target.value)}
                  placeholder="مقهى ومحمصة قهوة فاخرة في مسقط، عمان"
                  rows={3}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  value={localSettings.contactPhone}
                  onChange={(e) => updateSetting('contactPhone', e.target.value)}
                  placeholder="+968 9190 0005"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={localSettings.contactEmail}
                  onChange={(e) => updateSetting('contactEmail', e.target.value)}
                  placeholder="info@spirithubcafe.com"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium">Address</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="addressStreet">Street</Label>
                  <Input
                    id="addressStreet"
                    value={localSettings.address.street}
                    onChange={(e) => updateAddressSetting('street', e.target.value)}
                    placeholder="Al Mouj Street"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addressCity">City</Label>
                  <Input
                    id="addressCity"
                    value={localSettings.address.city}
                    onChange={(e) => updateAddressSetting('city', e.target.value)}
                    placeholder="Muscat"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addressRegion">Region</Label>
                  <Input
                    id="addressRegion"
                    value={localSettings.address.region}
                    onChange={(e) => updateAddressSetting('region', e.target.value)}
                    placeholder="Muscat Governorate"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addressPostalCode">Postal Code</Label>
                  <Input
                    id="addressPostalCode"
                    value={localSettings.address.postalCode}
                    onChange={(e) => updateAddressSetting('postalCode', e.target.value)}
                    placeholder="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addressCountry">Country Code</Label>
                  <Input
                    id="addressCountry"
                    value={localSettings.address.country}
                    onChange={(e) => updateAddressSetting('country', e.target.value)}
                    placeholder="OM"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-lg font-medium">SEO Features</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableAutoSitemap">Auto Sitemap Generation</Label>
                  <Switch
                    id="enableAutoSitemap"
                    checked={localSettings.enableAutoSitemap}
                    onCheckedChange={(checked) => updateSetting('enableAutoSitemap', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableBreadcrumbs">Breadcrumb Schema</Label>
                  <Switch
                    id="enableBreadcrumbs"
                    checked={localSettings.enableBreadcrumbs}
                    onCheckedChange={(checked) => updateSetting('enableBreadcrumbs', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableOpenGraph">Open Graph Tags</Label>
                  <Switch
                    id="enableOpenGraph"
                    checked={localSettings.enableOpenGraph}
                    onCheckedChange={(checked) => updateSetting('enableOpenGraph', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableTwitterCards">Twitter Cards</Label>
                  <Switch
                    id="enableTwitterCards"
                    checked={localSettings.enableTwitterCards}
                    onCheckedChange={(checked) => updateSetting('enableTwitterCards', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableSchema">Schema.org Markup</Label>
                  <Switch
                    id="enableSchema"
                    checked={localSettings.enableSchema}
                    onCheckedChange={(checked) => updateSetting('enableSchema', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableRichSnippets">Rich Snippets</Label>
                  <Switch
                    id="enableRichSnippets"
                    checked={localSettings.enableRichSnippets}
                    onCheckedChange={(checked) => updateSetting('enableRichSnippets', checked)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="openingHours">Opening Hours</Label>
              <Textarea
                id="openingHours"
                value={localSettings.openingHours.join('\n')}
                onChange={(e) => updateSetting('openingHours', e.target.value.split('\n').filter(h => h.trim()))}
                placeholder="Mo-Su 08:00-23:00"
                rows={3}
              />
              <p className="text-sm text-muted-foreground">
                Enter one time range per line in format: Mo-Su 08:00-23:00
              </p>
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
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
