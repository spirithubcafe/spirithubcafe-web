import React from 'react'
import { Link } from 'react-router-dom'
import { X, ZoomIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { HeroSlider } from '@/components/ui/hero-slider'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/components/theme-provider'
import { useState, useMemo } from 'react'
import { useScrollToTopOnRouteChange } from '@/hooks/useSmoothScrollToTop'
import type { Product, Category } from '@/lib/firebase'
import { useCurrency } from '@/hooks/useCurrency'
import { useProducts, useCategories, useGlobalHomepageSettings } from '@/contexts/enhanced-data-provider'
import { conversionRates } from '@/lib/currency'
import { NewsletterSection } from '@/components/newsletter-section'
import DOMPurify from 'dompurify'

export function HomePage() {
  const { t, i18n } = useTranslation()
  const { resolvedTheme } = useTheme()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { formatPrice, currency } = useCurrency()
  
  const { products, loading: loadingProducts } = useProducts()
  const { categories, loading: loadingCategories } = useCategories()
  const { settings: homepageSettings } = useGlobalHomepageSettings()
  
  const isArabic = i18n.language === 'ar'
  
  const latestProducts = useMemo(() => {
    return products
      .sort((a: Product, b: Product) => new Date(b.created).getTime() - new Date(a.created).getTime())
      .slice(0, 6)
  }, [products])
  
  // Functions for image modal
  const openImageModal = (imageSrc: string | undefined) => {
    if (imageSrc) {
      setSelectedImage(imageSrc)
      setIsModalOpen(true)
    }
  }

  const closeImageModal = () => {
    setSelectedImage(null)
    setIsModalOpen(false)
  }
  
  useScrollToTopOnRouteChange()

  const getProductPrice = (product: Product) => {
    let basePrice = product.price_omr
    if (currency === 'USD' && product.price_usd) {
      basePrice = product.price_usd
    } else if (currency === 'SAR' && product.price_sar) {
      basePrice = product.price_sar
    }
    
    if (currency !== 'OMR') {
      const rate = conversionRates[currency] || 1
      return (basePrice * rate)
    }
    return basePrice
  }

  const getSalePrice = (product: Product) => {
    let salePrice = product.sale_price_omr
    if (currency === 'USD' && product.sale_price_usd) {
      salePrice = product.sale_price_usd
    } else if (currency === 'SAR' && product.sale_price_sar) {
      salePrice = product.sale_price_sar
    }
    
    if (!salePrice) return null
    
    if (currency !== 'OMR') {
      const rate = conversionRates[currency] || 1
      return (salePrice * rate)
    }
    return salePrice
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="min-h-screen relative overflow-hidden z-0 -mt-16">
        <HeroSlider />
      </section>

      {/* Feature Section */}
      {(homepageSettings?.showFeatureSection !== false) && (
        <section 

        className="py-12 lg:py-16 relative"
          style={{
            backgroundColor: homepageSettings?.featureSectionBackgroundType === 'color' && (
              resolvedTheme === 'dark' 
                ? homepageSettings?.featureSectionBackgroundColorDark || homepageSettings?.featureSectionBackgroundColor
                : homepageSettings?.featureSectionBackgroundColorLight || homepageSettings?.featureSectionBackgroundColor
            )
              ? (resolvedTheme === 'dark' 
                  ? homepageSettings?.featureSectionBackgroundColorDark || homepageSettings?.featureSectionBackgroundColor
                  : homepageSettings?.featureSectionBackgroundColorLight || homepageSettings?.featureSectionBackgroundColor)
              : undefined,
            backgroundImage: homepageSettings?.featureSectionBackgroundType === 'image' && homepageSettings?.featureSectionBackgroundImage
              ? `url(${homepageSettings.featureSectionBackgroundImage})`
              : undefined,
            backgroundSize: homepageSettings?.featureSectionBackgroundType === 'image' ? 'cover' : undefined,
            backgroundPosition: homepageSettings?.featureSectionBackgroundType === 'image' ? 'center' : undefined,
            backgroundRepeat: homepageSettings?.featureSectionBackgroundType === 'image' ? 'no-repeat' : undefined
          }}
        >
          {/* Overlay for better text readability when using background image */}
          {homepageSettings?.featureSectionBackgroundType === 'image' && homepageSettings?.featureSectionBackgroundImage && (
            <div className="absolute inset-0 bg-black/20"></div>
          )}
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="w-full">
              {/* Title */}
              <div className="text-center mb-8">
                <h2 
                  className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-foreground"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(isArabic 
                      ? (homepageSettings?.featureSectionTitleAr || 'تجربة قهوة استثنائية')
                      : (homepageSettings?.featureSectionTitle || 'Exceptional Coffee Experience'))
                  }}
                />
                <div className="w-16 h-1 bg-primary mx-auto rounded-full"></div>
              </div>
              
              {/* Content */}
              <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                {/* Text Content */}
                <div className="flex-1 text-center lg:text-left order-2 lg:order-1">
                  <div 
                    className="text-lg md:text-xl text-muted-foreground leading-relaxed feature-content"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(isArabic 
                        ? (homepageSettings?.featureSectionDescriptionAr || 'في سبيريت هب، ندعوك لتجربة مثالية للقهوة الحرفية عالية الجودة. استمتع بنكهات استثنائية تم إعدادها بعناية فائقة، واكتشف عالم القهوة كما لم تعهده من قبل.')
                        : (homepageSettings?.featureSectionDescription || 'At Spirit Hub, we invite you to a perfect artisanal high-quality coffee experience. Enjoy exceptional flavors crafted with utmost care, and discover the world of coffee like never before.'))
                    }}
                  />
                </div>
                
                {/* Feature Image */}
                <div className="flex-1 flex justify-center w-full order-1 lg:order-2">
                  {homepageSettings?.featureSectionImage && (
                    <div 
                      className="w-full max-w-lg aspect-video overflow-hidden rounded-lg shadow-xl cursor-pointer hover:opacity-90 transition-all duration-300 relative group"
                      onClick={() => openImageModal(homepageSettings.featureSectionImage)}
                    >
                      <img
                        src={homepageSettings.featureSectionImage}
                        alt="Feature"
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <ZoomIn className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Section Separator */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>

      {/* Latest Release Section */}
      {(homepageSettings?.showLatestReleaseSection !== false) && (
        <section 
          className="py-12 md:py-16 lg:py-24 w-full relative"
          style={{
            backgroundColor: homepageSettings?.latestReleaseBackgroundType === 'color' && (
              resolvedTheme === 'dark' 
                ? homepageSettings?.latestReleaseBackgroundColorDark || homepageSettings?.latestReleaseBackgroundColor
                : homepageSettings?.latestReleaseBackgroundColorLight || homepageSettings?.latestReleaseBackgroundColor
            )
              ? (resolvedTheme === 'dark' 
                  ? homepageSettings?.latestReleaseBackgroundColorDark || homepageSettings?.latestReleaseBackgroundColor
                  : homepageSettings?.latestReleaseBackgroundColorLight || homepageSettings?.latestReleaseBackgroundColor)
              : undefined,
            backgroundImage: homepageSettings?.latestReleaseBackgroundType === 'image' && homepageSettings?.latestReleaseBackgroundImage
              ? `url(${homepageSettings.latestReleaseBackgroundImage})`
              : undefined,
            backgroundSize: homepageSettings?.latestReleaseBackgroundType === 'image' ? 'cover' : undefined,
            backgroundPosition: homepageSettings?.latestReleaseBackgroundType === 'image' ? 'center' : undefined,
            backgroundRepeat: homepageSettings?.latestReleaseBackgroundType === 'image' ? 'no-repeat' : undefined,
            backgroundAttachment: homepageSettings?.latestReleaseBackgroundType === 'image' ? 'fixed' : undefined
          }}
        >
          {/* Overlay for better text readability when using background image */}
          {homepageSettings?.latestReleaseBackgroundType === 'image' && homepageSettings?.latestReleaseBackgroundImage && (
            <div className="absolute inset-0 bg-black/20"></div>
          )}
          
          <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-7xl mx-auto">
              <div className="text-center space-y-4 mb-8 md:mb-12">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
                  {isArabic 
                    ? (homepageSettings?.latestReleaseTitleAr || 'أحدث الإصدارات')
                    : (homepageSettings?.latestReleaseTitle || 'LATEST RELEASE')
                  }
                </h2>
                <div className="w-16 h-1 bg-primary mx-auto rounded-full"></div>
              </div>
              
            {loadingProducts ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6 max-w-7xl mx-auto">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex flex-col items-center space-y-3">
                    <div className="animate-pulse w-full aspect-square bg-muted rounded-lg"></div>
                    <div className="animate-pulse h-4 bg-muted rounded w-3/4"></div>
                    <div className="animate-pulse h-3 bg-muted rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : latestProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6 max-w-7xl mx-auto">
                {latestProducts.slice(0, 6).map((product: Product) => {
                  const productPrice = getProductPrice(product)
                  const salePrice = getSalePrice(product)
                  const isArabic = localStorage.getItem('i18nextLng') === 'ar'

                  return (
                    <Link
                      key={product.id}
                      to={`/product/${product.slug || product.id}`}
                      className="group flex flex-col h-full bg-background border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300"
                    >
                      <div className="w-full aspect-square overflow-hidden bg-muted">
                        <img
                          src={
                            product.image_url || 
                            product.image || 
                            product.images?.[0] || 
                            product.gallery?.[0] || 
                            product.gallery_images?.[0] || 
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
                      
                      <div className="flex flex-col flex-1 p-3 space-y-2">
                        <h3 className={`font-semibold text-sm product-name-truncate transition-colors ${
                          resolvedTheme === 'dark' 
                            ? 'text-gray-100 hover:text-blue-300' 
                            : 'text-gray-900 hover:text-blue-600'
                        }`}>
                          {isArabic ? (product.name_ar || product.name) : product.name}
                        </h3>
                        
                        {/* Product Uses/Notes */}
                        <p className={`text-xs leading-relaxed product-name-truncate ${
                          resolvedTheme === 'dark' 
                            ? 'text-gray-300' 
                            : 'text-gray-600'
                        }`}>
                          {(isArabic ? product.notes_ar : product.notes) ? (
                            isArabic ? (product.notes_ar || product.notes) : product.notes
                          ) : (
                            isArabic ? 'لا توجد ملاحظات' : 'No notes available'
                          )}
                        </p>
                        
                        <div className="mt-auto">
                          <div className="product-price-container">
                            {salePrice && salePrice < productPrice ? (
                              <>
                                <span className="text-sm font-bold text-red-500">
                                  {formatPrice(salePrice)}
                                </span>
                                <span className="text-xs text-muted-foreground line-through">
                                  {formatPrice(productPrice)}
                                </span>
                              </>
                            ) : (
                              <span className="text-sm font-bold text-primary">
                                {formatPrice(productPrice)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
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
      )}

      {/* Coffee Selection Section with Image Background */}
      <section className="relative py-12 md:py-16 lg:py-24 w-full overflow-hidden">
        {/* Fixed Background Image */}
        <div 
          className="absolute inset-0 w-full h-full bg-fixed bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url(${homepageSettings?.backgroundVideo || '/images/back.jpg'})` 
          } as React.CSSProperties}
        />
        
        {/* Image Overlay */}
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-4 md:space-y-6 mb-12 md:mb-16">
              <h2 className="text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-white drop-shadow-lg">
                {isArabic 
                  ? (homepageSettings?.coffeeSelectionTitleAr || 'مجموعة القهوة')
                  : (homepageSettings?.coffeeSelectionTitle || 'COFFEE SELECTION')
                }
              </h2>
              <p className="text-sm md:text-lg lg:text-xl text-white/90 max-w-4xl mx-auto leading-relaxed drop-shadow-md px-2 md:px-0">
                {isArabic 
                  ? (homepageSettings?.coffeeSelectionDescriptionAr || 'مهمتنا هي إثراء يوم كل عميل بتجربة قهوة مصنوعة يدوياً. من خلال محمصة سبيريت هب، نضمن جودة ونكهة استثنائية في كل كوب، من الحبوب المختارة بعناية إلى التحميص الخبير. أينما نخدم، تتألق شغفنا وتفانينا، مما يجعل كل رشفة لا تُنسى.')
                  : (homepageSettings?.coffeeSelectionDescription || 'Our mission is to enrich each customer\'s day with a hand-crafted coffee experience. Through SpiritHub Roastery, we guarantee exceptional quality and flavor in every cup, from carefully selected beans to expert roasting. Wherever we serve, our passion and dedication shine through, making every sip unforgettable.')
                }
              </p>
              <div className="pt-4">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
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
      <section className="py-12 md:py-16 lg:py-24 w-full bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-4 mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
                {t('homepage.categories.title', 'SpiritHub Categories')}
              </h2>
              <div className="w-16 h-1 bg-primary mx-auto rounded-full"></div>
            </div>
            
            {loadingCategories ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 max-w-7xl mx-auto">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <div key={i} className="flex flex-col items-center space-y-3">
                    <div className="animate-pulse w-full aspect-square bg-muted rounded-lg"></div>
                    <div className="animate-pulse h-4 bg-muted rounded w-3/4"></div>
                    <div className="animate-pulse h-3 bg-muted rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : categories.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 max-w-7xl mx-auto">
                {(() => {
                  // If homepage settings contains an explicit list of category IDs, use that order.
                  const explicitIds = homepageSettings?.homepageCategoryIds || []
                  if (explicitIds && explicitIds.length > 0) {
                    // Map ids to category objects, filter out missing ones
                    return explicitIds
                      .map(id => categories.find(c => c.id === id))
                      .filter(Boolean)
                      .map((category: Category | undefined) => {
                        if (!category) return null
                        const isArabic = localStorage.getItem('i18nextLng') === 'ar'
                        const categoryName = isArabic ? (category.name_ar || category.name) : category.name

                        return (
                          <Link
                            key={category.id}
                            to={`/shop?category=${category.id}`}
                            className="group flex flex-col items-center text-center space-y-3 p-4 rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="w-full aspect-square overflow-hidden rounded-lg bg-muted border border-border">
                              <img
                                src={category.image || '/images/logo.png'}
                                alt={categoryName}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                onError={(e) => { e.currentTarget.src = '/images/logo.png' }}
                              />
                            </div>
                            <div className="space-y-1">
                              <h3 className="font-semibold text-base text-foreground hover:text-primary transition-colors category-name-truncate" title={categoryName}>
                                {categoryName}
                              </h3>
                            </div>
                          </Link>
                        )
                      })
                  }

                  // Fallback: show categories where showOnHome !== false
                  return categories
                    .filter((c: Category) => c.showOnHome !== false)
                    .map((category: Category) => {
                  const isArabic = localStorage.getItem('i18nextLng') === 'ar'
                  const categoryName = isArabic ? (category.name_ar || category.name) : category.name
                    
                    return (
                      <Link
                        key={category.id}
                        to={`/shop?category=${category.id}`}
                        className="group flex flex-col items-center text-center space-y-3 p-4 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="w-full aspect-square overflow-hidden rounded-lg bg-muted border border-border">
                          <img
                            src={category.image || '/images/logo.png'}
                            alt={categoryName}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => { e.currentTarget.src = '/images/logo.png' }}
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <h3 
                            className="font-semibold text-base text-foreground hover:text-primary transition-colors category-name-truncate" 
                            title={categoryName}
                          >
                            {categoryName}
                          </h3>
                        </div>
                      </Link>
                    )
                  })
                })()}
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
        <section className="py-16 md:py-24 lg:py-32 xl:py-40 relative overflow-hidden">
          {/* Fixed Background Image */}
          <div 
            className="absolute inset-0 w-full h-full bg-scroll md:bg-fixed bg-cover bg-center bg-no-repeat"
            style={{ 
              backgroundImage: `url(${homepageSettings?.communityBackgroundImage || '/images/back.jpg'})` 
            } as React.CSSProperties}
          />
          
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/60" />
          
          {/* Scrolling Content */}
          <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="space-y-12">
                {/* Community Text */}
                <div className="text-center max-w-5xl mx-auto">
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
                        href={homepageSettings?.instagramUrl || "https://instagram.com/spirithubcafe"} 
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
                        href={homepageSettings?.facebookUrl || "https://facebook.com/spirithubcafe"} 
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
                  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8 max-w-7xl mx-auto px-4">
                    {homepageSettings?.communityImage1 && (
                      <div 
                        className="aspect-[3/2] md:aspect-[4/3] lg:aspect-[16/10] overflow-hidden rounded-lg shadow-2xl border border-white/20 cursor-pointer hover:opacity-90 transition-all duration-300 relative group"
                        onClick={() => openImageModal(homepageSettings.communityImage1)}
                      >
                        <img
                          src={homepageSettings.communityImage1}
                          alt="Community 1"
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <ZoomIn className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    )}
                    {homepageSettings?.communityImage2 && (
                      <div 
                        className="aspect-[3/2] md:aspect-[4/3] lg:aspect-[16/10] overflow-hidden rounded-lg shadow-2xl border border-white/20 cursor-pointer hover:opacity-90 transition-all duration-300 relative group"
                        onClick={() => openImageModal(homepageSettings.communityImage2)}
                      >
                        <img
                          src={homepageSettings.communityImage2}
                          alt="Community 2"
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <ZoomIn className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    )}
                    {homepageSettings?.communityImage3 && (
                      <div 
                        className="aspect-[3/2] md:aspect-[4/3] lg:aspect-[16/10] overflow-hidden rounded-lg shadow-2xl border border-white/20 cursor-pointer hover:opacity-90 transition-all duration-300 relative group"
                        onClick={() => openImageModal(homepageSettings.communityImage3)}
                      >
                        <img
                          src={homepageSettings.communityImage3}
                          alt="Community 3"
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <ZoomIn className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    )}
                    {homepageSettings?.communityImage4 && (
                      <div 
                        className="aspect-[3/2] md:aspect-[4/3] lg:aspect-[16/10] overflow-hidden rounded-lg shadow-2xl border border-white/20 cursor-pointer hover:opacity-90 transition-all duration-300 relative group"
                        onClick={() => openImageModal(homepageSettings.communityImage4)}
                      >
                        <img
                          src={homepageSettings.communityImage4}
                          alt="Community 4"
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <ZoomIn className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Newsletter Section */}
      <NewsletterSection />

      {/* Image Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl w-full p-0 bg-transparent border-none [&>button]:hidden">
          <div className="relative">
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 z-50 bg-black/30 hover:bg-black/50 text-white rounded-full p-3 transition-colors duration-200 backdrop-blur-sm border border-white/20"
              aria-label={isArabic ? 'إغلاق' : 'Close'}
            >
              <X className="w-6 h-6" />
            </button>
            {selectedImage && (
              <img
                src={selectedImage}
                alt={isArabic ? 'صورة مكبرة' : 'Enlarged image'}
                className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = '/images/logo.png'
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}
