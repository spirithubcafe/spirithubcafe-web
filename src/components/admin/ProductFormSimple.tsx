import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { X, Save, ArrowLeft, Image, Grid, Settings } from 'lucide-react'
import { jsonDataService } from '@/services/jsonDataService'
import ProductPropertyForm from './ProductPropertyForm'

interface Category {
  id: string
  name: string
  name_ar: string
  description?: string
  description_ar?: string
}

interface ProductProperty {
  id: string
  name: string
  name_ar: string
  type: 'single' | 'multiple' | 'variant'
  required: boolean
  display_order: number
  options: Array<{
    id: string
    property_id: string
    name: string
    name_ar: string
    price_adjustment: number
    available: boolean
    display_order: number
  }>
}

interface Product {
  id?: string
  name: string
  name_ar: string
  description: string
  description_ar: string
  price: number
  sale_price?: number
  sku?: string
  stock: number
  category_id: string
  category?: string
  category_ar?: string
  images: string[]
  featured_image?: string
  status: 'active' | 'inactive' | 'draft'
  properties?: ProductProperty[]
  tags?: string[]
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
  seo?: {
    title?: string
    title_ar?: string
    description?: string
    description_ar?: string
    keywords?: string
    keywords_ar?: string
  }
  created_at?: string
  updated_at?: string
}

interface ProductFormProps {
  product?: Product
  onSave: (product: Product) => void
  onCancel: () => void
}

const defaultProduct: Product = {
  name: '',
  name_ar: '',
  description: '',
  description_ar: '',
  price: 0,
  stock: 0,
  category_id: '',
  images: [],
  status: 'draft',
  properties: [],
  tags: [],
  weight: 0,
  dimensions: {
    length: 0,
    width: 0,
    height: 0
  },
  seo: {
    title: '',
    title_ar: '',
    description: '',
    description_ar: '',
    keywords: '',
    keywords_ar: ''
  }
}

