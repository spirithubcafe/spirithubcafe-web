import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { X, Upload, Save, ArrowLeft, Image, Grid, Settings, Coffee } from 'lucide-react'
import { firestoreService, storageService, auth, type Category, type ProductProperty } from '@/lib/firebase'
import ProductPropertyForm from './ProductPropertyForm'
import toast from 'react-hot-toast'

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
  properties: ProductProperty[]
  stock_quantity: number
  slug: string
  // Coffee information fields
  roast_level: string
  process: string
  variety: string
  altitude: string
  notes: string
  farm: string
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
  const [mainImageUploadProgress, setMainImageUploadProgress] = useState(0)
  const [galleryUploadProgress, setGalleryUploadProgress] = useState(0)
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
    slug: '',
    // Coffee information fields
    roast_level: '',
    process: '',
    variety: '',
    altitude: '',
    notes: '',
    farm: ''
  })

  const handlePropertiesChange = (properties: ProductProperty[]) => {
    setForm(prev => ({ ...prev, properties }))
  }

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
        properties: editingProduct.properties || [],
        stock_quantity: editingProduct.stock_quantity || 0,
        slug: editingProduct.slug || '',
        // Coffee information fields
        roast_level: editingProduct.roast_level || '',
        process: editingProduct.processing_method || '',
        variety: editingProduct.variety || '',
        altitude: editingProduct.altitude || '',
        notes: editingProduct.notes || '',
        farm: editingProduct.farm || ''
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
        properties: form.properties,
        sort_order: 0,
        is_new_arrival: false,
        is_on_sale: (form.sale_price_omr || 0) > 0,
        stock: form.stock_quantity,
        // Coffee information fields
        roast_level: form.roast_level,
        processing_method: form.process,
        variety: form.variety,
        altitude: form.altitude,
        notes: form.notes,
        farm: form.farm,
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

    const isArabic = i18n.language === 'ar'

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(isArabic ? 'يرجى اختيار ملف صورة صالح' : 'Please select a valid image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(isArabic ? 'حجم الصورة كبير جداً (الحد الأقصى 5 ميجابايت)' : 'Image size too large (max 5MB)')
      return
    }

    // Choose the appropriate progress setter
    const setProgress = isGallery ? setGalleryUploadProgress : setMainImageUploadProgress
    setProgress(0)
    
    try {
      // Check authentication first
      const currentUser = auth.currentUser
      if (!currentUser) {
        toast.error(isArabic ? 'يجب تسجيل الدخول أولاً' : 'Please login first')
        return
      }

      // Show progress
      const progressInterval = setInterval(() => {
        setProgress((prev: number) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      let url: string
      
      try {
        // Generate safe filename
        const timestamp = Date.now()
        const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
        const fileName = `${timestamp}_${safeFileName}`
        const filePath = isGallery ? `products/gallery/${fileName}` : `products/${fileName}`
        
        // Try Firebase Storage upload
        console.log('Attempting Firebase Storage upload...')
        url = await storageService.upload(filePath, file)
        console.log('Firebase Storage upload successful:', url)
        
      } catch (storageError) {
        console.warn('Firebase Storage failed, using fallback:', storageError)
        clearInterval(progressInterval)
        setProgress(50)
        
        // Use fallback method (base64)
        console.log('Using fallback upload method...')
        url = await storageService.uploadAsDataURL(file)
        
        toast.success(isArabic ? 'تم استخدام طريقة بديلة للرفع' : 'Used fallback upload method')
      }
      
      clearInterval(progressInterval)
      setProgress(100)

      // Update form data
      if (isGallery) {
        setForm(prev => ({
          ...prev,
          gallery: [...(prev.gallery || []), url]
        }))
      } else {
        setForm(prev => ({ ...prev, image: url }))
      }

      setTimeout(() => setProgress(0), 1000)
      toast.success(isArabic ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully')
      
    } catch (error) {
      console.error('Upload error:', error)
      setProgress(0)
      
      let errorMessage = isArabic ? 'خطأ في رفع الصورة' : 'Error uploading image'
      
      if (error instanceof Error) {
        if (error.message.includes('authentication') || error.message.includes('Unauthorized')) {
          errorMessage = isArabic ? 'يجب تسجيل الدخول لرفع الصور' : 'Login required to upload images'
        } else if (error.message.includes('quota')) {
          errorMessage = isArabic ? 'تم تجاوز حصة التخزين' : 'Storage quota exceeded'
        } else if (error.message.includes('CORS')) {
          errorMessage = isArabic ? 'خطأ CORS: يرجى التحقق من إعدادات Firebase' : 'CORS error: Please check Firebase configuration'
        } else if (error.message.includes('permission')) {
          errorMessage = isArabic ? 'ليس لديك صلاحية لرفع الصور' : 'No permission to upload images'
        }
      }
      
      toast.error(errorMessage)
    }
  }

  const validateImageUrl = (url: string): boolean => {
    try {
      new URL(url)
      return /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i.test(url)
    } catch {
      return false
    }
  }

  const addImageByUrl = (url: string, isGallery = false) => {
    if (!url.trim()) {
      toast.error(isArabic ? 'يرجى إدخال رابط الصورة' : 'Please enter image URL')
      return
    }

    if (!validateImageUrl(url)) {
      toast.error(isArabic ? 'رابط الصورة غير صالح' : 'Invalid image URL')
      return
    }

    if (isGallery) {
      if (form.gallery?.includes(url)) {
        toast.error(isArabic ? 'هذه الصورة موجودة مسبقاً' : 'This image already exists')
        return
      }
      setForm(prev => ({
        ...prev,
        gallery: [...(prev.gallery || []), url]
      }))
    } else {
      setForm(prev => ({ ...prev, image: url }))
    }

    toast.success(isArabic ? 'تمت إضافة الصورة بنجاح' : 'Image added successfully')
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            {isArabic ? 'المعلومات الأساسية' : 'Basic Info'}
          </TabsTrigger>
          <TabsTrigger value="coffee" className="flex items-center gap-2">
            <Coffee className="h-4 w-4" />
            {isArabic ? 'معلومات القهوة' : 'Coffee Info'}
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
                  <RichTextEditor
                    value={form.description}
                    onChange={(value) => setForm(prev => ({
                      ...prev,
                      description: value
                    }))}
                    placeholder={isArabic ? 'أدخل وصف المنتج بالإنجليزية' : 'Enter product description in English'}
                    direction="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description-ar">{isArabic ? 'الوصف (عربي)' : 'Description (Arabic)'}</Label>
                  <RichTextEditor
                    value={form.description_ar}
                    onChange={(value) => setForm(prev => ({
                      ...prev,
                      description_ar: value
                    }))}
                    placeholder={isArabic ? 'أدخل وصف المنتج بالعربية' : 'Enter product description in Arabic'}
                    direction="rtl"
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
              <CardTitle>{isArabic ? 'الخصائص المتقدمة' : 'Advanced Properties'}</CardTitle>
              <CardDescription>
                {isArabic ? 'أضف خصائص متقدمة للمنتج مع خيارات متعددة وأسعار مختلفة' : 'Add advanced product properties with multiple options and different pricing'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductPropertyForm
                properties={form.properties}
                onPropertiesChange={handlePropertiesChange}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coffee" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coffee className="h-5 w-5 text-amber-600" />
                {isArabic ? 'معلومات القهوة' : 'Coffee Information'}
              </CardTitle>
              <CardDescription>
                {isArabic ? 'أدخل معلومات القهوة التي ستظهر للعملاء' : 'Enter coffee information that will be displayed to customers'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="roast-level">{isArabic ? 'درجة التحميص' : 'Roast Level'}</Label>
                  <Input
                    id="roast-level"
                    value={form.roast_level}
                    onChange={(e) => setForm(prev => ({ ...prev, roast_level: e.target.value }))}
                    placeholder={isArabic ? 'مثال: تحميص خفيف' : 'e.g., Light'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="process">{isArabic ? 'المعالجة' : 'Process'}</Label>
                  <Input
                    id="process"
                    value={form.process}
                    onChange={(e) => setForm(prev => ({ ...prev, process: e.target.value }))}
                    placeholder={isArabic ? 'مثال: طبيعي' : 'e.g., Natural'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="variety">{isArabic ? 'النوع' : 'Variety'}</Label>
                  <Input
                    id="variety"
                    value={form.variety}
                    onChange={(e) => setForm(prev => ({ ...prev, variety: e.target.value }))}
                    placeholder={isArabic ? 'مثال: موكا' : 'e.g., Mokka'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="altitude">{isArabic ? 'الارتفاع' : 'Altitude'}</Label>
                  <Input
                    id="altitude"
                    value={form.altitude}
                    onChange={(e) => setForm(prev => ({ ...prev, altitude: e.target.value }))}
                    placeholder={isArabic ? 'مثال: 1,450-1,530 متر' : 'e.g., 1,450-1,530 masl'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">{isArabic ? 'الملاحظات' : 'Notes'}</Label>
                  <Textarea
                    id="notes"
                    value={form.notes}
                    onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder={isArabic ? 'مثال: جريب فروت، خوخ، كاكاو' : 'e.g., Grapefruit, Plum, Cacao'}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="farm">{isArabic ? 'المزرعة' : 'Farm'}</Label>
                  <Input
                    id="farm"
                    value={form.farm}
                    onChange={(e) => setForm(prev => ({ ...prev, farm: e.target.value }))}
                    placeholder={isArabic ? 'مثال: هاواي' : 'e.g., Hawaii'}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'معاينة المعلومات' : 'Information Preview'}</CardTitle>
              <CardDescription>
                {isArabic ? 'كيف ستظهر معلومات القهوة للعملاء' : 'How the coffee information will appear to customers'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Coffee className="h-4 w-4 text-amber-600" />
                  <h3 className="font-medium text-sm">
                    {isArabic ? 'معلومات القهوة' : 'Coffee Information'}
                  </h3>
                </div>
                <div className="space-y-2">
                  {[
                    { label: isArabic ? 'درجة التحميص' : 'Roast Level', value: form.roast_level },
                    { label: isArabic ? 'المعالجة' : 'Process', value: form.process },
                    { label: isArabic ? 'النوع' : 'Variety', value: form.variety },
                    { label: isArabic ? 'الارتفاع' : 'Altitude', value: form.altitude },
                    { label: isArabic ? 'الملاحظات' : 'Notes', value: form.notes },
                    { label: isArabic ? 'المزرعة' : 'Farm', value: form.farm }
                  ].filter(item => item.value && item.value.trim()).map((item, index) => (
                    <div key={index} className="flex justify-between items-start text-sm">
                      <span className="text-muted-foreground font-medium">
                        {item.label}:
                      </span>
                      <span className="text-right flex-1 ml-2" dir={isArabic ? 'rtl' : 'ltr'}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                  {![form.roast_level, form.process, form.variety, form.altitude, form.notes, form.farm].some(v => v && v.trim()) && (
                    <p className="text-muted-foreground text-sm text-center py-4">
                      {isArabic ? 'لا توجد معلومات قهوة مضافة بعد' : 'No coffee information added yet'}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gallery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'الصورة الرئيسية' : 'Main Image'}</CardTitle>
              <CardDescription>
                {isArabic ? 'ارفع الصورة الرئيسية للمنتج أو أدخل رابط الصورة' : 'Upload the main product image or enter image URL'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="main-image-url">{isArabic ? 'رابط الصورة الرئيسية' : 'Main Image URL'}</Label>
                <Input
                  id="main-image-url"
                  type="url"
                  value={form.image || ''}
                  onChange={(e) => setForm(prev => ({ ...prev, image: e.target.value }))}
                  onBlur={(e) => {
                    const url = e.target.value.trim()
                    if (url && !validateImageUrl(url)) {
                      toast.error(isArabic ? 'رابط الصورة غير صالح' : 'Invalid image URL')
                    }
                  }}
                  placeholder={isArabic ? 'أدخل رابط الصورة الرئيسية' : 'Enter main image URL'}
                />
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    {isArabic ? 'أو' : 'Or'}
                  </span>
                </div>
              </div>

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
                {mainImageUploadProgress > 0 && (
                  <Progress value={mainImageUploadProgress} className="w-full" />
                )}
              </div>

              {form.image && (
                <div className="space-y-2">
                  <Label>{isArabic ? 'الصورة الرئيسية الحالية' : 'Current Main Image'}</Label>
                  <div className="relative inline-block">
                    <div className="w-32 h-32 aspect-square overflow-hidden rounded-lg border">
                      <img
                        src={form.image}
                        alt="Main product image"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/images/placeholder-product.png'
                        }}
                      />
                    </div>
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
                {isArabic ? 'أضف صور إضافية للمنتج عبر الرفع أو الروابط' : 'Add additional product images via upload or URLs'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gallery-url">{isArabic ? 'إضافة صورة بالرابط' : 'Add Image by URL'}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="gallery-url"
                    type="url"
                    placeholder={isArabic ? 'أدخل رابط الصورة' : 'Enter image URL'}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement
                        const url = input.value.trim()
                        if (url) {
                          addImageByUrl(url, true)
                          input.value = ''
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const input = document.getElementById('gallery-url') as HTMLInputElement
                      const url = input.value.trim()
                      if (url) {
                        addImageByUrl(url, true)
                        input.value = ''
                      }
                    }}
                  >
                    {isArabic ? 'إضافة' : 'Add'}
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    {isArabic ? 'أو' : 'Or'}
                  </span>
                </div>
              </div>

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
                {galleryUploadProgress > 0 && (
                  <Progress value={galleryUploadProgress} className="w-full" />
                )}
              </div>

              {form.gallery && form.gallery.length > 0 && (
                <div className="space-y-2">
                  <Label>{isArabic ? 'صور المعرض الحالية' : 'Current Gallery Images'}</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {form.gallery.map((image, index) => (
                      <div key={index} className="relative">
                        <div className="aspect-square overflow-hidden rounded-lg border">
                          <img
                            src={image}
                            alt={`Gallery image ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = '/images/placeholder-product.png'
                            }}
                          />
                        </div>
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
