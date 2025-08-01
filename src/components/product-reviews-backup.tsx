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
import { firestoreService, type ProductReview } from '@/lib/firebase'
import toast from 'react-hot-toast'

interface ProductReviewsProps {
  productId: string
  reviews: ProductReview[]
  averageRating: number
  onReviewAdded: (productId: string) => void
}

export function ProductReviews({ productId, reviews, averageRating, onReviewAdded }: ProductReviewsProps) {
  const { i18n } = useTranslation()
  const { currentUser } = useAuth()
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
      // Check if user has already reviewed this product
      const hasReviewed = await firestoreService.reviews.hasUserReviewed(productId, currentUser.id)
      
      if (hasReviewed) {
        toast.error(isArabic ? 'لقد قمت بتقييم هذا المنتج من قبل' : 'You have already reviewed this product')
        setIsSubmitting(false)
        return
      }

      await firestoreService.reviews.create({
        product_id: productId,
        user_id: currentUser.id,
        rating: newReview.rating,
        title: newReview.title,
        review_text: newReview.review_text,
        is_verified_purchase: false, // You might want to check this based on purchase history
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
      toast.info(isArabic ? 'لقد قمت بالتصويت لهذا التقييم من قبل' : 'You have already voted for this review')
      return
    }

    try {
      await firestoreService.reviews.incrementHelpfulCount(reviewId)
      setHelpfulClicks(prev => new Set([...prev, reviewId]))
      toast.success(isArabic ? 'شكراً لك على التصويت!' : 'Thank you for your vote!')
      
      // Refresh reviews to show updated count
      onReviewAdded(productId)
    } catch (error) {
      console.error('Error voting for review:', error)
      toast.error(isArabic ? 'حدث خطأ أثناء التصويت' : 'Error voting for review')
    }
  }
      
      if (hasReviewed) {
        toast.error(isArabic ? 'لقد قمت بتقييم هذا المنتج من قبل' : 'You have already reviewed this product')
        setIsSubmitting(false)
        return
      }

      // Create the review
      const reviewData = {
        product_id: productId,
        user_id: currentUser.id,
        rating: newReview.rating,
        title: newReview.title.trim(),
        review_text: newReview.review_text.trim(),
        is_verified_purchase: false, // TODO: Check if user has actually purchased the product
        is_approved: false, // Will be approved by admin
        helpful_count: 0,
        user: {
          id: currentUser.id,
          full_name: currentUser.full_name || currentUser.email || 'Anonymous',
          email: currentUser.email || '',
          phone: currentUser.phone || '',
          role: currentUser.role,
          email_verified: currentUser.email_verified,
          created: currentUser.created,
          updated: new Date()
        }
      }

      await firestoreService.reviews.create(reviewData)
      
      toast.success(isArabic ? 'تم إضافة التقييم بنجاح وهو في انتظار الموافقة' : 'Review added successfully and is pending approval')
      setShowAddReview(false)
      setNewReview({ rating: 5, title: '', review_text: '' })
      onReviewAdded(productId)
    } catch (error) {
      console.error('Error submitting review:', error)
      toast.error(isArabic ? 'حدث خطأ أثناء إضافة التقييم' : 'Error submitting review')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Reviews Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-5xl font-bold text-amber-600 mb-2">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex items-center justify-center gap-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-muted-foreground">
                {isArabic ? 'بناءً على' : 'Based on'} {reviews.length} {isArabic ? 'تقييم' : 'reviews'}
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = reviews.filter(r => r.rating === rating).length
                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                
                return (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-sm w-8">{rating}</span>
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <div className="flex-1 bg-muted rounded-full h-2 relative overflow-hidden">
                      <div 
                        className={`bg-yellow-400 h-2 rounded-full transition-all ${
                          percentage === 0 ? 'w-0' : ''
                        }`}
                        {...(percentage > 0 && { style: { width: `${percentage}%` } })}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Add Review Button */}
          <div className="mt-6 pt-6 border-t">
            <Dialog open={showAddReview} onOpenChange={setShowAddReview}>
              <DialogTrigger asChild>
                <Button variant="outline" className="inline-flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  {isArabic ? 'أضف تقييمك' : 'Write a Review'}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {isArabic ? 'أضف تقييمك' : 'Write a Review'}
                  </DialogTitle>
                  <DialogDescription>
                    {isArabic 
                      ? 'شارك تجربتك مع هذا المنتج لمساعدة العملاء الآخرين'
                      : 'Share your experience with this product to help other customers'
                    }
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Rating */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {isArabic ? 'التقييم' : 'Rating'}
                    </label>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setNewReview(prev => ({ ...prev, rating: i + 1 }))}
                          className="focus:outline-none"
                          title={`${i + 1} ${isArabic ? 'نجوم' : 'stars'}`}
                          aria-label={`Rate ${i + 1} ${i === 0 ? 'star' : 'stars'}`}
                        >
                          <Star
                            className={`h-6 w-6 transition-colors ${
                              i < newReview.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {isArabic ? 'عنوان التقييم' : 'Review Title'}
                    </label>
                    <Input
                      value={newReview.title}
                      onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                      placeholder={isArabic ? 'اكتب عنواناً للتقييم' : 'Write a title for your review'}
                    />
                  </div>

                  {/* Review Text */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {isArabic ? 'التقييم' : 'Review'}
                    </label>
                    <Textarea
                      value={newReview.review_text}
                      onChange={(e) => setNewReview(prev => ({ ...prev, review_text: e.target.value }))}
                      placeholder={isArabic ? 'شارك تجربتك مع هذا المنتج...' : 'Share your experience with this product...'}
                      rows={4}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddReview(false)}>
                    {isArabic ? 'إلغاء' : 'Cancel'}
                  </Button>
                  <Button onClick={handleSubmitReview} disabled={isSubmitting}>
                    {isSubmitting 
                      ? (isArabic ? 'جارٍ الحفظ...' : 'Saving...')
                      : (isArabic ? 'نشر التقييم' : 'Submit Review')
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
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {isArabic ? 'لا توجد تقييمات بعد' : 'No Reviews Yet'}
              </h3>
              <p className="text-muted-foreground">
                {isArabic 
                  ? 'كن أول من يقيم هذا المنتج'
                  : 'Be the first to review this product'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* User Avatar */}
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>

                  {/* Review Content */}
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">
                          {review.user?.full_name || (isArabic ? 'مستخدم مجهول' : 'Anonymous User')}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          {review.is_verified_purchase && (
                            <Badge variant="secondary" className="text-xs">
                              {isArabic ? 'مشتري موثق' : 'Verified Purchase'}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(review.created_at)}
                      </span>
                    </div>

                    {/* Review Title */}
                    {review.title && (
                      <h5 className="font-medium">{review.title}</h5>
                    )}

                    {/* Review Text */}
                    {review.review_text && (
                      <p className="text-muted-foreground leading-relaxed">
                        {review.review_text}
                      </p>
                    )}

                    {/* Review Actions */}
                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="sm" className="text-muted-foreground">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        {isArabic ? 'مفيد' : 'Helpful'} ({review.helpful_count})
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
