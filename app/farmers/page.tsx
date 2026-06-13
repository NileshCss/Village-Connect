import { createClient } from '@/lib/supabase/server';
import Image from 'next/image';
import Link from 'next/link';
import { Star, MapPin, ShieldCheck, Package } from 'lucide-react';

const fallbackFarmers = [
  { id: 'f1', user_id: 'u1', farm_name: 'Green Valley Farm', location: 'Amritsar', state: 'Punjab', bio: 'Growing organic vegetables and fruits for over 20 years.', avatar_url: 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=200', cover_url: null, verified: true, rating: 4.8, total_reviews: 234, created_at: '' },
  { id: 'f2', user_id: 'u2', farm_name: 'Organic Bliss Farm', location: 'Nashik', state: 'Maharashtra', bio: 'Certified organic farmer supplying premium produce.', avatar_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200', cover_url: null, verified: true, rating: 4.6, total_reviews: 189, created_at: '' },
  { id: 'f3', user_id: 'u3', farm_name: 'Sunrise Honey Farm', location: 'Shimla', state: 'Himachal Pradesh', bio: 'Pure natural honey from our forest beehives.', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200', cover_url: null, verified: true, rating: 4.9, total_reviews: 312, created_at: '' },
  { id: 'f4', user_id: 'u4', farm_name: 'Rice Heritage Farm', location: 'Cuttack', state: 'Odisha', bio: 'Traditional rice cultivation preserving ancient varieties.', avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200', cover_url: null, verified: true, rating: 4.7, total_reviews: 156, created_at: '' },
  { id: 'f5', user_id: 'u5', farm_name: 'Spice Garden', location: 'Kochi', state: 'Kerala', bio: 'Aromatic spices grown in the lush hills of Kerala.', avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200', cover_url: null, verified: false, rating: 4.5, total_reviews: 98, created_at: '' },
  { id: 'f6', user_id: 'u6', farm_name: 'Dairy Delight', location: 'Anand', state: 'Gujarat', bio: 'Fresh dairy products from grass-fed cows.', avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200', cover_url: null, verified: true, rating: 4.4, total_reviews: 87, created_at: '' },
];

export default async function FarmersPage() {
  let farmers = fallbackFarmers;
  try {
    const supabase = createClient();
    const { data } = await supabase.from('farmers').select('*').order('rating', { ascending: false });
    if (data && data.length > 0) farmers = data;
  } catch {}

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-800 to-primary-600 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-3">Our Verified Farmers</h1>
          <p className="text-primary-200 max-w-xl mx-auto">
            Meet the hardworking farmers who grow fresh, quality produce directly for you.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { number: '2,000+', label: 'Active Farmers' },
            { number: '500+', label: 'Villages' },
            { number: '28', label: 'States Covered' },
          ].map(({ number, label }) => (
            <div key={label} className="bg-white rounded-xl p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-primary-700">{number}</div>
              <div className="text-sm text-gray-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Farmers grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {farmers.map((farmer) => (
            <Link key={farmer.id} href={`/farmers/${farmer.id}`}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
              {/* Cover */}
              <div className="h-24 bg-gradient-to-r from-primary-100 to-primary-50 relative overflow-hidden">
                {farmer.cover_url && (
                  <Image src={farmer.cover_url} alt="" fill className="object-cover" />
                )}
              </div>
              <div className="px-5 pb-5">
                {/* Avatar */}
                <div className="relative -mt-8 mb-3 flex items-end justify-between">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow">
                    <Image
                      src={farmer.avatar_url || 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=100'}
                      alt={farmer.farm_name} fill className="object-cover"
                    />
                  </div>
                  {farmer.verified && (
                    <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full font-medium">
                      <ShieldCheck className="w-3 h-3" /> Verified
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-gray-800 group-hover:text-primary-700 transition-colors">
                  {farmer.farm_name}
                </h3>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" /> {farmer.location}, {farmer.state}
                </p>
                {farmer.bio && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{farmer.bio}</p>
                )}

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-sm">{farmer.rating.toFixed(1)}</span>
                    <span className="text-xs text-gray-400">({farmer.total_reviews})</span>
                  </div>
                  <span className="text-xs text-primary-700 font-medium flex items-center gap-1">
                    <Package className="w-3 h-3" /> View Products
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
