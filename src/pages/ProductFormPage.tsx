import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Plus, X, Upload, Save, ArrowLeft, Image, Grid, Settings } from 'lucide-react'
import { firestoreService, storageService, type Category } from '@/lib/firebase'
import toast from 'react-hot-toast'

interface SimpleProperty {
  name: string
  value: string
  price?: number
}

interface ProductForm {
  name: string
  name_ar: string
  description: string
  description_ar: string
  price_omr: number
  sale_price_omr?: number
  category_id: string
  image?: string
  gallery?: string[]
  is_featured: boolean
  is_bestseller: boolean
  properties: SimpleProperty[]
  stock_quantity: number
  slug: string
}

export default function ProductFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { t } = useTranslation()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [activeTab, setActiveTab] = useState('basic')

  const isEdit = id && id !== 'new'
  const returnTab = searchParams.get('return') || 'products'

  const [form, setForm] = useState<ProductForm>({
    name: '',
    name_ar: '',
    description: '',
    description_ar: '',
    price_omr: 0,
    sale_price_omr: undefined,
    category_id: '',
    image: '',
    gallery: [],
    is_featured: false,
    is_bestseller: false,
    properties: [],
    stock_quantity: 0,
    slug: ''
  })

  const [newProperty, setNewProperty] = useState({ name: '', value: '', price: 0 })

  useEffect(() => {
    loadCategories()
    if (isEdit) {
      loadProduct(id!)
    }
  }, [id, isEdit])

  const loadCategories = async () => {
    try {
      const data = await firestoreService.categories.list()
      setCategories(data.items)
    } catch (error) {
      console.error('Error loading categories:', error)
      toast.error(t('dashboard.categories.loadError'))
    }
  }

  const loadProduct = async (productId: string) => {
    setLoading(true)
    try {
      const product = await firestoreService.products.get(productId)
      if (product) {
        setForm({
          name: product.name || '',
          name_ar: product.name_ar || '',
          description: product.description || '',
          description_ar: product.description_ar || '',
          price_omr: product.price_omr || 0,
          sale_price_omr: product.sale_price_omr,
          category_id: product.category_id || '',
          image: product.image || '',
          gallery: product.gallery || [],
          is_featured: product.is_featured || false,
          is_bestseller: product.is_bestseller || false,
          properties: product.properties?.map(p => ({ 
            name: p.name, 
            value: p.options?.[0]?.value || '', 
            price: p.options?.[0]?.price_modifier || 0 
          })) || [],
          stock_quantity: product.stock_quantity || 0,
          slug: product.slug || ''
        })
      }
    } catch (error) {
      console.error('Error loading product:', error)
      toast.error(t('dashboard.products.loadError'))
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleSave = async () => {
    if (!form.name || !form.name_ar || !form.category_id || form.price_omr <= 0) {
      toast.error(t('dashboard.products.requiredFields'))
      return
    }

    setSaving(true)
    try {
      // Find category
      const category = categories.find(c => c.id === form.category_id)
      if (!category) {
        toast.error('Category not found')
        return
      }

      const productData = {
        name: form.name,
        name_ar: form.name_ar,
        description: form.description,
        description_ar: form.description_ar,
        price_omr: form.price_omr,
        sale_price_omr: form.sale_price_omr && form.sale_price_omr > 0 ? form.sale_price_omr : undefined,
        category_id: form.category_id,
        category: category,
        image: form.image,
        gallery: form.gallery || [],
        is_featured: form.is_featured,
        is_bestseller: form.is_bestseller,
        is_new_arrival: false,
        is_on_sale: form.sale_price_omr ? form.sale_price_omr < form.price_omr : false,
        is_active: true,
        stock_quantity: form.stock_quantity,
        stock: form.stock_quantity,
        sort_order: 0,
        slug: form.slug || generateSlug(form.name),
        properties: form.properties.map(p => ({
          name: p.name,
          name_ar: p.name,
          type: 'select' as const,
          required: false,
          affects_price: (p.price || 0) > 0,
          options: [{
            value: p.value,
            value_ar: p.value,
            label: p.value,
            label_ar: p.value,
            price_modifier: p.price || 0
          }]
        })),
        updated_at: new Date()
      }

      if (isEdit) {
        await firestoreService.products.update(id!, productData)
        toast.success(t('dashboard.products.updateSuccess'))
      } else {
        await firestoreService.products.create(productData)
        toast.success(t('dashboard.products.addSuccess'))
      }

      navigate(`/dashboard?tab=${returnTab}`)
    } catch (error) {
      console.error('Error saving product:', error)
      toast.error(t('dashboard.products.saveError'))
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (file: File, isGallery = false) => {
    if (!file) return

    setUploadProgress(0)
    try {
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const url = await storageService.upload(`products/${Date.now()}_${file.name}`, file)
      
      clearInterval(interval)
      setUploadProgress(100)

      if (isGallery) {
        setForm(prev => ({
          ...prev,
          gallery: [...(prev.gallery || []), url]
        }))
      } else {
        setForm(prev => ({ ...prev, image: url }))
      }

      setTimeout(() => setUploadProgress(0), 1000)
      toast.success(t('dashboard.products.uploadSuccess'))
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error(t('dashboard.products.uploadError'))
      setUploadProgress(0)
    }
  }

  const addProperty = () => {
    if (newProperty.name && newProperty.value) {
      setForm(prev => ({
        ...prev,
        properties: [...prev.properties, { ...newProperty }]
      }))
      setNewProperty({ name: '', value: '', price: 0 })
    }
  }

  const removeProperty = (index: number) => {
    setForm(prev => ({
      ...prev,
      properties: prev.properties.filter((_, i) => i !== index)
    }))
  }

  const removeGalleryImage = (index: number) => {
    setForm(prev => ({
      ...prev,
      gallery: prev.gallery?.filter((_, i) => i !== index) || []
    }))
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate(`/dashboard?tab=${returnTab}`)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEdit ? t('dashboard.products.edit') : t('dashboard.products.add')}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? t('dashboard.products.editDescription') : t('dashboard.products.addDescription')}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            {t('dashboard.products.basicInfo')}
          </TabsTrigger>
          <TabsTrigger value="gallery" className="flex items-center gap-2">
            <Grid className="h-4 w-4" />
            {t('dashboard.products.gallery')}
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            {t('dashboard.products.settings')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.products.basicInfo')}</CardTitle>
              <CardDescription>{t('dashboard.products.basicInfoDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name-en">{t('dashboard.products.nameEn')}</Label>
                  <Input
                    id="name-en"
                    value={form.name}
                    onChange={(e) => setForm(prev => ({
                      ...prev,
                      name: e.target.value,
                      slug: generateSlug(e.target.value)
                    }))}
                    placeholder={t('dashboard.products.nameEnPlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name-ar">{t('dashboard.products.nameAr')}</Label>
                  <Input
                    id="name-ar"
                    value={form.name_ar}
                    onChange={(e) => setForm(prev => ({
                      ...prev,
                      name_ar: e.target.value
                    }))}
                    placeholder={t('dashboard.products.nameArPlaceholder')}
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="description-en">{t('dashboard.products.descriptionEn')}</Label>
                  <Textarea
                    id="description-en"
                    value={form.description}
                    onChange={(e) => setForm(prev => ({
                      ...prev,
                      description: e.target.value
                    }))}
                    placeholder={t('dashboard.products.descriptionEnPlaceholder')}
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description-ar">{t('dashboard.products.descriptionAr')}</Label>
                  <Textarea
                    id="description-ar"
                    value={form.description_ar}
                    onChange={(e) => setForm(prev => ({
                      ...prev,
                      description_ar: e.target.value
                    }))}
                    placeholder={t('dashboard.products.descriptionArPlaceholder')}
                    dir="rtl"
                    rows={4}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">{t('dashboard.products.price')} (OMR)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price_omr}
                    onChange={(e) => setForm(prev => ({ ...prev, price_omr: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sale-price">{t('dashboard.products.salePrice')} (OMR)</Label>
                  <Input
                    id="sale-price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.sale_price_omr || ''}
                    onChange={(e) => setForm(prev => ({ 
                      ...prev, 
                      sale_price_omr: e.target.value ? parseFloat(e.target.value) : undefined 
                    }))}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">{t('dashboard.products.stock')}</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={form.stock_quantity}
                    onChange={(e) => setForm(prev => ({ ...prev, stock_quantity: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">{t('dashboard.products.category')}</Label>
                  <Select
                    value={form.category_id}
                    onValueChange={(value) => setForm(prev => ({ ...prev, category_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('dashboard.products.selectCategory')} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name} / {category.name_ar}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">{t('dashboard.products.slug')}</Label>
                  <Input
                    id="slug"
                    value={form.slug}
                    onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="product-slug"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.products.properties')}</CardTitle>
              <CardDescription>{t('dashboard.products.propertiesDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prop-name">{t('dashboard.products.propertyName')}</Label>
                  <Input
                    id="prop-name"
                    value={newProperty.name}
                    onChange={(e) => setNewProperty(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={t('dashboard.products.propertyNamePlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prop-value">{t('dashboard.products.propertyValue')}</Label>
                  <Input
                    id="prop-value"
                    value={newProperty.value}
                    onChange={(e) => setNewProperty(prev => ({ ...prev, value: e.target.value }))}
                    placeholder={t('dashboard.products.propertyValuePlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prop-price">{t('dashboard.products.propertyPrice')} (OMR)</Label>
                  <Input
                    id="prop-price"
                    type="number"
                    step="0.01"
                    value={newProperty.price}
                    onChange={(e) => setNewProperty(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={addProperty} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('common.add')}
                  </Button>
                </div>
              </div>

              {form.properties.length > 0 && (
                <div className="space-y-2">
                  <Label>{t('dashboard.products.currentProperties')}</Label>
                  <div className="flex flex-wrap gap-2">
                    {form.properties.map((property, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-2">
                        {property.name}: {property.value}
                        {property.price ? ` (+${property.price} OMR)` : ''}
                        <button
                          onClick={() => removeProperty(index)}
                          className="ml-1 hover:text-destructive"
                          title="Remove property"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gallery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.products.mainImage')}</CardTitle>
              <CardDescription>{t('dashboard.products.mainImageDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="main-image">{t('dashboard.products.uploadMainImage')}</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="main-image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file, false)
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('main-image')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {t('common.upload')}
                  </Button>
                </div>
                {uploadProgress > 0 && (
                  <Progress value={uploadProgress} className="w-full" />
                )}
              </div>

              {form.image && (
                <div className="space-y-2">
                  <Label>{t('dashboard.products.currentMainImage')}</Label>
                  <div className="relative inline-block">
                    <img
                      src={form.image}
                      alt="Main product image"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                    <button
                      onClick={() => setForm(prev => ({ ...prev, image: '' }))}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                      title="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.products.galleryImages')}</CardTitle>
              <CardDescription>{t('dashboard.products.galleryImagesDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gallery-image">{t('dashboard.products.uploadGalleryImage')}</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="gallery-image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file, true)
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('gallery-image')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {t('common.upload')}
                  </Button>
                </div>
              </div>

              {form.gallery && form.gallery.length > 0 && (
                <div className="space-y-2">
                  <Label>{t('dashboard.products.currentGalleryImages')}</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {form.gallery.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Gallery image ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        <button
                          onClick={() => removeGalleryImage(index)}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                          title="Remove image"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.products.productSettings')}</CardTitle>
              <CardDescription>{t('dashboard.products.productSettingsDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={form.is_featured}
                  onChange={(e) => setForm(prev => ({ ...prev, is_featured: e.target.checked }))}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                  title={t('dashboard.products.featured')}
                />
                <Label htmlFor="featured">{t('dashboard.products.featured')}</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="bestseller"
                  checked={form.is_bestseller}
                  onChange={(e) => setForm(prev => ({ ...prev, is_bestseller: e.target.checked }))}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                  title={t('dashboard.products.bestseller')}
                />
                <Label htmlFor="bestseller">{t('dashboard.products.bestseller')}</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button
          variant="outline"
          onClick={() => navigate(`/dashboard?tab=${returnTab}`)}
        >
          {t('common.cancel')}
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              {t('common.saving')}
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {t('common.save')}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
