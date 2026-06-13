'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ShoppingCart, Heart, Star, ShieldCheck, Truck,
  ArrowLeft, Plus, Minus, Share2, MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '@/lib/store/cart';
import { formatPrice } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import type { ProductWithFarmer } from '@/types/database';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [product, setProduct] = useState<ProductWithFarmer | null>(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addItem } = useCartStore();
  const supabase = createClient();

  useEffect(() => {
    const fetch = async () => {
      // @ts-ignore
      const { data } = await supabase.from('products').select('*, farmer:farmers(*), category:categories(*)').eq('slug', slug).single();
      setProduct(data as any as ProductWithFarmer);
      setLoading(false);
    };
    fetch();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-300 border-t-primary-700 rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg font-medium">Product not found</p>
          <Link href="/products" className="btn-primary mt-4 inline-flex">Browse Products</Link>
        </div>
      </div>
    );
  }

  const images = [product.image_url, ...(product.images || [])].filter(Boolean) as string[];
  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100) : null;

  const handleAddToCart = () => {
    addItem(product, qty);
    toast.success(`${qty}× ${product.name} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-primary-700">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-primary-700">Products</Link>
          <span>/</span>
          {product.category && (
            <>
              <Link href={`/categories/${product.category.slug}`} className="hover:text-primary-700">
                {product.category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-gray-600 line-clamp-1">{product.name}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-8 bg-white rounded-2xl shadow-sm p-6 md:p-8">
          {/* Images */}
          <div className="space-y-3">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50">
              <Image
                src={images[selectedImage] || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600'}
                alt={product.name} fill className="object-cover"
              />
              {discount && discount > 0 && (
                <span className="absolute top-3 left-3 badge-discount text-sm px-2.5 py-1">
                  {discount}% OFF
                </span>
              )}
              {product.is_organic && (
                <span className="absolute top-3 right-3 badge-organic text-sm px-2.5 py-1">Organic</span>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === i ? 'border-primary-500' : 'border-transparent'}`}>
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-5">
            <div>
              {product.category && (
                <Link href={`/categories/${product.category.slug}`}
                  className="text-sm text-primary-600 font-medium hover:underline">
                  {product.category.name}
                </Link>
              )}
              <h1 className="text-2xl font-bold text-gray-800 mt-1">{product.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} className={`w-4 h-4 ${s <= Math.round(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                  ))}
                </div>
                <span className="text-sm text-gray-500">{product.rating.toFixed(1)} ({product.total_reviews} reviews)</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-end gap-3">
              <span className="text-3xl font-bold text-primary-700">{formatPrice(product.price)}</span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-lg text-gray-400 line-through">{formatPrice(product.original_price)}</span>
              )}
              <span className="text-sm text-gray-500">/ {product.unit}</span>
            </div>

            {product.description && (
              <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
            )}

            {/* Farmer info */}
            {product.farmer && (
              <div className="flex items-center gap-3 bg-green-50 rounded-xl p-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-700 font-bold text-sm">
                    {product.farmer.farm_name[0]}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-800">{product.farmer.farm_name}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {product.farmer.location}, {product.farmer.state}
                    {product.farmer.verified && <ShieldCheck className="w-3 h-3 text-green-600 ml-1" />}
                  </p>
                </div>
                <Link href={`/farmers/${product.farmer.id}`} className="ml-auto text-xs text-primary-700 hover:underline">
                  View Farm
                </Link>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-gray-700">Quantity:</span>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-4 py-2.5 hover:bg-gray-50 text-gray-600 transition">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-5 font-bold text-gray-800">{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock_quantity, qty + 1))}
                  className="px-4 py-2.5 hover:bg-gray-50 text-gray-600 transition">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-xs text-gray-400">{product.stock_quantity} in stock</span>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={handleAddToCart}
                className="btn-primary flex-1 justify-center">
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </button>
              <button
                onClick={() => toast.success('Added to wishlist!')}
                className="p-3 border-2 border-gray-200 rounded-xl hover:border-red-300 hover:text-red-500 transition-colors">
                <Heart className="w-5 h-5" />
              </button>
              <button
                onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}
                className="p-3 border-2 border-gray-200 rounded-xl hover:border-primary-300 hover:text-primary-600 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Delivery info */}
            <div className="border border-gray-100 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Truck className="w-4 h-4 text-primary-600 shrink-0" />
                <span>Free delivery on orders above ₹499</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <ShieldCheck className="w-4 h-4 text-primary-600 shrink-0" />
                <span>100% authentic & quality checked</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
