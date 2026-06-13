import { createClient } from '@/lib/supabase/server';
import ProductCard from '@/components/products/ProductCard';
import type { ProductWithFarmer } from '@/types/database';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: { slug: string };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = params;
  let category: any = null;
  let products: ProductWithFarmer[] = [];

  try {
    const supabase = createClient();
    // @ts-ignore
    const { data: cat } = await supabase.from('categories').select('*').eq('slug', slug).single();
    category = cat;

    if (cat) {
      // @ts-ignore
      const { data } = await supabase.from('products').select('*, farmer:farmers(*), category:categories(*)').eq('category_id', cat.id).order('created_at', { ascending: false });
      if (data) products = data as ProductWithFarmer[];
    }
  } catch {}

  const displayName = slug.charAt(0).toUpperCase() + slug.slice(1);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center gap-3">
            <Link href="/categories" className="text-gray-400 hover:text-gray-600">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                {category?.name || displayName}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {category?.description || `Fresh ${displayName} from local farms`} · {products.length} products
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg font-medium text-gray-500">No products in this category yet</p>
            <Link href="/products" className="btn-primary mt-4 inline-flex">Browse All Products</Link>
          </div>
        )}
      </div>
    </div>
  );
}
