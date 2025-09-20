import type { CartItem, Product, ProductProperty, ProductPropertyOption } from '@/lib/firebase';

/**
 * Helper functions for calculating product weight based on advanced properties
 * Uses 'size' property type for weight management
 */

// Get weight property from product properties (using size type)
export const getWeightProperty = (product: Product): ProductProperty | null => {
  if (!product.properties) return null;
  
  return product.properties.find(prop => 
    prop.type === 'size' && (
      prop.name.toLowerCase().includes('weight') ||
      prop.name.toLowerCase().includes('size') ||
      prop.name.toLowerCase().includes('وزن') ||
      prop.name_ar?.includes('وزن') ||
      prop.name_ar?.includes('حجم') ||
      prop.name_ar?.includes('كجم') ||
      prop.name_ar?.includes('جرام')
    )
  ) || null;
};

// Get selected weight option from cart item
export const getSelectedWeightOption = (
  cartItem: CartItem, 
  product: Product
): ProductPropertyOption | null => {
  const weightProperty = getWeightProperty(product);
  if (!weightProperty) return null;

  // Check new detailed property selection
  if (cartItem.selectedPropertyOptions) {
    const selectedWeight = cartItem.selectedPropertyOptions.find(
      option => option.property_id === weightProperty.id
    );
    
    if (selectedWeight) {
      return weightProperty.options.find(
        option => option.id === selectedWeight.option_id
      ) || null;
    }
  }

  // Fallback to legacy selection
  if (cartItem.selectedProperties && weightProperty.id && cartItem.selectedProperties[weightProperty.id]) {
    const selectedOptionId = cartItem.selectedProperties[weightProperty.id];
    return weightProperty.options.find(option => option.id === selectedOptionId) || null;
  }

  // Return first available option as default
  return weightProperty.options[0] || null;
};

// Calculate actual weight from cart item
export const calculateCartItemWeight = (cartItem: CartItem, product: Product): number => {
  // Try to get weight from properties first
  const selectedWeightOption = getSelectedWeightOption(cartItem, product);
  
  if (selectedWeightOption) {
    // Parse weight value from option
    const weightValue = parseWeightFromOption(selectedWeightOption);
    if (weightValue > 0) {
      return weightValue;
    }
  }

  // Fallback to product base weight
  if (product.weight && product.weight > 0) {
    return product.weight;
  }

  // Default weight for coffee products
  return getDefaultWeightByCategory(product.category_id);
};

// Parse weight value from property option
export const parseWeightFromOption = (option: ProductPropertyOption): number => {
  // Try to extract weight from value and labels
  let weightStr = option.value || option.label || option.label_ar || '';
  
  // Remove weight labels in multiple languages
  weightStr = weightStr
    .toLowerCase()
    .replace(/weight|size|وزن|حجم|gram|grams|كجم|جرام|g|kg|kilogram|kilograms/gi, '')
    .trim();

  // Extract number
  const match = weightStr.match(/(\d+(?:\.\d+)?)/);
  if (match) {
    let weight = parseFloat(match[1]);
    
    // Convert to kg if needed
    const originalStr = (option.value || option.label || option.label_ar || '').toLowerCase();
    if ((originalStr.includes('g') && !originalStr.includes('kg')) || 
        originalStr.includes('جرام') || 
        originalStr.includes('gram')) {
      if (weight > 10) {
        // Likely in grams, convert to kg
        weight = weight / 1000;
      }
    }
    
    return weight;
  }

  return 0;
};

// Get default weight based on product category
export const getDefaultWeightByCategory = (categoryId: string): number => {
  // Default weights for different product categories
  const categoryWeights: Record<string, number> = {
    'coffee-beans': 0.25,      // 250g default for coffee beans
    'ground-coffee': 0.25,     // 250g default for ground coffee
    'capsules': 0.1,           // 100g default for capsules
    'equipment': 1.0,          // 1kg default for equipment
    'accessories': 0.5,        // 500g default for accessories
    'apparel': 0.3,           // 300g default for apparel
  };

  return categoryWeights[categoryId] || 0.5; // Default 500g
};

// Calculate total weight for cart items
export const calculateTotalCartWeight = (cartItems: CartItem[], products: Product[]): number => {
  return cartItems.reduce((totalWeight, cartItem) => {
    const product = products.find(p => p.id === cartItem.product_id);
    if (!product) {
      return totalWeight + (0.5 * cartItem.quantity); // Default fallback
    }

    const itemWeight = calculateCartItemWeight(cartItem, product);
    return totalWeight + (itemWeight * cartItem.quantity);
  }, 0);
};

// Get weight display string for UI
export const getWeightDisplayString = (cartItem: CartItem, product: Product, language: 'en' | 'ar' = 'en'): string => {
  const selectedWeightOption = getSelectedWeightOption(cartItem, product);
  
  if (selectedWeightOption) {
    return language === 'ar' 
      ? selectedWeightOption.label_ar || selectedWeightOption.label || selectedWeightOption.value || ''
      : selectedWeightOption.label || selectedWeightOption.value || '';
  }

  if (product.weight) {
    if (language === 'ar') {
      return product.weight >= 1 
        ? `${product.weight} كيلوجرام`
        : `${product.weight * 1000} جرام`;
    } else {
      return product.weight >= 1 
        ? `${product.weight} kg`
        : `${product.weight * 1000} g`;
    }
  }

  return language === 'ar' ? 'الوزن غير محدد' : 'Weight not specified';
};

// Validate weight for shipping
export const validateWeightForShipping = (weight: number): { isValid: boolean; error?: string } => {
  if (weight <= 0) {
    return { 
      isValid: false, 
      error: 'Weight must be greater than zero / يجب أن يكون الوزن أكبر من الصفر' 
    };
  }

  if (weight > 50) {
    return { 
      isValid: false, 
      error: 'Weight exceeds maximum limit (50kg) / الوزن يتجاوز الحد الأقصى (50 كجم)' 
    };
  }

  return { isValid: true };
};

// Get shipping weight with minimum requirements
export const getShippingWeight = (cartWeight: number): number => {
  // Aramex minimum weight requirement
  const minimumWeight = 0.1; // 100g
  return Math.max(cartWeight, minimumWeight);
};

// Helper function to get weight unit display
export const getWeightUnitDisplay = (weight: number, language: 'en' | 'ar' = 'en'): string => {
  if (language === 'ar') {
    return weight >= 1 ? 'كيلوجرام' : 'جرام';
  } else {
    return weight >= 1 ? 'kg' : 'g';
  }
};

// Helper function to format weight for display
export const formatWeightDisplay = (weight: number, language: 'en' | 'ar' = 'en'): string => {
  const displayWeight = weight >= 1 ? weight : weight * 1000;
  const unit = getWeightUnitDisplay(weight, language);
  
  return `${displayWeight.toFixed(displayWeight >= 1 ? 1 : 0)} ${unit}`;
};