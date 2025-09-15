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

// Types
interface CallableRequest {
  auth?: { uid: string };
  data: any;
}

// Helper function for authentication
const verifyAuth = async (request: CallableRequest) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }
  return request.auth;
};

// Helper function for admin check
const verifyAdmin = async (request: CallableRequest) => {
  const auth = await verifyAuth(request);
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

export const getUsers = onCall(async (request: CallableRequest) => {
  await verifyAdmin(request);
  
  try {
    const snapshot = await db.collection('users').get();
    const users = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { success: true, data: users };
  } catch (error) {
    logger.error('Error fetching users:', error);
    throw new HttpsError('internal', 'Failed to fetch users');
  }
});

export const getUserById = onCall(async (request: CallableRequest) => {
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

export const updateUser = onCall(async (request: CallableRequest) => {
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

export const deleteUser = onCall(async (request: CallableRequest) => {
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

export const getCategories = onCall(async (request: CallableRequest) => {
  try {
    const snapshot = await db.collection('categories')
      .where('is_active', '==', true)
      .orderBy('sort_order')
      .get();
    
    const categories = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { success: true, data: categories };
  } catch (error) {
    logger.error('Error fetching categories:', error);
    throw new HttpsError('internal', 'Failed to fetch categories');
  }
});

export const getAllCategories = onCall(async (request: CallableRequest) => {
  await verifyAdmin(request);
  
  try {
    const snapshot = await db.collection('categories').orderBy('sort_order').get();
    const categories = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { success: true, data: categories };
  } catch (error) {
    logger.error('Error fetching all categories:', error);
    throw new HttpsError('internal', 'Failed to fetch categories');
  }
});

export const getCategoryById = onCall(async (request: CallableRequest) => {
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

export const createCategory = onCall(async (request: CallableRequest) => {
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

export const updateCategory = onCall(async (request: CallableRequest) => {
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

export const deleteCategory = onCall(async (request: CallableRequest) => {
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

export const getProducts = onCall(async (request: CallableRequest) => {
  const { categoryId, limit = 50, offset = 0, filters = {} } = request.data || {};
  
  try {
    let query: any = db.collection('products').where('is_active', '==', true);
    
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
    
    const products = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { success: true, data: products };
  } catch (error) {
    logger.error('Error fetching products:', error);
    throw new HttpsError('internal', 'Failed to fetch products');
  }
});

export const getAllProducts = onCall(async (request: CallableRequest) => {
  await verifyAdmin(request);
  
  try {
    const snapshot = await db.collection('products').orderBy('sort_order').get();
    const products = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { success: true, data: products };
  } catch (error) {
    logger.error('Error fetching all products:', error);
    throw new HttpsError('internal', 'Failed to fetch products');
  }
});

export const getProductById = onCall(async (request: CallableRequest) => {
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

export const createProduct = onCall(async (request: CallableRequest) => {
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

export const updateProduct = onCall(async (request: CallableRequest) => {
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

export const deleteProduct = onCall(async (request: CallableRequest) => {
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
export const searchProducts = onCall(async (request: CallableRequest) => {
  const { searchTerm, categoryId, limit = 20 } = request.data;
  
  try {
    let query: any = db.collection('products').where('is_active', '==', true);
    
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

export const getOrders = onCall(async (request: CallableRequest) => {
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

export const getOrderById = onCall(async (request: CallableRequest) => {
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

export const createOrder = onCall(async (request: CallableRequest) => {
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

export const updateOrder = onCall(async (request: CallableRequest) => {
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

export const deleteOrder = onCall(async (request: CallableRequest) => {
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