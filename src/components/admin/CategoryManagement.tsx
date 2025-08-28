import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X, Upload, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTranslation } from 'react-i18next'
import { firestoreService, storageService, auth, type Category } from '@/lib/firebase'
import SEOForm from '@/components/seo/SEOForm'
import type { SEOMeta } from '@/types/seo'
import toast from 'react-hot-toast'

interface CategoryFormData {
  name: string
  name_ar: string
  description: string
  description_ar: string
  image: string
  is_active: boolean
  sort_order: number
  seo?: SEOMeta
}

// Helper function to convert Firebase Category to SEOMeta format
const categoryToSEOMeta = (category: Category): SEOMeta => {
  return {
    title: category.meta_title || '',
    titleAr: category.meta_title_ar || '',
    description: category.meta_description || '',
    descriptionAr: category.meta_description_ar || '',
    keywords: category.meta_keywords || '',
    keywordsAr: category.meta_keywords_ar || '',
    canonicalUrl: category.canonical_url || '',
    ogTitle: category.og_title || '',
    ogTitleAr: category.og_title_ar || '',
    ogDescription: category.og_description || '',
    ogDescriptionAr: category.og_description_ar || '',
    ogImage: category.og_image || '',
    twitterTitle: category.twitter_title || '',
    twitterTitleAr: category.twitter_title_ar || '',
    twitterDescription: category.twitter_description || '',
    twitterDescriptionAr: category.twitter_description_ar || '',
    twitterImage: category.twitter_image || ''
  }
}

// Helper function to convert SEOMeta to Firebase Category fields
const seoMetaToCategory = (seo: SEOMeta): Partial<Category> => {
  return {
    meta_title: seo.title,
    meta_title_ar: seo.titleAr,
    meta_description: seo.description,
    meta_description_ar: seo.descriptionAr,
    meta_keywords: seo.keywords,
    meta_keywords_ar: seo.keywordsAr,
    canonical_url: seo.canonicalUrl,
    og_title: seo.ogTitle,
    og_title_ar: seo.ogTitleAr,
    og_description: seo.ogDescription,
    og_description_ar: seo.ogDescriptionAr,
    og_image: seo.ogImage,
    twitter_title: seo.twitterTitle,
    twitter_title_ar: seo.twitterTitleAr,
    twitter_description: seo.twitterDescription,
    twitter_description_ar: seo.twitterDescriptionAr,
    twitter_image: seo.twitterImage
  }
}

