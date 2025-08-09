import { Link } from 'react-router-dom'
import { ArrowRight, Star, Clock, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from 'react-i18next'
import { useEffect, useRef, useState } from 'react'
import { useScrollToTopOnRouteChange } from '@/hooks/useSmoothScrollToTop'
import { firestoreService, type Product } from '@/lib/firebase'
import { HTMLContent } from '@/components/ui/html-content'
import { useCurrency } from '@/hooks/useCurrency'
import { useCart } from '@/hooks/useCart'
import { conversionRates } from '@/lib/currency'

export function HomePage() {
  const { t } = useTranslation()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [textVisible, setTextVisible] = useState(false)
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const { formatPrice, currency } = useCurrency()
  const { addToCart } = useCart()

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

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.addEventListener('loadeddata', () => {
        // Start text animation after video loads
        setTimeout(() => setTextVisible(true), 1000)
      })
    }
  }, [])

  // Load featured products (products with discounts or high ratings)
  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        const products = await firestoreService.products.list()
        
        // Filter products that are marked as featured
        let featured = products.items
          .filter((product: Product) => product.is_featured)
          .slice(0, 3) // Show only 3 featured products
        
        // If no featured products, show first 3 products as fallback
        if (featured.length === 0) {
          featured = products.items.slice(0, 3)
        }
        
        setFeaturedProducts(featured)
      } catch (error) {
        console.error('Error loading featured products:', error)
      } finally {
        setLoadingProducts(false)
      }
    }

    loadFeaturedProducts()
  }, [])

  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* Hero Section */}
      <section className="relative w-full min-h-screen flex items-center overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className={`w-full h-full object-cover transition-all duration-[4000ms] ease-out ${
              textVisible ? 'blur-[6px] scale-105' : 'blur-[12px] scale-110'
            }`}
            style={{
              filter: `blur(${textVisible ? '6px' : '12px'}) brightness(0.5) contrast(1.3) saturate(0.8)`
            }}
          >
            <source src="/video/back.mp4" type="video/mp4" />
          </video>
          
          {/* Enhanced overlay gradients for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/70"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60"></div>
          
          {/* Additional overlay when text is visible */}
          <div className={`absolute inset-0 bg-black/20 transition-opacity duration-2000 ${
            textVisible ? 'opacity-100' : 'opacity-0'
          }`}></div>
          
          {/* Animated particles overlay */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(251,191,36,0.1),transparent_50%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(249,115,22,0.08),transparent_50%)]"></div>
          </div>
        </div>

        {/* Content */}
        <div className="w-full relative z-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto text-center space-y-8">
            <div className={`space-y-6 transition-all duration-1000 ease-out ${
              textVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-sm font-medium shadow-xl">
                <img 
                  src="/images/logo-s.png" 
                  alt="SpiritHub Cafe Logo" 
                  className="h-5 w-5 mr-2 object-contain no-flip"
                />
                {t('homepage.hero.badge', 'Premium Coffee Experience')}
              </div>
              
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white drop-shadow-2xl text-shadow-coffee leading-relaxed">
                <span className="block bg-gradient-to-r from-amber-200 via-orange-200 to-yellow-200 bg-clip-text text-transparent">
                  {t('homepage.hero.title')}
                </span>
              </h1>
            </div>
            
            <div className={`space-y-6 transition-all duration-1000 ease-out delay-300 ${
              textVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
                {t('homepage.hero.subtitle')}
              </p>
              <p className="text-lg text-white/80 max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
                {t('homepage.hero.description')}
              </p>
            </div>
            
            <div className={`flex flex-col sm:flex-row gap-4 justify-center pt-6 transition-all duration-1000 ease-out delay-500 ${
              textVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <Button asChild size="lg" className="btn-coffee shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-sm">
                <Link to="/shop" className="flex items-center justify-center">
                  {t('homepage.hero.shopNow')}
                  <ArrowRight className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0 rtl:rotate-180 no-flip" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="border-white/30 text-coffee-dark hover:bg-white/30 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300" asChild>
                <Link to="/about">
                  {t('homepage.hero.aboutUs', 'About Us')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-background via-muted/10 to-accent/5 bg-coffee-pattern w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-shadow-coffee">
                {t('homepage.features.title', 'Why Choose Us')}
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {t('homepage.features.subtitle', 'Discover what makes our coffee exceptional')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="card-clean group hover:glow-coffee hover:-translate-y-2 transition-all duration-300 border-0 shadow-lg backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-950 dark:to-orange-950 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Star className="h-8 w-8 text-amber-600 dark:text-amber-400 no-flip" />
                </div>
                <CardTitle className="text-xl">{t('homepage.features.quality.title')}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base leading-relaxed">
                  {t('homepage.features.quality.description')}
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-clean group hover:glow-coffee hover:-translate-y-2 transition-all duration-300 border-0 shadow-lg backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950 dark:to-emerald-950 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg bg-coffee-green">
                  <Clock className="h-8 w-8 text-green-600 dark:text-green-400 no-flip" />
                </div>
                <CardTitle className="text-xl">{t('homepage.features.freshness.title')}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base leading-relaxed">
                  {t('homepage.features.freshness.description')}
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-clean group hover:glow-coffee hover:-translate-y-2 transition-all duration-300 border-0 shadow-lg backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-200 to-amber-100 dark:from-amber-950 dark:to-amber-900 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg bg-coffee-gold">
                  <img 
                    src="/images/logo-s.png" 
                    alt="SpiritHub Cafe Logo" 
                    className="h-10 w-10 object-contain no-flip"
                  />
                </div>
                <CardTitle className="text-xl">{t('homepage.features.expertise.title')}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base leading-relaxed">
                  {t('homepage.features.expertise.description')}
                </CardDescription>
              </CardContent>
            </Card>
          </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-accent/5 via-background to-muted/10 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-shadow-coffee">
                {t('homepage.featured.title', 'Featured Products')}
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {t('homepage.featured.subtitle', 'Discover our best deals and top-rated products')}
              </p>
            </div>
            
            {loadingProducts ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="card-clean">
                    <CardContent className="p-6">
                      <div className="animate-pulse space-y-4">
                        <div className="bg-muted h-48 rounded-lg"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-4 bg-muted rounded w-1/2"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : featuredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {featuredProducts.map((product) => {
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
                          <Badge className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg">
                            {discountPercent}% {isArabic ? 'خصم' : 'OFF'}
                          </Badge>
                        )}
                        
                        {/* Rating */}
                        {product.average_rating && product.average_rating > 0 && (
                          <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-white text-xs font-medium">
                              {product.average_rating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <CardContent className="p-6">
                        <Link to={`/product/${product.slug || product.id}`}>
                          <h3 className="font-semibold text-lg mb-2 hover:text-primary transition-colors line-clamp-2">
                            {isArabic ? (product.name_ar || product.name) : product.name}
                          </h3>
                        </Link>
                        
                        <div className="text-muted-foreground text-sm mb-4 line-clamp-2">
                          <HTMLContent content={isArabic ? (product.description_ar || product.description || '') : (product.description || '')} />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {salePrice && salePrice < productPrice ? (
                                <>
                                  <span className="text-lg font-bold text-red-600">
                                    {formatPrice(salePrice)}
                                  </span>
                                  <span className="text-sm text-muted-foreground line-through">
                                    {formatPrice(productPrice)}
                                  </span>
                                  {(() => {
                                    const discountPercent = Math.round(((productPrice - salePrice) / productPrice) * 100)
                                    return discountPercent > 0 ? (
                                      <Badge variant="destructive" className="text-xs">
                                        {discountPercent}% {isArabic ? 'خصم' : 'OFF'}
                                      </Badge>
                                    ) : null
                                  })()}
                                </>
                              ) : (
                                <span className="text-lg font-bold text-primary">
                                  {formatPrice(productPrice)}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <Button 
                            size="sm" 
                            className="btn-coffee"
                            onClick={() => addToCart(product, 1)}
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            {t('common.addToCart', 'Add to Cart')}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  {t('homepage.featured.noProducts', 'No featured products available at the moment')}
                </p>
              </div>
            )}
            
            <div className="text-center mt-12">
              <Button asChild size="lg" className="btn-coffee">
                <Link to="/shop">
                  {t('homepage.featured.viewAll', 'View All Products')}
                  <ArrowRight className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0 rtl:rotate-180" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
