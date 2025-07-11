# Supabase Setup Guide

This project uses Supabase as the backend database. Follow these steps to set up Supabase integration.

## Prerequisites

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project in your Supabase dashboard

## Environment Variables

### Local Development

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Get your Supabase project credentials:
   - Go to your Supabase project dashboard
   - Navigate to Settings > API
   - Copy the Project URL and anon/public key

3. Update your `.env` file:
   ```bash
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_KEY=your-anon-public-key-here
   ```

### Production Deployment

For production deployments (GitHub, Vercel, etc.), set these environment variables in your deployment platform:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_KEY`

## Database Schema

For the example `ProductsList` component, create a `products` table in your Supabase database:

```sql
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some sample data
INSERT INTO products (name, description, price) VALUES
  ('Coffee Beans', 'Premium Arabica coffee beans', 24.99),
  ('Espresso Machine', 'Professional grade espresso machine', 299.99),
  ('Coffee Mug', 'Ceramic coffee mug with logo', 9.99);
```

## Usage

The Supabase client is available throughout your application by importing it from `@/lib/supabase`:

```typescript
import { supabase } from '@/lib/supabase'

// Example: Fetch data
const { data, error } = await supabase
  .from('products')
  .select('*')

// Example: Insert data
const { data, error } = await supabase
  .from('products')
  .insert({ name: 'New Product', price: 19.99 })

// Example: Update data
const { data, error } = await supabase
  .from('products')
  .update({ price: 29.99 })
  .eq('id', 1)

// Example: Delete data
const { data, error } = await supabase
  .from('products')
  .delete()
  .eq('id', 1)
```

## Components

### ProductsList Component

The `ProductsList` component demonstrates how to:
- Fetch data from Supabase
- Handle loading states
- Display error messages
- Render data in a responsive grid layout

To use this component in your app:

```typescript
import ProductsList from '@/components/ProductsList'

function App() {
  return (
    <div>
      <ProductsList />
    </div>
  )
}
```

## Security Notes

- The anon/public key is safe to use in client-side code
- Use Row Level Security (RLS) in Supabase for data protection
- Never commit your `.env` file to version control
- Use service role keys only on the server side for admin operations

## Troubleshooting

### Common Issues

1. **Missing environment variables**: Ensure both `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY` are set
2. **CORS errors**: Check your Supabase project settings and ensure your domain is allowed
3. **RLS blocking queries**: If you get permission errors, check your Row Level Security policies
4. **TypeScript errors**: Ensure `@supabase/supabase-js` is properly installed

### Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```
