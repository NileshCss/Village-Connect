import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import ProductCard from '@/components/products/ProductCard';
import type { ProductWithFarmer } from '@/types/database';

const fallbackProducts: ProductWithFarmer[] = [
  {
    id: '1', farmer_id: 'f1', category_id: 'c2', name: 'Fresh Bananas (1 Dozen)', slug: 'fresh-bananas',
    description: null, price: 50, original_price: 60, unit: '1 Dozen', stock_quantity: 100,
    image_url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400',
    images: [], is_organic: false, is_featured: true, rating: 4.5, total_reviews: 234,
    discount_percent: 20, created_at: '', updated_at: '',
    farmer: { id: 'f1', user_id: 'u1', farm_name: 'India Gate', location: 'Punjab', state: 'Punjab', bio: null, avatar_url: null, cover_url: null, verified: true, rating: 4.5, total_reviews: 100, created_at: '' },
    category: { id: 'c2', name: 'Fruits', slug: 'fruits', description: null, image_url: null, product_count: 150, created_at: '' },
  },
  {
    id: '2', farmer_id: 'f2', category_id: 'c1', name: 'Organic Tomatoes (1Kg)', slug: 'organic-tomatoes',
    description: null, price: 42, original_price: 60, unit: '1kg', stock_quantity: 80,
    image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400',
    images: [], is_organic: true, is_featured: true, rating: 4, total_reviews: 98,
    discount_percent: 15, created_at: '', updated_at: '',
    farmer: { id: 'f2', user_id: 'u2', farm_name: 'Local Farm', location: 'Maharashtra', state: 'Maharashtra', bio: null, avatar_url: null, cover_url: null, verified: true, rating: 4.2, total_reviews: 80, created_at: '' },
    category: { id: 'c1', name: 'Vegetables', slug: 'vegetables', description: null, image_url: null, product_count: 120, created_at: '' },
  },
  {
    id: '3', farmer_id: 'f3', category_id: 'c1', name: 'Farm Fresh Potatoes (1kg)', slug: 'farm-fresh-potatoes',
    description: null, price: 27, original_price: 30, unit: '1kg', stock_quantity: 200,
    image_url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400',
    images: [], is_organic: false, is_featured: true, rating: 4, total_reviews: 156,
    discount_percent: 10, created_at: '', updated_at: '',
    farmer: { id: 'f3', user_id: 'u3', farm_name: 'Local Farm', location: 'UP', state: 'Uttar Pradesh', bio: null, avatar_url: null, cover_url: null, verified: true, rating: 4.0, total_reviews: 60, created_at: '' },
    category: { id: 'c1', name: 'Vegetables', slug: 'vegetables', description: null, image_url: null, product_count: 120, created_at: '' },
  },
  {
    id: '4', farmer_id: 'f4', category_id: 'c4', name: 'Local Rice (5kg)', slug: 'local-rice-5kg',
    description: null, price: 240, original_price: null, unit: '5kg', stock_quantity: 50,
    image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
    images: [], is_organic: false, is_featured: true, rating: 4, total_reviews: 320,
    discount_percent: null, created_at: '', updated_at: '',
    farmer: { id: 'f4', user_id: 'u4', farm_name: 'Local Rice', location: 'Odisha', state: 'Odisha', bio: null, avatar_url: null, cover_url: null, verified: true, rating: 4.5, total_reviews: 200, created_at: '' },
    category: { id: 'c4', name: 'Grains', slug: 'grains', description: null, image_url: null, product_count: 100, created_at: '' },
  },
  {
    id: '5', farmer_id: 'f5', category_id: 'c8', name: 'Pure Honey (500g)', slug: 'pure-honey-500g',
    description: null, price: 180, original_price: null, unit: '500g', stock_quantity: 40,
    image_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400',
    images: [], is_organic: true, is_featured: true, rating: 4.5, total_reviews: 88,
    discount_percent: null, created_at: '', updated_at: '',
    farmer: { id: 'f5', user_id: 'u5', farm_name: 'Village Honey', location: 'Himachal Pradesh', state: 'Himachal Pradesh', bio: null, avatar_url: null, cover_url: null, verified: true, rating: 4.8, total_reviews: 150, created_at: '' },
    category: { id: 'c8', name: 'Honey', slug: 'honey', description: null, image_url: null, product_count: 30, created_at: '' },
  },
  {
    id: '6', farmer_id: 'f6', category_id: 'c9', name: 'Cold Pressed Mustard Oil (1L)', slug: 'cold-pressed-mustard-oil',
    description: null, price: 150, original_price: null, unit: '1L', stock_quantity: 60,
    image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400',
    images: [], is_organic: false, is_featured: true, rating: 4, total_reviews: 45,
    discount_percent: null, created_at: '', updated_at: '',
    farmer: { id: 'f6', user_id: 'u6', farm_name: 'Fortune', location: 'Rajasthan', state: 'Rajasthan', bio: null, avatar_url: null, cover_url: null, verified: true, rating: 4.2, total_reviews: 90, created_at: '' },
    category: { id: 'c9', name: 'Spices', slug: 'spices', description: null, image_url: null, product_count: 90, created_at: '' },
  },
];

export default async function FeaturedProducts() {
  let products: ProductWithFarmer[] = fallbackProducts;
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from('products')
      .select('*, farmer:farmers(*), category:categories(*)')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(8);
    if (data && data.length > 0) products = data as ProductWithFarmer[];
  } catch {}

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-harvest rounded-full" />
            <h2 className="text-2xl font-bold text-gray-800">Featured Products</h2>
          </div>
          <Link href="/products" className="text-sm font-medium text-primary-700 hover:text-primary-900 flex items-center gap-1">
            View All Products <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
