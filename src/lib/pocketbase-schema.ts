// PocketBase Collections Schema
// This file documents the collections structure for PocketBase

export const collections = {
  // Users collection (built-in auth collection)
  users: {
    fields: {
      email: 'email (required)',
      password: 'password (required)',
      full_name: 'text (required)',
      phone: 'text (optional)',
      role: 'select (admin, user) default: user',
      avatar: 'file (single, optional)',
      created: 'date (auto)',
      updated: 'date (auto)'
    },
    rules: {
      listRule: 'id = @request.auth.id || @request.auth.role = "admin"',
      viewRule: 'id = @request.auth.id || @request.auth.role = "admin"',
      createRule: '',
      updateRule: 'id = @request.auth.id',
      deleteRule: '@request.auth.role = "admin"'
    }
  },

  // Categories collection
  categories: {
    fields: {
      name: 'text (required)',
      name_ar: 'text (required)',
      description: 'text (optional)',
      description_ar: 'text (optional)',
      image: 'file (single, optional)',
      is_active: 'bool (default: true)',
      sort_order: 'number (default: 0)',
      created: 'date (auto)',
      updated: 'date (auto)'
    },
    rules: {
      listRule: 'is_active = true || @request.auth.role = "admin"',
      viewRule: 'is_active = true || @request.auth.role = "admin"',
      createRule: '@request.auth.role = "admin"',
      updateRule: '@request.auth.role = "admin"',
      deleteRule: '@request.auth.role = "admin"'
    }
  },

  // Products collection
  products: {
    fields: {
      name: 'text (required)',
      name_ar: 'text (required)',
      description: 'text (optional)',
      description_ar: 'text (optional)',
      category: 'relation (categories, required)',
      price_usd: 'number (required)',
      price_omr: 'number (optional)',
      price_sar: 'number (optional)',
      sale_price_usd: 'number (optional)',
      sale_price_omr: 'number (optional)',
      sale_price_sar: 'number (optional)',
      image: 'file (single, optional)',
      gallery: 'file (multiple, optional)',
      is_active: 'bool (default: true)',
      is_featured: 'bool (default: false)',
      is_bestseller: 'bool (default: false)',
      is_new_arrival: 'bool (default: false)',
      is_on_sale: 'bool (default: false)',
      stock_quantity: 'number (default: 0)',
      sku: 'text (optional)',
      weight: 'number (optional)',
      sort_order: 'number (default: 0)',
      meta_title: 'text (optional)',
      meta_description: 'text (optional)',
      created: 'date (auto)',
      updated: 'date (auto)'
    },
    rules: {
      listRule: 'is_active = true || @request.auth.role = "admin"',
      viewRule: 'is_active = true || @request.auth.role = "admin"',
      createRule: '@request.auth.role = "admin"',
      updateRule: '@request.auth.role = "admin"',
      deleteRule: '@request.auth.role = "admin"'
    }
  },

  // Cart Items collection
  cart_items: {
    fields: {
      user: 'relation (users, required)',
      product: 'relation (products, required)',
      quantity: 'number (required, min: 1)',
      created: 'date (auto)',
      updated: 'date (auto)'
    },
    rules: {
      listRule: 'user = @request.auth.id',
      viewRule: 'user = @request.auth.id',
      createRule: 'user = @request.auth.id',
      updateRule: 'user = @request.auth.id',
      deleteRule: 'user = @request.auth.id'
    }
  },

  // Orders collection
  orders: {
    fields: {
      user: 'relation (users, required)',
      order_number: 'text (required)',
      status: 'select (pending, confirmed, preparing, ready, delivered, cancelled) default: pending',
      total_usd: 'number (required)',
      total_omr: 'number (optional)',
      total_sar: 'number (optional)',
      currency: 'select (USD, OMR, SAR) default: USD',
      customer_name: 'text (required)',
      customer_email: 'email (required)',
      customer_phone: 'text (required)',
      delivery_address: 'text (optional)',
      notes: 'text (optional)',
      created: 'date (auto)',
      updated: 'date (auto)'
    },
    rules: {
      listRule: 'user = @request.auth.id || @request.auth.role = "admin"',
      viewRule: 'user = @request.auth.id || @request.auth.role = "admin"',
      createRule: 'user = @request.auth.id',
      updateRule: '@request.auth.role = "admin"',
      deleteRule: '@request.auth.role = "admin"'
    }
  },

  // Order Items collection
  order_items: {
    fields: {
      order: 'relation (orders, required)',
      product: 'relation (products, required)',
      quantity: 'number (required, min: 1)',
      unit_price_usd: 'number (required)',
      unit_price_omr: 'number (optional)',
      unit_price_sar: 'number (optional)',
      total_price_usd: 'number (required)',
      total_price_omr: 'number (optional)',
      total_price_sar: 'number (optional)',
      created: 'date (auto)',
      updated: 'date (auto)'
    },
    rules: {
      listRule: 'order.user = @request.auth.id || @request.auth.role = "admin"',
      viewRule: 'order.user = @request.auth.id || @request.auth.role = "admin"',
      createRule: 'order.user = @request.auth.id',
      updateRule: '@request.auth.role = "admin"',
      deleteRule: '@request.auth.role = "admin"'
    }
  }
}

// Instructions to set up PocketBase:
// 1. Download PocketBase from https://pocketbase.io/
// 2. Extract and run: ./pocketbase serve
// 3. Open http://127.0.0.1:8090/_/ to access admin UI
// 4. Create collections based on the schema above
// 5. Set up the rules for each collection
// 6. Import sample data if needed
