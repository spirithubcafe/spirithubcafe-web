import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X, Search, Filter, Eye, Package2, Star, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTranslation } from 'react-i18next'
import { useCurrency } from '@/components/currency-provider'
import { firestoreService, type Product, type Category } from '@/lib/firebase'

interface ProductFormData {
  name: string
  name_ar: string
  description: string
  description_ar: string
  category_id: string
  price_omr: number  // قیمت اصلی به ریال عمان
  sale_price_omr: number
  image: string
  gallery: string[]
  is_active: boolean
  is_featured: boolean
  is_bestseller: boolean
  is_new_arrival: boolean
  is_on_sale: boolean
  stock_quantity: number
  sku: string
  weight: number
  sort_order: number
  meta_title: string
  meta_description: string
}

interface ProductFilters {
  category_id: string
  status: string
  search: string
}

export default function ProductManagement() {
  const { i18n } = useTranslation()
  const { formatPrice } = useCurrency()
  const isArabic = i18n.language === 'ar'

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null)

  const [filters, setFilters] = useState<ProductFilters>({
    category_id: 'all',
    status: 'all',
    search: ''
  })

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    name_ar: '',
    description: '',
    description_ar: '',
    category_id: '',
    price_omr: 0,  // قیمت اصلی به ریال عمان
    sale_price_omr: 0,
    image: '',
    gallery: [],
    is_active: true,
    is_featured: false,
    is_bestseller: false,
    is_new_arrival: false,
    is_on_sale: false,
    stock_quantity: 0,
    sku: '',
    weight: 0,
    sort_order: 1,
    meta_title: '',
    meta_description: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [productsResult, categoriesResult] = await Promise.all([
        firestoreService.products.list(),
        firestoreService.categories.list()
      ])
      setProducts(productsResult.items)
      setCategories(categoriesResult.items)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(product => {
    let matches = true

    if (filters.category_id && filters.category_id !== 'all' && product.category_id !== filters.category_id) {
      matches = false
    }

    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'active' && !product.is_active) matches = false
      if (filters.status === 'inactive' && product.is_active) matches = false
      if (filters.status === 'featured' && !product.is_featured) matches = false
      if (filters.status === 'bestseller' && !product.is_bestseller) matches = false
      if (filters.status === 'new_arrival' && !product.is_new_arrival) matches = false
      if (filters.status === 'on_sale' && !product.is_on_sale) matches = false
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      const nameMatch = product.name.toLowerCase().includes(searchTerm)
      const nameArMatch = product.name_ar?.toLowerCase().includes(searchTerm)
      const skuMatch = product.sku?.toLowerCase().includes(searchTerm)
      if (!nameMatch && !nameArMatch && !skuMatch) matches = false
    }

    return matches
  })

  const openDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        name: product.name,
        name_ar: product.name_ar || '',
        description: product.description || '',
        description_ar: product.description_ar || '',
        category_id: product.category_id,
        price_omr: product.price_omr || 0, // از OMR به OMR - بدون تبدیل
        sale_price_omr: product.sale_price_omr || 0,
        image: product.image || '',
        gallery: product.gallery || [],
        is_active: product.is_active,
        is_featured: product.is_featured,
        is_bestseller: product.is_bestseller,
        is_new_arrival: product.is_new_arrival,
        is_on_sale: product.is_on_sale,
        stock_quantity: product.stock_quantity,
        sku: product.sku || '',
        weight: product.weight || 0,
        sort_order: product.sort_order,
        meta_title: product.meta_title || '',
        meta_description: product.meta_description || ''
      })
    } else {
      setEditingProduct(null)
      setFormData({
        name: '',
        name_ar: '',
        description: '',
        description_ar: '',
        category_id: '',
        price_omr: 0,  // قیمت اصلی به ریال عمان
        sale_price_omr: 0,
        image: '',
        gallery: [],
        is_active: true,
        is_featured: false,
        is_bestseller: false,
        is_new_arrival: false,
        is_on_sale: false,
        stock_quantity: 0,
        sku: '',
        weight: 0,
        sort_order: products.length + 1,
        meta_title: '',
        meta_description: ''
      })
    }
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setEditingProduct(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.category_id) {
      alert(isArabic ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields')
      return
    }

    try {
      setFormLoading(true)

      if (editingProduct) {
        await firestoreService.products.update(editingProduct.id, formData)
      } else {
        await firestoreService.products.create({
          ...formData,
          stock: formData.stock_quantity // Map stock_quantity to stock
        })
      }

      await loadData()
      closeDialog()
    } catch (error) {
      console.error('Error saving product:', error)
      alert(isArabic ? 'حدث خطأ أثناء الحفظ' : 'Error saving product')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!productToDelete) return

    try {
      setFormLoading(true)
      await firestoreService.products.delete(productToDelete.id)
      await loadData()
      setDeleteDialogOpen(false)
      setProductToDelete(null)
    } catch (error) {
      console.error('Error deleting product:', error)
      alert(isArabic ? 'حدث خطأ أثناء الحذف' : 'Error deleting product')
    } finally {
      setFormLoading(false)
    }
  }

  const openDeleteDialog = (product: Product) => {
    setProductToDelete(product)
    setDeleteDialogOpen(true)
  }

  const openViewDialog = (product: Product) => {
    setViewingProduct(product)
    setViewDialogOpen(true)
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    if (!category) return isArabic ? 'غير محدد' : 'Unspecified'
    return isArabic ? (category.name_ar || category.name) : category.name
  }

  const getProductBadges = (product: Product) => {
    const badges = []
    if (product.is_featured) badges.push({ text: isArabic ? 'مميز' : 'Featured', color: 'bg-blue-500' })
    if (product.is_bestseller) badges.push({ text: isArabic ? 'الأكثر مبيعاً' : 'Bestseller', color: 'bg-green-500' })
    if (product.is_new_arrival) badges.push({ text: isArabic ? 'وصل حديثاً' : 'New', color: 'bg-purple-500' })
    if (product.is_on_sale) badges.push({ text: isArabic ? 'تخفيض' : 'Sale', color: 'bg-red-500' })
    return badges
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">
            {isArabic ? 'إدارة المنتجات' : 'Product Management'}
          </h2>
          <p className="text-muted-foreground">
            {isArabic ? 'إدارة وتنظيم المنتجات' : 'Manage and organize products'}
          </p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          {isArabic ? 'إضافة منتج جديد' : 'Add New Product'}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>{isArabic ? 'البحث' : 'Search'}</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={isArabic ? 'ابحث عن منتج...' : 'Search products...'}
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>{isArabic ? 'الفئة' : 'Category'}</Label>
              <Select value={filters.category_id} onValueChange={(value) => setFilters({ ...filters, category_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder={isArabic ? 'جميع الفئات' : 'All Categories'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isArabic ? 'جميع الفئات' : 'All Categories'}</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {isArabic ? (category.name_ar || category.name) : category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{isArabic ? 'الحالة' : 'Status'}</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder={isArabic ? 'جميع الحالات' : 'All Status'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isArabic ? 'جميع الحالات' : 'All Status'}</SelectItem>
                  <SelectItem value="active">{isArabic ? 'نشط' : 'Active'}</SelectItem>
                  <SelectItem value="inactive">{isArabic ? 'غير نشط' : 'Inactive'}</SelectItem>
                  <SelectItem value="featured">{isArabic ? 'مميز' : 'Featured'}</SelectItem>
                  <SelectItem value="bestseller">{isArabic ? 'الأكثر مبيعاً' : 'Bestseller'}</SelectItem>
                  <SelectItem value="new_arrival">{isArabic ? 'وصل حديثاً' : 'New Arrival'}</SelectItem>
                  <SelectItem value="on_sale">{isArabic ? 'تخفيض' : 'On Sale'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => setFilters({ category_id: '', status: '', search: '' })}
                className="w-full"
              >
                <Filter className="h-4 w-4 mr-2" />
                {isArabic ? 'مسح الفلاتر' : 'Clear Filters'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                {/* Image skeleton */}
                <div className="aspect-square bg-muted rounded-lg mb-4"></div>
                
                {/* Badges skeleton */}
                <div className="flex gap-2 mb-3">
                  <div className="h-5 bg-muted rounded-full w-12"></div>
                  <div className="h-5 bg-muted rounded-full w-16"></div>
                </div>
                
                {/* Title skeleton */}
                <div className="h-5 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded w-3/4 mb-3"></div>
                
                {/* Price skeleton */}
                <div className="h-6 bg-muted rounded w-20 mb-4"></div>
                
                {/* Buttons skeleton */}
                <div className="flex gap-2">
                  <div className="h-9 bg-muted rounded flex-1"></div>
                  <div className="h-9 bg-muted rounded w-9"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              {isArabic ? 'لا توجد منتجات' : 'No products found'}
            </p>
            <Button onClick={() => openDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              {isArabic ? 'إضافة أول منتج' : 'Add First Product'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                {/* Product Image */}
                <div className="relative h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg mb-4 overflow-hidden">
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <Package2 className="h-8 w-8" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    <Badge variant={product.is_active ? 'default' : 'secondary'} className="text-xs">
                      {product.is_active ? (isArabic ? 'نشط' : 'Active') : (isArabic ? 'غير نشط' : 'Inactive')}
                    </Badge>
                  </div>
                </div>

                {/* Product Info */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm line-clamp-1">
                    {isArabic ? (product.name_ar || product.name) : product.name}
                  </h3>
                  
                  <p className="text-xs text-muted-foreground">
                    {getCategoryName(product.category_id)}
                  </p>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-lg">
                        {formatPrice(product.price_omr)}
                      </p>
                      {product.is_on_sale && product.sale_price_omr && product.sale_price_omr < product.price_omr && (
                        <p className="text-xs text-muted-foreground line-through">
                          {formatPrice(product.sale_price_omr)}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {isArabic ? 'المخزون:' : 'Stock:'} {product.stock_quantity}
                      </p>
                      {product.sku && (
                        <p className="text-xs text-muted-foreground">
                          {product.sku}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Product Badges */}
                  <div className="flex flex-wrap gap-1">
                    {getProductBadges(product).map((badge, index) => (
                      <span
                        key={index}
                        className={`text-xs px-2 py-0.5 rounded text-white ${badge.color}`}
                      >
                        {badge.text}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => openViewDialog(product)}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => openDialog(product)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => openDeleteDialog(product)}
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct 
                ? (isArabic ? 'تعديل المنتج' : 'Edit Product')
                : (isArabic ? 'إضافة منتج جديد' : 'Add New Product')
              }
            </DialogTitle>
            <DialogDescription>
              {isArabic 
                ? 'املأ المعلومات أدناه لإنشاء أو تعديل المنتج'
                : 'Fill in the information below to create or edit the product'
              }
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">{isArabic ? 'أساسي' : 'Basic'}</TabsTrigger>
                <TabsTrigger value="pricing">{isArabic ? 'الأسعار' : 'Pricing'}</TabsTrigger>
                <TabsTrigger value="media">{isArabic ? 'الصور' : 'Media'}</TabsTrigger>
                <TabsTrigger value="settings">{isArabic ? 'إعدادات' : 'Settings'}</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{isArabic ? 'اسم المنتج (إنجليزي) *' : 'Product Name (English) *'}</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name_ar">{isArabic ? 'اسم المنتج (عربي)' : 'Product Name (Arabic)'}</Label>
                    <Input
                      id="name_ar"
                      value={formData.name_ar}
                      onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category_id">{isArabic ? 'الفئة *' : 'Category *'}</Label>
                  <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder={isArabic ? 'اختر الفئة' : 'Select Category'} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {isArabic ? (category.name_ar || category.name) : category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="description">{isArabic ? 'الوصف (إنجليزي)' : 'Description (English)'}</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description_ar">{isArabic ? 'الوصف (عربي)' : 'Description (Arabic)'}</Label>
                    <Textarea
                      id="description_ar"
                      value={formData.description_ar}
                      onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                      rows={4}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="pricing" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price_omr">{isArabic ? 'السعر (ريال عماني) *' : 'Price (OMR) *'}</Label>
                    <Input
                      id="price_omr"
                      type="number"
                      step="0.001"
                      min="0"
                      value={formData.price_omr}
                      onChange={(e) => setFormData({ ...formData, price_omr: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="sale_price_omr">{isArabic ? 'سعر التخفيض (ريال عماني)' : 'Sale Price (OMR)'}</Label>
                    <Input
                      id="sale_price_omr"
                      type="number"
                      step="0.001"
                      min="0"
                      value={formData.sale_price_omr}
                      onChange={(e) => setFormData({ ...formData, sale_price_omr: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="stock_quantity">{isArabic ? 'كمية المخزون *' : 'Stock Quantity *'}</Label>
                    <Input
                      id="stock_quantity"
                      type="number"
                      min="0"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="sku">{isArabic ? 'رمز المنتج' : 'SKU'}</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight">{isArabic ? 'الوزن (كيلو)' : 'Weight (kg)'}</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="media" className="space-y-4">
                <div>
                  <Label htmlFor="image">{isArabic ? 'الصورة الرئيسية' : 'Main Image'}</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder={isArabic ? 'رابط الصورة الرئيسية' : 'Main image URL'}
                  />
                </div>

                <div>
                  <Label>{isArabic ? 'معرض الصور' : 'Gallery Images'}</Label>
                  <div className="space-y-2">
                    {formData.gallery.map((url, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={url}
                          onChange={(e) => {
                            const newGallery = [...formData.gallery]
                            newGallery[index] = e.target.value
                            setFormData({ ...formData, gallery: newGallery })
                          }}
                          placeholder={isArabic ? 'رابط الصورة' : 'Image URL'}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newGallery = formData.gallery.filter((_, i) => i !== index)
                            setFormData({ ...formData, gallery: newGallery })
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setFormData({ ...formData, gallery: [...formData.gallery, ''] })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {isArabic ? 'إضافة صورة' : 'Add Image'}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sort_order">{isArabic ? 'ترتيب العرض' : 'Sort Order'}</Label>
                    <Input
                      id="sort_order"
                      type="number"
                      min="1"
                      value={formData.sort_order}
                      onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { key: 'is_active', label: isArabic ? 'منتج نشط' : 'Active Product', icon: Package2 },
                    { key: 'is_featured', label: isArabic ? 'منتج مميز' : 'Featured Product', icon: Star },
                    { key: 'is_bestseller', label: isArabic ? 'الأكثر مبيعاً' : 'Bestseller', icon: TrendingUp },
                    { key: 'is_new_arrival', label: isArabic ? 'وصل حديثاً' : 'New Arrival', icon: Plus },
                    { key: 'is_on_sale', label: isArabic ? 'في التخفيضات' : 'On Sale', icon: Package2 },
                  ].map((field) => (
                    <div key={field.key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={field.key}
                        checked={formData[field.key as keyof ProductFormData] as boolean}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.checked })}
                        className="rounded"
                        placeholder={field.label}
                        title={field.label}
                      />
                      <Label htmlFor={field.key} className="flex items-center gap-2">
                        <field.icon className="h-4 w-4" />
                        {field.label}
                      </Label>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="meta_title">{isArabic ? 'عنوان SEO' : 'SEO Title'}</Label>
                    <Input
                      id="meta_title"
                      value={formData.meta_title}
                      onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="meta_description">{isArabic ? 'وصف SEO' : 'SEO Description'}</Label>
                    <Textarea
                      id="meta_description"
                      value={formData.meta_description}
                      onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                      rows={2}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
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
                ? `هل أنت متأكد من حذف المنتج "${productToDelete?.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`
                : `Are you sure you want to delete the product "${productToDelete?.name}"? This action cannot be undone.`
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

      {/* View Product Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isArabic ? 'تفاصيل المنتج' : 'Product Details'}
            </DialogTitle>
          </DialogHeader>
          {viewingProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <img 
                    src={viewingProduct.image || '/placeholder.jpg'} 
                    alt={viewingProduct.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">
                    {isArabic ? (viewingProduct.name_ar || viewingProduct.name) : viewingProduct.name}
                  </h3>
                  <p className="text-muted-foreground">
                    {getCategoryName(viewingProduct.category_id)}
                  </p>
                  <p className="text-2xl font-bold">
                    {formatPrice(viewingProduct.price_omr)}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {getProductBadges(viewingProduct).map((badge, index) => (
                      <span
                        key={index}
                        className={`text-xs px-2 py-0.5 rounded text-white ${badge.color}`}
                      >
                        {badge.text}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              {viewingProduct.description && (
                <div>
                  <h4 className="font-semibold mb-2">{isArabic ? 'الوصف' : 'Description'}</h4>
                  <p className="text-muted-foreground">
                    {isArabic ? (viewingProduct.description_ar || viewingProduct.description) : viewingProduct.description}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold">{isArabic ? 'المخزون:' : 'Stock:'}</span> {viewingProduct.stock_quantity}
                </div>
                {viewingProduct.sku && (
                  <div>
                    <span className="font-semibold">{isArabic ? 'رمز المنتج:' : 'SKU:'}</span> {viewingProduct.sku}
                  </div>
                )}
                {viewingProduct.weight && (
                  <div>
                    <span className="font-semibold">{isArabic ? 'الوزن:' : 'Weight:'}</span> {viewingProduct.weight} kg
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
