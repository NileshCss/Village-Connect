'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, ShoppingCart, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart';
import { formatPrice } from '@/lib/utils';

export default function CartDrawer() {
  const [mounted, setMounted] = useState(false);
  const { items, isOpen, setCartOpen, removeItem, updateQuantity, totalPrice } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={() => setCartOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white z-50 flex flex-col shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary-700" />
            <h2 className="font-bold text-lg text-gray-800">My Cart</h2>
            <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {items.length}
            </span>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <ShoppingCart className="w-16 h-16 mb-4 opacity-30" />
              <p className="font-medium text-gray-500">Your cart is empty</p>
              <p className="text-sm mt-1">Add some fresh products!</p>
              <Link
                href="/products"
                onClick={() => setCartOpen(false)}
                className="mt-4 btn-primary text-sm py-2 px-4"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            items.map(({ product, quantity }) => (
              <div key={product.id} className="flex gap-3 pb-4 border-b border-gray-50">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                  <Image
                    src={product.image_url || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100'}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-800 line-clamp-1">{product.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{product.unit}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-primary-700">{formatPrice(product.price * quantity)}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:border-primary-500 hover:text-primary-700 transition"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:border-primary-500 hover:text-primary-700 transition"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeItem(product.id)}
                        className="ml-1 w-6 h-6 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50 transition"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-gray-100 space-y-3">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>{formatPrice(totalPrice())}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Delivery</span>
              <span className={totalPrice() >= 499 ? 'text-green-600 font-medium' : ''}>
                {totalPrice() >= 499 ? 'FREE' : formatPrice(49)}
              </span>
            </div>
            <div className="flex items-center justify-between font-bold text-lg border-t pt-3">
              <span>Total</span>
              <span className="text-primary-700">{formatPrice(totalPrice() + (totalPrice() >= 499 ? 0 : 49))}</span>
            </div>
            <Link
              href="/checkout"
              onClick={() => setCartOpen(false)}
              className="btn-primary w-full justify-center"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/cart"
              onClick={() => setCartOpen(false)}
              className="btn-outline w-full justify-center text-sm py-2"
            >
              View Cart
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
