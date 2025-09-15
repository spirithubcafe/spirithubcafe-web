# SpiritHub Cafe API Documentation

Firebase Functions API برای اپلیکیشن موبایل SpiritHub Cafe

## Authentication

همه APIها به authentication نیاز دارند مگر اینکه مشخص شده باشد. برای admin functions باید user role برابر با `admin` یا `shop_owner` باشد.

## Available APIs

### 👤 User Management

#### getUsers
- **Method**: Callable Function
- **Auth**: Admin Required
- **Description**: دریافت لیست تمام کاربران
- **Response**: `{ success: true, data: User[] }`

#### getUserById
- **Method**: Callable Function
- **Auth**: Required
- **Parameters**: `{ userId: string }`
- **Description**: دریافت اطلاعات یک کاربر خاص
- **Response**: `{ success: true, data: User }`

#### updateUser
- **Method**: Callable Function
- **Auth**: Required (Own profile or Admin)
- **Parameters**: `{ userId: string, userData: object }`
- **Description**: بروزرسانی اطلاعات کاربر
- **Response**: `{ success: true, message: string }`

#### deleteUser
- **Method**: Callable Function
- **Auth**: Admin Required
- **Parameters**: `{ userId: string }`
- **Description**: حذف کاربر
- **Response**: `{ success: true, message: string }`

---

### 📁 Categories

#### getCategories
- **Method**: Callable Function
- **Auth**: None
- **Description**: دریافت دسته بندی های فعال
- **Response**: `{ success: true, data: Category[] }`

#### getAllCategories
- **Method**: Callable Function
- **Auth**: Admin Required
- **Description**: دریافت تمام دسته بندی ها (شامل غیرفعال ها)
- **Response**: `{ success: true, data: Category[] }`

#### getCategoryById
- **Method**: Callable Function
- **Auth**: None
- **Parameters**: `{ categoryId: string }`
- **Description**: دریافت اطلاعات یک دسته بندی
- **Response**: `{ success: true, data: Category }`

#### createCategory
- **Method**: Callable Function
- **Auth**: Admin Required
- **Parameters**: `{ categoryData: object }`
- **Description**: ایجاد دسته بندی جدید
- **Response**: `{ success: true, data: Category }`

#### updateCategory
- **Method**: Callable Function
- **Auth**: Admin Required
- **Parameters**: `{ categoryId: string, categoryData: object }`
- **Description**: بروزرسانی دسته بندی
- **Response**: `{ success: true, message: string }`

#### deleteCategory
- **Method**: Callable Function
- **Auth**: Admin Required
- **Parameters**: `{ categoryId: string }`
- **Description**: حذف دسته بندی
- **Response**: `{ success: true, message: string }`

---

### 🛍️ Products

#### getProducts
- **Method**: Callable Function
- **Auth**: None
- **Parameters**: `{ categoryId?: string, limit?: number, offset?: number, filters?: object }`
- **Description**: دریافت محصولات فعال
- **Response**: `{ success: true, data: Product[] }`

#### getAllProducts
- **Method**: Callable Function
- **Auth**: Admin Required
- **Description**: دریافت تمام محصولات (شامل غیرفعال ها)
- **Response**: `{ success: true, data: Product[] }`

#### getProductById
- **Method**: Callable Function
- **Auth**: None
- **Parameters**: `{ productId: string }`
- **Description**: دریافت اطلاعات یک محصول
- **Response**: `{ success: true, data: Product }`

#### createProduct
- **Method**: Callable Function
- **Auth**: Admin Required
- **Parameters**: `{ productData: object }`
- **Description**: ایجاد محصول جدید
- **Response**: `{ success: true, data: Product }`

#### updateProduct
- **Method**: Callable Function
- **Auth**: Admin Required
- **Parameters**: `{ productId: string, productData: object }`
- **Description**: بروزرسانی محصول
- **Response**: `{ success: true, message: string }`

