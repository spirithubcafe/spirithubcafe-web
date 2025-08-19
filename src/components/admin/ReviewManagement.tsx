import { useState, useEffect } from 'react'
import { Star, Check, X, Eye, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useTranslation } from 'react-i18next'
import { firestoreService, type ProductReview, type Product } from '@/lib/firebase'
import toast from 'react-hot-toast'

export default function ReviewManagement() {
  const { i18n } = useTranslation()
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReview, setSelectedReview] = useState<ProductReview | null>(null)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const isArabic = i18n.language === 'ar'

  const loadReviews = async () => {
    try {
      setLoading(true)
      // Load real reviews from Firebase
      const result = await firestoreService.reviews.list()
      setReviews(result.items)
    } catch (error) {
      console.error('Error loading reviews:', error)
      toast.error(isArabic ? 'خطأ في تحميل المراجعات' : 'Error loading reviews')
      // Fallback to empty array
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReviews()
    loadProducts()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadProducts = async () => {
    try {
      const result = await firestoreService.products.list()
      setProducts(result.items)
    } catch (error) {
      console.error('Error loading products:', error)
    }
  }

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId)
    if (!product) return productId
    return isArabic ? (product.name_ar || product.name) : product.name
  }

  const handleApproveReview = async (reviewId: string) => {
    try {
      // Update the review in Firebase
      await firestoreService.reviews.update(reviewId, { is_approved: true })
      
      // Update the review in state
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? { ...review, is_approved: true }
          : review
      ))
      
      toast.success(isArabic ? 'تم تأكيد المراجعة' : 'Review approved')
    } catch (error) {
      console.error('Error approving review:', error)
      toast.error(isArabic ? 'خطأ في تأكيد المراجعة' : 'Error approving review')
    }
  }

  const handleRejectReview = async (reviewId: string) => {
    try {
      // Update the review in Firebase
      await firestoreService.reviews.update(reviewId, { is_approved: false })
      
      // Update the review in state
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? { ...review, is_approved: false }
          : review
      ))
      
      toast.success(isArabic ? 'تم رفض المراجعة' : 'Review rejected')
    } catch (error) {
      console.error('Error rejecting review:', error)
      toast.error(isArabic ? 'خطأ في رفض المراجعة' : 'Error rejecting review')
    }
  }

  const handleDeleteReview = async () => {
    if (!selectedReview) return
    
    try {
      // Delete the review from Firebase
      await firestoreService.reviews.delete(selectedReview.id)
      
      // Remove the review from state
      setReviews(prev => prev.filter(review => review.id !== selectedReview.id))
      setShowDeleteDialog(false)
      setSelectedReview(null)
      
      toast.success(isArabic ? 'تم حذف المراجعة' : 'Review deleted')
    } catch (error) {
      console.error('Error deleting review:', error)
      toast.error(isArabic ? 'خطأ في حذف المراجعة' : 'Error deleting review')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat(isArabic ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  const pendingReviews = reviews.filter(r => !r.is_approved)
  const approvedReviews = reviews.filter(r => r.is_approved)

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
        <p className="mt-2 text-muted-foreground">
          {isArabic ? 'جاري تحميل المراجعات...' : 'Loading reviews...'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          {isArabic ? 'إدارة المراجعات' : 'Review Management'}
        </h1>
        <p className="text-muted-foreground">
          {isArabic ? 'تأكيد أو رفض مراجعات العملاء' : 'Approve or reject customer reviews'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'في انتظار التأكيد' : 'Pending Approval'}
            </CardTitle>
            <X className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingReviews.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'مؤكدة' : 'Approved'}
            </CardTitle>
            <Check className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedReviews.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'إجمالي المراجعات' : 'Total Reviews'}
            </CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviews.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews Table */}
      <Card>
        <CardHeader>
          <CardTitle>{isArabic ? 'جميع المراجعات' : 'All Reviews'}</CardTitle>
          <CardDescription>
            {isArabic ? 'إدارة وتأكيد مراجعات العملاء' : 'Manage and approve customer reviews'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {isArabic ? 'لا توجد مراجعات' : 'No reviews found'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isArabic ? 'المنتج' : 'Product'}</TableHead>
                  <TableHead>{isArabic ? 'العميل' : 'Customer'}</TableHead>
                  <TableHead>{isArabic ? 'التقييم' : 'Rating'}</TableHead>
                  <TableHead>{isArabic ? 'العنوان' : 'Title'}</TableHead>
                  <TableHead>{isArabic ? 'الحالة' : 'Status'}</TableHead>
                  <TableHead>{isArabic ? 'التاريخ' : 'Date'}</TableHead>
                  <TableHead>{isArabic ? 'العمليات' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell className="font-medium">
                      {getProductName(review.product_id)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{review.user?.full_name || 'Unknown User'}</p>
                        {review.is_verified_purchase && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            {isArabic ? 'مشتري مؤكد' : 'Verified Purchase'}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="line-clamp-2">{review.title}</p>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={review.is_approved ? "default" : "secondary"}
                        className={review.is_approved ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}
                      >
                        {review.is_approved 
                          ? (isArabic ? 'مؤكد' : 'Approved')
                          : (isArabic ? 'في الانتظار' : 'Pending')
                        }
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDate(review.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedReview(review)
                            setShowViewDialog(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {!review.is_approved && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleApproveReview(review.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {review.is_approved && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRejectReview(review.id)}
                            className="text-orange-600 hover:text-orange-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedReview(review)
                            setShowDeleteDialog(true)
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Review Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl w-[95vw]">
          <DialogHeader>
            <DialogTitle>
              {isArabic ? 'تفاصيل المراجعة' : 'Review Details'}
            </DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">
                  {isArabic ? 'المنتج:' : 'Product:'}
                </h4>
                <p>{getProductName(selectedReview.product_id)}</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">
                  {isArabic ? 'العميل:' : 'Customer:'}
                </h4>
                <p>{selectedReview.user?.full_name || 'Unknown User'} ({selectedReview.user?.email || 'No email'})</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">
                  {isArabic ? 'التقييم:' : 'Rating:'}
                </h4>
                <div className="flex items-center gap-1">
                  {renderStars(selectedReview.rating)}
                  <span className="ml-2">({selectedReview.rating}/5)</span>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">
                  {isArabic ? 'العنوان:' : 'Title:'}
                </h4>
                <p>{selectedReview.title}</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">
                  {isArabic ? 'نص المراجعة:' : 'Review Text:'}
                </h4>
                <p className="text-muted-foreground">{selectedReview.review_text}</p>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>
                  {isArabic ? 'تاريخ الإنشاء:' : 'Created:'} {formatDate(selectedReview.created_at)}
                </span>
                {selectedReview.is_verified_purchase && (
                  <Badge variant="secondary">
                    {isArabic ? 'مشتري مؤكد' : 'Verified Purchase'}
                  </Badge>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              {isArabic ? 'إغلاق' : 'Close'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Review Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-lg w-[95vw]">
          <DialogHeader>
            <DialogTitle>
              {isArabic ? 'حذف المراجعة' : 'Delete Review'}
            </DialogTitle>
            <DialogDescription>
              {isArabic 
                ? 'هل أنت متأكد من أنك تريد حذف هذه المراجعة؟ لا يمكن التراجع عن هذا الإجراء.'
                : 'Are you sure you want to delete this review? This action cannot be undone.'
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="destructive" onClick={handleDeleteReview}>
              {isArabic ? 'حذف' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
