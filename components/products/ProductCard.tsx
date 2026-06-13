'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '@/lib/store/cart';
import { formatPrice } from '@/lib/utils';
import type { ProductWithFarmer } from '@/types/database';

interface ProductCardProps {
  product: ProductWithFarmer;
  className?: string;
}

export default function ProductCard({ product, className = '' }: ProductCardProps) {
  const { addItem } = useCartStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
    toast.success(`${product.name} added to cart!`);
  };

  const discount = product.discount_percent ??
    (product.original_price
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : null);

  return (
    <Link href={`/products/${product.slug}`} className={`product-card bg-white rounded-xl overflow-hidden border border-gray-100 group block ${className}`}>
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <Image
          src={product.image_url || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400'}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {discount && discount > 0 && (
          <span className="absolute top-2 left-2 badge-discount">
            {discount}% OFF
          </span>
        )}
        {product.is_organic && (
          <span className="absolute top-2 right-10 badge-organic">Organic</span>
        )}
        <button
          onClick={(e) => {
            e.preventDefault();
            toast.success('Added to wishlist!');
          }}
          className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
        >
          <Heart className="w-4 h-4 text-gray-400 hover:text-red-500" />
        </button>
      </div>

      <div className="p-3">
        <p className="text-xs text-gray-400 mb-0.5">
          {product.category?.name} · {product.farmer?.farm_name || 'Local Farm'}
        </p>
        <h3 className="font-semibold text-sm text-gray-800 line-clamp-2 leading-snug mb-2">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-3 h-3 ${star <= Math.round(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
            />
          ))}
          <span className="text-xs text-gray-400 ml-1">({product.total_reviews})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="font-bold text-primary-700">{formatPrice(product.price)}</span>
          {product.original_price && product.original_price > product.price && (
            <span className="text-xs text-gray-400 line-through">{formatPrice(product.original_price)}</span>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          className="w-full bg-primary-700 hover:bg-primary-800 text-white text-xs font-semibold py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          Add to Cart
        </button>
      </div>
    </Link>
  );
}
