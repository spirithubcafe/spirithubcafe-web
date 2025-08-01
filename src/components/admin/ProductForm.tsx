import { useState, useEffect } from 'react'
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

interface ProductFormProps {
  editingProduct?: any
  onSave: () => void
  onCancel: () => void
}

export default function ProductForm({ editingProduct, onSave, onCancel }: ProductFormProps) {
  const { i18n } = useTranslation()
  const [categories, setCategories] = useState<Category[]>([])
  const [saving, setSaving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [activeTab, setActiveTab] = useState('basic')

  const isArabic = i18n.language === 'ar'
  const isEdit = !!editingProduct

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
    const loadCategories = async () => {
      try {
        const data = await firestoreService.categories.list()
        setCategories(data.items)
      } catch (error) {
        console.error('Error loading categories:', error)
        toast.error(isArabic ? 'خطأ في تحميل الفئات' : 'Error loading categories')
      }
    }
    
    loadCategories()
    
    if (editingProduct) {
      setForm({
        name: editingProduct.name || '',
        name_ar: editingProduct.name_ar || '',
        description: editingProduct.description || '',
        description_ar: editingProduct.description_ar || '',
        price_omr: editingProduct.price_omr || 0,
        sale_price_omr: editingProduct.sale_price_omr,
        category_id: editingProduct.category_id || '',
        image: editingProduct.image || '',
        gallery: editingProduct.gallery || [],
        is_featured: editingProduct.is_featured || false,
        is_bestseller: editingProduct.is_bestseller || false,
        properties: editingProduct.properties?.map((p: any) => ({ 
          name: p.name, 
          value: p.options?.[0]?.value || '', 
          price: p.options?.[0]?.price_modifier || 0 
        })) || [],
        stock_quantity: editingProduct.stock_quantity || 0,
        slug: editingProduct.slug || ''
      })
    }
  }, [editingProduct, isArabic])

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
      toast.error(isArabic ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields')
      return
    }

    setSaving(true)
    try {
      // Find category
      const category = categories.find(c => c.id === form.category_id)
      if (!category) {
        toast.error(isArabic ? 'لم يتم العثور على الفئة' : 'Category not found')
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
        is_active: true,
        stock_quantity: form.stock_quantity,
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
        sort_order: 0,
        is_new_arrival: false,
        is_on_sale: (form.sale_price_omr || 0) > 0,
        stock: form.stock_quantity,
        updated_at: new Date()
      }

      if (isEdit) {
        await firestoreService.products.update(editingProduct.id, productData)
        toast.success(isArabic ? 'تم تحديث المنتج بنجاح' : 'Product updated successfully')
      } else {
        await firestoreService.products.create(productData)
        toast.success(isArabic ? 'تم إضافة المنتج بنجاح' : 'Product added successfully')
      }

      onSave()
    } catch (error) {
      console.error('Error saving product:', error)
      toast.error(isArabic ? 'خطأ في حفظ المنتج' : 'Error saving product')
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
      toast.success(isArabic ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully')
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error(isArabic ? 'خطأ في رفع الصورة' : 'Error uploading image')
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {isEdit 
              ? (isArabic ? 'تعديل المنتج' : 'Edit Product')
              : (isArabic ? 'إضافة منتج جديد' : 'Add New Product')
            }
          </h3>
          <p className="text-sm text-muted-foreground">
            {isEdit 
              ? (isArabic ? 'تعديل تفاصيل المنتج' : 'Edit product details')
              : (isArabic ? 'إضافة منتج جديد إلى المتجر' : 'Add a new product to the store')
            }
          </p>
        </div>
        <Button variant="outline" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {isArabic ? 'رجوع' : 'Back'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            {isArabic ? 'المعلومات الأساسية' : 'Basic Info'}
          </TabsTrigger>
          <TabsTrigger value="gallery" className="flex items-center gap-2">
            <Grid className="h-4 w-4" />
            {isArabic ? 'الصور' : 'Gallery'}
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            {isArabic ? 'الإعدادات' : 'Settings'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'المعلومات الأساسية' : 'Basic Information'}</CardTitle>
              <CardDescription>
                {isArabic ? 'أدخل المعلومات الأساسية للمنتج' : 'Enter the basic product information'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name-en">{isArabic ? 'الاسم (إنجليزي)' : 'Name (English)'}</Label>
                  <Input
                    id="name-en"
                    value={form.name}
                    onChange={(e) => setForm(prev => ({
                      ...prev,
                      name: e.target.value,
                      slug: generateSlug(e.target.value)
                    }))}
                    placeholder={isArabic ? 'أدخل اسم المنتج بالإنجليزية' : 'Enter product name in English'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name-ar">{isArabic ? 'الاسم (عربي)' : 'Name (Arabic)'}</Label>
                  <Input
                    id="name-ar"
                    value={form.name_ar}
                    onChange={(e) => setForm(prev => ({
                      ...prev,
                      name_ar: e.target.value
                    }))}
                    placeholder={isArabic ? 'أدخل اسم المنتج بالعربية' : 'Enter product name in Arabic'}
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="description-en">{isArabic ? 'الوصف (إنجليزي)' : 'Description (English)'}</Label>
                  <Textarea
                    id="description-en"
                    value={form.description}
                    onChange={(e) => setForm(prev => ({
                      ...prev,
                      description: e.target.value
                    }))}
                    placeholder={isArabic ? 'أدخل وصف المنتج بالإنجليزية' : 'Enter product description in English'}
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description-ar">{isArabic ? 'الوصف (عربي)' : 'Description (Arabic)'}</Label>
                  <Textarea
                    id="description-ar"
                    value={form.description_ar}
                    onChange={(e) => setForm(prev => ({
                      ...prev,
                      description_ar: e.target.value
                    }))}
                    placeholder={isArabic ? 'أدخل وصف المنتج بالعربية' : 'Enter product description in Arabic'}
                    dir="rtl"
                    rows={4}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">{isArabic ? 'السعر' : 'Price'} (OMR)</Label>
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
                  <Label htmlFor="sale-price">{isArabic ? 'سعر التخفيض' : 'Sale Price'} (OMR)</Label>
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
                  <Label htmlFor="stock">{isArabic ? 'المخزون' : 'Stock'}</Label>
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
                  <Label htmlFor="category">{isArabic ? 'الفئة' : 'Category'}</Label>
                  <Select
                    value={form.category_id}
                    onValueChange={(value) => setForm(prev => ({ ...prev, category_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isArabic ? 'اختر الفئة' : 'Select category'} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {isArabic ? category.name_ar : category.name} / {isArabic ? category.name : category.name_ar}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">{isArabic ? 'الرابط المختصر' : 'Slug'}</Label>
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
              <CardTitle>{isArabic ? 'الخصائص' : 'Properties'}</CardTitle>
              <CardDescription>
                {isArabic ? 'أضف خصائص إضافية للمنتج مثل الحجم أو اللون' : 'Add additional product properties like size or color'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prop-name">{isArabic ? 'اسم الخاصية' : 'Property Name'}</Label>
                  <Input
                    id="prop-name"
                    value={newProperty.name}
                    onChange={(e) => setNewProperty(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={isArabic ? 'مثل: الحجم' : 'e.g: Size'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prop-value">{isArabic ? 'القيمة' : 'Value'}</Label>
                  <Input
                    id="prop-value"
                    value={newProperty.value}
                    onChange={(e) => setNewProperty(prev => ({ ...prev, value: e.target.value }))}
                    placeholder={isArabic ? 'مثل: كبير' : 'e.g: Large'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prop-price">{isArabic ? 'السعر الإضافي' : 'Additional Price'} (OMR)</Label>
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
                    {isArabic ? 'إضافة' : 'Add'}
                  </Button>
                </div>
              </div>

              {form.properties.length > 0 && (
                <div className="space-y-2">
                  <Label>{isArabic ? 'الخصائص الحالية' : 'Current Properties'}</Label>
                  <div className="flex flex-wrap gap-2">
                    {form.properties.map((property, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-2">
                        {property.name}: {property.value}
                        {property.price ? ` (+${property.price} OMR)` : ''}
                        <button
                          onClick={() => removeProperty(index)}
                          className="ml-1 hover:text-destructive"
                          title={isArabic ? 'حذف الخاصية' : 'Remove property'}
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
              <CardTitle>{isArabic ? 'الصورة الرئيسية' : 'Main Image'}</CardTitle>
              <CardDescription>
                {isArabic ? 'ارفع الصورة الرئيسية للمنتج' : 'Upload the main product image'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="main-image">{isArabic ? 'رفع الصورة الرئيسية' : 'Upload Main Image'}</Label>
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
                    {isArabic ? 'رفع' : 'Upload'}
                  </Button>
                </div>
                {uploadProgress > 0 && (
                  <Progress value={uploadProgress} className="w-full" />
                )}
              </div>

              {form.image && (
                <div className="space-y-2">
                  <Label>{isArabic ? 'الصورة الرئيسية الحالية' : 'Current Main Image'}</Label>
                  <div className="relative inline-block">
                    <img
                      src={form.image}
                      alt="Main product image"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                    <button
                      onClick={() => setForm(prev => ({ ...prev, image: '' }))}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                      title={isArabic ? 'حذف الصورة' : 'Remove image'}
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
              <CardTitle>{isArabic ? 'معرض الصور' : 'Image Gallery'}</CardTitle>
              <CardDescription>
                {isArabic ? 'ارفع صور إضافية للمنتج' : 'Upload additional product images'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gallery-image">{isArabic ? 'رفع صورة للمعرض' : 'Upload Gallery Image'}</Label>
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
                    {isArabic ? 'رفع' : 'Upload'}
                  </Button>
                </div>
              </div>

              {form.gallery && form.gallery.length > 0 && (
                <div className="space-y-2">
                  <Label>{isArabic ? 'صور المعرض الحالية' : 'Current Gallery Images'}</Label>
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
                          title={isArabic ? 'حذف الصورة' : 'Remove image'}
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
              <CardTitle>{isArabic ? 'إعدادات المنتج' : 'Product Settings'}</CardTitle>
              <CardDescription>
                {isArabic ? 'تحديد حالة المنتج وخصائصه الخاصة' : 'Configure product status and special features'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={form.is_featured}
                  onChange={(e) => setForm(prev => ({ ...prev, is_featured: e.target.checked }))}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                  title={isArabic ? 'منتج مميز' : 'Featured product'}
                />
                <Label htmlFor="featured">{isArabic ? 'منتج مميز' : 'Featured Product'}</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="bestseller"
                  checked={form.is_bestseller}
                  onChange={(e) => setForm(prev => ({ ...prev, is_bestseller: e.target.checked }))}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                  title={isArabic ? 'الأكثر مبيعاً' : 'Best seller'}
                />
                <Label htmlFor="bestseller">{isArabic ? 'الأكثر مبيعاً' : 'Best Seller'}</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button variant="outline" onClick={onCancel}>
          {isArabic ? 'إلغاء' : 'Cancel'}
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              {isArabic ? 'جاري الحفظ...' : 'Saving...'}
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {isArabic ? 'حفظ' : 'Save'}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
