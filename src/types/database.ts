export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      addresses: {
        Row: {
          id: number
          user_id: string
          recipient_name: string
          phone: string
          country: string
          city: string
          district: string | null
          postal_code: string | null
          full_address: string
          location_lat: number | null
          location_lng: number | null
          type: 'shipping' | 'billing'
          is_default: boolean
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          recipient_name: string
          phone: string
          country: string
          city: string
          district?: string | null
          postal_code?: string | null
          full_address: string
          location_lat?: number | null
          location_lng?: number | null
          type?: 'shipping' | 'billing'
          is_default?: boolean
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          recipient_name?: string
          phone?: string
          country?: string
          city?: string
          district?: string | null
          postal_code?: string | null
          full_address?: string
          location_lat?: number | null
          location_lng?: number | null
          type?: 'shipping' | 'billing'
          is_default?: boolean
          is_active?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      blog_posts: {
        Row: {
          id: number
          title: string
          title_ar: string | null
          slug: string
          excerpt: string | null
          excerpt_ar: string | null
          content: string | null
          content_ar: string | null
          featured_image: string | null
          meta_title: string | null
          meta_description: string | null
          author_id: string | null
          category: string | null
          tags: string[] | null
          is_published: boolean
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          title: string
          title_ar?: string | null
          slug: string
          excerpt?: string | null
          excerpt_ar?: string | null
          content?: string | null
          content_ar?: string | null
          featured_image?: string | null
          meta_title?: string | null
          meta_description?: string | null
          author_id?: string | null
          category?: string | null
          tags?: string[] | null
          is_published?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          title?: string
          title_ar?: string | null
          slug?: string
          excerpt?: string | null
          excerpt_ar?: string | null
          content?: string | null
          content_ar?: string | null
          featured_image?: string | null
          meta_title?: string | null
          meta_description?: string | null
          author_id?: string | null
          category?: string | null
          tags?: string[] | null
          is_published?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      cart_items: {
        Row: {
          id: number
          cart_id: number
          product_id: number
          variant_id: number | null
          quantity: number
          added_at: string
        }
        Insert: {
          id?: number
          cart_id: number
          product_id: number
          variant_id?: number | null
          quantity?: number
          added_at?: string
        }
        Update: {
          id?: number
          cart_id?: number
          product_id?: number
          variant_id?: number | null
          quantity?: number
          added_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          }
        ]
      }
      carts: {
        Row: {
          id: number
          user_id: string | null
          session_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id?: string | null
          session_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string | null
          session_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "carts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      categories: {
        Row: {
          id: number
          name: string
          name_ar: string | null
          description: string | null
          description_ar: string | null
          image_url: string | null
          parent_id: number | null
          sort_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          name_ar?: string | null
          description?: string | null
          description_ar?: string | null
          image_url?: string | null
          parent_id?: number | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          name_ar?: string | null
          description?: string | null
          description_ar?: string | null
          image_url?: string | null
          parent_id?: number | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      coffee_origins: {
        Row: {
          id: number
          name: string
          name_ar: string | null
          country: string | null
          region: string | null
          description: string | null
          flavor_notes: string[] | null
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          name_ar?: string | null
          country?: string | null
          region?: string | null
          description?: string | null
          flavor_notes?: string[] | null
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          name_ar?: string | null
          country?: string | null
          region?: string | null
          description?: string | null
          flavor_notes?: string[] | null
          created_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          id: number
          name: string
          email: string
          subject: string
          message: string
          phone: string | null
          is_read: boolean
          replied_at: string | null
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          email: string
          subject: string
          message: string
          phone?: string | null
          is_read?: boolean
          replied_at?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          email?: string
          subject?: string
          message?: string
          phone?: string | null
          is_read?: boolean
          replied_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          id: number
          code: string
          name: string | null
          name_ar: string | null
          description: string | null
          discount_type: 'percentage' | 'fixed_amount'
          discount_value: number
          minimum_order_amount: number
          usage_limit: number | null
          used_count: number
          user_limit: number
          start_date: string | null
          end_date: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: number
          code: string
          name?: string | null
          name_ar?: string | null
          description?: string | null
          discount_type: 'percentage' | 'fixed_amount'
          discount_value: number
          minimum_order_amount?: number
          usage_limit?: number | null
          used_count?: number
          user_limit?: number
          start_date?: string | null
          end_date?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          code?: string
          name?: string | null
          name_ar?: string | null
          description?: string | null
          discount_type?: 'percentage' | 'fixed_amount'
          discount_value?: number
          minimum_order_amount?: number
          usage_limit?: number | null
          used_count?: number
          user_limit?: number
          start_date?: string | null
          end_date?: string | null
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      inventory_movements: {
        Row: {
          id: number
          product_id: number
          variant_id: number | null
          movement_type: 'in' | 'out' | 'adjustment'
          quantity: number
          reason: string | null
          reference_id: number | null
          reference_type: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: number
          product_id: number
          variant_id?: number | null
          movement_type: 'in' | 'out' | 'adjustment'
          quantity: number
          reason?: string | null
          reference_id?: number | null
          reference_type?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          product_id?: number
          variant_id?: number | null
          movement_type?: 'in' | 'out' | 'adjustment'
          quantity?: number
          reason?: string | null
          reference_id?: number | null
          reference_type?: string | null
          created_by?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          }
        ]
      }
      newsletter_subscribers: {
        Row: {
          id: number
          email: string
          name: string | null
          subscribed_at: string
          is_active: boolean
          unsubscribed_at: string | null
        }
        Insert: {
          id?: number
          email: string
          name?: string | null
          subscribed_at?: string
          is_active?: boolean
          unsubscribed_at?: string | null
        }
        Update: {
          id?: number
          email?: string
          name?: string | null
          subscribed_at?: string
          is_active?: boolean
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: number
          order_id: number
          product_id: number | null
          variant_id: number | null
          product_name: string
          product_name_ar: string | null
          variant_name: string | null
          product_image: string | null
          quantity: number
          unit_price_usd: number | null
          unit_price_omr: number | null
          unit_price_sar: number | null
          total_price_usd: number | null
          total_price_omr: number | null
          total_price_sar: number | null
        }
        Insert: {
          id?: number
          order_id: number
          product_id?: number | null
          variant_id?: number | null
          product_name: string
          product_name_ar?: string | null
          variant_name?: string | null
          product_image?: string | null
          quantity: number
          unit_price_usd?: number | null
          unit_price_omr?: number | null
          unit_price_sar?: number | null
          total_price_usd?: number | null
          total_price_omr?: number | null
          total_price_sar?: number | null
        }
        Update: {
          id?: number
          order_id?: number
          product_id?: number | null
          variant_id?: number | null
          product_name?: string
          product_name_ar?: string | null
          variant_name?: string | null
          product_image?: string | null
          quantity?: number
          unit_price_usd?: number | null
          unit_price_omr?: number | null
          unit_price_sar?: number | null
          total_price_usd?: number | null
          total_price_omr?: number | null
          total_price_sar?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          }
        ]
      }
      order_status_history: {
        Row: {
          id: number
          order_id: number
          status: string
          note: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: number
          order_id: number
          status: string
          note?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          order_id?: number
          status?: string
          note?: string | null
          created_by?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          }
        ]
      }
      orders: {
        Row: {
          id: number
          order_number: string
          user_id: string | null
          customer_email: string | null
          customer_phone: string | null
          customer_name: string | null
          shipping_address_id: number | null
          billing_address_id: number | null
          shipping_method_id: number | null
          subtotal_usd: number | null
          subtotal_omr: number | null
          subtotal_sar: number | null
          shipping_cost_usd: number
          shipping_cost_omr: number
          shipping_cost_sar: number
          tax_amount_usd: number
          tax_amount_omr: number
          tax_amount_sar: number
          discount_amount_usd: number
          discount_amount_omr: number
          discount_amount_sar: number
          total_price_usd: number | null
          total_price_omr: number | null
          total_price_sar: number | null
          currency: string
          coupon_code: string | null
          status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          payment_status: 'unpaid' | 'paid' | 'partially_paid' | 'refunded' | 'failed'
          tracking_number: string | null
          shipped_at: string | null
          delivered_at: string | null
          notes: string | null
          admin_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          order_number?: string
          user_id?: string | null
          customer_email?: string | null
          customer_phone?: string | null
          customer_name?: string | null
          shipping_address_id?: number | null
          billing_address_id?: number | null
          shipping_method_id?: number | null
          subtotal_usd?: number | null
          subtotal_omr?: number | null
          subtotal_sar?: number | null
          shipping_cost_usd?: number
          shipping_cost_omr?: number
          shipping_cost_sar?: number
          tax_amount_usd?: number
          tax_amount_omr?: number
          tax_amount_sar?: number
          discount_amount_usd?: number
          discount_amount_omr?: number
          discount_amount_sar?: number
          total_price_usd?: number | null
          total_price_omr?: number | null
          total_price_sar?: number | null
          currency?: string
          coupon_code?: string | null
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          payment_status?: 'unpaid' | 'paid' | 'partially_paid' | 'refunded' | 'failed'
          tracking_number?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          notes?: string | null
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          order_number?: string
          user_id?: string | null
          customer_email?: string | null
          customer_phone?: string | null
          customer_name?: string | null
          shipping_address_id?: number | null
          billing_address_id?: number | null
          shipping_method_id?: number | null
          subtotal_usd?: number | null
          subtotal_omr?: number | null
          subtotal_sar?: number | null
          shipping_cost_usd?: number
          shipping_cost_omr?: number
          shipping_cost_sar?: number
          tax_amount_usd?: number
          tax_amount_omr?: number
          tax_amount_sar?: number
          discount_amount_usd?: number
          discount_amount_omr?: number
          discount_amount_sar?: number
          total_price_usd?: number | null
          total_price_omr?: number | null
          total_price_sar?: number | null
          currency?: string
          coupon_code?: string | null
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          payment_status?: 'unpaid' | 'paid' | 'partially_paid' | 'refunded' | 'failed'
          tracking_number?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          notes?: string | null
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_billing_address_id_fkey"
            columns: ["billing_address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_shipping_address_id_fkey"
            columns: ["shipping_address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_shipping_method_id_fkey"
            columns: ["shipping_method_id"]
            isOneToOne: false
            referencedRelation: "shipping_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      payments: {
        Row: {
          id: number
          order_id: number
          transaction_id: string | null
          amount_usd: number | null
          amount_omr: number | null
          amount_sar: number | null
          currency: string | null
          payment_method: string | null
          gateway: string | null
          gateway_transaction_id: string | null
          gateway_response: Json | null
          status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded'
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: number
          order_id: number
          transaction_id?: string | null
          amount_usd?: number | null
          amount_omr?: number | null
          amount_sar?: number | null
          currency?: string | null
          payment_method?: string | null
          gateway?: string | null
          gateway_transaction_id?: string | null
          gateway_response?: Json | null
          status?: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded'
          paid_at?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          order_id?: number
          transaction_id?: string | null
          amount_usd?: number | null
          amount_omr?: number | null
          amount_sar?: number | null
          currency?: string | null
          payment_method?: string | null
          gateway?: string | null
          gateway_transaction_id?: string | null
          gateway_response?: Json | null
          status?: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded'
          paid_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          }
        ]
      }
      product_reviews: {
        Row: {
          id: number
          product_id: number
          user_id: string | null
          rating: number
          title: string | null
          review_text: string | null
          is_verified_purchase: boolean
          is_approved: boolean
          helpful_count: number
          created_at: string
        }
        Insert: {
          id?: number
          product_id: number
          user_id?: string | null
          rating: number
          title?: string | null
          review_text?: string | null
          is_verified_purchase?: boolean
          is_approved?: boolean
          helpful_count?: number
          created_at?: string
        }
        Update: {
          id?: number
          product_id?: number
          user_id?: string | null
          rating?: number
          title?: string | null
          review_text?: string | null
          is_verified_purchase?: boolean
          is_approved?: boolean
          helpful_count?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      product_tag_relations: {
        Row: {
          product_id: number
          tag_id: number
        }
        Insert: {
          product_id: number
          tag_id: number
        }
        Update: {
          product_id?: number
          tag_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_tag_relations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_tag_relations_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "product_tags"
            referencedColumns: ["id"]
          }
        ]
      }
      product_tags: {
        Row: {
          id: number
          name: string
          name_ar: string | null
          color: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          name_ar?: string | null
          color?: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          name_ar?: string | null
          color?: string
          created_at?: string
        }
        Relationships: []
      }
      product_variants: {
        Row: {
          id: number
          product_id: number
          variant_type: string
          variant_name: string
          variant_value: string
          price_adjustment_usd: number
          price_adjustment_omr: number
          price_adjustment_sar: number
          stock: number
          sku: string | null
          weight_grams: number | null
          is_active: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: number
          product_id: number
          variant_type: string
          variant_name: string
          variant_value: string
          price_adjustment_usd?: number
          price_adjustment_omr?: number
          price_adjustment_sar?: number
          stock?: number
          sku?: string | null
          weight_grams?: number | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: number
          product_id?: number
          variant_type?: string
          variant_name?: string
          variant_value?: string
          price_adjustment_usd?: number
          price_adjustment_omr?: number
          price_adjustment_sar?: number
          stock?: number
          sku?: string | null
          weight_grams?: number | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          id: number
          name: string
          name_ar: string | null
          description: string | null
          description_ar: string | null
          image_url: string | null
          gallery_images: string[] | null
          price_usd: number
          price_omr: number | null
          price_sar: number | null
          category_id: number | null
          origin_id: number | null
          roast_level_id: number | null
          bean_type: 'Arabica' | 'Robusta' | 'Blend' | null
          processing_method: string | null
          altitude: string | null
          harvest_year: number | null
          caffeine_content: string | null
          grind_options: string[] | null
          package_size: string[] | null
          variety: string | null
          notes: string | null
          farm: string | null
          stock: number
          low_stock_threshold: number
          weight_grams: number | null
          slug: string | null
          meta_title: string | null
          meta_description: string | null
          featured: boolean
          bestseller: boolean
          new_arrival: boolean
          on_sale: boolean
          sale_price_usd: number | null
          sale_price_omr: number | null
          sale_price_sar: number | null
          sale_start_date: string | null
          sale_end_date: string | null
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          name_ar?: string | null
          description?: string | null
          description_ar?: string | null
          image_url?: string | null
          gallery_images?: string[] | null
          price_usd: number
          price_omr?: number | null
          price_sar?: number | null
          category_id?: number | null
          origin_id?: number | null
          roast_level_id?: number | null
          bean_type?: 'Arabica' | 'Robusta' | 'Blend' | null
          processing_method?: string | null
          altitude?: string | null
          harvest_year?: number | null
          caffeine_content?: string | null
          grind_options?: string[] | null
          package_size?: string[] | null
          variety?: string | null
          notes?: string | null
          farm?: string | null
          stock?: number
          low_stock_threshold?: number
          weight_grams?: number | null
          slug?: string | null
          meta_title?: string | null
          meta_description?: string | null
          featured?: boolean
          bestseller?: boolean
          new_arrival?: boolean
          on_sale?: boolean
          sale_price_usd?: number | null
          sale_price_omr?: number | null
          sale_price_sar?: number | null
          sale_start_date?: string | null
          sale_end_date?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          name_ar?: string | null
          description?: string | null
          description_ar?: string | null
          image_url?: string | null
          gallery_images?: string[] | null
          price_usd?: number
          price_omr?: number | null
          price_sar?: number | null
          category_id?: number | null
          origin_id?: number | null
          roast_level_id?: number | null
          bean_type?: 'Arabica' | 'Robusta' | 'Blend' | null
          processing_method?: string | null
          altitude?: string | null
          harvest_year?: number | null
          caffeine_content?: string | null
          grind_options?: string[] | null
          package_size?: string[] | null
          variety?: string | null
          notes?: string | null
          farm?: string | null
          stock?: number
          low_stock_threshold?: number
          weight_grams?: number | null
          slug?: string | null
          meta_title?: string | null
          meta_description?: string | null
          featured?: boolean
          bestseller?: boolean
          new_arrival?: boolean
          on_sale?: boolean
          sale_price_usd?: number | null
          sale_price_omr?: number | null
          sale_price_sar?: number | null
          sale_start_date?: string | null
          sale_end_date?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_origin_id_fkey"
            columns: ["origin_id"]
            isOneToOne: false
            referencedRelation: "coffee_origins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_roast_level_id_fkey"
            columns: ["roast_level_id"]
            isOneToOne: false
            referencedRelation: "roast_levels"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          phone: string
          gender: 'male' | 'female' | 'other' | null
          date_of_birth: string | null
          profile_image: string | null
          national_id: string | null
          nationality: string | null
          company_name: string | null
          job_title: string | null
          role: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          phone: string
          gender?: 'male' | 'female' | 'other' | null
          date_of_birth?: string | null
          profile_image?: string | null
          national_id?: string | null
          nationality?: string | null
          company_name?: string | null
          job_title?: string | null
          role?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          phone?: string
          gender?: 'male' | 'female' | 'other' | null
          date_of_birth?: string | null
          profile_image?: string | null
          national_id?: string | null
          nationality?: string | null
          company_name?: string | null
          job_title?: string | null
          role?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      roast_levels: {
        Row: {
          id: number
          name: string
          name_ar: string | null
          description: string | null
          color_code: string | null
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          name_ar?: string | null
          description?: string | null
          color_code?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          name_ar?: string | null
          description?: string | null
          color_code?: string | null
          created_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          key: string
          value: Json | null
          updated_at: string
        }
        Insert: {
          key: string
          value?: Json | null
          updated_at?: string
        }
        Update: {
          key?: string
          value?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      shipping_methods: {
        Row: {
          id: number
          zone_id: number | null
          name: string
          name_ar: string | null
          description: string | null
          estimated_delivery_days: string | null
          price_usd: number | null
          price_omr: number | null
          price_sar: number | null
          free_shipping_threshold: number | null
          is_active: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: number
          zone_id?: number | null
          name: string
          name_ar?: string | null
          description?: string | null
          estimated_delivery_days?: string | null
          price_usd?: number | null
          price_omr?: number | null
          price_sar?: number | null
          free_shipping_threshold?: number | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: number
          zone_id?: number | null
          name?: string
          name_ar?: string | null
          description?: string | null
          estimated_delivery_days?: string | null
          price_usd?: number | null
          price_omr?: number | null
          price_sar?: number | null
          free_shipping_threshold?: number | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipping_methods_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "shipping_zones"
            referencedColumns: ["id"]
          }
        ]
      }
      shipping_zones: {
        Row: {
          id: number
          name: string
          name_ar: string | null
          countries: string[] | null
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          name_ar?: string | null
          countries?: string[] | null
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          name_ar?: string | null
          countries?: string[] | null
          created_at?: string
        }
        Relationships: []
      }
      static_pages: {
        Row: {
          id: number
          slug: string
          title: string
          title_ar: string | null
          content: string | null
          content_ar: string | null
          meta_title: string | null
          meta_description: string | null
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          slug: string
          title: string
          title_ar?: string | null
          content?: string | null
          content_ar?: string | null
          meta_title?: string | null
          meta_description?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          slug?: string
          title?: string
          title_ar?: string | null
          content?: string | null
          content_ar?: string | null
          meta_title?: string | null
          meta_description?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      ticket_messages: {
        Row: {
          id: number
          ticket_id: number
          user_id: string | null
          message: string
          attachments: string[] | null
          is_admin: boolean
          created_at: string
        }
        Insert: {
          id?: number
          ticket_id: number
          user_id?: string | null
          message: string
          attachments?: string[] | null
          is_admin?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          ticket_id?: number
          user_id?: string | null
          message?: string
          attachments?: string[] | null
          is_admin?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      tickets: {
        Row: {
          id: number
          ticket_number: string
          user_id: string | null
          order_id: number | null
          customer_name: string | null
          customer_email: string | null
          customer_phone: string | null
          subject: string
          category: string | null
          priority: 'low' | 'medium' | 'high' | 'urgent'
          status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          ticket_number?: string
          user_id?: string | null
          order_id?: number | null
          customer_name?: string | null
          customer_email?: string | null
          customer_phone?: string | null
          subject: string
          category?: string | null
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          ticket_number?: string
          user_id?: string | null
          order_id?: number | null
          customer_name?: string | null
          customer_email?: string | null
          customer_phone?: string | null
          subject?: string
          category?: string | null
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      wishlists: {
        Row: {
          id: number
          user_id: string
          product_id: number
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          product_id: number
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          product_id?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      order_analytics: {
        Row: {
          date: string | null
          total_orders: number | null
          revenue_usd: number | null
          avg_order_value_usd: number | null
          unique_customers: number | null
        }
        Relationships: []
      }
      popular_products: {
        Row: {
          id: number | null
          name: string | null
          total_sold: number | null
          times_ordered: number | null
          avg_rating: number | null
          review_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_order_number: {
        Args: object
        Returns: string
      }
      generate_ticket_number: {
        Args: object
        Returns: string
      }
      update_product_stock: {
        Args: {
          product_id_param: number
          quantity_change: number
          movement_type: string
          variant_id_param?: number
          reason_param?: string
          reference_id_param?: number
          reference_type_param?: string
        }
        Returns: undefined
      }
      update_user_role: {
        Args: {
          target_user_id: string
          new_role: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
