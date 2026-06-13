'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center py-20">
          <ShoppingCart className="w-20 h-20 mx-auto mb-6 text-gray-200" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Looks like you haven't added anything yet.</p>
          <Link href="/products" className="btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = totalPrice();
  const delivery = subtotal >= 499 ? 0 : 49;
  const total = subtotal + delivery;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/products" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Shopping Cart</h1>
          <span className="bg-primary-100 text-primary-700 text-sm font-bold px-2.5 py-0.5 rounded-full">
            {items.length} items
          </span>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="bg-white rounded-xl p-4 flex gap-4 shadow-sm">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                  <Image
                    src={product.image_url || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200'}
                    alt={product.name}
                    fill className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${product.slug}`} className="font-semibold text-gray-800 hover:text-primary-700 line-clamp-1">
                    {product.name}
                  </Link>
                  <p className="text-xs text-gray-500 mt-0.5">{product.unit} · {product.category?.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Sold by: {product.farmer?.farm_name}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2 border border-gray-200 rounded-lg overflow-hidden">
                      <button onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="px-3 py-1.5 hover:bg-gray-50 text-gray-600 transition">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 font-semibold text-sm">{quantity}</span>
                      <button onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="px-3 py-1.5 hover:bg-gray-50 text-gray-600 transition">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-primary-700">{formatPrice(product.price * quantity)}</span>
                      <button onClick={() => removeItem(product.id)}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-between pt-2">
              <Link href="/products" className="text-sm text-primary-700 hover:underline flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" /> Continue Shopping
              </Link>
              <button onClick={clearCart} className="text-sm text-red-500 hover:underline">
                Clear Cart
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-20">
              <h2 className="font-bold text-lg text-gray-800 mb-4">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({items.length} items)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery charges</span>
                  <span className={delivery === 0 ? 'text-green-600 font-medium' : ''}>
                    {delivery === 0 ? 'FREE' : formatPrice(delivery)}
                  </span>
                </div>
                {subtotal < 499 && (
                  <p className="text-xs text-primary-600 bg-primary-50 rounded-lg px-3 py-2">
                    Add {formatPrice(499 - subtotal)} more for free delivery!
                  </p>
                )}
                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary-700">{formatPrice(total)}</span>
                </div>
              </div>

              <Link href="/checkout" className="btn-primary w-full justify-center mt-6">
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="mt-4 flex items-center gap-2 text-xs text-gray-400 justify-center">
                <span>🔒</span>
                <span>Safe and secure checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
