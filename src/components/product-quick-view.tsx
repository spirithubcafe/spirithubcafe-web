import React, { useState, useEffect } from 'react'
import { Star, ShoppingCart, Plus, Minus, Heart } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StockIndicator } from '@/components/ui/stock-indicator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTranslation } from 'react-i18next'
import { useCurrency } from '@/hooks/useCurrency'
import { useCart } from '@/hooks/useCart'
import { useWishlist } from '@/hooks/useWishlist'
import { firestoreService, type Product, type Category } from '@/lib/firebase'
// import CoffeeInfoDisplay from '@/components/product/CoffeeInfoDisplay'
import toast from 'react-hot-toast'

interface ProductQuickViewProps {
  product: Product
  children: React.ReactNode
}

export function ProductQuickView({ product, children }: ProductQuickViewProps) {
  const { i18n } = useTranslation()
  const { formatPrice, currency } = useCurrency()
  const { addToCart } = useCart()
  const { toggleWishlist, isInWishlist, loading: wishlistLoading } = useWishlist()
  const [quantity, setQuantity] = useState(1)
  const [isOpen, setIsOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedProperties, setSelectedProperties] = useState<Record<string, string>>({})

  const isArabic = i18n.language === 'ar'

  // Load categories when component mounts
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await firestoreService.categories.list()
        setCategories(categoriesData.items)
      } catch (error) {
        console.error('Error loading categories:', error)
      }
    }
    loadCategories()
  }, [])

  // Initialize default selections for property-based pricing
  useEffect(() => {
    if (product && product.properties) {
      const pricingProperties = product.properties.filter(p => p.affects_price && p.options && p.options.length > 0)
      
      // Only auto-select if product has advanced properties and no selections made yet
      if (pricingProperties.length > 0 && Object.keys(selectedProperties).length === 0) {
        // Find the combination that gives the minimum price
        let minPrice = Infinity
        let bestCombination: Record<string, string> = {}
        
        const findBestCombination = (propertyIndex: number, currentSelections: Record<string, string>): void => {
          if (propertyIndex >= pricingProperties.length) {
            // Calculate price for this combination
            let totalPrice = 0
            
            for (const property of pricingProperties) {
              const selectedValue = currentSelections[property.name]
              if (selectedValue) {
                const option = property.options.find(opt => opt.value === selectedValue)
                if (option) {
                  let optionPrice = 0
                  if (currency === 'OMR') {
                    if (option.price_omr) {
                      optionPrice = option.on_sale && option.sale_price_omr ? option.sale_price_omr : option.price_omr
                    } else if (option.price_modifier_omr || option.price_modifier) {
                      optionPrice = option.price_modifier_omr || option.price_modifier || 0
                    }
                  } else if (currency === 'SAR') {
                    if (option.price_sar) {
                      optionPrice = option.on_sale && option.sale_price_sar ? option.sale_price_sar : option.price_sar
                    } else if (option.price_modifier_sar || option.price_modifier_omr || option.price_modifier) {
                      optionPrice = option.price_modifier_sar || (option.price_modifier_omr || option.price_modifier || 0) * 9.75
                    }
                  } else {
                    if (option.price_usd) {
                      optionPrice = option.on_sale && option.sale_price_usd ? option.sale_price_usd : option.price_usd
                    } else if (option.price_modifier_usd || option.price_modifier_omr || option.price_modifier) {
                      optionPrice = option.price_modifier_usd || (option.price_modifier_omr || option.price_modifier || 0) * 2.6
                    }
                  }
                  totalPrice += optionPrice
                }
              }
            }
            
            if (totalPrice < minPrice) {
              minPrice = totalPrice
              bestCombination = { ...currentSelections }
            }
            return
          }
          
          const currentProperty = pricingProperties[propertyIndex]
          for (const option of currentProperty.options) {
            findBestCombination(propertyIndex + 1, {
              ...currentSelections,
              [currentProperty.name]: option.value
            })
          }
        }
        
        findBestCombination(0, {})
        
        if (Object.keys(bestCombination).length > 0) {
          setSelectedProperties(bestCombination)
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, currency])

  // Get all product images from different fields
  const getProductImages = (product: Product): string[] => {
    const images: string[] = []
    
    // Add main image first (highest priority)
    if (product.image_url) {
      images.push(product.image_url)
    }
    if (product.image) {
      images.push(product.image)
    }
    
    // Then add gallery images
    if (product.images && Array.isArray(product.images)) {
      images.push(...product.images)
    }
    if (product.gallery && Array.isArray(product.gallery)) {
      images.push(...product.gallery)
    }
    if (product.gallery_images && Array.isArray(product.gallery_images)) {
      images.push(...product.gallery_images)
    }
    
    // Remove duplicates and empty strings
    return [...new Set(images.filter(img => img && img.trim() !== ''))]
  }

  // Get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    if (!category) return isArabic ? 'عام' : 'General'
    return isArabic ? (category.name_ar || category.name) : category.name
  }

  // Get product price based on selected currency - returns sale price if available and lower, otherwise regular
  const getProductPrice = (): number => {
    if (!product) return 0
    
    // If product has properties with pricing, try property-based pricing first
    if (product.properties && product.properties.some(p => p.affects_price && p.options && p.options.length > 0)) {
      const price = getPropertyBasedPrice()
      
      // If property-based pricing returned a valid price, use it
      if (price > 0) {
        return price
      }
    }
    
    // Fallback to base pricing for products without property-based pricing or when property pricing fails
    let baseSalePrice: number
    
    switch (currency) {
      case 'OMR':
        baseSalePrice = product.sale_price_omr || product.price_omr || 0
        break
      case 'SAR':
        baseSalePrice = product.sale_price_sar || (product.sale_price_omr ? product.sale_price_omr * 9.75 : (product.price_omr || 0) * 9.75)
        break
      case 'USD':
      default:
        baseSalePrice = product.sale_price_usd || (product.sale_price_omr ? product.sale_price_omr * 2.6 : (product.price_omr || 0) * 2.6)
        break
    }

    return baseSalePrice
  }

  const getPropertyBasedPrice = (): number => {
    if (!product || !product.properties) return 0

    // Find properties that affect price
    const pricingProperties = product.properties.filter(p => p.affects_price && p.options && p.options.length > 0)
    
    if (pricingProperties.length === 0) return 0

    // If user has selected properties, use the first property that affects price
    if (Object.keys(selectedProperties).length > 0) {
      for (const property of pricingProperties) {
        const selectedValue = selectedProperties[property.name]
        
        if (selectedValue) {
          const option = property.options.find(opt => opt.value === selectedValue)
          if (option) {
            // Check for absolute prices first (new system)
            let price = 0
            if (currency === 'OMR') {
              if (option.price_omr) {
                // New system: absolute price
                price = option.on_sale && option.sale_price_omr ? option.sale_price_omr : option.price_omr
              } else if (option.price_modifier_omr || option.price_modifier) {
                // Legacy: modifier as absolute price
                const modifier = option.price_modifier_omr || option.price_modifier || 0
                price = modifier
              }
            } else if (currency === 'SAR') {
              if (option.price_sar) {
                // New system: absolute price
                price = option.on_sale && option.sale_price_sar ? option.sale_price_sar : option.price_sar
              } else if (option.price_modifier_sar || option.price_modifier_omr || option.price_modifier) {
                // Legacy: modifier as absolute price
                const modifier = option.price_modifier_sar || (option.price_modifier_omr || option.price_modifier || 0) * 9.75
                price = modifier
              }
            } else {
              if (option.price_usd) {
                // New system: absolute price
                price = option.on_sale && option.sale_price_usd ? option.sale_price_usd : option.price_usd
              } else if (option.price_modifier_usd || option.price_modifier_omr || option.price_modifier) {
                // Legacy: modifier as absolute price
                const modifier = option.price_modifier_usd || (option.price_modifier_omr || option.price_modifier || 0) * 2.6
                price = modifier
              }
            }
            
            // If property option has valid price, return it
            if (price > 0) {
              return price
            }
          }
        }
      }
    }

    // If no properties selected or no valid price found, use first option of first property
    const firstProperty = pricingProperties[0]
    if (firstProperty && firstProperty.options.length > 0) {
      const firstOption = firstProperty.options[0]
      // Check for absolute prices first (new system)
      let price = 0
      if (currency === 'OMR') {
        if (firstOption.price_omr) {
          // New system: absolute price
          price = firstOption.on_sale && firstOption.sale_price_omr ? firstOption.sale_price_omr : firstOption.price_omr
        } else if (firstOption.price_modifier_omr || firstOption.price_modifier) {
          // Legacy: modifier as absolute price
          const modifier = firstOption.price_modifier_omr || firstOption.price_modifier || 0
          price = modifier
        }
      } else if (currency === 'SAR') {
        if (firstOption.price_sar) {
          // New system: absolute price
          price = firstOption.on_sale && firstOption.sale_price_sar ? firstOption.sale_price_sar : firstOption.price_sar
        } else if (firstOption.price_modifier_sar || firstOption.price_modifier_omr || firstOption.price_modifier) {
          // Legacy: modifier as absolute price
          const modifier = firstOption.price_modifier_sar || (firstOption.price_modifier_omr || firstOption.price_modifier || 0) * 9.75
          price = modifier
        }
      } else {
        if (firstOption.price_usd) {
          // New system: absolute price
          price = firstOption.on_sale && firstOption.sale_price_usd ? firstOption.sale_price_usd : firstOption.price_usd
        } else if (firstOption.price_modifier_usd || firstOption.price_modifier_omr || firstOption.price_modifier) {
          // Legacy: modifier as absolute price
          const modifier = firstOption.price_modifier_usd || (firstOption.price_modifier_omr || firstOption.price_modifier || 0) * 2.6
          price = modifier
        }
      }
      
      // If property option has valid price, return it
      if (price > 0) {
        return price
      }
    }

    return 0
  }

  const finalPrice = getProductPrice()

  const handleAddToCart = async () => {
    setIsLoading(true)
    try {
      await addToCart(product, quantity, Object.keys(selectedProperties).length > 0 ? selectedProperties : undefined)
      setQuantity(1)
      setIsOpen(false)
      const productName = isArabic ? (product.name_ar || product.name) : product.name
      toast.success(isArabic ? `تمت إضافة ${productName} إلى السلة` : `${productName} added to cart`)
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error(isArabic ? 'حدث خطأ أثناء الإضافة إلى السلة' : 'Error adding to cart')
    } finally {
      setIsLoading(false)
    }
  }

  const handleWishlistToggle = async () => {
    try {
      await toggleWishlist(product.id)
    } catch (error) {
      console.error('Error toggling wishlist:', error)
    }
  }

  const incrementQuantity = () => {
    if (quantity < product.stock_quantity) {
      setQuantity(prev => prev + 1)
    }
  }

  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1))

  const productImages = getProductImages(product)
  const productName = isArabic ? (product.name_ar || product.name) : product.name
  const productDescription = isArabic ? (product.description_ar || product.description) : product.description

  // Render property input based on display type
  const renderPropertyInput = (property: any) => {
    const selectedValue = selectedProperties[property.name] || ''
    
    if (property.display_type === 'radio') {
      return (
        <div className="space-y-2">
          <label className="text-sm font-medium">{isArabic ? (property.label_ar || property.label) : property.label}</label>
          <div className="flex flex-wrap gap-2">
            {property.options.map((option: any) => (
              <Button
                key={option.value}
                variant={selectedValue === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedProperties(prev => ({
                  ...prev,
                  [property.name]: option.value
                }))}
                className="h-8"
              >
                {isArabic ? (option.label_ar || option.label) : option.label}
                {property.affects_price && option.price_omr && (
                  <span className="ml-1 text-xs opacity-75">
                    (+{formatPrice(option.price_omr)})
                  </span>
                )}
              </Button>
            ))}
          </div>
        </div>
      )
    } else if (property.display_type === 'color') {
      return (
        <div className="space-y-2">
          <label className="text-sm font-medium">{isArabic ? (property.label_ar || property.label) : property.label}</label>
          <div className="flex flex-wrap gap-2">
            {property.options.map((option: any) => (
              <div
                key={option.value}
                onClick={() => setSelectedProperties(prev => ({
                  ...prev,
                  [property.name]: option.value
                }))}
                className={`w-8 h-8 rounded-full border-2 cursor-pointer ${
                  selectedValue === option.value ? 'border-primary ring-2 ring-primary/30' : 'border-gray-300'
                } swatch-${option.value.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                title={isArabic ? (option.label_ar || option.label) : option.label}
              />
            ))}
          </div>
        </div>
      )
    } else {
      // Default dropdown
      return (
        <div className="space-y-2">
          <label className="text-sm font-medium">{isArabic ? (property.label_ar || property.label) : property.label}</label>
          <Select 
            value={selectedValue} 
            onValueChange={(value) => setSelectedProperties(prev => ({
              ...prev,
              [property.name]: value
            }))}
          >
            <SelectTrigger>
              <SelectValue placeholder={isArabic ? "اختر..." : "Select..."} />
            </SelectTrigger>
            <SelectContent>
              {property.options.map((option: any) => (
                <SelectItem key={option.value} value={option.value}>
                  {isArabic ? (option.label_ar || option.label) : option.label}
                  {property.affects_price && option.price_omr && (
                    <span className="ml-1 text-xs opacity-75">
                      (+{formatPrice(option.price_omr)})
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-right">
            {productName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Images */}
          <div className="space-y-4">
            {productImages.length > 0 ? (
              <>
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={productImages[selectedImage]}
                    alt={productName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/images/placeholder.jpg'
                    }}
                  />
                </div>
                
                {productImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {productImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                          selectedImage === index ? 'border-primary' : 'border-transparent'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${productName} ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/images/placeholder.jpg'
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">No image available</span>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">{productName}</h1>
              <p className="text-muted-foreground">{productDescription}</p>
            </div>

            {/* Category */}
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {getCategoryName(product.category_id)}
              </Badge>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor((product as any).rating || 0)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                ({(product as any).rating || 0})
              </span>
            </div>

            {/* Price & Stock */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-primary">
                    {formatPrice(finalPrice)}
                  </span>
                </div>
                <StockIndicator 
                  stock={product.stock_quantity || product.stock || 0} 
                  variant="detailed"
                  lowStockThreshold={10}
                />
              </div>
            </div>

            {/* Properties */}
            {product.properties && product.properties.length > 0 && (
              <div className="space-y-4">
                {product.properties.map((property) => (
                  <div key={property.name}>
                    {renderPropertyInput(property)}
                  </div>
                ))}
              </div>
            )}

            {/* Quantity Selector */}
            {product.stock_quantity > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-medium">
                  {isArabic ? 'الكمية' : 'Quantity'}
                </label>
                <div className="flex items-center w-fit">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-r-none"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="flex h-10 w-16 items-center justify-center border-t border-b bg-background text-sm font-medium">
                    {quantity}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-l-none"
                    onClick={incrementQuantity}
                    disabled={quantity >= product.stock_quantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              {/* Add to Cart Button */}
              <Button 
                className="flex-1" 
                onClick={handleAddToCart} 
                disabled={product.stock_quantity <= 0 || isLoading}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {isLoading 
                  ? (isArabic ? 'جاري الإضافة...' : 'Adding...') 
                  : (isArabic ? 'أضف إلى السلة' : 'Add to Cart')
                }
              </Button>

              {/* Wishlist Button */}
              <Button
                variant="outline"
                size="icon"
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
              >
                <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? 'fill-current text-red-500' : ''}`} />
              </Button>
            </div>

            {/* Coffee Info Display - Comment out for now */}
            {/* <CoffeeInfoDisplay product={product} /> */}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
