import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Truck, MapPin, Package } from 'lucide-react';
import { useAramexShipping } from '@/hooks/useAramexShipping';
import type { CartItem, Product } from '@/lib/firebase';

interface AramexShippingProps {
  cartItems: CartItem[];
  products: Product[];
  shippingAddress: {
    city: string;
    country: string;
    addressLine: string;
  };
  onRateCalculated: (rate: number, currency: string) => void;
  onError: (error: string) => void;
  language?: 'en' | 'ar';
}

export const AramexShippingComponent: React.FC<AramexShippingProps> = ({
  cartItems,
  products,
  shippingAddress,
  onRateCalculated,
  onError,
  language = 'en',
}) => {
  const { isAvailable, calculating, calculateShippingRate } = useAramexShipping();
  const [rate, setRate] = useState<{ amount: number; currency: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAvailable() && shippingAddress.city && shippingAddress.country && cartItems.length > 0) {
      handleCalculateRate();
    }
  }, [shippingAddress, cartItems]);

  const handleCalculateRate = async () => {
    setError(null);
    
    try {
      const result = await calculateShippingRate(cartItems, products, {
        city: shippingAddress.city,
        country: shippingAddress.country,
      });

      if (result.success && result.rate && result.currency) {
        setRate({ amount: result.rate, currency: result.currency });
        onRateCalculated(result.rate, result.currency);
      } else {
        const errorMsg = result.error || (language === 'ar' 
          ? 'خطأ في حساب تكلفة الشحن' 
          : 'Error calculating shipping cost');
        setError(errorMsg);
        onError(errorMsg);
      }
    } catch (err) {
      const errorMsg = language === 'ar' 
        ? 'خطأ في الاتصال بخدمة أرامكس' 
        : 'Error connecting to Aramex service';
      setError(errorMsg);
      onError(errorMsg);
    }
  };

  if (!isAvailable()) {
    return null; // Don't show if Aramex is not configured
  }

  return (
    <Card className="border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-700">
          <Truck className="h-5 w-5" />
          <span>{language === 'ar' ? 'شحن أرامكس' : 'Aramex Shipping'}</span>
        </CardTitle>
        <CardDescription>
          {language === 'ar' 
            ? 'شحن سريع وآمن عبر أرامكس' 
            : 'Fast and secure delivery by Aramex'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {calculating && (
          <div className="flex items-center gap-2 text-blue-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>
              {language === 'ar' 
                ? 'جاري حساب تكلفة الشحن...' 
                : 'Calculating shipping cost...'}
            </span>
          </div>
        )}

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        {rate && !calculating && !error && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-md">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-600" />
                <span className="font-medium">
                  {language === 'ar' ? 'تكلفة الشحن:' : 'Shipping Cost:'}
                </span>
              </div>
              <span className="font-bold text-blue-700">
                {rate.amount.toFixed(2)} {rate.currency}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>
                {language === 'ar' 
                  ? `التسليم إلى: ${shippingAddress.city}, ${shippingAddress.country}`
                  : `Delivery to: ${shippingAddress.city}, ${shippingAddress.country}`}
              </span>
            </div>
            
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              {language === 'ar' ? (
                <>
                  ⚡ شحن سريع 1-3 أيام عمل
                  <br />
                  📍 إمكانية التتبع عبر الإنترنت
                  <br />
                  🛡️ تأمين كامل للشحنة
                </>
              ) : (
                <>
                  ⚡ Express delivery 1-3 business days
                  <br />
                  📍 Online tracking available
                  <br />
                  🛡️ Full shipment insurance
                </>
              )}
            </div>
          </div>
        )}

        {!calculating && !rate && !error && shippingAddress.city && (
          <Button 
            onClick={handleCalculateRate}
            variant="outline"
            className="w-full"
          >
            {language === 'ar' ? 'احسب تكلفة الشحن' : 'Calculate Shipping Cost'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};