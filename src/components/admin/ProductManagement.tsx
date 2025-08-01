import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, Filter, Eye, Package2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from 'react-i18next'
import { useCurrency } from '@/hooks/useCurrency'
import { firestoreService, type Product, type Category } from '@/lib/firebase'
import ProductForm from './ProductForm'
import toast from 'react-hot-toast'

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
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [filters, setFilters] = useState<ProductFilters>({
    category_id: 'all',
    status: 'all',
    search: ''
  })

  useEffect(() => {
    const loadDataAsync = async () => {
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
        toast.error(isArabic ? 'خطأ في تحميل البيانات' : 'Error loading data')
      } finally {
        setLoading(false)
      }
    }
    
    loadDataAsync()
  }, [isArabic])

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
      toast.error(isArabic ? 'خطأ في تحميل البيانات' : 'Error loading data')
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

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setShowForm(true)
  }

  const handleAdd = () => {
    setEditingProduct(null)
    setShowForm(true)
  }

  const handleFormSave = async () => {
    setShowForm(false)
    setEditingProduct(null)
    await loadData()
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingProduct(null)
  }

  const handleDelete = async () => {
    if (!productToDelete) return

    try {
      setDeleting(true)
      await firestoreService.products.delete(productToDelete.id)
      await loadData()
      setDeleteDialogOpen(false)
      setProductToDelete(null)
      toast.success(isArabic ? 'تم حذف المنتج بنجاح' : 'Product deleted successfully')
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error(isArabic ? 'خطأ في حذف المنتج' : 'Error deleting product')
    } finally {
      setDeleting(false)
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

  // If showing form, render the ProductForm component
  if (showForm) {
    return (
      <ProductForm
        editingProduct={editingProduct}
        onSave={handleFormSave}
        onCancel={handleFormCancel}
      />
    )
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
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          {isArabic ? 'إضافة منتج جديد' : 'Add New Product'}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
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
            <div className="space-y-2">
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
            <div className="space-y-2">
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
                onClick={() => setFilters({ category_id: 'all', status: 'all', search: '' })}
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
            <Button onClick={handleAdd}>
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
                      {product.is_on_sale && product.sale_price_omr && product.sale_price_omr < product.price_omr ? (
                        <>
                          <p className="font-semibold text-lg text-red-600">
                            {formatPrice(product.sale_price_omr)}
                          </p>
                          <p className="text-xs text-muted-foreground line-through">
                            {formatPrice(product.price_omr)}
                          </p>
                        </>
                      ) : (
                        <p className="font-semibold text-lg">
                          {formatPrice(product.price_omr)}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {isArabic ? 'المخزون:' : 'Stock:'} {product.stock_quantity || product.stock || 0}
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
                    onClick={() => handleEdit(product)}
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
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting 
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
                  <span className="font-semibold">{isArabic ? 'المخزون:' : 'Stock:'}</span> {viewingProduct.stock_quantity || viewingProduct.stock || 0}
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