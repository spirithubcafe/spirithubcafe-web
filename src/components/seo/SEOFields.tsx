import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Twitter, 
  Facebook,
  Link,
  Info
} from 'lucide-react'
import SEOAutoGenerateButton from './SEOAutoGenerateButton'

interface SEOFieldsProps {
  type: 'product' | 'category' | 'page'
  itemId?: string
  values: {
    meta_title?: string
    meta_description?: string
    meta_keywords?: string
    slug?: string
    canonical_url?: string
    og_title?: string
    og_description?: string
    og_image?: string
    twitter_title?: string
    twitter_description?: string
    twitter_image?: string
    seo_auto_generated?: boolean
    seo_generated_at?: string
  }
  onChange: (field: string, value: string) => void
  onSEOGenerated?: (seoData: any) => void
  disabled?: boolean
}

const SEOFields: React.FC<SEOFieldsProps> = ({
  type,
  itemId,
  values,
  onChange,
  onSEOGenerated,
  disabled = false
}) => {
  const handleSEOGenerated = (seoData: any) => {
    // Update all SEO fields with generated data
    Object.keys(seoData).forEach(key => {
      if (seoData[key]) {
        onChange(key, seoData[key])
      }
    })
    
    // Mark as auto-generated
    onChange('seo_auto_generated', 'true')
    onChange('seo_generated_at', new Date().toISOString())
    
    // Call callback if provided
    if (onSEOGenerated) {
      onSEOGenerated(seoData)
    }
  }

  const getCharacterCount = (text: string, recommended: number) => {
    const length = text?.length || 0
    const isGood = length <= recommended && length > recommended * 0.7
    const isWarning = length > recommended
    
    return {
      length,
      isGood,
      isWarning,
      className: isWarning ? 'text-red-500' : isGood ? 'text-green-500' : 'text-gray-500'
    }
  }

  const metaTitleStats = getCharacterCount(values.meta_title || '', 60)
  const metaDescStats = getCharacterCount(values.meta_description || '', 160)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              تحسين محركات البحث (SEO)
            </CardTitle>
            <CardDescription>
              قم بتحسين ظهور المحتوى في نتائج البحث ومواقع التواصل الاجتماعي
            </CardDescription>
          </div>
          
          {itemId && (
            <SEOAutoGenerateButton
              type={type}
              itemId={itemId}
              currentSEO={values}
              onSEOGenerated={handleSEOGenerated}
            />
          )}
        </div>
        
        {values.seo_auto_generated && values.seo_generated_at && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4" />
            تم التحديث تلقائياً في {new Date(values.seo_generated_at).toLocaleDateString('ar')}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Basic SEO */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <h4 className="font-medium">البيانات الأساسية</h4>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="meta_title">العنوان الرئيسي (Meta Title)</Label>
              <Input
                id="meta_title"
                value={values.meta_title || ''}
                onChange={(e) => onChange('meta_title', e.target.value)}
                placeholder="عنوان الصفحة كما سيظهر في نتائج البحث"
                disabled={disabled}
                className="mt-1"
              />
              <div className={`text-xs mt-1 ${metaTitleStats.className}`}>
                {metaTitleStats.length}/60 حرف 
                {metaTitleStats.isWarning && ' (طويل جداً)'}
                {metaTitleStats.isGood && ' (مثالي)'}
              </div>
            </div>
            
            <div>
              <Label htmlFor="meta_description">وصف الصفحة (Meta Description)</Label>
              <Textarea
                id="meta_description"
                value={values.meta_description || ''}
                onChange={(e) => onChange('meta_description', e.target.value)}
                placeholder="وصف مختصر للصفحة سيظهر تحت العنوان في نتائج البحث"
                disabled={disabled}
                className="mt-1 min-h-[80px]"
              />
              <div className={`text-xs mt-1 ${metaDescStats.className}`}>
                {metaDescStats.length}/160 حرف
                {metaDescStats.isWarning && ' (طويل جداً)'}
                {metaDescStats.isGood && ' (مثالي)'}
              </div>
            </div>
            
            <div>
              <Label htmlFor="meta_keywords">الكلمات المفتاحية</Label>
              <Input
                id="meta_keywords"
                value={values.meta_keywords || ''}
                onChange={(e) => onChange('meta_keywords', e.target.value)}
                placeholder="كلمات مفتاحية مفصولة بفواصل"
                disabled={disabled}
                className="mt-1"
              />
              <div className="text-xs text-muted-foreground mt-1">
                استخدم فواصل للفصل بين الكلمات المفتاحية
              </div>
            </div>
            
            <div>
              <Label htmlFor="slug">الرابط المختصر (Slug)</Label>
              <Input
                id="slug"
                value={values.slug || ''}
                onChange={(e) => onChange('slug', e.target.value)}
                placeholder="رابط-مختصر-للصفحة"
                disabled={disabled}
                className="mt-1 font-mono"
              />
              <div className="text-xs text-muted-foreground mt-1">
                يجب أن يكون باللغة الإنجليزية ومفصول بشرطات
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Open Graph (Facebook) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Facebook className="h-4 w-4" />
            <h4 className="font-medium">Facebook / Open Graph</h4>
            <Badge variant="secondary" className="text-xs">اختياري</Badge>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="og_title">عنوان Facebook</Label>
              <Input
                id="og_title"
                value={values.og_title || ''}
                onChange={(e) => onChange('og_title', e.target.value)}
                placeholder="العنوان كما سيظهر عند المشاركة على Facebook"
                disabled={disabled}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="og_description">وصف Facebook</Label>
              <Textarea
                id="og_description"
                value={values.og_description || ''}
                onChange={(e) => onChange('og_description', e.target.value)}
                placeholder="الوصف كما سيظهر عند المشاركة على Facebook"
                disabled={disabled}
                className="mt-1 min-h-[60px]"
              />
            </div>
            
            <div>
              <Label htmlFor="og_image">رابط صورة Facebook</Label>
              <Input
                id="og_image"
                value={values.og_image || ''}
                onChange={(e) => onChange('og_image', e.target.value)}
                placeholder="https://example.com/image.jpg"
                disabled={disabled}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Twitter Cards */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Twitter className="h-4 w-4" />
            <h4 className="font-medium">Twitter Cards</h4>
            <Badge variant="secondary" className="text-xs">اختياري</Badge>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="twitter_title">عنوان Twitter</Label>
              <Input
                id="twitter_title"
                value={values.twitter_title || ''}
                onChange={(e) => onChange('twitter_title', e.target.value)}
                placeholder="العنوان كما سيظهر عند المشاركة على Twitter"
                disabled={disabled}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="twitter_description">وصف Twitter</Label>
              <Textarea
                id="twitter_description"
                value={values.twitter_description || ''}
                onChange={(e) => onChange('twitter_description', e.target.value)}
                placeholder="الوصف كما سيظهر عند المشاركة على Twitter"
                disabled={disabled}
                className="mt-1 min-h-[60px]"
              />
            </div>
            
            <div>
              <Label htmlFor="twitter_image">رابط صورة Twitter</Label>
              <Input
                id="twitter_image"
                value={values.twitter_image || ''}
                onChange={(e) => onChange('twitter_image', e.target.value)}
                placeholder="https://example.com/image.jpg"
                disabled={disabled}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Technical SEO */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            <h4 className="font-medium">الإعدادات التقنية</h4>
            <Badge variant="secondary" className="text-xs">متقدم</Badge>
          </div>
          
          <div>
            <Label htmlFor="canonical_url">الرابط الكانوني (Canonical URL)</Label>
            <Input
              id="canonical_url"
              value={values.canonical_url || ''}
              onChange={(e) => onChange('canonical_url', e.target.value)}
              placeholder="/products/product-name"
              disabled={disabled}
              className="mt-1 font-mono"
            />
            <div className="text-xs text-muted-foreground mt-1">
              الرابط الرسمي للصفحة لتجنب المحتوى المكرر
            </div>
          </div>
        </div>

        {/* SEO Tips */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h5 className="font-medium text-blue-900 mb-2">نصائح لتحسين السيو:</h5>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• استخدم عناوين وصفية وجذابة</li>
            <li>• اكتب أوصاف تلخص المحتوى بوضوح</li>
            <li>• استخدم كلمات مفتاحية مناسبة للمحتوى</li>
            <li>• تأكد من أن الروابط المختصرة سهلة القراءة</li>
            <li>• استخدم الأزرار أعلاه لتوليد سيو تلقائي محسن</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

export default SEOFields
