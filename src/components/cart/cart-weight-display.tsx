import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Scale, Package } from 'lucide-react';
import { getWeightDisplayString, calculateCartItemWeight, formatWeightDisplay } from '@/utils/weight-calculator';
import type { CartItem, Product } from '@/lib/firebase';

interface CartWeightDisplayProps {
  cartItems: CartItem[];
  products: Product[];
  language?: 'en' | 'ar';
}

export const CartWeightDisplay: React.FC<CartWeightDisplayProps> = ({
  cartItems,
  products,
  language = 'en',
}) => {
  // Calculate total weight
  const totalWeight = cartItems.reduce((total, item) => {
    const product = products.find(p => p.id === item.product_id);
    if (!product) return total;
    
    const itemWeight = calculateCartItemWeight(item, product);
    return total + (itemWeight * item.quantity);
  }, 0);

  const getTexts = () => {
    if (language === 'ar') {
      return {
        title: 'وزن السلة',
        description: 'إجمالي وزن المنتجات المحددة',
        totalWeight: 'الوزن الإجمالي',
        itemWeight: 'وزن القطعة',
        selectedSize: 'الحجم المحدد',
      };
    } else {
      return {
        title: 'Cart Weight',
        description: 'Total weight of selected products',
        totalWeight: 'Total Weight',
        itemWeight: 'Item Weight',
        selectedSize: 'Selected Size',
      };
    }
  };

  const texts = getTexts();

  return (
    <Card className="border-green-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-green-700">
          <Scale className="h-5 w-5" />
          <span>{texts.title}</span>
        </CardTitle>
        <CardDescription>
          {texts.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Weight */}
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-md">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-green-600" />
            <span className="font-medium">{texts.totalWeight}:</span>
          </div>
          <Badge variant="outline" className="text-green-700 border-green-300">
            {formatWeightDisplay(totalWeight, language)}
          </Badge>
        </div>

        {/* Individual Items */}
        <div className="space-y-2">
          {cartItems.map((item, index) => {
            const product = products.find(p => p.id === item.product_id);
            if (!product) return null;

            const itemWeight = calculateCartItemWeight(item, product);
            const weightDisplay = getWeightDisplayString(item, product, language);

            return (
              <div key={index} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                <div className="flex-1">
                  <div className="font-medium">
                    {language === 'ar' ? product.name_ar : product.name}
                  </div>
                  <div className="text-gray-600">
                    {texts.selectedSize}: {weightDisplay}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {item.quantity} × {formatWeightDisplay(itemWeight, language)}
                  </div>
                  <div className="text-gray-600">
                    = {formatWeightDisplay(itemWeight * item.quantity, language)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Shipping Note */}
        <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
          {language === 'ar' ? (
            <>
              💡 يتم حساب تكلفة الشحن بناءً على الوزن الإجمالي للطلب
              <br />
              📦 الحد الأدنى للوزن للشحن: 100 جرام
            </>
          ) : (
            <>
              💡 Shipping cost is calculated based on total order weight
              <br />
              📦 Minimum shipping weight: 100g
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};