#### deleteProduct
- **Method**: Callable Function
- **Auth**: Admin Required
- **Parameters**: `{ productId: string }`
- **Description**: حذف محصول
- **Response**: `{ success: true, message: string }`

#### searchProducts
- **Method**: Callable Function
- **Auth**: None
- **Parameters**: `{ searchTerm: string, categoryId?: string, limit?: number }`
- **Description**: جستجوی محصولات
- **Response**: `{ success: true, data: Product[] }`

---

### 📋 Orders

#### getOrders
- **Method**: Callable Function
- **Auth**: Required
- **Parameters**: `{ limit?: number, offset?: number, userId?: string }`
- **Description**: دریافت سفارشات (کاربر فقط سفارشات خود، ادمین همه)
- **Response**: `{ success: true, data: Order[] }`

#### getOrderById
- **Method**: Callable Function
- **Auth**: Required
- **Parameters**: `{ orderId: string }`
- **Description**: دریافت اطلاعات یک سفارش
- **Response**: `{ success: true, data: Order }`

#### createOrder
- **Method**: Callable Function
- **Auth**: Required
- **Parameters**: `{ orderData: object }`
- **Description**: ایجاد سفارش جدید
- **Response**: `{ success: true, data: Order }`

#### updateOrder
- **Method**: Callable Function
- **Auth**: Admin Required
- **Parameters**: `{ orderId: string, orderData: object }`
- **Description**: بروزرسانی سفارش
- **Response**: `{ success: true, message: string }`

#### deleteOrder
- **Method**: Callable Function
- **Auth**: Admin Required
- **Parameters**: `{ orderId: string }`
- **Description**: حذف سفارش
- **Response**: `{ success: true, message: string }`

---

### 🛒 Cart

#### getCart
- **Method**: Callable Function
- **Auth**: Required
- **Description**: دریافت سبد خرید کاربر
- **Response**: `{ success: true, data: CartItem[] }`

#### addToCart
- **Method**: Callable Function
- **Auth**: Required
- **Parameters**: `{ productId: string, quantity: number, selectedProperties?: object }`
- **Description**: افزودن محصول به سبد خرید
- **Response**: `{ success: true, data: CartItem }`

#### updateCartItem
- **Method**: Callable Function
- **Auth**: Required
- **Parameters**: `{ cartItemId: string, quantity: number }`
- **Description**: بروزرسانی تعداد آیتم در سبد خرید
- **Response**: `{ success: true, message: string }`

#### removeFromCart
- **Method**: Callable Function
- **Auth**: Required
- **Parameters**: `{ cartItemId: string }`
- **Description**: حذف آیتم از سبد خرید
- **Response**: `{ success: true, message: string }`

#### clearCart
- **Method**: Callable Function
- **Auth**: Required
- **Description**: پاک کردن کل سبد خرید
- **Response**: `{ success: true, message: string }`

---

### ❤️ Wishlist

#### getWishlist
- **Method**: Callable Function
- **Auth**: Required
- **Description**: دریافت لیست علاقه مندی ها
- **Response**: `{ success: true, data: WishlistItem[] }`

#### addToWishlist
- **Method**: Callable Function
- **Auth**: Required
- **Parameters**: `{ productId: string }`
- **Description**: افزودن به لیست علاقه مندی ها
- **Response**: `{ success: true, data: WishlistItem }`

#### removeFromWishlist
- **Method**: Callable Function
- **Auth**: Required
- **Parameters**: `{ productId: string }`
- **Description**: حذف از لیست علاقه مندی ها
- **Response**: `{ success: true, message: string }`

---

### ⭐ Reviews

#### getProductReviews
- **Method**: Callable Function
- **Auth**: None
- **Parameters**: `{ productId: string, limit?: number, offset?: number }`
- **Description**: دریافت نظرات محصول
- **Response**: `{ success: true, data: Review[] }`

#### createReview
- **Method**: Callable Function
- **Auth**: Required
- **Parameters**: `{ productId: string, rating: number, title?: string, reviewText?: string }`
- **Description**: ایجاد نظر جدید
- **Response**: `{ success: true, data: Review }`