export default function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  
  const [formData, setFormData] = useState<Product>(product || defaultProduct)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [imageUrl, setImageUrl] = useState('')

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const data = await jsonDataService.fetchJSON('/data/categories.json')
      if (data && Array.isArray(data)) {
        setCategories(data)
      }
    } catch (error) {
      console.error('Error loading categories:', error)
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      // Validation
      if (!formData.name || !formData.name_ar || !formData.category_id) {
        console.log(isArabic ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields')
        return
      }

      // Find category name
      const category = categories.find(c => c.id === formData.category_id)
      if (category) {
        formData.category = category.name
        formData.category_ar = category.name_ar
      }

      const now = new Date().toISOString()
      const productData: Product = {
        ...formData,
        updated_at: now,
        ...(product ? {} : { id: Date.now().toString(), created_at: now })
      }

      await onSave(productData)
      console.log(product 
        ? (isArabic ? 'تم تحديث المنتج بنجاح' : 'Product updated successfully')
        : (isArabic ? 'تم إضافة المنتج بنجاح' : 'Product added successfully')
      )
    } catch (error) {
      console.error('Error saving product:', error)
    } finally {
      setSaving(false)
    }
  }

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const updateDimensions = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      dimensions: {
        ...prev.dimensions!,
        [field]: value
      }
    }))
  }

  const updateSEO = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      seo: {
        ...prev.seo!,
        [field]: value
      }
    }))
  }

  const addImage = () => {
    if (imageUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageUrl.trim()],
        ...(prev.images.length === 0 ? { featured_image: imageUrl.trim() } : {})
      }))
      setImageUrl('')
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      ...(prev.featured_image === prev.images[index] ? { featured_image: prev.images[0] || '' } : {})
    }))
  }

  const setFeaturedImage = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      featured_image: imageUrl
    }))
  }

  const addTag = (tag: string) => {
    if (tag.trim() && !formData.tags?.includes(tag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag.trim()]
      }))
    }
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || []
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">
            {product 
              ? (isArabic ? 'تحرير المنتج' : 'Edit Product')
              : (isArabic ? 'إضافة منتج جديد' : 'Add New Product')
            }
          </h2>
          <p className="text-muted-foreground">
            {isArabic ? 'قم بتعديل معلومات المنتج' : 'Fill in the product information'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {isArabic ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving 
              ? (isArabic ? 'جارٍ الحفظ...' : 'Saving...')
              : (isArabic ? 'حفظ المنتج' : 'Save Product')
            }
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">
            <Grid className="h-4 w-4 mr-2" />
            {isArabic ? 'معلومات أساسية' : 'Basic Info'}
          </TabsTrigger>
          <TabsTrigger value="images">
            <Image className="h-4 w-4 mr-2" />
            {isArabic ? 'الصور' : 'Images'}
          </TabsTrigger>
          <TabsTrigger value="properties">
            <Settings className="h-4 w-4 mr-2" />
            {isArabic ? 'الخصائص' : 'Properties'}
          </TabsTrigger>
          <TabsTrigger value="seo">
            {isArabic ? 'SEO' : 'SEO'}
          </TabsTrigger>
        </TabsList>

        {/* Basic Information */}
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'المعلومات الأساسية' : 'Basic Information'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{isArabic ? 'اسم المنتج (انجليزي)' : 'Product Name (English)'} *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="Product name"
                  />
                </div>
                <div>
                  <Label>{isArabic ? 'اسم المنتج (عربي)' : 'Product Name (Arabic)'} *</Label>
                  <Input
                    value={formData.name_ar}
                    onChange={(e) => updateField('name_ar', e.target.value)}
                    placeholder="اسم المنتج"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{isArabic ? 'وصف المنتج (انجليزي)' : 'Product Description (English)'}</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    rows={4}
                    placeholder="Product description"
                  />
                </div>
                <div>
                  <Label>{isArabic ? 'وصف المنتج (عربي)' : 'Product Description (Arabic)'}</Label>
                  <Textarea
                    value={formData.description_ar}
                    onChange={(e) => updateField('description_ar', e.target.value)}
                    rows={4}
                    placeholder="وصف المنتج"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label>{isArabic ? 'السعر ($)' : 'Price ($)'} *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => updateField('price', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>{isArabic ? 'سعر التخفيض ($)' : 'Sale Price ($)'}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.sale_price || ''}
                    onChange={(e) => updateField('sale_price', parseFloat(e.target.value) || undefined)}
                  />
                </div>
                <div>
                  <Label>{isArabic ? 'الكمية' : 'Stock Quantity'}</Label>
                  <Input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => updateField('stock', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>{isArabic ? 'رمز المنتج' : 'SKU'}</Label>
                  <Input
                    value={formData.sku || ''}
                    onChange={(e) => updateField('sku', e.target.value)}
                    placeholder="PROD-001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{isArabic ? 'الفئة' : 'Category'} *</Label>
                  <Select 
                    value={formData.category_id} 
                    onValueChange={(value) => updateField('category_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isArabic ? 'اختر الفئة' : 'Select category'} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {isArabic ? category.name_ar || category.name : category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{isArabic ? 'الحالة' : 'Status'}</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value: any) => updateField('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">{isArabic ? 'نشط' : 'Active'}</SelectItem>
                      <SelectItem value="inactive">{isArabic ? 'غير نشط' : 'Inactive'}</SelectItem>
                      <SelectItem value="draft">{isArabic ? 'مسودة' : 'Draft'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Dimensions */}
              <div>
                <Label className="text-lg font-medium">{isArabic ? 'الأبعاد (سم)' : 'Dimensions (cm)'}</Label>
                <div className="grid grid-cols-4 gap-4 mt-2">
                  <div>
                    <Label>{isArabic ? 'الوزن (جم)' : 'Weight (g)'}</Label>
                    <Input
                      type="number"
                      value={formData.weight || ''}
                      onChange={(e) => updateField('weight', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label>{isArabic ? 'الطول' : 'Length'}</Label>
                    <Input
                      type="number"
                      value={formData.dimensions?.length || ''}
                      onChange={(e) => updateDimensions('length', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label>{isArabic ? 'العرض' : 'Width'}</Label>
                    <Input
                      type="number"
                      value={formData.dimensions?.width || ''}
                      onChange={(e) => updateDimensions('width', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label>{isArabic ? 'الارتفاع' : 'Height'}</Label>
                    <Input
                      type="number"
                      value={formData.dimensions?.height || ''}
                      onChange={(e) => updateDimensions('height', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <Label className="text-lg font-medium">{isArabic ? 'العلامات' : 'Tags'}</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder={isArabic ? 'أضف علامة' : 'Add tag'}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addTag(e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags?.map((tag, index) => (
                    <div key={index} className="bg-secondary px-2 py-1 rounded-md flex items-center gap-2">
                      <span className="text-sm">{tag}</span>
                      <button onClick={() => removeTag(tag)}>
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Images */}
        <TabsContent value="images">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'صور المنتج' : 'Product Images'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>{isArabic ? 'رابط الصورة' : 'Image URL'}</Label>
                <div className="flex gap-2">
                  <Input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                  <Button onClick={addImage} disabled={!imageUrl.trim()}>
                    {isArabic ? 'إضافة' : 'Add'}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Product ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                      onError={(e) => {
                        e.currentTarget.src = '/images/placeholder.jpg'
                      }}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setFeaturedImage(image)}
                        disabled={formData.featured_image === image}
                      >
                        {formData.featured_image === image 
                          ? (isArabic ? 'رئيسية' : 'Featured')
                          : (isArabic ? 'جعل رئيسية' : 'Set Featured')
                        }
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {formData.images.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Image className="h-12 w-12 mx-auto mb-4" />
                  <p>{isArabic ? 'لا توجد صور للمنتج' : 'No product images'}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Properties */}
        <TabsContent value="properties">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'خصائص المنتج' : 'Product Properties'}</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductPropertyForm
                properties={formData.properties || []}
                onPropertiesChange={(properties) => updateField('properties', properties)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO */}
        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'إعدادات SEO' : 'SEO Settings'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{isArabic ? 'عنوان SEO (انجليزي)' : 'SEO Title (English)'}</Label>
                  <Input
                    value={formData.seo?.title || ''}
                    onChange={(e) => updateSEO('title', e.target.value)}
                    placeholder={formData.name}
                  />
                </div>
                <div>
                  <Label>{isArabic ? 'عنوان SEO (عربي)' : 'SEO Title (Arabic)'}</Label>
                  <Input
                    value={formData.seo?.title_ar || ''}
                    onChange={(e) => updateSEO('title_ar', e.target.value)}
                    placeholder={formData.name_ar}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{isArabic ? 'وصف SEO (انجليزي)' : 'SEO Description (English)'}</Label>
                  <Textarea
                    value={formData.seo?.description || ''}
                    onChange={(e) => updateSEO('description', e.target.value)}
                    rows={3}
                    placeholder={formData.description}
                  />
                </div>
                <div>
                  <Label>{isArabic ? 'وصف SEO (عربي)' : 'SEO Description (Arabic)'}</Label>
                  <Textarea
                    value={formData.seo?.description_ar || ''}
                    onChange={(e) => updateSEO('description_ar', e.target.value)}
                    rows={3}
                    placeholder={formData.description_ar}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{isArabic ? 'الكلمات المفتاحية (انجليزي)' : 'Keywords (English)'}</Label>
                  <Input
                    value={formData.seo?.keywords || ''}
                    onChange={(e) => updateSEO('keywords', e.target.value)}
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>
                <div>
                  <Label>{isArabic ? 'الكلمات المفتاحية (عربي)' : 'Keywords (Arabic)'}</Label>
                  <Input
                    value={formData.seo?.keywords_ar || ''}
                    onChange={(e) => updateSEO('keywords_ar', e.target.value)}
                    placeholder="كلمة1, كلمة2, كلمة3"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
