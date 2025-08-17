import { Link } from 'react-router-dom'
import { ArrowRight, Star, Clock, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { HeroSlider } from '@/components/ui/hero-slider'
import { useTranslation } from 'react-i18next'
import { useEffect, useState, useRef } from 'react'
import { useScrollToTopOnRouteChange } from '@/hooks/useSmoothScrollToTop'
import { firestoreService, type Product, type Category } from '@/lib/firebase'
import { useCurrency } from '@/hooks/useCurrency'
import { useCart } from '@/hooks/useCart'
import { useCategoriesSettings } from '@/hooks/useCategoriesSettings'
import { conversionRates } from '@/lib/currency'

export function HomePage() {
  const { t } = useTranslation()
  const [latestProducts, setLatestProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const { formatPrice, currency } = useCurrency()
  const { addToCart } = useCart()
  const { settings: categoriesSettings, refetch: refetchCategoriesSettings } = useCategoriesSettings()
  const categoriesScrollRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  
  // Parallax effect for categories background video
  useEffect(() => {
    const handleScroll = () => {
      if (!videoRef.current) return
      
      const scrolled = window.pageYOffset
      const rate = scrolled * -0.3 // Reduced parallax speed to prevent gaps
      
      // Apply parallax transform with larger scale to prevent gaps
      videoRef.current.style.transform = `translate3d(0, ${rate}px, 0) scale(1.2)`
    }

    // Add throttling for better performance
    let ticking = false
    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', requestTick, { passive: true })
    return () => window.removeEventListener('scroll', requestTick)
  }, [])

  // Ensure video loops continuously
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleVideoEnd = () => {
      video.currentTime = 0
      video.play()
    }

    const handleVideoError = () => {
      console.error('Video playback error, attempting to restart')
      setTimeout(() => {
        video.currentTime = 0
        video.play()
      }, 1000)
    }

    video.addEventListener('ended', handleVideoEnd)
    video.addEventListener('error', handleVideoError)
    
    // Ensure video starts playing
    video.play().catch(console.error)

    return () => {
      video.removeEventListener('ended', handleVideoEnd)
      video.removeEventListener('error', handleVideoError)
    }
  }, [categoriesSettings?.backgroundVideo])

  // Update video source when settings change
  useEffect(() => {
    const video = videoRef.current
    if (!video || !categoriesSettings?.backgroundVideo) return

    // Force video to reload with new source
    video.pause()
    video.src = categoriesSettings.backgroundVideo
    video.load()
    
    // Wait a bit then play
    setTimeout(() => {
      video.play().catch(console.error)
    }, 100)

    console.log('Video source updated to:', categoriesSettings.backgroundVideo)
  }, [categoriesSettings?.backgroundVideo])

  // Listen for categories settings updates
  useEffect(() => {
    const handleSettingsUpdate = () => {
      console.log('Categories settings updated, refreshing...')
      refetchCategoriesSettings()
    }

    window.addEventListener('categoriesSettingsUpdated', handleSettingsUpdate)
    return () => {
      window.removeEventListener('categoriesSettingsUpdated', handleSettingsUpdate)
    }
  }, [refetchCategoriesSettings])
  
  // Touch/drag state for categories
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [dragDistance, setDragDistance] = useState(0)

  // Helper function to get product price in current currency
  const getProductPrice = (product: Product): number => {
    return (product.price_omr || 0) * conversionRates[currency]
  }

  // Helper function to get sale price in current currency  
  const getSalePrice = (product: Product): number | null => {
    if (!product.sale_price_omr || product.sale_price_omr >= (product.price_omr || 0)) return null
    return product.sale_price_omr * conversionRates[currency]
  }

  // Smooth scroll to top when page loads
  useScrollToTopOnRouteChange()

  // Load latest products (last 3 products)
  useEffect(() => {
    const loadLatestProducts = async () => {
      try {
        const products = await firestoreService.products.list()
        
        // Get the latest 4 products
        const latest = products.items
          .sort((a: Product, b: Product) => new Date(b.created).getTime() - new Date(a.created).getTime())
          .slice(0, 4)
        
        setLatestProducts(latest)
      } catch (error) {
        console.error('Error loading latest products:', error)
      } finally {
        setLoadingProducts(false)
      }
    }

    loadLatestProducts()
  }, [])

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const result = await firestoreService.categories.list()
        setCategories(result.items.filter(cat => cat.is_active))
      } catch (error) {
        console.error('Error loading categories:', error)
      } finally {
        setLoadingCategories(false)
      }
    }

    loadCategories()
  }, [])

  // Scroll categories horizontally
  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoriesScrollRef.current) {
      const scrollAmount = 200
      const newScrollLeft = categoriesScrollRef.current.scrollLeft + 
        (direction === 'right' ? scrollAmount : -scrollAmount)
      
      categoriesScrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      })
    }
  }

  // Touch/drag handlers for categories
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!categoriesScrollRef.current) return
    setIsDragging(true)
    setStartX(e.touches[0].pageX - categoriesScrollRef.current.offsetLeft)
    setScrollLeft(categoriesScrollRef.current.scrollLeft)
    setDragDistance(0)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !categoriesScrollRef.current) return
    e.preventDefault()
    const x = e.touches[0].pageX - categoriesScrollRef.current.offsetLeft
    const walk = (x - startX) * 2 // Scroll speed multiplier
    setDragDistance(Math.abs(walk))
    categoriesScrollRef.current.scrollLeft = scrollLeft - walk
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  // Mouse drag handlers (for desktop)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!categoriesScrollRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - categoriesScrollRef.current.offsetLeft)
    setScrollLeft(categoriesScrollRef.current.scrollLeft)
    setDragDistance(0)
    categoriesScrollRef.current.style.cursor = 'grabbing'
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !categoriesScrollRef.current) return
    e.preventDefault()
    const x = e.pageX - categoriesScrollRef.current.offsetLeft
    const walk = (x - startX) * 2
    setDragDistance(Math.abs(walk))
    categoriesScrollRef.current.scrollLeft = scrollLeft - walk
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    if (categoriesScrollRef.current) {
      categoriesScrollRef.current.style.cursor = 'grab'
    }
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
    if (categoriesScrollRef.current) {
      categoriesScrollRef.current.style.cursor = 'grab'
    }
  }

  // Handle category click - prevent navigation if dragging
  const handleCategoryClick = (e: React.MouseEvent) => {
    if (dragDistance > 10) { // If dragged more than 10px, prevent navigation
      e.preventDefault()
      e.stopPropagation()
      return false
    }
    // Allow normal navigation
    return true
  }

  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* Hero Section with Slides */}
      <HeroSlider />

      {/* Latest Release Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-background via-muted/10 to-accent/5 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-shadow-coffee">
                {t('homepage.latestRelease.title', 'Latest Release')}
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {t('homepage.latestRelease.subtitle', 'Discover our newest coffee arrivals')}
              </p>
            </div>
            
            {loadingProducts ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="card-clean py-0">
                    <CardContent className="p-4">
                      <div className="animate-pulse space-y-3">
                        <div className="bg-muted h-40 rounded-lg"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-4 bg-muted rounded w-1/2"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : latestProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {latestProducts.map((product) => {
                  const productPrice = getProductPrice(product)
                  const salePrice = getSalePrice(product)
                  const discountPercent = salePrice ? Math.round(((productPrice - salePrice) / productPrice) * 100) : 0
                  const isArabic = localStorage.getItem('i18nextLng') === 'ar'

                  return (
                    <Card key={product.id} className="card-clean group hover:glow-coffee hover:-translate-y-2 transition-all duration-300 border-0 shadow-lg backdrop-blur-sm overflow-hidden py-0">
                      <div className="relative">
                        <Link to={`/product/${product.slug || product.id}`}>
                          <div className="aspect-square overflow-hidden">
                            <img
                              src={
                                product.images?.[0] || 
                                product.gallery?.[0] || 
                                product.gallery_images?.[0] || 
                                product.image_url || 
                                product.image || 
                                '/images/logo.png'
                              }
                              alt={product.name || ''}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.src = '/images/logo.png'
                              }}
                            />
                          </div>
                        </Link>
                        
                        {/* Discount Badge */}
                        {discountPercent > 0 && (
                          <Badge className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg text-xs">
                            {discountPercent}% {isArabic ? 'خصم' : 'OFF'}
                          </Badge>
                        )}
                        
                        {/* Rating */}
                        {product.average_rating && product.average_rating > 0 && (
                          <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-white text-xs font-medium">
                              {product.average_rating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <CardContent className="p-4 flex-1 flex flex-col">
                        <Link to={`/product/${product.slug || product.id}`}>
                          <h3 className="font-semibold text-base mb-2 hover:text-primary transition-colors line-clamp-2">
                            {isArabic ? (product.name_ar || product.name) : product.name}
                          </h3>
                        </Link>
                        
                        <div className="text-muted-foreground text-sm mb-3 line-clamp-2 flex-1">
                          {(isArabic ? product.uses_ar : product.uses) ? (
                            <span>{isArabic ? (product.uses_ar || product.uses) : product.uses}</span>
                          ) : (
                            <span className="italic opacity-70">
                              {isArabic ? 'لا توجد استخدامات' : 'No uses available'}
                            </span>
                          )}
                        </div>
                        
                        <div className="mt-auto">
                          <div className="flex items-center gap-2">
                            {salePrice && salePrice < productPrice ? (
                              <>
                                <span className="text-base font-bold text-red-600">
                                  {formatPrice(salePrice)}
                                </span>
                                <span className="text-sm text-muted-foreground line-through">
                                  {formatPrice(productPrice)}
                                </span>
                              </>
                            ) : (
                              <span className="text-base font-bold text-primary">
                                {formatPrice(productPrice)}
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                      
                      <div className="p-4 pt-0">
                        <Button 
                          size="sm" 
                          className="btn-coffee w-full text-sm"
                          onClick={() => addToCart(product, 1)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          {t('common.addToCart', 'Add to Cart')}
                        </Button>
                      </div>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  {t('homepage.latestRelease.noProducts', 'No new products available at the moment')}
                </p>
              </div>
            )}
            
            <div className="text-center mt-12">
              <Button asChild size="lg" className="btn-coffee">
                <Link to="/shop">
                  {t('homepage.latestRelease.viewShop', 'View Shop')}
                  <ArrowRight className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0 rtl:rotate-180" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Our Coffees Section - Placeholder */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-accent/5 via-background to-muted/10 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-shadow-coffee">
                {t('homepage.ourCoffees.title', 'Our Coffees')}
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {t('homepage.ourCoffees.subtitle', 'Coming Soon')}
              </p>
            </div>
            
            <div className="text-center py-20 bg-muted/20 rounded-lg border-2 border-dashed border-muted">
              <div className="space-y-4">
                <Clock className="h-16 w-16 text-muted-foreground mx-auto" />
                <h3 className="text-xl font-semibold text-muted-foreground">
                  {t('homepage.ourCoffees.comingSoon', 'Coming Soon')}
                </h3>
                <p className="text-muted-foreground">
                  {t('homepage.ourCoffees.description', 'We are preparing something special for you. Stay tuned!')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SpiritHub Categories Section */}
      <section className="py-16 lg:py-24 relative overflow-hidden">
        {/* Background Video */}
        {(categoriesSettings?.showBackgroundVideo !== false) && (
          <div className="absolute inset-0 w-full h-full overflow-hidden">
            <video
              key={categoriesSettings?.backgroundVideo || 'default-video'}
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              disablePictureInPicture
              src={categoriesSettings?.backgroundVideo || '/video/back.mp4'}
              className={`absolute -top-[15%] -left-[15%] min-w-[130%] min-h-[130%] object-cover transition-all duration-300 ${
                (categoriesSettings?.backgroundVideoBlur || 30) <= 12.5 
                  ? 'blur-none' 
                  : (categoriesSettings?.backgroundVideoBlur || 30) <= 25 
                  ? 'blur-sm' 
                  : (categoriesSettings?.backgroundVideoBlur || 30) <= 50 
                  ? 'blur' 
                  : (categoriesSettings?.backgroundVideoBlur || 30) <= 75 
                  ? 'blur-lg' 
                  : 'blur-xl'
              }`}
            >
              Your browser does not support the video tag.
            </video>
            {/* Overlay */}
            <div 
              className={`absolute inset-0 bg-black transition-opacity duration-300 ${
                (categoriesSettings?.overlayOpacity || 70) <= 10 
                  ? 'opacity-10'
                  : (categoriesSettings?.overlayOpacity || 70) <= 20
                  ? 'opacity-20'
                  : (categoriesSettings?.overlayOpacity || 70) <= 30
                  ? 'opacity-30'
                  : (categoriesSettings?.overlayOpacity || 70) <= 40
                  ? 'opacity-40'
                  : (categoriesSettings?.overlayOpacity || 70) <= 50
                  ? 'opacity-50'
                  : (categoriesSettings?.overlayOpacity || 70) <= 60
                  ? 'opacity-60'
                  : (categoriesSettings?.overlayOpacity || 70) <= 70
                  ? 'opacity-70'
                  : (categoriesSettings?.overlayOpacity || 70) <= 80
                  ? 'opacity-80'
                  : (categoriesSettings?.overlayOpacity || 70) <= 90
                  ? 'opacity-90'
                  : 'opacity-70'
              }`}
            />
            {/* Theme-aware gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-background/80"></div>
          </div>
        )}
        
        {/* Content */}
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground drop-shadow-lg">
                {t('homepage.categories.title', 'SpiritHub Categories')}
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {t('homepage.categories.subtitle', 'Explore our coffee categories')}
              </p>
            </div>
            
            {loadingCategories ? (
              <div className="flex gap-6 overflow-hidden">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex-shrink-0">
                    <div className="animate-pulse space-y-4 text-center">
                      <div className="w-20 h-20 md:w-24 md:h-24 bg-muted rounded-full mx-auto"></div>
                      <div className="h-4 bg-muted rounded w-16 mx-auto"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : categories.length > 0 ? (
              <div className="relative">
                {/* Scroll buttons */}
                <button
                  onClick={() => scrollCategories('left')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/20 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-background/30 transition-colors border border-border/20"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="h-5 w-5 text-foreground" />
                </button>
                
                <button
                  onClick={() => scrollCategories('right')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/20 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-background/30 transition-colors border border-border/20"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="h-5 w-5 text-foreground" />
                </button>

                {/* Categories scroll container */}
                <div
                  ref={categoriesScrollRef}
                  className="flex gap-8 overflow-x-auto scrollbar-hide scroll-smooth px-8 categories-scroll cursor-grab active:cursor-grabbing select-none"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseLeave}
                >
                  {categories.map((category: Category) => {
                    const isArabic = localStorage.getItem('i18nextLng') === 'ar'
                    return (
                      <Link
                        key={category.id}
                        to={`/shop?category=${category.id}`}
                        className="flex-shrink-0 group"
                        onClick={handleCategoryClick}
                      >
                        <div className="text-center space-y-3 min-w-[100px]">
                          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-primary/20 group-hover:border-primary/40 transition-colors shadow-lg mx-auto">
                            <img
                              src={category.image || '/images/logo.png'}
                              alt={isArabic ? (category.name_ar || category.name) : category.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.src = '/images/logo.png'
                              }}
                            />
                          </div>
                          <p className="text-sm font-medium text-center whitespace-nowrap overflow-hidden text-ellipsis px-2 text-foreground">
                            {isArabic ? (category.name_ar || category.name) : category.name}
                          </p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  {t('homepage.categories.noCategories', 'No categories available at the moment')}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SpiritHub Coffee Capsules Section - Placeholder */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-accent/5 via-background to-muted/10 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-shadow-coffee">
                {t('homepage.coffeeCapsules.title', 'SpiritHub Coffee Capsules')}
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {t('homepage.coffeeCapsules.subtitle', 'Coming Soon')}
              </p>
            </div>
            
            <div className="text-center py-20 bg-muted/20 rounded-lg border-2 border-dashed border-muted">
              <div className="space-y-4">
                <Clock className="h-16 w-16 text-muted-foreground mx-auto" />
                <h3 className="text-xl font-semibold text-muted-foreground">
                  {t('homepage.coffeeCapsules.comingSoon', 'Coming Soon')}
                </h3>
                <p className="text-muted-foreground">
                  {t('homepage.coffeeCapsules.description', 'We are preparing something special for you. Stay tuned!')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cold Brew Selection Section - Placeholder */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-muted/10 via-background to-accent/5 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-shadow-coffee">
                {t('homepage.coldBrew.title', 'Cold Brew Selection')}
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {t('homepage.coldBrew.subtitle', 'Coming Soon')}
              </p>
            </div>
            
            <div className="text-center py-20 bg-muted/20 rounded-lg border-2 border-dashed border-muted">
              <div className="space-y-4">
                <Clock className="h-16 w-16 text-muted-foreground mx-auto" />
                <h3 className="text-xl font-semibold text-muted-foreground">
                  {t('homepage.coldBrew.comingSoon', 'Coming Soon')}
                </h3>
                <p className="text-muted-foreground">
                  {t('homepage.coldBrew.description', 'We are preparing something special for you. Stay tuned!')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
