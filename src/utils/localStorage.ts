// Local Storage utilities for cart and wishlist

export interface LocalCartItem {
  id: string
  productId: string
  quantity: number
  selectedProperties?: Record<string, string>
  addedAt: string
  updatedAt: string
}

export interface LocalWishlistItem {
  id: string
  productId: string
  addedAt: string
}

const CART_STORAGE_KEY = 'spirithub_cart'
const WISHLIST_STORAGE_KEY = 'spirithub_wishlist'

// Cart Local Storage Functions
export const cartStorage = {
  // Get cart items from localStorage
  getItems(): LocalCartItem[] {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error reading cart from localStorage:', error)
      return []
    }
  },

  // Save cart items to localStorage
  setItems(items: LocalCartItem[]): void {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    } catch (error) {
      console.error('Error saving cart to localStorage:', error)
    }
  },

  // Add item to cart
  addItem(productId: string, quantity: number = 1, selectedProperties?: Record<string, string>): LocalCartItem {
    const items = this.getItems()
    const now = new Date().toISOString()
    
    // Check if item already exists with same properties
    const existingItemIndex = items.findIndex(item => 
      item.productId === productId && 
      JSON.stringify(item.selectedProperties || {}) === JSON.stringify(selectedProperties || {})
    )

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      items[existingItemIndex].quantity += quantity
      items[existingItemIndex].updatedAt = now
      this.setItems(items)
      return items[existingItemIndex]
    } else {
      // Add new item
      const newItem: LocalCartItem = {
        id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        productId,
        quantity,
        selectedProperties,
        addedAt: now,
        updatedAt: now
      }
      items.push(newItem)
      this.setItems(items)
      return newItem
    }
  },

  // Update item quantity
  updateItemQuantity(itemId: string, quantity: number): boolean {
    const items = this.getItems()
    const itemIndex = items.findIndex(item => item.id === itemId)
    
    if (itemIndex >= 0) {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        items.splice(itemIndex, 1)
      } else {
        items[itemIndex].quantity = quantity
        items[itemIndex].updatedAt = new Date().toISOString()
      }
      this.setItems(items)
      return true
    }
    return false
  },

  // Remove item from cart
  removeItem(itemId: string): boolean {
    const items = this.getItems()
    const filteredItems = items.filter(item => item.id !== itemId)
    
    if (filteredItems.length !== items.length) {
      this.setItems(filteredItems)
      return true
    }
    return false
  },

  // Clear all cart items
  clearItems(): void {
    this.setItems([])
  },

  // Get total items count
  getTotalItems(): number {
    return this.getItems().reduce((total, item) => total + item.quantity, 0)
  }
}

// Wishlist Local Storage Functions
export const wishlistStorage = {
  // Get wishlist items from localStorage
  getItems(): LocalWishlistItem[] {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error reading wishlist from localStorage:', error)
      return []
    }
  },

  // Save wishlist items to localStorage
  setItems(items: LocalWishlistItem[]): void {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items))
    } catch (error) {
      console.error('Error saving wishlist to localStorage:', error)
    }
  },

  // Add item to wishlist
  addItem(productId: string): LocalWishlistItem | null {
    const items = this.getItems()
    
    // Check if item already exists
    const existingItem = items.find(item => item.productId === productId)
    if (existingItem) {
      return null // Item already exists
    }

    const newItem: LocalWishlistItem = {
      id: `wishlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      productId,
      addedAt: new Date().toISOString()
    }

    items.push(newItem)
    this.setItems(items)
    return newItem
  },

  // Remove item from wishlist
  removeItem(productId: string): boolean {
    const items = this.getItems()
    const filteredItems = items.filter(item => item.productId !== productId)
    
    if (filteredItems.length !== items.length) {
      this.setItems(filteredItems)
      return true
    }
    return false
  },

  // Check if item is in wishlist
  isInWishlist(productId: string): boolean {
    return this.getItems().some(item => item.productId === productId)
  },

  // Toggle item in wishlist
  toggleItem(productId: string): boolean {
    if (this.isInWishlist(productId)) {
      this.removeItem(productId)
      return false // Removed
    } else {
      this.addItem(productId)
      return true // Added
    }
  },

  // Clear all wishlist items
  clearItems(): void {
    this.setItems([])
  }
}
