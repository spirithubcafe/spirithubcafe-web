import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Search, 
  Globe, 
  Share2, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Eye,
  Smartphone
} from 'lucide-react'
import { useSEOAnalysis } from '@/hooks/useSEO'
import type { SEOMeta } from '@/types/seo'

interface SEOFormProps {
  initialData?: Partial<SEOMeta>
  onChange: (data: SEOMeta) => void
  showPreview?: boolean
  entityType?: 'product' | 'category' | 'page'
}

export function SEOForm({ 
  initialData = {}, 
  onChange, 
  showPreview = true, 
  entityType = 'page' 
}: SEOFormProps) {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  
  const [seoData, setSeoData] = useState<SEOMeta>({
    title: '',
    titleAr: '',
    description: '',
    descriptionAr: '',
    keywords: '',
    keywordsAr: '',
    canonicalUrl: '',
    ogTitle: '',
    ogTitleAr: '',
    ogDescription: '',
    ogDescriptionAr: '',
    ogImage: '',
    ogType: 'website',
    ogUrl: '',
    twitterCard: 'summary_large_image',
    twitterTitle: '',
    twitterTitleAr: '',
    twitterDescription: '',
    twitterDescriptionAr: '',
    twitterImage: '',
    robots: '',
    author: '',
    noIndex: false,
    noFollow: false,
    ...initialData
  })

  const analysis = useSEOAnalysis(seoData)

  const updateSEOData = <K extends keyof SEOMeta>(key: K, value: SEOMeta[K]) => {
    const newData = { ...seoData, [key]: value }
    setSeoData(newData)
    onChange(newData)
  }

  const autoFillFromTitle = () => {
    const title = isArabic ? (seoData.titleAr || seoData.title) : (seoData.title || seoData.titleAr)
    if (title) {
      updateSEOData('ogTitle', seoData.ogTitle || title)
      updateSEOData('ogTitleAr', seoData.ogTitleAr || title)
      updateSEOData('twitterTitle', seoData.twitterTitle || title)
      updateSEOData('twitterTitleAr', seoData.twitterTitleAr || title)
    }
  }

  const autoFillFromDescription = () => {
    const description = isArabic 
      ? (seoData.descriptionAr || seoData.description) 
      : (seoData.description || seoData.descriptionAr)
    if (description) {
      updateSEOData('ogDescription', seoData.ogDescription || description)
      updateSEOData('ogDescriptionAr', seoData.ogDescriptionAr || description)
      updateSEOData('twitterDescription', seoData.twitterDescription || description)
      updateSEOData('twitterDescriptionAr', seoData.twitterDescriptionAr || description)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default'
    if (score >= 60) return 'secondary'
    return 'destructive'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <CardTitle>SEO Settings</CardTitle>
          </div>
          {analysis && (
            <Badge variant={getScoreBadgeVariant(analysis.score)}>
              SEO Score: {analysis.score}%
            </Badge>
          )}
        </div>
        <CardDescription>
          Optimize your {entityType} for search engines and social media
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* SEO Analysis */}
        {analysis && (
          <div className="mb-6 space-y-4">
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-medium">SEO Analysis</h4>
              <span className={`text-2xl font-bold ${getScoreColor(analysis.score)}`}>
                {analysis.score}%
              </span>
            </div>
            
            {analysis.issues.length > 0 && (
              <div className="space-y-2">
                {analysis.issues.map((issue, index) => (
                  <Alert key={index} variant={issue.type === 'error' ? 'destructive' : 'default'}>
                    {issue.type === 'error' ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : (
                      <Info className="h-4 w-4" />
                    )}
                    <AlertDescription>{issue.message}</AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            {analysis.suggestions.length > 0 && (
              <div className="space-y-2">
                {analysis.suggestions.map((suggestion, index) => (
                  <Alert key={index}>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{suggestion.message}</AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
          </div>
        )}

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">
              <Globe className="h-4 w-4 mr-2" />
              Basic SEO
            </TabsTrigger>
            <TabsTrigger value="social">
              <Share2 className="h-4 w-4 mr-2" />
              Social Media
            </TabsTrigger>
            <TabsTrigger value="advanced">
              <Search className="h-4 w-4 mr-2" />
              Advanced
            </TabsTrigger>
            {showPreview && (
              <TabsTrigger value="preview">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </TabsTrigger>
            )}
          </TabsList>

          {/* Basic SEO Tab */}
          <TabsContent value="basic" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title (English)</Label>
                <Input
                  id="title"
                  value={seoData.title || ''}
                  onChange={(e) => updateSEOData('title', e.target.value)}
                  placeholder="Enter page title"
                  maxLength={60}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{seoData.title?.length || 0}/60 characters</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={autoFillFromTitle}
                    className="h-auto p-0 text-xs"
                  >
                    Auto-fill social media
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="titleAr">Title (Arabic)</Label>
                <Input
                  id="titleAr"
                  value={seoData.titleAr || ''}
                  onChange={(e) => updateSEOData('titleAr', e.target.value)}
                  placeholder="أدخل عنوان الصفحة"
                  maxLength={60}
                />
                <div className="text-xs text-muted-foreground">
                  {seoData.titleAr?.length || 0}/60 characters
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="description">Description (English)</Label>
                <Textarea
                  id="description"
                  value={seoData.description || ''}
                  onChange={(e) => updateSEOData('description', e.target.value)}
                  placeholder="Enter meta description"
                  rows={3}
                  maxLength={160}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{seoData.description?.length || 0}/160 characters</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={autoFillFromDescription}
                    className="h-auto p-0 text-xs"
                  >
                    Auto-fill social media
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="descriptionAr">Description (Arabic)</Label>
                <Textarea
                  id="descriptionAr"
                  value={seoData.descriptionAr || ''}
                  onChange={(e) => updateSEOData('descriptionAr', e.target.value)}
                  placeholder="أدخل وصف الصفحة"
                  rows={3}
                  maxLength={160}
                />
                <div className="text-xs text-muted-foreground">
                  {seoData.descriptionAr?.length || 0}/160 characters
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords (English)</Label>
                <Input
                  id="keywords"
                  value={seoData.keywords || ''}
                  onChange={(e) => updateSEOData('keywords', e.target.value)}
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="keywordsAr">Keywords (Arabic)</Label>
                <Input
                  id="keywordsAr"
                  value={seoData.keywordsAr || ''}
                  onChange={(e) => updateSEOData('keywordsAr', e.target.value)}
                  placeholder="كلمة مفتاحية1، كلمة مفتاحية2"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="canonicalUrl">Canonical URL</Label>
              <Input
                id="canonicalUrl"
                type="url"
                value={seoData.canonicalUrl || ''}
                onChange={(e) => updateSEOData('canonicalUrl', e.target.value)}
                placeholder="https://spirithubcafe.com/page-url"
              />
            </div>
          </TabsContent>

          {/* Social Media Tab */}
          <TabsContent value="social" className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-lg font-medium">Open Graph (Facebook, WhatsApp, etc.)</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="ogTitle">OG Title (English)</Label>
                  <Input
                    id="ogTitle"
                    value={seoData.ogTitle || ''}
                    onChange={(e) => updateSEOData('ogTitle', e.target.value)}
                    placeholder="Open Graph title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ogTitleAr">OG Title (Arabic)</Label>
                  <Input
                    id="ogTitleAr"
                    value={seoData.ogTitleAr || ''}
                    onChange={(e) => updateSEOData('ogTitleAr', e.target.value)}
                    placeholder="عنوان Open Graph"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="ogDescription">OG Description (English)</Label>
                  <Textarea
                    id="ogDescription"
                    value={seoData.ogDescription || ''}
                    onChange={(e) => updateSEOData('ogDescription', e.target.value)}
                    placeholder="Open Graph description"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ogDescriptionAr">OG Description (Arabic)</Label>
                  <Textarea
                    id="ogDescriptionAr"
                    value={seoData.ogDescriptionAr || ''}
                    onChange={(e) => updateSEOData('ogDescriptionAr', e.target.value)}
                    placeholder="وصف Open Graph"
                    rows={3}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ogImage">OG Image URL</Label>
                <Input
                  id="ogImage"
                  type="url"
                  value={seoData.ogImage || ''}
                  onChange={(e) => updateSEOData('ogImage', e.target.value)}
                  placeholder="https://spirithubcafe.com/images/og-image.jpg"
                />
                <p className="text-xs text-muted-foreground">
                  Recommended size: 1200x630 pixels
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-medium">Twitter Cards</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="twitterTitle">Twitter Title (English)</Label>
                  <Input
                    id="twitterTitle"
                    value={seoData.twitterTitle || ''}
                    onChange={(e) => updateSEOData('twitterTitle', e.target.value)}
                    placeholder="Twitter title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitterTitleAr">Twitter Title (Arabic)</Label>
                  <Input
                    id="twitterTitleAr"
                    value={seoData.twitterTitleAr || ''}
                    onChange={(e) => updateSEOData('twitterTitleAr', e.target.value)}
                    placeholder="عنوان تويتر"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitterImage">Twitter Image URL</Label>
                <Input
                  id="twitterImage"
                  type="url"
                  value={seoData.twitterImage || ''}
                  onChange={(e) => updateSEOData('twitterImage', e.target.value)}
                  placeholder="https://spirithubcafe.com/images/twitter-image.jpg"
                />
              </div>
            </div>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-lg font-medium">Search Engine Settings</h4>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="noIndex"
                    checked={seoData.noIndex || false}
                    onCheckedChange={(checked) => updateSEOData('noIndex', checked)}
                  />
                  <Label htmlFor="noIndex">No Index (Hide from search engines)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="noFollow"
                    checked={seoData.noFollow || false}
                    onCheckedChange={(checked) => updateSEOData('noFollow', checked)}
                  />
                  <Label htmlFor="noFollow">No Follow (Don't follow links)</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="robots">Custom Robots Tags</Label>
                <Input
                  id="robots"
                  value={seoData.robots || ''}
                  onChange={(e) => updateSEOData('robots', e.target.value)}
                  placeholder="noarchive, nosnippet"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  value={seoData.author || ''}
                  onChange={(e) => updateSEOData('author', e.target.value)}
                  placeholder="Author name"
                />
              </div>
            </div>
          </TabsContent>

          {/* Preview Tab */}
          {showPreview && (
            <TabsContent value="preview" className="space-y-6">
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium mb-4 flex items-center">
                    <Search className="h-5 w-5 mr-2" />
                    Google Search Preview
                  </h4>
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <div className="text-blue-600 text-lg cursor-pointer hover:underline">
                      {(isArabic ? (seoData.titleAr || seoData.title) : (seoData.title || seoData.titleAr)) || 'Page Title'}
                    </div>
                    <div className="text-green-700 text-sm">
                      {seoData.canonicalUrl || 'https://spirithubcafe.com/page-url'}
                    </div>
                    <div className="text-gray-600 text-sm mt-1">
                      {(isArabic ? (seoData.descriptionAr || seoData.description) : (seoData.description || seoData.descriptionAr)) || 'Page description will appear here...'}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium mb-4 flex items-center">
                    <Share2 className="h-5 w-5 mr-2" />
                    Facebook/WhatsApp Preview
                  </h4>
                  <div className="border rounded-lg overflow-hidden bg-white">
                    {seoData.ogImage && (
                      <div className="aspect-video bg-gray-200 flex items-center justify-center">
                        <img 
                          src={seoData.ogImage} 
                          alt="OG Image"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="font-medium text-sm">
                        {(isArabic ? (seoData.ogTitleAr || seoData.ogTitle) : (seoData.ogTitle || seoData.ogTitleAr)) || 'Open Graph Title'}
                      </div>
                      <div className="text-gray-600 text-sm mt-1">
                        {(isArabic ? (seoData.ogDescriptionAr || seoData.ogDescription) : (seoData.ogDescription || seoData.ogDescriptionAr)) || 'Open Graph description...'}
                      </div>
                      <div className="text-gray-500 text-xs mt-2 uppercase">
                        spirithubcafe.com
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium mb-4 flex items-center">
                    <Smartphone className="h-5 w-5 mr-2" />
                    Twitter Preview
                  </h4>
                  <div className="border rounded-lg overflow-hidden bg-white">
                    {seoData.twitterImage && (
                      <div className="aspect-video bg-gray-200 flex items-center justify-center">
                        <img 
                          src={seoData.twitterImage} 
                          alt="Twitter Image"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="font-medium text-sm">
                        {(isArabic ? (seoData.twitterTitleAr || seoData.twitterTitle) : (seoData.twitterTitle || seoData.twitterTitleAr)) || 'Twitter Title'}
                      </div>
                      <div className="text-gray-600 text-sm mt-1">
                        {(isArabic ? (seoData.twitterDescriptionAr || seoData.twitterDescription) : (seoData.twitterDescription || seoData.twitterDescriptionAr)) || 'Twitter description...'}
                      </div>
                      <div className="text-gray-500 text-xs mt-2">
                        spirithubcafe.com
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default SEOForm
