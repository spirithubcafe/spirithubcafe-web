import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from 'react-i18next'
import { firestoreService, type Category } from '@/lib/firebase'

interface CategoryFormData {
  name: string
  name_ar: string
  description: string
  description_ar: string
  image: string
  is_active: boolean
  sort_order: number
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

  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    name_ar: '',
    description: '',
    description_ar: '',
    image: '',
    is_active: true,
    sort_order: 1
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

  const openDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setFormData({
        name: category.name,
        name_ar: category.name_ar || '',
        description: category.description || '',
        description_ar: category.description_ar || '',
        image: category.image || '',
        is_active: category.is_active,
        sort_order: category.sort_order
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
        sort_order: categories.length + 1
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

      if (editingCategory) {
        await firestoreService.categories.update(editingCategory.id, formData)
      } else {
        await firestoreService.categories.create(formData)
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

      {/* Categories Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                {/* Image skeleton */}
                <div className="aspect-video bg-muted rounded-lg mb-4"></div>
                
                {/* Status badge skeleton */}
                <div className="h-5 bg-muted rounded-full w-16 mb-3"></div>
                
                {/* Title skeleton */}
                <div className="h-6 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded w-2/3 mb-4"></div>
                
                {/* Description skeleton */}
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-4/5"></div>
                </div>
                
                {/* Buttons skeleton */}
                <div className="flex gap-2">
                  <div className="h-9 bg-muted rounded flex-1"></div>
                  <div className="h-9 bg-muted rounded w-9"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {isArabic ? 'لا توجد فئات بعد' : 'No categories yet'}
            </p>
            <Button onClick={() => openDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              {isArabic ? 'إضافة أول فئة' : 'Add First Category'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Card key={category.id} className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                {/* Category Image */}
                <div className="h-32 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900 dark:to-amber-800 rounded-lg mb-4 flex items-center justify-center">
                  {category.image ? (
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-amber-600 dark:text-amber-400 text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm opacity-50">
                        {isArabic ? 'لا توجد صورة' : 'No Image'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Category Info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">
                      {isArabic ? (category.name_ar || category.name) : category.name}
                    </h3>
                    <Badge variant={category.is_active ? 'default' : 'secondary'}>
                      {category.is_active 
                        ? (isArabic ? 'نشط' : 'Active')
                        : (isArabic ? 'غير نشط' : 'Inactive')
                      }
                    </Badge>
                  </div>
                  
                  {category.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {isArabic ? (category.description_ar || category.description) : category.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      {isArabic ? 'ترتيب:' : 'Order:'} {category.sort_order}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => openDialog(category)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    {isArabic ? 'تعديل' : 'Edit'}
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => openDeleteDialog(category)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
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
              <div>
                <Label htmlFor="image" className="mb-2 block">{isArabic ? 'رابط الصورة' : 'Image URL'}</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder={isArabic ? 'رابط صورة الفئة' : 'Category image URL'}
                />
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
        <DialogContent>
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
