'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Star, MapPin, ShieldCheck, ArrowLeft, Package } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import ProductCard from '@/components/products/ProductCard';
import type { ProductWithFarmer } from '@/types/database';

export default function FarmerDetailPage() {
  const { id } = useParams();
  const [farmer, setFarmer] = useState<any>(null);
  const [products, setProducts] = useState<ProductWithFarmer[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      // @ts-ignore
      const { data: farmerDataRaw } = await supabase.from('farmers').select('*, profile:profiles(email)').eq('id', id).single();
      const farmerData = farmerDataRaw as any;
      setFarmer(farmerData);

      if (farmerData) {
        // @ts-ignore
        const { data: prods } = await supabase.from('products').select('*, farmer:farmers(*), category:categories(*)').eq('farmer_id', farmerData.id).order('created_at', { ascending: false });
        setProducts((prods || []) as ProductWithFarmer[]);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-300 border-t-primary-700 rounded-full animate-spin" />
      </div>
    );
  }

  if (!farmer) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="mb-4">Farmer not found</p>
          <Link href="/farmers" className="btn-primary">View All Farmers</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover */}
      <div className="relative h-48 bg-gradient-to-r from-primary-700 to-primary-500">
        {farmer.cover_url && (
          <Image src={farmer.cover_url} alt="" fill className="object-cover" />
        )}
        <div className="absolute inset-0 bg-black/20" />
        <Link href="/farmers"
          className="absolute top-4 left-4 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center text-gray-700 hover:bg-white transition">
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-16 relative">
        {/* Farmer card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-md shrink-0">
              <Image
                src={farmer.avatar_url || 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=200'}
                alt={farmer.farm_name} fill className="object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{farmer.farm_name}</h1>
                  <p className="text-gray-500 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-4 h-4" /> {farmer.location}, {farmer.state}
                  </p>
                </div>
                {farmer.verified && (
                  <span className="flex items-center gap-1.5 text-sm text-green-700 bg-green-50 border border-green-100 px-3 py-1.5 rounded-full font-medium">
                    <ShieldCheck className="w-4 h-4" /> Verified Farmer
                  </span>
                )}
              </div>
              {farmer.bio && (
                <p className="text-gray-600 text-sm mt-3 leading-relaxed">{farmer.bio}</p>
              )}
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-1.5">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-gray-800">{farmer.rating.toFixed(1)}</span>
                  <span className="text-sm text-gray-500">({farmer.total_reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Package className="w-4 h-4" />
                  <span>{products.length} products</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products */}
        <h2 className="font-bold text-xl text-gray-800 mb-4">Products from {farmer.farm_name}</h2>
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pb-10">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-10 text-center text-gray-400 mb-8">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No products listed yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
