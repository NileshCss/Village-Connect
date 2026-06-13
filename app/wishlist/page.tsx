'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/lib/store/cart';

export default function WishlistPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCartStore();
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from('wishlists')
        .select('*, product:products(*, farmer:farmers(*), category:categories(*))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setItems(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const removeFromWishlist = async (wishlistId: string) => {
    await supabase.from('wishlists').delete().eq('id', wishlistId);
    setItems((prev) => prev.filter((i) => i.id !== wishlistId));
    toast.success('Removed from wishlist');
  };

  const moveToCart = (item: any) => {
    addItem(item.product);
    toast.success('Added to cart!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-300 border-t-primary-700 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 mb-6">
          <Heart className="w-6 h-6 text-red-500 fill-red-500" />
          <h1 className="text-2xl font-bold text-gray-800">My Wishlist</h1>
          <span className="bg-red-100 text-red-600 text-sm font-bold px-2.5 py-0.5 rounded-full">
            {items.length}
          </span>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
            <Heart className="w-16 h-16 mx-auto mb-4 text-gray-200" />
            <h2 className="font-bold text-gray-700 text-lg">Your wishlist is empty</h2>
            <p className="text-gray-500 text-sm mt-1 mb-6">Save your favourite products here</p>
            <Link href="/products" className="btn-primary">Browse Products</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm p-4 flex gap-4">
                <Link href={`/products/${item.product?.slug}`}>
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                    <Image
                      src={item.product?.image_url || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200'}
                      alt={item.product?.name} fill className="object-cover"
                    />
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.product?.slug}`}>
                    <h3 className="font-semibold text-sm text-gray-800 hover:text-primary-700 line-clamp-1">
                      {item.product?.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-gray-400 mt-0.5">{item.product?.unit}</p>
                  <p className="font-bold text-primary-700 mt-1.5">{formatPrice(item.product?.price)}</p>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => moveToCart(item)}
                      className="flex-1 bg-primary-700 hover:bg-primary-800 text-white text-xs font-semibold py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors">
                      <ShoppingCart className="w-3 h-3" /> Add to Cart
                    </button>
                    <button onClick={() => removeFromWishlist(item.id)}
                      className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
