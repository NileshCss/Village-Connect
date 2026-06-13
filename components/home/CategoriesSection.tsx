import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { ChevronRight } from 'lucide-react';

const fallbackCategories = [
  { id: '1', name: 'Vegetables', slug: 'vegetables', product_count: 120, image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200' },
  { id: '2', name: 'Fruits', slug: 'fruits', product_count: 150, image_url: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=200' },
  { id: '3', name: 'Dairy', slug: 'dairy', product_count: 80, image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200' },
  { id: '4', name: 'Grains', slug: 'grains', product_count: 100, image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200' },
  { id: '5', name: 'Fish', slug: 'fish', product_count: 60, image_url: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=200' },
  { id: '6', name: 'Eggs', slug: 'eggs', product_count: 40, image_url: 'https://images.unsplash.com/photo-1569288063643-5d29ad64df09?w=200' },
  { id: '7', name: 'Handicrafts', slug: 'handicrafts', product_count: 75, image_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=200' },
  { id: '8', name: 'Honey', slug: 'honey', product_count: 30, image_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=200' },
  { id: '9', name: 'Spices', slug: 'spices', product_count: 90, image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=200' },
  { id: '10', name: 'Organic', slug: 'organic', product_count: 50, image_url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=200' },
];

export default async function CategoriesSection() {
  let categories = fallbackCategories;
  try {
    const supabase = createClient();
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data && data.length > 0) categories = data;
  } catch {}

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-primary-600 rounded-full" />
            <h2 className="text-2xl font-bold text-gray-800">Shop by Category</h2>
          </div>
          <Link href="/categories" className="text-sm font-medium text-primary-700 hover:text-primary-900 flex items-center gap-1">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-5 md:grid-cols-10 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="category-card"
            >
              <div className="category-img w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-white border-2 border-transparent transition-all duration-200 hover:border-primary-500 shadow-sm">
                <div className="relative w-full h-full">
                  <Image
                    src={cat.image_url || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100'}
                    alt={cat.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <span className="text-xs text-center text-gray-700 font-medium leading-tight">{cat.name}</span>
              <span className="text-xs text-gray-400">{cat.product_count}+</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
