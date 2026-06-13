import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import ProductCard from '@/components/products/ProductCard';
import type { ProductWithFarmer } from '@/types/database';
import { SlidersHorizontal, Search } from 'lucide-react';

interface PageProps {
  searchParams: {
    search?: string;
    category?: string;
    sort?: string;
    organic?: string;
    page?: string;
  };
}

const fallbackProducts: ProductWithFarmer[] = [
  {
    id: '1', farmer_id: 'f1', category_id: 'c2', name: 'Fresh Bananas (1 Dozen)', slug: 'fresh-bananas',
    description: 'Sweet and ripe bananas from local farms.', price: 50, original_price: 60, unit: '1 Dozen', stock_quantity: 100,
    image_url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400',
    images: [], is_organic: false, is_featured: true, rating: 4.5, total_reviews: 234,
    discount_percent: 20, created_at: '', updated_at: '',
    farmer: { id: 'f1', user_id: 'u1', farm_name: 'India Gate', location: 'Punjab', state: 'Punjab', bio: null, avatar_url: null, cover_url: null, verified: true, rating: 4.5, total_reviews: 100, created_at: '' },
    category: { id: 'c2', name: 'Fruits', slug: 'fruits', description: null, image_url: null, product_count: 150, created_at: '' },
  },
  {
    id: '2', farmer_id: 'f2', category_id: 'c1', name: 'Organic Tomatoes (1Kg)', slug: 'organic-tomatoes',
    description: 'Juicy organic tomatoes grown without pesticides.', price: 42, original_price: 60, unit: '1kg', stock_quantity: 80,
    image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400',
    images: [], is_organic: true, is_featured: true, rating: 4, total_reviews: 98,
    discount_percent: 15, created_at: '', updated_at: '',
    farmer: { id: 'f2', user_id: 'u2', farm_name: 'Local Farm', location: 'Maharashtra', state: 'Maharashtra', bio: null, avatar_url: null, cover_url: null, verified: true, rating: 4.2, total_reviews: 80, created_at: '' },
    category: { id: 'c1', name: 'Vegetables', slug: 'vegetables', description: null, image_url: null, product_count: 120, created_at: '' },
  },
  {
    id: '3', farmer_id: 'f3', category_id: 'c1', name: 'Farm Fresh Potatoes (1kg)', slug: 'farm-fresh-potatoes',
    description: 'Freshly harvested potatoes from local farms.', price: 27, original_price: 30, unit: '1kg', stock_quantity: 200,
    image_url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400',
    images: [], is_organic: false, is_featured: true, rating: 4, total_reviews: 156,
    discount_percent: 10, created_at: '', updated_at: '',
    farmer: { id: 'f3', user_id: 'u3', farm_name: 'Local Farm', location: 'UP', state: 'Uttar Pradesh', bio: null, avatar_url: null, cover_url: null, verified: true, rating: 4.0, total_reviews: 60, created_at: '' },
    category: { id: 'c1', name: 'Vegetables', slug: 'vegetables', description: null, image_url: null, product_count: 120, created_at: '' },
  },
  {
    id: '4', farmer_id: 'f4', category_id: 'c4', name: 'Local Rice (5kg)', slug: 'local-rice-5kg',
    description: 'Aromatic local rice grown by traditional methods.', price: 240, original_price: null, unit: '5kg', stock_quantity: 50,
    image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
    images: [], is_organic: false, is_featured: true, rating: 4, total_reviews: 320,
    discount_percent: null, created_at: '', updated_at: '',
    farmer: { id: 'f4', user_id: 'u4', farm_name: 'Local Rice', location: 'Odisha', state: 'Odisha', bio: null, avatar_url: null, cover_url: null, verified: true, rating: 4.5, total_reviews: 200, created_at: '' },
    category: { id: 'c4', name: 'Grains', slug: 'grains', description: null, image_url: null, product_count: 100, created_at: '' },
  },
  {
    id: '5', farmer_id: 'f5', category_id: 'c8', name: 'Pure Honey (500g)', slug: 'pure-honey-500g',
    description: 'Natural honey collected from forest beehives.', price: 180, original_price: null, unit: '500g', stock_quantity: 40,
    image_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400',
    images: [], is_organic: true, is_featured: true, rating: 4.5, total_reviews: 88,
    discount_percent: null, created_at: '', updated_at: '',
    farmer: { id: 'f5', user_id: 'u5', farm_name: 'Village Honey', location: 'Himachal Pradesh', state: 'Himachal Pradesh', bio: null, avatar_url: null, cover_url: null, verified: true, rating: 4.8, total_reviews: 150, created_at: '' },
    category: { id: 'c8', name: 'Honey', slug: 'honey', description: null, image_url: null, product_count: 30, created_at: '' },
  },
  {
    id: '6', farmer_id: 'f6', category_id: 'c9', name: 'Cold Pressed Mustard Oil (1L)', slug: 'cold-pressed-mustard-oil',
    description: 'Traditional cold-pressed mustard oil, pure and healthy.', price: 150, original_price: null, unit: '1L', stock_quantity: 60,
    image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400',
    images: [], is_organic: false, is_featured: false, rating: 4, total_reviews: 45,
    discount_percent: null, created_at: '', updated_at: '',
    farmer: { id: 'f6', user_id: 'u6', farm_name: 'Fortune', location: 'Rajasthan', state: 'Rajasthan', bio: null, avatar_url: null, cover_url: null, verified: true, rating: 4.2, total_reviews: 90, created_at: '' },
    category: { id: 'c9', name: 'Spices', slug: 'spices', description: null, image_url: null, product_count: 90, created_at: '' },
  },
];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

export default async function ProductsPage({ searchParams }: PageProps) {
  const { search = '', category = '', sort = 'newest', organic = '' } = searchParams;
  let products: ProductWithFarmer[] = fallbackProducts;

  try {
    const supabase = createClient();
    let query = supabase
      .from('products')
      .select('*, farmer:farmers(*), category:categories(*)');

    if (search) query = query.ilike('name', `%${search}%`);
    if (category) query = query.eq('categories.slug', category);
    if (organic === 'true') query = query.eq('is_organic', true);

    if (sort === 'price_asc') query = query.order('price', { ascending: true });
    else if (sort === 'price_desc') query = query.order('price', { ascending: false });
    else if (sort === 'rating') query = query.order('rating', { ascending: false });
    else query = query.order('created_at', { ascending: false });

    const { data } = await query.limit(24);
    if (data && data.length > 0) products = data as ProductWithFarmer[];
  } catch {}

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {search ? `Results for "${search}"` : category ? `${category.charAt(0).toUpperCase() + category.slice(1)}` : 'All Products'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{products.length} products found</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Filters bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="w-4 h-4 text-gray-500" />
            <span className="font-medium text-sm text-gray-700">Filters:</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked={organic === 'true'}
                className="w-4 h-4 accent-primary-600"
              />
              <span className="text-sm text-gray-600">Organic Only</span>
            </label>
          </div>
          <select
            defaultValue={sort}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary-500"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Products grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <Search className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium text-gray-500">No products found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