#### updateReview
- **Method**: Callable Function
- **Auth**: Required (Own review or Admin)
- **Parameters**: `{ reviewId: string, reviewData: object }`
- **Description**: بروزرسانی نظر
- **Response**: `{ success: true, message: string }`

#### deleteReview
- **Method**: Callable Function
- **Auth**: Required (Own review or Admin)
- **Parameters**: `{ reviewId: string }`
- **Description**: حذف نظر
- **Response**: `{ success: true, message: string }`

---

### 📄 Pages (Static Content)

#### getPages
- **Method**: Callable Function
- **Auth**: None
- **Description**: دریافت صفحات فعال
- **Response**: `{ success: true, data: Page[] }`

#### getPageBySlug
- **Method**: Callable Function
- **Auth**: None
- **Parameters**: `{ slug: string }`
- **Description**: دریافت صفحه با slug
- **Response**: `{ success: true, data: Page }`

#### createPage
- **Method**: Callable Function
- **Auth**: Admin Required
- **Parameters**: `{ pageData: object }`
- **Description**: ایجاد صفحه جدید
- **Response**: `{ success: true, data: Page }`

#### updatePage
- **Method**: Callable Function
- **Auth**: Admin Required
- **Parameters**: `{ pageId: string, pageData: object }`
- **Description**: بروزرسانی صفحه
- **Response**: `{ success: true, message: string }`

#### deletePage
- **Method**: Callable Function
- **Auth**: Admin Required
- **Parameters**: `{ pageId: string }`
- **Description**: حذف صفحه
- **Response**: `{ success: true, message: string }`

---

### 📧 Newsletter

#### subscribeNewsletter
- **Method**: Callable Function
- **Auth**: None
- **Parameters**: `{ email: string, language?: string }`
- **Description**: عضویت در خبرنامه
- **Response**: `{ success: true, data: object }`

#### unsubscribeNewsletter
- **Method**: Callable Function
- **Auth**: None
- **Parameters**: `{ email: string }`
- **Description**: لغو عضویت از خبرنامه
- **Response**: `{ success: true, message: string }`

---

### ⚙️ Settings

#### getSettings
- **Method**: Callable Function
- **Auth**: None
- **Description**: دریافت تنظیمات عمومی
- **Response**: `{ success: true, data: object }`

#### updateSettings
- **Method**: Callable Function
- **Auth**: Admin Required
- **Parameters**: `{ settingsData: object }`
- **Description**: بروزرسانی تنظیمات
- **Response**: `{ success: true, message: string }`

---

### 📊 Statistics (Admin Only)

#### getDashboardStats
- **Method**: Callable Function
- **Auth**: Admin Required
- **Description**: دریافت آمار داشبورد
- **Response**: 
```json
{
  "success": true,
  "data": {
    "totalUsers": number,
    "totalProducts": number,
    "totalOrders": number,
    "totalCategories": number,
    "recentOrders": number
  }
}
```

---

## Error Handling

تمام APIها از HttpsError استفاده می کنند:

- `unauthenticated`: کاربر احراز هویت نشده
- `permission-denied`: دسترسی مجاز نیست
- `not-found`: آیتم پیدا نشد
- `already-exists`: آیتم از قبل موجود است
- `internal`: خطای داخلی سرور

## Usage Example (React Native)

```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();

// Get products
const getProducts = httpsCallable(functions, 'getProducts');
const result = await getProducts({ categoryId: 'category123', limit: 10 });
console.log(result.data.data); // Products array

// Add to cart
const addToCart = httpsCallable(functions, 'addToCart');
await addToCart({ 
  productId: 'product123', 
  quantity: 2,
  selectedProperties: { size: 'L', color: 'blue' }
});
```

## Deployment

```bash
cd functions
npm run build
firebase deploy --only functions
```

این API کامل برای پیاده سازی اپلیکیشن موبایل SpiritHub Cafe آماده است.