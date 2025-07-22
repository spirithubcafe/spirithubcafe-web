CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles Table (Extended User Info with roles)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  date_of_birth DATE,
  profile_image TEXT,
  national_id TEXT,
  nationality TEXT,
  company_name TEXT,
  job_title TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'shop', 'admin')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Public profiles are viewable by everyone." 
ON profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile." 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- Admin policy to view all profiles
CREATE POLICY "Admins can view all profiles"
ON profiles FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
AS '
DECLARE
  user_count INTEGER;
  user_role TEXT;
BEGIN
  -- Count existing users
  SELECT COUNT(*) INTO user_count FROM public.profiles;
  
  -- Set role based on user count
  IF user_count = 0 THEN
    user_role := ''admin'';  -- First user becomes admin
  ELSE
    user_role := COALESCE(NEW.raw_user_meta_data->>''role'', ''user'');
  END IF;
  
  INSERT INTO public.profiles (id, email, full_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>''full_name'', ''User''),
    COALESCE(NEW.raw_user_meta_data->>''phone'', ''''),
    user_role
  );
  RETURN NEW;
END;
';

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS '
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
';

-- Trigger to update updated_at on profile changes
CREATE TRIGGER update_profiles_updated_at 
BEFORE UPDATE ON profiles 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Addresses Table with geo-location
CREATE TABLE addresses (
  id SERIAL PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  country TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT,
  postal_code TEXT,
  full_address TEXT NOT NULL,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  type TEXT DEFAULT 'shipping' CHECK (type IN ('shipping', 'billing')),
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Coffee specific categories and attributes
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  name_ar TEXT, -- Arabic name
  description TEXT,
  description_ar TEXT,
  image_url TEXT,
  parent_id INTEGER REFERENCES categories(id), -- For subcategories
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default coffee categories
INSERT INTO categories (name, name_ar, description) VALUES 
('Coffee Beans', 'حبوب القهوة', 'Premium coffee beans from around the world'),
('Ground Coffee', 'القهوة المطحونة', 'Freshly ground coffee for immediate use'),
('Instant Coffee', 'القهوة السريعة', 'Quick and convenient instant coffee'),
('Coffee Equipment', 'معدات القهوة', 'Coffee makers, grinders and accessories'),
('Gift Sets', 'مجموعات الهدايا', 'Perfect coffee gift collections'),
('Accessories', 'الإكسسوارات', 'Coffee cups, filters and brewing accessories');

-- Coffee origins and roast levels
CREATE TABLE coffee_origins (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  name_ar TEXT,
  country TEXT,
  region TEXT,
  description TEXT,
  flavor_notes TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

INSERT INTO coffee_origins (name, name_ar, country, region, flavor_notes) VALUES 
('Ethiopian Yirgacheffe', 'يرغاتشيف الاثيوبية', 'Ethiopia', 'Yirgacheffe', ARRAY['Floral', 'Citrus', 'Wine-like']),
('Colombian Supremo', 'الكولومبية سوبريمو', 'Colombia', 'Huila', ARRAY['Chocolate', 'Caramel', 'Nutty']),
('Jamaican Blue Mountain', 'الجاميكية الجبل الأزرق', 'Jamaica', 'Blue Mountains', ARRAY['Mild', 'Sweet', 'Clean']),
('Hawaiian Kona', 'كونا الهاوايية', 'USA', 'Hawaii', ARRAY['Rich', 'Smooth', 'Low acidity']);

CREATE TABLE roast_levels (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  name_ar TEXT,
  description TEXT,
  color_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

INSERT INTO roast_levels (name, name_ar, description, color_code) VALUES 
('Light Roast', 'تحميص خفيف', 'Light brown color, no oil on surface', '#8B4513'),
('Medium Roast', 'تحميص متوسط', 'Medium brown color, balanced flavor', '#654321'),
('Medium-Dark Roast', 'تحميص متوسط داكن', 'Rich, dark color with some oil', '#3C1810'),
('Dark Roast', 'تحميص داكن', 'Shiny black beans with oil on surface', '#1C0F0A');

-- Enhanced Products Table for coffee shop
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT,
  description TEXT,
  description_ar TEXT,
  image_url TEXT,
  gallery_images TEXT[], -- Multiple product images
  price_usd NUMERIC(10,2) NOT NULL,
  price_omr NUMERIC(10,2),
  price_sar NUMERIC(10,2),
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  origin_id INTEGER REFERENCES coffee_origins(id),
  roast_level_id INTEGER REFERENCES roast_levels(id),
  
  -- Coffee specific attributes
  bean_type TEXT CHECK (bean_type IN ('Arabica', 'Robusta', 'Blend')),
  processing_method TEXT, -- Washed, Natural, Honey
  altitude TEXT, -- Growing altitude
  harvest_year INTEGER,
  caffeine_content TEXT, -- High, Medium, Low, Decaf
  grind_options TEXT[], -- Whole Bean, Fine, Medium, Coarse
  package_size TEXT[], -- 250g, 500g, 1kg
  
  -- Inventory
  stock INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 10,
  weight_grams INTEGER, -- Product weight
  
  -- SEO and marketing
  slug TEXT UNIQUE,
  meta_title TEXT,
  meta_description TEXT,
  featured BOOLEAN DEFAULT FALSE,
  bestseller BOOLEAN DEFAULT FALSE,
  new_arrival BOOLEAN DEFAULT FALSE,
  on_sale BOOLEAN DEFAULT FALSE,
  sale_price_usd NUMERIC(10,2),
  sale_price_omr NUMERIC(10,2),
  sale_price_sar NUMERIC(10,2),
  sale_start_date TIMESTAMP WITH TIME ZONE,
  sale_end_date TIMESTAMP WITH TIME ZONE,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Product Variants (sizes, grind types, etc.)
CREATE TABLE product_variants (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  variant_type TEXT NOT NULL, -- size, grind, package
  variant_name TEXT NOT NULL,
  variant_value TEXT NOT NULL,
  price_adjustment_usd NUMERIC(10,2) DEFAULT 0,
  price_adjustment_omr NUMERIC(10,2) DEFAULT 0,
  price_adjustment_sar NUMERIC(10,2) DEFAULT 0,
  stock INTEGER DEFAULT 0,
  sku TEXT UNIQUE,
  weight_grams INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Product Reviews
CREATE TABLE product_reviews (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  review_text TEXT,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Product Tags (for filtering)
CREATE TABLE product_tags (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  name_ar TEXT,
  color TEXT DEFAULT '#gray',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE product_tag_relations (
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES product_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, tag_id)
);

-- Insert default tags
INSERT INTO product_tags (name, name_ar, color) VALUES 
('Organic', 'عضوي', '#22c55e'),
('Fair Trade', 'التجارة العادلة', '#3b82f6'),
('Single Origin', 'منشأ واحد', '#8b5cf6'),
('Decaffeinated', 'منزوع الكافيين', '#ef4444'),
('Limited Edition', 'إصدار محدود', '#f59e0b');

-- Wishlist
CREATE TABLE wishlists (
  id SERIAL PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enhanced Cart Table
CREATE TABLE carts (
  id SERIAL PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT, -- For guest users
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Cart Items with variants support
CREATE TABLE cart_items (
  id SERIAL PRIMARY KEY,
  cart_id INTEGER REFERENCES carts(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  variant_id INTEGER REFERENCES product_variants(id),
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Coupons and Discounts
CREATE TABLE coupons (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT,
  name_ar TEXT,
  description TEXT,
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value NUMERIC(10,2),
  minimum_order_amount NUMERIC(10,2) DEFAULT 0,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  user_limit INTEGER DEFAULT 1, -- Per user usage limit
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Shipping Methods with zone support
CREATE TABLE shipping_zones (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT,
  countries TEXT[], -- Array of country codes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE shipping_methods (
  id SERIAL PRIMARY KEY,
  zone_id INTEGER REFERENCES shipping_zones(id),
  name TEXT NOT NULL,
  name_ar TEXT,
  description TEXT,
  estimated_delivery_days TEXT,
  price_usd NUMERIC(10,2),
  price_omr NUMERIC(10,2),
  price_sar NUMERIC(10,2),
  free_shipping_threshold NUMERIC(10,2),
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enhanced Orders Table
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Customer info (for guest orders)
  customer_email TEXT,
  customer_phone TEXT,
  customer_name TEXT,
  
  -- Addresses
  shipping_address_id INTEGER REFERENCES addresses(id),
  billing_address_id INTEGER REFERENCES addresses(id),
  shipping_method_id INTEGER REFERENCES shipping_methods(id),
  
  -- Pricing
  subtotal_usd NUMERIC(10,2),
  subtotal_omr NUMERIC(10,2),
  subtotal_sar NUMERIC(10,2),
  shipping_cost_usd NUMERIC(10,2) DEFAULT 0,
  shipping_cost_omr NUMERIC(10,2) DEFAULT 0,
  shipping_cost_sar NUMERIC(10,2) DEFAULT 0,
  tax_amount_usd NUMERIC(10,2) DEFAULT 0,
  tax_amount_omr NUMERIC(10,2) DEFAULT 0,
  tax_amount_sar NUMERIC(10,2) DEFAULT 0,
  discount_amount_usd NUMERIC(10,2) DEFAULT 0,
  discount_amount_omr NUMERIC(10,2) DEFAULT 0,
  discount_amount_sar NUMERIC(10,2) DEFAULT 0,
  total_price_usd NUMERIC(10,2),
  total_price_omr NUMERIC(10,2),
  total_price_sar NUMERIC(10,2),
  currency TEXT DEFAULT 'USD',
  
  -- Coupon
  coupon_code TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'partially_paid', 'refunded', 'failed')),
  
  -- Tracking
  tracking_number TEXT,
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  
  -- Notes
  notes TEXT,
  admin_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT 
LANGUAGE plpgsql
AS '
DECLARE
  order_num TEXT;
BEGIN
  order_num := ''ORD-'' || TO_CHAR(NOW(), ''YYYY'') || ''-'' || LPAD(nextval(''orders_id_seq'')::TEXT, 6, ''0'');
  RETURN order_num;
END;
';

-- Trigger to auto-generate order number
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS '
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
';

CREATE TRIGGER set_order_number_trigger
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION set_order_number();

-- Order Items with snapshot pricing
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  variant_id INTEGER REFERENCES product_variants(id),
  
  -- Product snapshot (in case product is deleted)
  product_name TEXT NOT NULL,
  product_name_ar TEXT,
  variant_name TEXT,
  product_image TEXT,
  
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price_usd NUMERIC(10,2),
  unit_price_omr NUMERIC(10,2),
  unit_price_sar NUMERIC(10,2),
  total_price_usd NUMERIC(10,2),
  total_price_omr NUMERIC(10,2),
  total_price_sar NUMERIC(10,2)
);

-- Order Status History
CREATE TABLE order_status_history (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT,
  created_by uuid REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enhanced Payments Table
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  transaction_id TEXT,
  amount_usd NUMERIC(10,2),
  amount_omr NUMERIC(10,2),
  amount_sar NUMERIC(10,2),
  currency TEXT,
  payment_method TEXT, -- card, paypal, bank_transfer, cash_on_delivery
  gateway TEXT, -- stripe, paypal, etc.
  gateway_transaction_id TEXT,
  gateway_response JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enhanced Tickets/Support Table
CREATE TABLE tickets (
  id SERIAL PRIMARY KEY,
  ticket_number TEXT UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id INTEGER REFERENCES orders(id),
  
  -- Customer info (for guest tickets)
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  
  subject TEXT NOT NULL,
  category TEXT, -- order_issue, product_question, general, complaint
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_customer', 'resolved', 'closed')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ticket Messages
CREATE TABLE ticket_messages (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER REFERENCES tickets(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  message TEXT NOT NULL,
  attachments TEXT[],
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Function to generate ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT 
LANGUAGE plpgsql
AS '
DECLARE
  ticket_num TEXT;
BEGIN
  ticket_num := ''TKT-'' || TO_CHAR(NOW(), ''YYYY'') || ''-'' || LPAD(nextval(''tickets_id_seq'')::TEXT, 4, ''0'');
  RETURN ticket_num;
END;
';

-- Trigger to auto-generate ticket number
CREATE OR REPLACE FUNCTION set_ticket_number()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS '
BEGIN
  IF NEW.ticket_number IS NULL THEN
    NEW.ticket_number := generate_ticket_number();
  END IF;
  RETURN NEW;
END;
';

CREATE TRIGGER set_ticket_number_trigger
  BEFORE INSERT ON tickets
  FOR EACH ROW EXECUTE FUNCTION set_ticket_number();

-- Newsletter Subscribers
CREATE TABLE newsletter_subscribers (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT TRUE,
  unsubscribed_at TIMESTAMP WITH TIME ZONE
);

-- Static Pages (About, Terms, Privacy, etc.)
CREATE TABLE static_pages (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  title_ar TEXT,
  content TEXT,
  content_ar TEXT,
  meta_title TEXT,
  meta_description TEXT,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default pages
INSERT INTO static_pages (slug, title, title_ar, content, content_ar) VALUES 
('about-us', 'About Us', 'من نحن', 'Learn about our coffee journey...', 'تعرف على رحلتنا مع القهوة...'),
('privacy-policy', 'Privacy Policy', 'سياسة الخصوصية', 'Your privacy is important to us...', 'خصوصيتك مهمة بالنسبة لنا...'),
('terms-of-service', 'Terms of Service', 'شروط الخدمة', 'Terms and conditions...', 'الشروط والأحكام...'),
('shipping-info', 'Shipping Information', 'معلومات الشحن', 'Shipping details...', 'تفاصيل الشحن...');

-- Settings Table for site configuration
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default settings
INSERT INTO settings (key, value) VALUES 
('site_name', '"Coffee Shop"'),
('site_description', '"Premium coffee beans and equipment"'),
('contact_email', '"info@coffeeshop.com"'),
('contact_phone', '"+968 1234 5678"'),
('currency_rates', '{"usd": 1, "omr": 0.385, "sar": 3.75}'),
('tax_rate', '0.05'),
('free_shipping_threshold', '50'),
('low_stock_threshold', '10');

-- Blogs/Articles Table
CREATE TABLE blog_posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  title_ar TEXT,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  excerpt_ar TEXT,
  content TEXT,
  content_ar TEXT,
  featured_image TEXT,
  meta_title TEXT,
  meta_description TEXT,
  author_id uuid REFERENCES auth.users(id),
  category TEXT,
  tags TEXT[],
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inventory Tracking
CREATE TABLE inventory_movements (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  variant_id INTEGER REFERENCES product_variants(id),
  movement_type TEXT CHECK (movement_type IN ('in', 'out', 'adjustment')),
  quantity INTEGER NOT NULL,
  reason TEXT,
  reference_id INTEGER, -- order_id, return_id, etc.
  reference_type TEXT, -- order, return, manual, etc.
  created_by uuid REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Analytics/Reports Views
CREATE VIEW order_analytics AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as total_orders,
  SUM(total_price_usd) as revenue_usd,
  AVG(total_price_usd) as avg_order_value_usd,
  COUNT(DISTINCT user_id) as unique_customers
FROM orders 
WHERE status != 'cancelled'
GROUP BY DATE_TRUNC('day', created_at);

CREATE VIEW popular_products AS
SELECT 
  p.id,
  p.name,
  SUM(oi.quantity) as total_sold,
  COUNT(DISTINCT oi.order_id) as times_ordered,
  AVG(pr.rating) as avg_rating,
  COUNT(pr.id) as review_count
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN orders o ON oi.order_id = o.id AND o.status != 'cancelled'
LEFT JOIN product_reviews pr ON p.id = pr.product_id AND pr.is_approved = true
GROUP BY p.id, p.name
ORDER BY total_sold DESC NULLS LAST;

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_featured ON products(featured) WHERE featured = true;
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = true;
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_cart_items_user ON cart_items(cart_id);
CREATE INDEX idx_reviews_product ON product_reviews(product_id);

-- Add updated_at triggers for tables that need them
CREATE TRIGGER update_products_updated_at 
BEFORE UPDATE ON products 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
BEFORE UPDATE ON orders 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at 
BEFORE UPDATE ON tickets 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_static_pages_updated_at 
BEFORE UPDATE ON static_pages 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at 
BEFORE UPDATE ON blog_posts 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function for admins to update user roles
CREATE OR REPLACE FUNCTION public.update_user_role(
  target_user_id uuid,
  new_role TEXT
)
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
AS '
BEGIN
  -- Check if the current user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = ''admin''
  ) THEN
    RAISE EXCEPTION ''Only admins can update user roles'';
  END IF;
  
  -- Validate the new role
  IF new_role NOT IN (''user'', ''shop'', ''admin'') THEN
    RAISE EXCEPTION ''Invalid role. Must be user, shop, or admin'';
  END IF;
  
  -- Update the user''''s role
  UPDATE profiles 
  SET role = new_role, updated_at = now()
  WHERE id = target_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION ''User not found'';
  END IF;
END;
';

-- Function to update product stock
CREATE OR REPLACE FUNCTION update_product_stock(
  product_id_param INTEGER,
  quantity_change INTEGER,
  movement_type TEXT,
  variant_id_param INTEGER DEFAULT NULL,
  reason_param TEXT DEFAULT NULL,
  reference_id_param INTEGER DEFAULT NULL,
  reference_type_param TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  -- Update main product stock
  IF variant_id_param IS NULL THEN
    UPDATE products 
    SET stock = stock + quantity_change,
        updated_at = now()
    WHERE id = product_id_param;
  ELSE
    -- Update variant stock
    UPDATE product_variants 
    SET stock = stock + quantity_change
    WHERE id = variant_id_param;
  END IF;
  
  -- Record inventory movement
  INSERT INTO inventory_movements (
    product_id, variant_id, movement_type, quantity, 
    reason, reference_id, reference_type, created_by
  ) VALUES (
    product_id_param, variant_id_param, movement_type, 
    ABS(quantity_change), reason_param, reference_id_param, 
    reference_type_param, auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;