import { useState, useEffect } from 'react'
import { Star, Check, X, Eye, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useTranslation } from 'react-i18next'
import { jsonDataService, type Product } from '@/services/jsonDataService'

interface ProductReview {
  id: string
  product_id: string
  user_id: string
  user_name: string
  user_email: string
  rating: number
  review_text: string
  is_approved: boolean
  is_featured: boolean
  created_at: string
  updated_at: string
}

export default function ReviewManagement() {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReview, setSelectedReview] = useState<ProductReview | null>(null)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [reviewsData, productsData] = await Promise.all([
        jsonDataService.fetchJSON<ProductReview[]>('reviews.json'),
        jsonDataService.getProducts()
      ])
      setReviews(reviewsData || [])
      setProducts(productsData || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (reviewId: string) => {
    try {
      const updatedReviews = reviews.map(review => 
        review.id === reviewId 
          ? { ...review, is_approved: true, updated_at: new Date().toISOString() }
          : review
      )
      
      await jsonDataService.saveJSON('reviews.json', updatedReviews)
      setReviews(updatedReviews)
      console.log(isArabic ? 'تم تأكيد المراجعة' : 'Review approved')
    } catch (error) {
      console.error('Error approving review:', error)
    }
  }

  const handleReject = async (reviewId: string) => {
    try {
      const updatedReviews = reviews.map(review => 
        review.id === reviewId 
          ? { ...review, is_approved: false, updated_at: new Date().toISOString() }
          : review
      )
      
      await jsonDataService.saveJSON('reviews.json', updatedReviews)
      setReviews(updatedReviews)
      console.log(isArabic ? 'تم رفض المراجعة' : 'Review rejected')
    } catch (error) {
      console.error('Error rejecting review:', error)
    }
  }

  const handleDelete = async () => {
    if (!selectedReview) return
    
    try {
      const updatedReviews = reviews.filter(review => review.id !== selectedReview.id)
      await jsonDataService.saveJSON('reviews.json', updatedReviews)
      setReviews(updatedReviews)
      setShowDeleteDialog(false)
      setSelectedReview(null)
      console.log(isArabic ? 'تم حذف المراجعة' : 'Review deleted')
    } catch (error) {
      console.error('Error deleting review:', error)
    }
  }

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId)
    return product ? (isArabic ? product.name_ar || product.name : product.name) : 'Unknown Product'
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>{isArabic ? 'جارٍ التحميل...' : 'Loading...'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">
            {isArabic ? 'إدارة المراجعات' : 'Review Management'}
          </h2>
          <p className="text-muted-foreground">
            {isArabic ? 'مراجعة وإدارة تقييمات العملاء' : 'Review and manage customer reviews'}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'إجمالي المراجعات' : 'Total Reviews'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviews.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'مراجعات معتمدة' : 'Approved Reviews'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {reviews.filter(r => r.is_approved).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'في انتظار المراجعة' : 'Pending Reviews'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {reviews.filter(r => !r.is_approved).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isArabic ? 'كل المراجعات' : 'All Reviews'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isArabic ? 'المنتج' : 'Product'}</TableHead>
                <TableHead>{isArabic ? 'العميل' : 'Customer'}</TableHead>
                <TableHead>{isArabic ? 'التقييم' : 'Rating'}</TableHead>
                <TableHead>{isArabic ? 'المراجعة' : 'Review'}</TableHead>
                <TableHead>{isArabic ? 'الحالة' : 'Status'}</TableHead>
                <TableHead>{isArabic ? 'التاريخ' : 'Date'}</TableHead>
                <TableHead>{isArabic ? 'الإجراءات' : 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{getProductName(review.product_id)}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{review.user_name || 'Unknown User'}</p>
                      <p className="text-sm text-muted-foreground">{review.user_email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {renderStars(review.rating)}
                      <span className="text-sm text-muted-foreground ml-2">
                        {review.rating}/5
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="line-clamp-2 max-w-xs">{review.review_text}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={review.is_approved ? "default" : "secondary"}>
                      {review.is_approved 
                        ? (isArabic ? 'معتمد' : 'Approved')
                        : (isArabic ? 'في الانتظار' : 'Pending')
                      }
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(review.created_at).toLocaleDateString(isArabic ? 'ar-AE' : 'en-US')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
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
                          variant="outline"
                          size="sm"
                          onClick={() => handleApprove(review.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {review.is_approved && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReject(review.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedReview(review)
                          setShowDeleteDialog(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {reviews.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {isArabic ? 'لا توجد مراجعات' : 'No reviews found'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Review Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isArabic ? 'تفاصيل المراجعة' : 'Review Details'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedReview && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">
                  {isArabic ? 'المنتج' : 'Product'}
                </h4>
                <p>{getProductName(selectedReview.product_id)}</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">
                  {isArabic ? 'العميل' : 'Customer'}
                </h4>
                <p>{selectedReview.user_name || 'Unknown User'} ({selectedReview.user_email || 'No email'})</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">
                  {isArabic ? 'التقييم' : 'Rating'}
                </h4>
                <div className="flex items-center space-x-1">
                  {renderStars(selectedReview.rating)}
                  <span className="ml-2">{selectedReview.rating}/5</span>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">
                  {isArabic ? 'المراجعة' : 'Review'}
                </h4>
                <p className="whitespace-pre-wrap">{selectedReview.review_text}</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">
                  {isArabic ? 'الحالة' : 'Status'}
                </h4>
                <Badge variant={selectedReview.is_approved ? "default" : "secondary"}>
                  {selectedReview.is_approved 
                    ? (isArabic ? 'معتمد' : 'Approved')
                    : (isArabic ? 'في الانتظار' : 'Pending')
                  }
                </Badge>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">
                  {isArabic ? 'تاريخ الإنشاء' : 'Created Date'}
                </h4>
                <p>{new Date(selectedReview.created_at).toLocaleDateString(isArabic ? 'ar-AE' : 'en-US')}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Review Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isArabic ? 'حذف المراجعة' : 'Delete Review'}
            </DialogTitle>
            <DialogDescription>
              {isArabic 
                ? 'هل أنت متأكد من حذف هذه المراجعة؟ لا يمكن التراجع عن هذا الإجراء.'
                : 'Are you sure you want to delete this review? This action cannot be undone.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {isArabic ? 'حذف' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
