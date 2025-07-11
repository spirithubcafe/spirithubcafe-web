import { Link } from 'react-router-dom'
import { ShoppingCart, Plus, Minus, X, Coffee } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useCart } from '@/components/cart-provider'
import { useCurrency } from '@/components/currency-provider'
import { useTranslation } from 'react-i18next'

export function CartSidebar() {
  const { t, i18n } = useTranslation()
  const { cart, updateQuantity, removeFromCart } = useCart()
  const { formatPrice } = useCurrency()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-4 w-4" />
          {cart.totalItems > 0 && (
            <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {cart.totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-lg p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-6 pb-4">
            <SheetTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              {t('cart.title')}
              {cart.totalItems > 0 && (
                <Badge variant="secondary">
                  {cart.totalItems} {cart.totalItems === 1 ? t('cart.item') : t('cart.items')}
                </Badge>
              )}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 flex flex-col px-6">
            {cart.items.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Coffee className="h-16 w-16 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold">
                      {t('cart.empty')}
                    </h3>
                    <p className="text-muted-foreground">
                      {t('cart.emptyDescription')}
                    </p>
                  </div>
                  <Button asChild>
                    <Link to="/shop">
                      {t('cart.shopNow')}
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto py-2 space-y-4">
                  {cart.items.map((item) => (
                    <div key={item.product.id} className="flex gap-4 p-4 border rounded-lg">
                      <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950 rounded-md flex items-center justify-center flex-shrink-0">
                        <Coffee className="h-8 w-8 text-amber-600" />
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-sm">
                            {i18n.language === 'ar' ? item.product.nameAr : item.product.name}
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.product.id)}
                            className="h-6 w-6 p-0 hover:bg-destructive/10"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {i18n.language === 'ar' ? item.product.categoryAr : item.product.category}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <p className="font-semibold text-amber-600 currency">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cart Summary */}
                <div className="border-t pt-4 pb-6 space-y-4">
                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span>{t('cart.total')}</span>
                    <span className="text-amber-600 currency">
                      {formatPrice(cart.total)}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <Button asChild className="w-full">
                      <Link to="/checkout">
                        {t('cart.checkout')}
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/shop">
                        {t('cart.continueShopping')}
                      </Link>
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
