import { useState } from 'react'
import { Star, ThumbsUp, MessageSquare, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

// Temporary type definition
interface ProductReview {
  id: string
  product_id: string
  user_id: string
  user_name: string
  rating: number
  title?: string
  comment?: string
  verified_purchase: boolean
  created: Date
  updated?: Date
}

interface ProductReviewsProps {
  productId: string
  reviews: ProductReview[]
  averageRating: number
  onReviewAdded: (productId: string) => void
}

export function ProductReviews({ productId, reviews, averageRating, onReviewAdded }: ProductReviewsProps) {
  const { i18n } = useTranslation()
  const auth = useAuth() as any
  const currentUser = auth?.currentUser
  const [showAddReview, setShowAddReview] = useState(false)
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    review_text: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [helpfulClicks, setHelpfulClicks] = useState<Set<string>>(new Set())

  const isArabic = i18n.language === 'ar'

  const handleSubmitReview = async () => {
    if (!currentUser) {
      toast.error(isArabic ? 'يرجى تسجيل الدخول أولاً' : 'Please log in first')
      return
    }

    if (!newReview.title.trim() || !newReview.review_text.trim()) {
      toast.error(isArabic ? 'يرجى ملء جميع الحقول' : 'Please fill all fields')
      return
    }

    setIsSubmitting(true)
    try {
      // Check if user has already reviewed this product (placeholder)
      console.log('Checking if user has reviewed product:', productId, currentUser?.id)
      const hasReviewed = false // TODO: Implement with Google Sheets
      
      if (hasReviewed) {
        toast.error(isArabic ? 'لقد قمت بتقييم هذا المنتج من قبل' : 'You have already reviewed this product')
        setIsSubmitting(false)
        return
      }

      // Create review (placeholder)
      console.log('Creating review:', {
        product_id: productId,
        user_id: currentUser?.id,
        rating: newReview.rating,
        title: newReview.title,
        review_text: newReview.review_text,
        is_verified_purchase: false,
        is_approved: false,
        helpful_count: 0,
        user: currentUser
      })

      toast.success(isArabic ? 'تم إرسال التقييم بنجاح! سيتم مراجعته قريباً' : 'Review submitted successfully! It will be reviewed shortly')
      
      setNewReview({
        rating: 5,
        title: '',
        review_text: ''
      })
      setShowAddReview(false)
      
      // Refresh reviews
      onReviewAdded(productId)
    } catch (error) {
      console.error('Error submitting review:', error)
      toast.error(isArabic ? 'حدث خطأ أثناء إرسال التقييم' : 'Error submitting review')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleHelpfulClick = async (reviewId: string) => {
    if (!currentUser) {
      toast.error(isArabic ? 'يرجى تسجيل الدخول أولاً' : 'Please log in first')
      return
    }

    if (helpfulClicks.has(reviewId)) {
      toast.error(isArabic ? 'لقد قمت بالتصويت لهذا التقييم من قبل' : 'You have already voted for this review')
      return
    }

    try {
      // Increment helpful count (placeholder)
      console.log('Incrementing helpful count for review:', reviewId)
      setHelpfulClicks(prev => new Set([...prev, reviewId]))
      toast.success(isArabic ? 'شكراً لك على التصويت!' : 'Thank you for your vote!')
      
      // Refresh reviews to show updated count
      onReviewAdded(productId)
    } catch (error) {
      console.error('Error voting for review:', error)
      toast.error(isArabic ? 'حدث خطأ أثناء التصويت' : 'Error voting for review')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return isArabic
      ? date.toLocaleDateString('ar-SA')
      : date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        })
  }

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
    const count = reviews.filter(r => r.rating === rating).length
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
    return { rating, count, percentage }
  })

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{averageRating.toFixed(1)}</div>
                <div className="flex items-center gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(averageRating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  {reviews.length} {isArabic ? 'تقييم' : 'reviews'}
                </div>
              </div>

              <div className="space-y-2 flex-1 max-w-sm">
                {ratingDistribution.map(({ rating, count, percentage }) => (
                  <div key={rating} className="flex items-center gap-2 text-sm">
                    <span className="w-3">{rating}</span>
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <div className="flex-1 h-2 bg-gray-200 rounded">
                      <div
                        className={`h-2 bg-yellow-400 rounded w-[${percentage}%]`}
                      />
                    </div>
                    <span className="w-8 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <Dialog open={showAddReview} onOpenChange={setShowAddReview}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <MessageSquare className="w-4 h-4" />
                  {isArabic ? 'إضافة تقييم' : 'Write Review'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {isArabic ? 'إضافة تقييم جديد' : 'Write a Review'}
                  </DialogTitle>
                  <DialogDescription>
                    {isArabic 
                      ? 'شاركنا رأيك في هذا المنتج لمساعدة الآخرين'
                      : 'Share your experience with this product to help others'
                    }
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {isArabic ? 'التقييم' : 'Rating'}
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                          className="focus:outline-none"
                          title={`Rate ${star} stars`}
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= newReview.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {isArabic ? 'عنوان التقييم' : 'Review Title'}
                    </label>
                    <Input
                      value={newReview.title}
                      onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                      placeholder={isArabic ? 'مثال: منتج ممتاز' : 'e.g., Great product!'}
                      dir={isArabic ? 'rtl' : 'ltr'}
                    />
                  </div>

                  {/* Review Text */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {isArabic ? 'التقييم' : 'Your Review'}
                    </label>
                    <Textarea
                      value={newReview.review_text}
                      onChange={(e) => setNewReview(prev => ({ ...prev, review_text: e.target.value }))}
                      placeholder={isArabic 
                        ? 'اكتب تجربتك مع هذا المنتج...'
                        : 'Describe your experience with this product...'
                      }
                      rows={4}
                      dir={isArabic ? 'rtl' : 'ltr'}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddReview(false)}>
                    {isArabic ? 'إلغاء' : 'Cancel'}
                  </Button>
                  <Button onClick={handleSubmitReview} disabled={isSubmitting}>
                    {isSubmitting 
                      ? (isArabic ? 'جاري الإرسال...' : 'Submitting...')
                      : (isArabic ? 'إرسال التقييم' : 'Submit Review')
                    }
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {isArabic ? 'لا توجد تقييمات بعد' : 'No reviews yet'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {isArabic 
                  ? 'كن أول من يقيم هذا المنتج'
                  : 'Be the first to review this product'
                }
              </p>
              <Button variant="outline" onClick={() => setShowAddReview(true)}>
                {isArabic ? 'اكتب أول تقييم' : 'Write First Review'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{review.user_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(review.created.toISOString())}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {review.verified_purchase && (
                      <Badge variant="secondary" className="text-xs">
                        {isArabic ? 'مشترى معتمد' : 'Verified Purchase'}
                      </Badge>
                    )}
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {review.title && (
                  <h4 className="font-medium mb-2" dir={isArabic ? 'rtl' : 'ltr'}>
                    {review.title}
                  </h4>
                )}

                {review.comment && (
                  <p className="text-muted-foreground mb-4" dir={isArabic ? 'rtl' : 'ltr'}>
                    {review.comment}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleHelpfulClick(review.id)}
                    className="gap-2"
                    disabled={helpfulClicks.has(review.id)}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    {isArabic ? 'مفيد' : 'Helpful'} 
                    {/* Note: helpful count would be from Google Sheets */}
                    {/* ({review.helpful_count || 0}) */}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
