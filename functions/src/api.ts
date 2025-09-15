import * as admin from 'firebase-admin';
import { onCall } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2';
import * as logger from 'firebase-functions/logger';
import { HttpsError } from 'firebase-functions/v2/https';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Set global options
setGlobalOptions({
  maxInstances: 10,
  region: 'us-central1',
});

// Helper function for authentication
const verifyAuth = async (context: any) => {
  if (!context.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }
  return context.auth;
};

// Helper function for admin check
const verifyAdmin = async (context: any) => {
  const auth = await verifyAuth(context);
  const userDoc = await db.collection('users').doc(auth.uid).get();
  const userData = userDoc.data();
  
  if (!userData || !['admin', 'shop_owner'].includes(userData.role)) {
    throw new HttpsError('permission-denied', 'User must be admin or shop owner');
  }
  
  return auth;
};

// =============================================================================
// USER MANAGEMENT API
// =============================================================================

export const getUsers = onCall(async (request) => {
  await verifyAdmin(request);
  
  try {
    const snapshot = await db.collection('users').get();
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { success: true, data: users };
  } catch (error) {
    logger.error('Error fetching users:', error);
    throw new HttpsError('internal', 'Failed to fetch users');
  }
});

export const getUserById = onCall(async (request) => {
  const { userId } = request.data;
  await verifyAuth(request);
  
  try {
    const doc = await db.collection('users').doc(userId).get();
    if (!doc.exists) {
      throw new HttpsError('not-found', 'User not found');
    }
    
    return { success: true, data: { id: doc.id, ...doc.data() } };
  } catch (error) {
    logger.error('Error fetching user:', error);
    throw new HttpsError('internal', 'Failed to fetch user');
  }
});

