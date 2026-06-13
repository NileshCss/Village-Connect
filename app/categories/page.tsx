import { createClient } from '@/lib/supabase/server';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const fallbackCategories = [
  { id: '1', name: 'Vegetables', slug: 'vegetables', description: 'Fresh farm vegetables harvested daily', product_count: 120, image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400', created_at: '' },
  { id: '2', name: 'Fruits', slug: 'fruits', description: 'Seasonal fresh fruits from local orchards', product_count: 150, image_url: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400', created_at: '' },
  { id: '3', name: 'Dairy', slug: 'dairy', description: 'Pure dairy products from grass-fed cows', product_count: 80, image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400', created_at: '' },
  { id: '4', name: 'Grains', slug: 'grains', description: 'Whole grains and cereals', product_count: 100, image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', created_at: '' },
  { id: '5', name: 'Fish', slug: 'fish', description: 'Fresh caught fish and seafood', product_count: 60, image_url: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400', created_at: '' },
  { id: '6', name: 'Eggs', slug: 'eggs', description: 'Farm fresh eggs daily', product_count: 40, image_url: 'https://images.unsplash.com/photo-1569288063643-5d29ad64df09?w=400', created_at: '' },
  { id: '7', name: 'Handicrafts', slug: 'handicrafts', description: 'Handmade village crafts and artifacts', product_count: 75, image_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400', created_at: '' },
  { id: '8', name: 'Honey', slug: 'honey', description: 'Pure natural honey varieties', product_count: 30, image_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400', created_at: '' },
  { id: '9', name: 'Spices', slug: 'spices', description: 'Aromatic fresh spices and herbs', product_count: 90, image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400', created_at: '' },
  { id: '10', name: 'Organic', slug: 'organic', description: 'Certified organic produce', product_count: 50, image_url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400', created_at: '' },
];

export default async function CategoriesPage() {
  let categories = fallbackCategories;
  try {
    const supabase = createClient();
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data && data.length > 0) categories = data;
  } catch {}

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-primary-800 to-primary-600 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-3">Shop by Category</h1>
          <p className="text-primary-200">Explore our wide range of fresh farm products</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/categories/${cat.slug}`}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <div className="relative h-36 overflow-hidden">
                <Image
                  src={cat.image_url || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300'}
                  alt={cat.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <h3 className="absolute bottom-2 left-3 text-white font-bold text-sm">{cat.name}</h3>
              </div>
              <div className="p-3">
                <p className="text-xs text-gray-500 line-clamp-2">{cat.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-primary-600 font-medium">{cat.product_count}+ products</span>
                  <ArrowRight className="w-4 h-4 text-primary-500 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
