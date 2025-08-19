import { Link } from 'react-router-dom'
import { ArrowRight, Star, ShoppingCart } from 'lucide-react'
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
import { useHomepageSettings } from '@/hooks/useHomepageSettings'
import { conversionRates } from '@/lib/currency'

export function HomePage() {
  const { t, i18n } = useTranslation()
  const [latestProducts, setLatestProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const { formatPrice, currency } = useCurrency()
  const { addToCart } = useCart()
  const { settings: homepageSettings, refetch: refetchHomepageSettings } = useHomepageSettings()
  const videoRef = useRef<HTMLVideoElement>(null)
  const isArabic = i18n.language === 'ar'
  
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

    const handleVideoEnd = async () => {
      try {
        video.currentTime = 0
        // Only play if video is not already playing
        if (video.paused) {
          await video.play()
        }
      } catch (error) {
        console.error('Error restarting video after end:', error)
      }
    }

    const handleVideoError = () => {
      console.error('Video playback error, attempting to restart')
      setTimeout(async () => {
        try {
          video.currentTime = 0
          // Only play if video is not already playing  
          if (video.paused) {
            await video.play()
          }
        } catch (error) {
          console.error('Error restarting video after error:', error)
        }
      }, 1000)
    }

    video.addEventListener('ended', handleVideoEnd)
    video.addEventListener('error', handleVideoError)
    
    // Only ensure video starts playing if it's not already playing and autoplay failed
    if (video.paused && video.readyState >= 2) {
      video.play().catch(console.error)
    }

    return () => {
      video.removeEventListener('ended', handleVideoEnd)
      video.removeEventListener('error', handleVideoError)
    }
  }, [homepageSettings?.backgroundVideo])

  // Update video source when settings change
  useEffect(() => {
    const video = videoRef.current
    if (!video || !homepageSettings?.backgroundVideo) return

    // Properly handle video source changes with async operations
    const updateVideoSource = async () => {
      try {
        // Wait for pause to complete if video is playing
        if (!video.paused) {
          video.pause()
          // Wait for pause event to complete
          await new Promise(resolve => {
            const handlePause = () => {
              video.removeEventListener('pause', handlePause)
              resolve(undefined)
            }
            video.addEventListener('pause', handlePause)
            // Fallback timeout in case pause event doesn't fire
            setTimeout(resolve, 100)
          })
        }
        
        // Ensure we have a valid video URL
        if (homepageSettings.backgroundVideo) {
          video.src = homepageSettings.backgroundVideo
          video.load()
          
          // Wait for the video to be ready before playing
          await new Promise(resolve => {
            const handleCanPlay = () => {
              video.removeEventListener('canplay', handleCanPlay)
              resolve(undefined)
            }
            video.addEventListener('canplay', handleCanPlay)
            // Fallback timeout
            setTimeout(resolve, 500)
          })
          
          // Now safely play the video only if it's not already playing
          if (video.paused) {
            await video.play()
            console.log('Video source updated and playing:', homepageSettings.backgroundVideo)
          }
        }
      } catch (error) {
        console.error('Error updating video source:', error)
      }
    }

    updateVideoSource()
  }, [homepageSettings?.backgroundVideo])

  // Listen for homepage settings updates
  useEffect(() => {
    const handleSettingsUpdate = () => {
      console.log('Homepage settings updated, refreshing...')
      refetchHomepageSettings()
    }

    window.addEventListener('homepageSettingsUpdated', handleSettingsUpdate)
    return () => {
      window.removeEventListener('homepageSettingsUpdated', handleSettingsUpdate)
    }
  }, [refetchHomepageSettings])

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

  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* Hero Section with Slides */}
      <HeroSlider />

      {/* Mission Statement Section with Fixed Background */}
      {(homepageSettings?.showMissionSection !== false) && (
        <section className="py-32 lg:py-40 relative overflow-hidden">
          {/* Fixed Background Image */}
          <div 
            className="absolute inset-0 w-full h-full bg-fixed bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${homepageSettings?.missionBackgroundImage || '/images/back.jpg'})` }}
          />
          
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/50" />
          
          {/* Scrolling Content */}
          <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <div className="space-y-8">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white drop-shadow-2xl">
                  {isArabic 
                    ? (homepageSettings?.missionTitleAr || 'الاستدامة والجودة والالتزام')
                    : (homepageSettings?.missionTitle || 'SUSTAINABILITY, QUALITY, COMMITMENT')
                  }
                </h2>
                
                <p className="text-lg md:text-xl lg:text-2xl text-white/95 leading-relaxed drop-shadow-lg font-medium">
                  {isArabic 
                    ? (homepageSettings?.missionDescriptionAr || 'مهمتنا هي إثراء يوم كل عميل بتجربة قهوة مصنوعة يدوياً. من خلال محمصة سبيريت هب، نضمن جودة ونكهة استثنائية في كل كوب، من الحبوب المختارة بعناية إلى التحميص الخبير. أينما نخدم، تتألق شغفنا وتفانينا، مما يجعل كل رشفة لا تُنسى.')
                    : (homepageSettings?.missionDescription || 'Our mission is to enrich each customer\'s day with a hand-crafted coffee experience. Through SpiritHub Roastery, we guarantee exceptional quality and flavor in every cup, from carefully selected beans to expert roasting. Wherever we serve, our passion and dedication shine through, making every sip unforgettable.')
                  }
                </p>
                
                <div className="pt-8">
                  <Button 
                    size="lg" 
                    className="bg-amber-600 hover:bg-amber-700 text-white px-10 py-4 text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 border-2 border-amber-500"
                    asChild
                  >
                    <Link to="/shop" className="flex items-center gap-3">
                      {isArabic 
                        ? (homepageSettings?.missionButtonTextAr || 'تسوق الآن')
                        : (homepageSettings?.missionButtonText || 'SHOP NOW')
                      }
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}


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
            

          </div>
        </div>
      </section>

      {/* Coffee Selection Section */}
      <section className="py-16 lg:py-24 relative overflow-hidden">
        {/* Background Video */}
        {(homepageSettings?.showBackgroundVideo !== false) && (
          <div className="absolute inset-0 w-full h-full overflow-hidden">
            <video
              key={homepageSettings?.backgroundVideo || 'default-video'}
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              disablePictureInPicture
              src={homepageSettings?.backgroundVideo || '/video/back.mp4'}
              className={`absolute -top-[15%] -left-[15%] min-w-[130%] min-h-[130%] object-cover transition-all duration-300 ${
                (homepageSettings?.backgroundVideoBlur || 30) <= 12.5 
                  ? 'blur-none' 
                  : (homepageSettings?.backgroundVideoBlur || 30) <= 25 
                  ? 'blur-sm' 
                  : (homepageSettings?.backgroundVideoBlur || 30) <= 50 
                  ? 'blur' 
                  : (homepageSettings?.backgroundVideoBlur || 30) <= 75 
                  ? 'blur-lg' 
                  : 'blur-xl'
              }`}
            >
              Your browser does not support the video tag.
            </video>
            {/* Overlay */}
            <div 
              className={`absolute inset-0 bg-black transition-opacity duration-300 ${
                (homepageSettings?.overlayOpacity || 30) <= 10 
                  ? 'opacity-5'
                  : (homepageSettings?.overlayOpacity || 30) <= 20
                  ? 'opacity-10'
                  : (homepageSettings?.overlayOpacity || 30) <= 30
                  ? 'opacity-20'
                  : (homepageSettings?.overlayOpacity || 30) <= 40
                  ? 'opacity-30'
                  : (homepageSettings?.overlayOpacity || 30) <= 50
                  ? 'opacity-40'
                  : (homepageSettings?.overlayOpacity || 30) <= 60
                  ? 'opacity-50'
                  : (homepageSettings?.overlayOpacity || 30) <= 70
                  ? 'opacity-60'
                  : (homepageSettings?.overlayOpacity || 30) <= 80
                  ? 'opacity-70'
                  : (homepageSettings?.overlayOpacity || 30) <= 90
                  ? 'opacity-80'
                  : 'opacity-30'
              }`}
            />
            {/* Theme-aware gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-background/20 to-background/40"></div>
          </div>
        )}
        
        {/* Content */}
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-6 mb-16">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white drop-shadow-lg">
                {isArabic 
                  ? (homepageSettings?.coffeeSelectionTitleAr || 'مجموعة القهوة')
                  : (homepageSettings?.coffeeSelectionTitle || 'COFFEE SELECTION')
                }
              </h2>
              <p className="text-lg md:text-xl text-white/90 max-w-4xl mx-auto leading-relaxed drop-shadow-md">
                {isArabic 
                  ? (homepageSettings?.coffeeSelectionDescriptionAr || 'مهمتنا هي إثراء يوم كل عميل بتجربة قهوة مصنوعة يدوياً. من خلال محمصة سبيريت هب، نضمن جودة ونكهة استثنائية في كل كوب، من الحبوب المختارة بعناية إلى التحميص الخبير. أينما نخدم، تتألق شغفنا وتفانينا، مما يجعل كل رشفة لا تُنسى.')
                  : (homepageSettings?.coffeeSelectionDescription || 'Our mission is to enrich each customer\'s day with a hand-crafted coffee experience. Through SpiritHub Roastery, we guarantee exceptional quality and flavor in every cup, from carefully selected beans to expert roasting. Wherever we serve, our passion and dedication shine through, making every sip unforgettable.')
                }
              </p>
              <div className="pt-4">
                <Button 
                  size="lg" 
                  className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                  asChild
                >
                  <Link to="/shop" className="flex items-center gap-2">
                    {isArabic 
                      ? (homepageSettings?.coffeeSelectionButtonTextAr || 'تسوق الآن')
                      : (homepageSettings?.coffeeSelectionButtonText || 'SHOP NOW')
                    }
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SpiritHub Categories Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-accent/5 via-background to-muted/10 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-shadow-coffee">
                {t('homepage.categories.title', 'SpiritHub Categories')}
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {t('homepage.categories.subtitle', 'Explore our coffee categories')}
              </p>
            </div>
            
            {loadingCategories ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <div key={i} className="flex flex-col items-center space-y-3">
                    <div className="animate-pulse w-full aspect-square bg-muted rounded-lg"></div>
                    <div className="animate-pulse h-4 bg-muted rounded w-3/4"></div>
                    <div className="animate-pulse h-3 bg-muted rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : categories.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
                {categories.map((category: Category) => {
                  const isArabic = localStorage.getItem('i18nextLng') === 'ar'
                  // Count products in this category
                  const productCount = latestProducts.filter(product => product.category_id === category.id).length
                  
                  return (
                    <Link
                      key={category.id}
                      to={`/shop?category=${category.id}`}
                      className="group flex flex-col items-center text-center space-y-3 p-4 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-full aspect-square overflow-hidden rounded-lg bg-muted border border-border">
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
                      
                      <div className="space-y-1">
                        <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors">
                          {isArabic ? (category.name_ar || category.name) : category.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {productCount} {isArabic ? 'منتج' : 'Products'}
                        </p>
                      </div>
                    </Link>
                  )
                })}
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

      {/* Community Section with Fixed Background */}
      {(homepageSettings?.showCommunitySection !== false) && (
        <section className="py-32 lg:py-40 relative overflow-hidden">
          {/* Fixed Background Image */}
          <div 
            className="absolute inset-0 w-full h-full bg-fixed bg-cover bg-center bg-no-repeat"
            style={{ 
              backgroundImage: `url(${homepageSettings?.communityBackgroundImage || '/images/back.jpg'})` 
            }}
          />
          
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/60" />
          
          {/* Scrolling Content */}
          <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="space-y-12">
                {/* Community Text */}
                <div className="text-center max-w-4xl mx-auto">
                  <p className="text-lg md:text-xl lg:text-2xl text-white/95 leading-relaxed drop-shadow-lg font-medium">
                    {isArabic 
                      ? (homepageSettings?.communityTextAr || 'كن جزءًا لا يتجزأ من عائلة سبيريت هب! تواصل معنا على وسائل التواصل الاجتماعي للحصول على تحديثات حصرية، ولمحات من وراء الكواليس، ومحتوى مثير. تابعنا لتبقى على اطلاع دائم. من النظرات الخاطفة على عمليتنا الإبداعية إلى العروض الترويجية الخاصة، قنواتنا الاجتماعية هي تذكرتك للأحدث. تفاعل مع المتحمسين ذوي التفكير المماثل، وشارك تجاربك، وكن عضوًا مهمًا في مجتمعنا الديناميكي عبر الإنترنت. لا تفوت الإثارة؛ انضم إلينا اليوم!')
                      : (homepageSettings?.communityText || 'Become an integral part of our Spirit Hub family! Connect with us on social media for exclusive updates, behind-the-scenes glimpses, and thrilling content. Follow us to stay in the loop. From sneak peeks into our creative process to special promotions, our social channels are your ticket to the latest. Engage with like-minded enthusiasts, share your experiences, and be a crucial member of our dynamic online community. Don\'t miss out on the excitement; join us today!')
                    }
                  </p>
                  
                  {/* Social Media Icons */}
                  <div className="flex justify-center gap-6 mt-8">
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="h-12 w-12 rounded-full border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:border-white/50 transition-all duration-300"
                      asChild
                    >
                      <a 
                        href="https://instagram.com/spirithubcafe" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        title="Follow us on Instagram"
                        aria-label="Follow us on Instagram"
                      >
                        <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </a>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="h-12 w-12 rounded-full border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:border-white/50 transition-all duration-300"
                      asChild
                    >
                      <a 
                        href="https://facebook.com/spirithubcafe" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        title="Follow us on Facebook"
                        aria-label="Follow us on Facebook"
                      >
                        <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </a>
                    </Button>
                  </div>
                </div>
                
                {/* Community Images Gallery */}
                {(homepageSettings?.communityImage1 || homepageSettings?.communityImage2 || homepageSettings?.communityImage3 || homepageSettings?.communityImage4) && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                    {homepageSettings?.communityImage1 && (
                      <div className="aspect-square overflow-hidden rounded-lg shadow-2xl border border-white/20">
                        <img
                          src={homepageSettings.communityImage1}
                          alt="Community 1"
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                    {homepageSettings?.communityImage2 && (
                      <div className="aspect-square overflow-hidden rounded-lg shadow-2xl border border-white/20">
                        <img
                          src={homepageSettings.communityImage2}
                          alt="Community 2"
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                    {homepageSettings?.communityImage3 && (
                      <div className="aspect-square overflow-hidden rounded-lg shadow-2xl border border-white/20">
                        <img
                          src={homepageSettings.communityImage3}
                          alt="Community 3"
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                    {homepageSettings?.communityImage4 && (
                      <div className="aspect-square overflow-hidden rounded-lg shadow-2xl border border-white/20">
                        <img
                          src={homepageSettings.communityImage4}
                          alt="Community 4"
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

    </div>
  )
}