export const updateUser = onCall(async (request) => {
  const { userId, userData } = request.data;
  const auth = await verifyAuth(request);
  
  // Users can only update their own profile unless they're admin
  if (userId !== auth.uid) {
    await verifyAdmin(request);
  }
  
  try {
    await db.collection('users').doc(userId).update({
      ...userData,
      updated: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { success: true, message: 'User updated successfully' };
  } catch (error) {
    logger.error('Error updating user:', error);
    throw new HttpsError('internal', 'Failed to update user');
  }
});

export const deleteUser = onCall(async (request) => {
  const { userId } = request.data;
  await verifyAdmin(request);
  
  try {
    await db.collection('users').doc(userId).delete();
    return { success: true, message: 'User deleted successfully' };
  } catch (error) {
    logger.error('Error deleting user:', error);
    throw new HttpsError('internal', 'Failed to delete user');
  }
});

// =============================================================================
// CATEGORIES API
// =============================================================================

export const getCategories = onCall(async (request) => {
  try {
    const snapshot = await db.collection('categories')
      .where('is_active', '==', true)
      .orderBy('sort_order')
      .get();
    
    const categories = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { success: true, data: categories };
  } catch (error) {
    logger.error('Error fetching categories:', error);
    throw new HttpsError('internal', 'Failed to fetch categories');
  }
});

export const getAllCategories = onCall(async (request) => {
  await verifyAdmin(request);
  
  try {
    const snapshot = await db.collection('categories').orderBy('sort_order').get();
    const categories = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { success: true, data: categories };
  } catch (error) {
    logger.error('Error fetching all categories:', error);
    throw new HttpsError('internal', 'Failed to fetch categories');
  }
});

export const getCategoryById = onCall(async (request) => {
  const { categoryId } = request.data;
  
  try {
    const doc = await db.collection('categories').doc(categoryId).get();
    if (!doc.exists) {
      throw new HttpsError('not-found', 'Category not found');
    }
    
    return { success: true, data: { id: doc.id, ...doc.data() } };
  } catch (error) {
    logger.error('Error fetching category:', error);
    throw new HttpsError('internal', 'Failed to fetch category');
  }
});

export const createCategory = onCall(async (request) => {
  const { categoryData } = request.data;
  await verifyAdmin(request);
  
  try {
    const docRef = await db.collection('categories').add({
      ...categoryData,
      created: admin.firestore.FieldValue.serverTimestamp(),
      updated: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { success: true, data: { id: docRef.id, ...categoryData } };
  } catch (error) {
    logger.error('Error creating category:', error);
    throw new HttpsError('internal', 'Failed to create category');
  }
});

export const updateCategory = onCall(async (request) => {
  const { categoryId, categoryData } = request.data;
  await verifyAdmin(request);
  
  try {
    await db.collection('categories').doc(categoryId).update({
      ...categoryData,
      updated: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { success: true, message: 'Category updated successfully' };
  } catch (error) {
    logger.error('Error updating category:', error);
    throw new HttpsError('internal', 'Failed to update category');
  }
});

export const deleteCategory = onCall(async (request) => {
  const { categoryId } = request.data;
  await verifyAdmin(request);
  
  try {
    await db.collection('categories').doc(categoryId).delete();
    return { success: true, message: 'Category deleted successfully' };
  } catch (error) {
    logger.error('Error deleting category:', error);
    throw new HttpsError('internal', 'Failed to delete category');
  }
});

// =============================================================================
// PRODUCTS API
// =============================================================================

export const getProducts = onCall(async (request) => {
  const { categoryId, limit = 50, offset = 0, filters = {} } = request.data || {};
  
  try {
    let query = db.collection('products').where('is_active', '==', true);
    
    if (categoryId) {
      query = query.where('category_id', '==', categoryId);
    }
    
    // Apply additional filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.where(key, '==', value);
      }
    });
    
    const snapshot = await query
      .orderBy('sort_order')
      .limit(limit)
      .offset(offset)
      .get();
    
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { success: true, data: products };
  } catch (error) {
    logger.error('Error fetching products:', error);
    throw new HttpsError('internal', 'Failed to fetch products');
  }
});

export const getAllProducts = onCall(async (request) => {
  await verifyAdmin(request);
  
  try {
    const snapshot = await db.collection('products').orderBy('sort_order').get();
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { success: true, data: products };
  } catch (error) {
    logger.error('Error fetching all products:', error);
    throw new HttpsError('internal', 'Failed to fetch products');
  }
});

export const getProductById = onCall(async (request) => {
  const { productId } = request.data;
  
  try {
    const doc = await db.collection('products').doc(productId).get();
    if (!doc.exists) {
      throw new HttpsError('not-found', 'Product not found');
    }
    
    return { success: true, data: { id: doc.id, ...doc.data() } };
  } catch (error) {
    logger.error('Error fetching product:', error);
    throw new HttpsError('internal', 'Failed to fetch product');
  }
});

export const createProduct = onCall(async (request) => {
  const { productData } = request.data;
  await verifyAdmin(request);
  
  try {
    const docRef = await db.collection('products').add({
      ...productData,
      created: admin.firestore.FieldValue.serverTimestamp(),
      updated: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { success: true, data: { id: docRef.id, ...productData } };
  } catch (error) {
    logger.error('Error creating product:', error);
    throw new HttpsError('internal', 'Failed to create product');
  }
});

export const updateProduct = onCall(async (request) => {
  const { productId, productData } = request.data;
  await verifyAdmin(request);
  
  try {
    await db.collection('products').doc(productId).update({
      ...productData,
      updated: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { success: true, message: 'Product updated successfully' };
  } catch (error) {
    logger.error('Error updating product:', error);
    throw new HttpsError('internal', 'Failed to update product');
  }
});

export const deleteProduct = onCall(async (request) => {
  const { productId } = request.data;
  await verifyAdmin(request);
  
  try {
    await db.collection('products').doc(productId).delete();
    return { success: true, message: 'Product deleted successfully' };
  } catch (error) {
    logger.error('Error deleting product:', error);
    throw new HttpsError('internal', 'Failed to delete product');
  }
});

// Search products
export const searchProducts = onCall(async (request) => {
  const { searchTerm, categoryId, limit = 20 } = request.data;
  
  try {
    let query = db.collection('products').where('is_active', '==', true);
    
    if (categoryId) {
      query = query.where('category_id', '==', categoryId);
    }
    
    const snapshot = await query.limit(limit).get();
    
    // Client-side filtering for search term (Firestore doesn't support full-text search)
    const products = snapshot.docs
      .map((doc: any) => ({ id: doc.id, ...doc.data() }))
      .filter((product: any) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
          product.name?.toLowerCase().includes(term) ||
          product.name_ar?.includes(term) ||
          product.description?.toLowerCase().includes(term) ||
          product.description_ar?.includes(term)
        );
      });
    
    return { success: true, data: products };
  } catch (error) {
    logger.error('Error searching products:', error);
    throw new HttpsError('internal', 'Failed to search products');
  }
});

// =============================================================================
// ORDERS API
// =============================================================================

export const getOrders = onCall(async (request) => {
  const auth = await verifyAuth(request);
  const { limit = 50, offset = 0, userId } = request.data || {};
  
  try {
    let query: any = db.collection('orders');
    
    // If not admin, only show user's own orders
    if (userId) {
      // Admin can query by userId
      await verifyAdmin(request);
      query = query.where('user_id', '==', userId);
    } else {
      // Regular users can only see their own orders
      const userDoc = await db.collection('users').doc(auth.uid).get();
      const userData = userDoc.data();
      
      if (!userData || !['admin', 'shop_owner'].includes(userData.role)) {
        query = query.where('user_id', '==', auth.uid);
      }
    }
    
    const snapshot = await query
      .orderBy('created', 'desc')
      .limit(limit)
      .offset(offset)
      .get();
    
    const orders = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { success: true, data: orders };
  } catch (error) {
    logger.error('Error fetching orders:', error);
    throw new HttpsError('internal', 'Failed to fetch orders');
  }
});

export const getOrderById = onCall(async (request) => {
  const { orderId } = request.data;
  const auth = await verifyAuth(request);
  
  try {
    const doc = await db.collection('orders').doc(orderId).get();
    if (!doc.exists) {
      throw new HttpsError('not-found', 'Order not found');
    }
    
    const orderData = doc.data();
    
    // Check if user can access this order
    const userDoc = await db.collection('users').doc(auth.uid).get();
    const userData = userDoc.data();
    
    if (!userData || !['admin', 'shop_owner'].includes(userData.role)) {
      if (orderData?.user_id !== auth.uid) {
        throw new HttpsError('permission-denied', 'Access denied');
      }
    }
    
    return { success: true, data: { id: doc.id, ...orderData } };
  } catch (error) {
    logger.error('Error fetching order:', error);
    throw new HttpsError('internal', 'Failed to fetch order');
  }
});

export const createOrder = onCall(async (request) => {
  const { orderData } = request.data;
  const auth = await verifyAuth(request);
  
  try {
    const docRef = await db.collection('orders').add({
      ...orderData,
      user_id: auth.uid,
      created: admin.firestore.FieldValue.serverTimestamp(),
      updated: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { success: true, data: { id: docRef.id, ...orderData } };
  } catch (error) {
    logger.error('Error creating order:', error);
    throw new HttpsError('internal', 'Failed to create order');
  }
});

export const updateOrder = onCall(async (request) => {
  const { orderId, orderData } = request.data;
  await verifyAdmin(request);
  
  try {
    await db.collection('orders').doc(orderId).update({
      ...orderData,
      updated: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { success: true, message: 'Order updated successfully' };
  } catch (error) {
    logger.error('Error updating order:', error);
    throw new HttpsError('internal', 'Failed to update order');
  }
});

export const deleteOrder = onCall(async (request) => {
  const { orderId } = request.data;
  await verifyAdmin(request);
  
  try {
    await db.collection('orders').doc(orderId).delete();
    return { success: true, message: 'Order deleted successfully' };
  } catch (error) {
    logger.error('Error deleting order:', error);
    throw new HttpsError('internal', 'Failed to delete order');
  }
});

// =============================================================================
// CART API
// =============================================================================

export const getCart = onCall(async (request) => {
  const auth = await verifyAuth(request);
  
  try {
    const snapshot = await db.collection('cart')
      .where('user_id', '==', auth.uid)
      .get();
    
    const cartItems = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { success: true, data: cartItems };
  } catch (error) {
    logger.error('Error fetching cart:', error);
    throw new HttpsError('internal', 'Failed to fetch cart');
  }
});

export const addToCart = onCall(async (request) => {
  const { productId, quantity, selectedProperties } = request.data;
  const auth = await verifyAuth(request);
  
  try {
    const docRef = await db.collection('cart').add({
      user_id: auth.uid,
      product_id: productId,
      quantity,
      selectedProperties: selectedProperties || {},
      created: admin.firestore.FieldValue.serverTimestamp(),
      updated: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { success: true, data: { id: docRef.id, user_id: auth.uid, product_id: productId, quantity } };
  } catch (error) {
    logger.error('Error adding to cart:', error);
    throw new HttpsError('internal', 'Failed to add to cart');
  }
});

export const updateCartItem = onCall(async (request) => {
  const { cartItemId, quantity } = request.data;
  const auth = await verifyAuth(request);
  
  try {
    // Verify ownership
    const doc = await db.collection('cart').doc(cartItemId).get();
    if (!doc.exists) {
      throw new HttpsError('not-found', 'Cart item not found');
    }
    
    const cartData = doc.data();
    if (cartData?.user_id !== auth.uid) {
      throw new HttpsError('permission-denied', 'Access denied');
    }
    
    await db.collection('cart').doc(cartItemId).update({
      quantity,
      updated: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { success: true, message: 'Cart item updated successfully' };
  } catch (error) {
    logger.error('Error updating cart item:', error);
    throw new HttpsError('internal', 'Failed to update cart item');
  }
});

export const removeFromCart = onCall(async (request) => {
  const { cartItemId } = request.data;
  const auth = await verifyAuth(request);
  
  try {
    // Verify ownership
    const doc = await db.collection('cart').doc(cartItemId).get();
    if (!doc.exists) {
      throw new HttpsError('not-found', 'Cart item not found');
    }
    
    const cartData = doc.data();
    if (cartData?.user_id !== auth.uid) {
      throw new HttpsError('permission-denied', 'Access denied');
    }
    
    await db.collection('cart').doc(cartItemId).delete();
    return { success: true, message: 'Item removed from cart' };
  } catch (error) {
    logger.error('Error removing from cart:', error);
    throw new HttpsError('internal', 'Failed to remove from cart');
  }
});

export const clearCart = onCall(async (request) => {
  const auth = await verifyAuth(request);
  
  try {
    const snapshot = await db.collection('cart')
      .where('user_id', '==', auth.uid)
      .get();
    
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    return { success: true, message: 'Cart cleared successfully' };
  } catch (error) {
    logger.error('Error clearing cart:', error);
    throw new HttpsError('internal', 'Failed to clear cart');
  }
});

// =============================================================================
// WISHLIST API
// =============================================================================

export const getWishlist = onCall(async (request) => {
  const auth = await verifyAuth(request);
  
  try {
    const snapshot = await db.collection('wishlist')
      .where('user_id', '==', auth.uid)
      .get();
    
    const wishlistItems = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { success: true, data: wishlistItems };
  } catch (error) {
    logger.error('Error fetching wishlist:', error);
    throw new HttpsError('internal', 'Failed to fetch wishlist');
  }
});

export const addToWishlist = onCall(async (request) => {
  const { productId } = request.data;
  const auth = await verifyAuth(request);
  
  try {
    // Check if already in wishlist
    const existing = await db.collection('wishlist')
      .where('user_id', '==', auth.uid)
      .where('product_id', '==', productId)
      .get();
    
    if (!existing.empty) {
      throw new HttpsError('already-exists', 'Product already in wishlist');
    }
    
    const docRef = await db.collection('wishlist').add({
      user_id: auth.uid,
      product_id: productId,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { success: true, data: { id: docRef.id, user_id: auth.uid, product_id: productId } };
  } catch (error) {
    logger.error('Error adding to wishlist:', error);
    throw new HttpsError('internal', 'Failed to add to wishlist');
  }
});

export const removeFromWishlist = onCall(async (request) => {
  const { productId } = request.data;
  const auth = await verifyAuth(request);
  
  try {
    const snapshot = await db.collection('wishlist')
      .where('user_id', '==', auth.uid)
      .where('product_id', '==', productId)
      .get();
    
    if (snapshot.empty) {
      throw new HttpsError('not-found', 'Product not in wishlist');
    }
    
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    return { success: true, message: 'Product removed from wishlist' };
  } catch (error) {
    logger.error('Error removing from wishlist:', error);
    throw new HttpsError('internal', 'Failed to remove from wishlist');
  }
});

// =============================================================================
// REVIEWS API
// =============================================================================

export const getProductReviews = onCall(async (request) => {
  const { productId, limit = 20, offset = 0 } = request.data;
  
  try {
    const snapshot = await db.collection('reviews')
      .where('product_id', '==', productId)
      .where('is_approved', '==', true)
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset)
      .get();
    
    const reviews = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { success: true, data: reviews };
  } catch (error) {
    logger.error('Error fetching reviews:', error);
    throw new HttpsError('internal', 'Failed to fetch reviews');
  }
});

export const createReview = onCall(async (request) => {
  const { productId, rating, title, reviewText } = request.data;
  const auth = await verifyAuth(request);
  
  try {
    // Check if user already reviewed this product
    const existing = await db.collection('reviews')
      .where('product_id', '==', productId)
      .where('user_id', '==', auth.uid)
      .get();
    
    if (!existing.empty) {
      throw new HttpsError('already-exists', 'You have already reviewed this product');
    }
    
    const docRef = await db.collection('reviews').add({
      product_id: productId,
      user_id: auth.uid,
      rating,
      title: title || '',
      review_text: reviewText || '',
      is_verified_purchase: false, // TODO: Check if user actually purchased this product
      is_approved: false, // Requires admin approval
      helpful_count: 0,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { success: true, data: { id: docRef.id, product_id: productId, rating } };
  } catch (error) {
    logger.error('Error creating review:', error);
    throw new HttpsError('internal', 'Failed to create review');
  }
});

export const updateReview = onCall(async (request) => {
  const { reviewId, reviewData } = request.data;
  const auth = await verifyAuth(request);
  
  try {
    // Verify ownership or admin
    const doc = await db.collection('reviews').doc(reviewId).get();
    if (!doc.exists) {
      throw new HttpsError('not-found', 'Review not found');
    }
    
    const review = doc.data();
    const userDoc = await db.collection('users').doc(auth.uid).get();
    const userData = userDoc.data();
    
    if (review?.user_id !== auth.uid && (!userData || !['admin', 'shop_owner'].includes(userData.role))) {
      throw new HttpsError('permission-denied', 'Access denied');
    }
    
    await db.collection('reviews').doc(reviewId).update(reviewData);
    
    return { success: true, message: 'Review updated successfully' };
  } catch (error) {
    logger.error('Error updating review:', error);
    throw new HttpsError('internal', 'Failed to update review');
  }
});

export const deleteReview = onCall(async (request) => {
  const { reviewId } = request.data;
  const auth = await verifyAuth(request);
  
  try {
    // Verify ownership or admin
    const doc = await db.collection('reviews').doc(reviewId).get();
    if (!doc.exists) {
      throw new HttpsError('not-found', 'Review not found');
    }
    
    const review = doc.data();
    const userDoc = await db.collection('users').doc(auth.uid).get();
    const userData = userDoc.data();
    
    if (review?.user_id !== auth.uid && (!userData || !['admin', 'shop_owner'].includes(userData.role))) {
      throw new HttpsError('permission-denied', 'Access denied');
    }
    
    await db.collection('reviews').doc(reviewId).delete();
    return { success: true, message: 'Review deleted successfully' };
  } catch (error) {
    logger.error('Error deleting review:', error);
    throw new HttpsError('internal', 'Failed to delete review');
  }
});

// =============================================================================
// PAGES API (Static Content)
// =============================================================================

export const getPages = onCall(async (request) => {
  try {
    const snapshot = await db.collection('pages')
      .where('is_active', '==', true)
      .orderBy('sort_order')
      .get();
    
    const pages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { success: true, data: pages };
  } catch (error) {
    logger.error('Error fetching pages:', error);
    throw new HttpsError('internal', 'Failed to fetch pages');
  }
});

export const getPageBySlug = onCall(async (request) => {
  const { slug } = request.data;
  
  try {
    const snapshot = await db.collection('pages')
      .where('slug', '==', slug)
      .where('is_active', '==', true)
      .get();
    
    if (snapshot.empty) {
      throw new HttpsError('not-found', 'Page not found');
    }
    
    const doc = snapshot.docs[0];
    return { success: true, data: { id: doc.id, ...doc.data() } };
  } catch (error) {
    logger.error('Error fetching page:', error);
    throw new HttpsError('internal', 'Failed to fetch page');
  }
});

export const createPage = onCall(async (request) => {
  const { pageData } = request.data;
  await verifyAdmin(request);
  
  try {
    const docRef = await db.collection('pages').add({
      ...pageData,
      created: admin.firestore.FieldValue.serverTimestamp(),
      updated: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { success: true, data: { id: docRef.id, ...pageData } };
  } catch (error) {
    logger.error('Error creating page:', error);
    throw new HttpsError('internal', 'Failed to create page');
  }
});

export const updatePage = onCall(async (request) => {
  const { pageId, pageData } = request.data;
  await verifyAdmin(request);
  
  try {
    await db.collection('pages').doc(pageId).update({
      ...pageData,
      updated: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { success: true, message: 'Page updated successfully' };
  } catch (error) {
    logger.error('Error updating page:', error);
    throw new HttpsError('internal', 'Failed to update page');
  }
});

export const deletePage = onCall(async (request) => {
  const { pageId } = request.data;
  await verifyAdmin(request);
  
  try {
    await db.collection('pages').doc(pageId).delete();
    return { success: true, message: 'Page deleted successfully' };
  } catch (error) {
    logger.error('Error deleting page:', error);
    throw new HttpsError('internal', 'Failed to delete page');
  }
});

// =============================================================================
// NEWSLETTER API
// =============================================================================

export const subscribeNewsletter = onCall(async (request) => {
  const { email, language = 'en' } = request.data;
  
  try {
    // Check if already subscribed
    const existing = await db.collection('newsletter_subscribers')
      .where('email', '==', email)
      .get();
    
    if (!existing.empty) {
      throw new HttpsError('already-exists', 'Email already subscribed');
    }
    
    const docRef = await db.collection('newsletter_subscribers').add({
      email,
      language,
      is_active: true,
      subscribed_at: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { success: true, data: { id: docRef.id, email } };
  } catch (error) {
    logger.error('Error subscribing to newsletter:', error);
    throw new HttpsError('internal', 'Failed to subscribe to newsletter');
  }
});

export const unsubscribeNewsletter = onCall(async (request) => {
  const { email } = request.data;
  
  try {
    const snapshot = await db.collection('newsletter_subscribers')
      .where('email', '==', email)
      .get();
    
    if (snapshot.empty) {
      throw new HttpsError('not-found', 'Email not found');
    }
    
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { is_active: false });
    });
    
    await batch.commit();
    return { success: true, message: 'Unsubscribed successfully' };
  } catch (error) {
    logger.error('Error unsubscribing from newsletter:', error);
    throw new HttpsError('internal', 'Failed to unsubscribe from newsletter');
  }
});

// =============================================================================
// SETTINGS API
// =============================================================================

export const getSettings = onCall(async (request) => {
  try {
    const snapshot = await db.collection('settings').get();
    const settings: any = {};
    
    snapshot.docs.forEach(doc => {
      settings[doc.id] = doc.data();
    });
    
    return { success: true, data: settings };
  } catch (error) {
    logger.error('Error fetching settings:', error);
    throw new HttpsError('internal', 'Failed to fetch settings');
  }
});

export const updateSettings = onCall(async (request) => {
  const { settingsData } = request.data;
  await verifyAdmin(request);
  
  try {
    const batch = db.batch();
    
    Object.entries(settingsData).forEach(([key, value]) => {
      const docRef = db.collection('settings').doc(key);
      batch.set(docRef, value as any, { merge: true });
    });
    
    await batch.commit();
    return { success: true, message: 'Settings updated successfully' };
  } catch (error) {
    logger.error('Error updating settings:', error);
    throw new HttpsError('internal', 'Failed to update settings');
  }
});

// =============================================================================
// STATISTICS API (Admin Only)
// =============================================================================

export const getDashboardStats = onCall(async (request) => {
  await verifyAdmin(request);
  
  try {
    // Get counts for various collections
    const [usersSnapshot, productsSnapshot, ordersSnapshot, categoriesSnapshot] = await Promise.all([
      db.collection('users').get(),
      db.collection('products').get(),
      db.collection('orders').get(),
      db.collection('categories').get()
    ]);
    
    const stats = {
      totalUsers: usersSnapshot.size,
      totalProducts: productsSnapshot.size,
      totalOrders: ordersSnapshot.size,
      totalCategories: categoriesSnapshot.size,
      // Calculate recent orders (last 30 days)
      recentOrders: ordersSnapshot.docs.filter(doc => {
        const orderData = doc.data();
        const orderDate = orderData.created?.toDate() || new Date(orderData.created_at);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return orderDate >= thirtyDaysAgo;
      }).length
    };
    
    return { success: true, data: stats };
  } catch (error) {
    logger.error('Error fetching dashboard stats:', error);
    throw new HttpsError('internal', 'Failed to fetch dashboard stats');
  }
});