export default function CategoryManagement() {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [activeTab, setActiveTab] = useState('basic')

  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    name_ar: '',
    description: '',
    description_ar: '',
    image: '',
    is_active: true,
    sort_order: 1,
    seo: {}
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const result = await firestoreService.categories.list()
      setCategories(result.items)
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (file: File) => {
    if (!file) return

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

    setUploadProgress(0)
    
    try {
      // Check authentication first
      const currentUser = auth.currentUser
      if (!currentUser) {
        toast.error(isArabic ? 'يجب تسجيل الدخول أولاً' : 'Please login first')
        return
      }

      // Show progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
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
        const filePath = `categories/${fileName}`
        
        // Try Firebase Storage upload
        console.log('Attempting Firebase Storage upload...')
        url = await storageService.upload(filePath, file)
        console.log('Firebase Storage upload successful:', url)
        
      } catch (storageError) {
        console.warn('Firebase Storage failed, using fallback:', storageError)
        clearInterval(progressInterval)
        setUploadProgress(50)
        
        // Use fallback method (base64)
        console.log('Using fallback upload method...')
        url = await storageService.uploadAsDataURL(file)
        
        toast.success(isArabic ? 'تم استخدام طريقة بديلة للرفع' : 'Used fallback upload method')
      }
      
      clearInterval(progressInterval)
      setUploadProgress(100)

      // Update form data
      setFormData(prev => ({ ...prev, image: url }))

      setTimeout(() => setUploadProgress(0), 1000)
      toast.success(isArabic ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully')
      
    } catch (error) {
      console.error('Upload error:', error)
      setUploadProgress(0)
      
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

  const openDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      const convertedSEO = categoryToSEOMeta(category)
      console.log('Category SEO Data Loading:', {
        original: category,
        converted: convertedSEO
      })
      setFormData({
        name: category.name,
        name_ar: category.name_ar || '',
        description: category.description || '',
        description_ar: category.description_ar || '',
        image: category.image || '',
        is_active: category.is_active,
        sort_order: category.sort_order,
        seo: convertedSEO
      })
    } else {
      setEditingCategory(null)
      setFormData({
        name: '',
        name_ar: '',
        description: '',
        description_ar: '',
        image: '',
        is_active: true,
        sort_order: categories.length + 1,
        seo: {}
      })
    }
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setEditingCategory(null)
    setFormData({
      name: '',
      name_ar: '',
      description: '',
      description_ar: '',
      image: '',
      is_active: true,
      sort_order: 1
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert(isArabic ? 'يرجى إدخال اسم الفئة' : 'Please enter category name')
      return
    }

    try {
      setFormLoading(true)

      // Prepare data with SEO conversion
      const categoryData = {
        name: formData.name,
        name_ar: formData.name_ar,
        description: formData.description,
        description_ar: formData.description_ar,
        image: formData.image,
        is_active: formData.is_active,
        sort_order: formData.sort_order,
        ...(formData.seo ? seoMetaToCategory(formData.seo) : {})
      }

      if (editingCategory) {
        await firestoreService.categories.update(editingCategory.id, categoryData)
      } else {
        await firestoreService.categories.create(categoryData)
      }

      await loadCategories()
      closeDialog()
    } catch (error) {
      console.error('Error saving category:', error)
      alert(isArabic ? 'حدث خطأ أثناء الحفظ' : 'Error saving category')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!categoryToDelete) return

    try {
      setFormLoading(true)
      await firestoreService.categories.delete(categoryToDelete.id)
      await loadCategories()
      setDeleteDialogOpen(false)
      setCategoryToDelete(null)
    } catch (error) {
      console.error('Error deleting category:', error)
      alert(isArabic ? 'حدث خطأ أثناء الحذف' : 'Error deleting category')
    } finally {
      setFormLoading(false)
    }
  }

  const openDeleteDialog = (category: Category) => {
    setCategoryToDelete(category)
    setDeleteDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">
            {isArabic ? 'إدارة الفئات' : 'Category Management'}
          </h2>
          <p className="text-muted-foreground">
            {isArabic ? 'إدارة فئات المنتجات' : 'Manage product categories'}
          </p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          {isArabic ? 'إضافة فئة جديدة' : 'Add New Category'}
        </Button>
      </div>

      {/* Categories List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse py-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  {/* Image skeleton */}
                  <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0"></div>
                  
                  <div className="flex-1 space-y-2">
                    {/* Status badge skeleton */}
                    <div className="h-5 bg-muted rounded-full w-16"></div>
                    
                    {/* Title skeleton */}
                    <div className="h-6 bg-muted rounded w-1/3"></div>
                    
                    {/* Description skeleton */}
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </div>
                  
                  {/* Actions skeleton */}
                  <div className="flex gap-2">
                    <div className="h-9 bg-muted rounded w-20"></div>
                    <div className="h-9 bg-muted rounded w-9"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <Card className="py-0">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium mb-2">
              {isArabic ? 'لا توجد فئات بعد' : 'No categories yet'}
            </p>
            <p className="text-muted-foreground mb-4">
              {isArabic ? 'ابدأ بإضافة فئة لتنظيم منتجاتك' : 'Start by adding a category to organize your products'}
            </p>
            <Button onClick={() => openDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              {isArabic ? 'إضافة أول فئة' : 'Add First Category'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {/* Categories Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground w-16">
                {isArabic ? 'صورة' : 'Image'}
              </span>
              <span className="text-sm font-medium text-muted-foreground flex-1">
                {isArabic ? 'الفئة' : 'Category'}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground w-20">
                {isArabic ? 'الحالة' : 'Status'}
              </span>
              <span className="text-sm font-medium text-muted-foreground w-16">
                {isArabic ? 'ترتيب' : 'Order'}
              </span>
              <span className="text-sm font-medium text-muted-foreground w-24">
                {isArabic ? 'إجراءات' : 'Actions'}
              </span>
            </div>
          </div>

          {/* Categories List */}
          {categories
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((category) => (
            <Card key={category.id} className="py-0 hover:shadow-md transition-all duration-200 border-l-4 border-l-transparent hover:border-l-primary">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Category Image */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900 dark:to-amber-800">
                    {category.image ? (
                      <img 
                        src={category.image} 
                        alt={category.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/images/placeholder-category.png'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Upload className="h-6 w-6 text-amber-600 dark:text-amber-400 opacity-50" />
                      </div>
                    )}
                  </div>

                  {/* Category Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg truncate">
                          {isArabic ? (category.name_ar || category.name) : category.name}
                        </h3>
                        {(isArabic ? category.name : category.name_ar) && (
                          <p className="text-sm text-muted-foreground truncate">
                            {isArabic ? category.name : category.name_ar}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {(category.description || category.description_ar) && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {isArabic ? (category.description_ar || category.description) : category.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>ID: {category.id.slice(0, 8)}</span>
                      <span>
                        {isArabic ? 'تم الإنشاء:' : 'Created:'} {
                          (() => {
                            if (!category.created) return isArabic ? 'غير متوفر' : 'N/A';
                            
                            try {
                              // Handle Firestore Timestamp
                              if (category.created && typeof category.created === 'object' && 'seconds' in category.created) {
                                return new Date((category.created as any).seconds * 1000).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US');
                              }
                              // Handle JavaScript Date
                              if (category.created instanceof Date) {
                                return category.created.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US');
                              }
                              // Handle string date
                              return new Date(category.created as string).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US');
                            } catch {
                              return isArabic ? 'غير متوفر' : 'N/A';
                            }
                          })()
                        }
                      </span>
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="flex items-center gap-4">
                    {/* Status */}
                    <div className="w-20">
                      <Badge 
                        variant={category.is_active ? 'default' : 'secondary'}
                        className="w-full justify-center"
                      >
                        {category.is_active 
                          ? (isArabic ? 'نشط' : 'Active')
                          : (isArabic ? 'غير نشط' : 'Inactive')
                        }
                      </Badge>
                    </div>

                    {/* Sort Order */}
                    <div className="w-16 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-medium">
                        {category.sort_order}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 w-24">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openDialog(category)}
                        className="h-8 w-8 p-0"
                        title={isArabic ? 'تعديل' : 'Edit'}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => openDeleteDialog(category)}
                        className="h-8 w-8 p-0"
                        title={isArabic ? 'حذف' : 'Delete'}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Categories Summary */}
          <Card className="py-0 bg-muted/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {isArabic ? 'إجمالي الفئات:' : 'Total Categories:'} {categories.length}
                </span>
                <span>
                  {isArabic ? 'الفئات النشطة:' : 'Active Categories:'} {categories.filter(c => c.is_active).length}
                </span>
                <span>
                  {isArabic ? 'الفئات غير النشطة:' : 'Inactive Categories:'} {categories.filter(c => !c.is_active).length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCategory 
                ? (isArabic ? 'تعديل الفئة' : 'Edit Category')
                : (isArabic ? 'إضافة فئة جديدة' : 'Add New Category')
              }
            </DialogTitle>
            <DialogDescription>
              {isArabic 
                ? 'املأ المعلومات أدناه لإنشاء أو تعديل الفئة'
                : 'Fill in the information below to create or edit the category'
              }
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic" className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  {isArabic ? 'المعلومات الأساسية' : 'Basic Info'}
                </TabsTrigger>
                <TabsTrigger value="seo" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  {isArabic ? 'تحسين محركات البحث' : 'SEO'}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="mb-2 block">{isArabic ? 'الاسم (إنجليزي)' : 'Name (English)'}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={isArabic ? 'اسم الفئة بالإنجليزية' : 'Category name in English'}
                  required
                />
              </div>
              <div>
                <Label htmlFor="name_ar" className="mb-2 block">{isArabic ? 'الاسم (عربي)' : 'Name (Arabic)'}</Label>
                <Input
                  id="name_ar"
                  value={formData.name_ar}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                  placeholder={isArabic ? 'اسم الفئة بالعربية' : 'Category name in Arabic'}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="description" className="mb-2 block">{isArabic ? 'الوصف (إنجليزي)' : 'Description (English)'}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={isArabic ? 'وصف الفئة بالإنجليزية' : 'Category description in English'}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="description_ar" className="mb-2 block">{isArabic ? 'الوصف (عربي)' : 'Description (Arabic)'}</Label>
                <Textarea
                  id="description_ar"
                  value={formData.description_ar}
                  onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                  placeholder={isArabic ? 'وصف الفئة بالعربية' : 'Category description in Arabic'}
                  rows={3}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <Label htmlFor="image" className="mb-2 block">{isArabic ? 'صورة الفئة' : 'Category Image'}</Label>
                
                {/* URL Input */}
                <div className="space-y-2">
                  <Label htmlFor="image-url" className="text-sm">{isArabic ? 'رابط الصورة' : 'Image URL'}</Label>
                  <Input
                    id="image-url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder={isArabic ? 'أدخل رابط صورة الفئة' : 'Enter category image URL'}
                  />
                </div>

                {/* Divider */}
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

                {/* File Upload */}
                <div className="space-y-2">
                  <Label htmlFor="image-file" className="text-sm">{isArabic ? 'رفع صورة' : 'Upload Image'}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="image-file"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(file)
                      }}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('image-file')?.click()}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isArabic ? 'اختر صورة' : 'Choose Image'}
                    </Button>
                  </div>
                  
                  {uploadProgress > 0 && (
                    <Progress value={uploadProgress} className="w-full" />
                  )}
                </div>

                {/* Image Preview */}
                {formData.image && (
                  <div className="space-y-2">
                    <Label className="text-sm">{isArabic ? 'معاينة الصورة' : 'Image Preview'}</Label>
                    <div className="relative inline-block">
                      <div className="w-24 h-24 aspect-square overflow-hidden rounded-lg border">
                        <img
                          src={formData.image}
                          alt="Category preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = '/images/placeholder-category.png'
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                        title={isArabic ? 'حذف الصورة' : 'Remove image'}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <Label htmlFor="sort_order" className="mb-2 block">{isArabic ? 'ترتيب العرض' : 'Sort Order'}</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 1 })}
                  min="1"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded"
                placeholder={isArabic ? 'حدد إذا كانت الفئة نشطة' : 'Check if category is active'}
                title={isArabic ? 'فئة نشطة' : 'Active Category'}
              />
              <Label htmlFor="is_active">{isArabic ? 'فئة نشطة' : 'Active Category'}</Label>
            </div>
              </TabsContent>

              <TabsContent value="seo" className="space-y-4">
                <SEOForm
                  initialData={formData.seo || {}}
                  onChange={(seoData) => setFormData(prev => ({ ...prev, seo: seoData }))}
                  entityType="category"
                />
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                <X className="h-4 w-4 mr-2" />
                {isArabic ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button type="submit" disabled={formLoading}>
                <Save className="h-4 w-4 mr-2" />
                {formLoading 
                  ? (isArabic ? 'جاري الحفظ...' : 'Saving...')
                  : (isArabic ? 'حفظ' : 'Save')
                }
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-lg w-[95vw]">
          <DialogHeader>
            <DialogTitle>{isArabic ? 'تأكيد الحذف' : 'Confirm Delete'}</DialogTitle>
            <DialogDescription>
              {isArabic 
                ? `هل أنت متأكد من حذف الفئة "${categoryToDelete?.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`
                : `Are you sure you want to delete the category "${categoryToDelete?.name}"? This action cannot be undone.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={formLoading}>
              {formLoading 
                ? (isArabic ? 'جاري الحذف...' : 'Deleting...')
                : (isArabic ? 'حذف' : 'Delete')
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
