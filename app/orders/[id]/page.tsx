'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  CheckCircle, Truck, Package, Clock, XCircle,
  AlertCircle, MapPin, ArrowLeft, CreditCard
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatPrice } from '@/lib/utils';

const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending:    { label: 'Pending',    color: 'text-yellow-700', bg: 'bg-yellow-50',  icon: Clock },
  confirmed:  { label: 'Confirmed',  color: 'text-blue-700',   bg: 'bg-blue-50',    icon: AlertCircle },
  processing: { label: 'Processing', color: 'text-purple-700', bg: 'bg-purple-50',  icon: Package },
  shipped:    { label: 'Shipped',    color: 'text-indigo-700', bg: 'bg-indigo-50',  icon: Truck },
  delivered:  { label: 'Delivered',  color: 'text-green-700',  bg: 'bg-green-50',   icon: CheckCircle },
  cancelled:  { label: 'Cancelled',  color: 'text-red-700',    bg: 'bg-red-50',     icon: XCircle },
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get('success') === 'true';
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*, product:products(name, image_url, unit, slug))')
        .eq('id', id)
        .single();
      setOrder(data);
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

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="mb-4">Order not found</p>
          <Link href="/orders" className="btn-primary">View All Orders</Link>
        </div>
      </div>
    );
  }

  const status = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const currentStep = statusSteps.indexOf(order.status);
  const addr = order.delivery_address || {};

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        {/* Success banner */}
        {isSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6 flex items-center gap-4">
            <CheckCircle className="w-10 h-10 text-green-500 shrink-0" />
            <div>
              <h2 className="font-bold text-green-800 text-lg">Order Placed Successfully! 🎉</h2>
              <p className="text-green-700 text-sm mt-0.5">
                Thank you for your order. We'll notify you once it's confirmed.
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/orders" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>
          <span className={`ml-auto flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${status.color} ${status.bg}`}>
            <StatusIcon className="w-3.5 h-3.5" /> {status.label}
          </span>
        </div>

        {/* Progress tracker */}
        {order.status !== 'cancelled' && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-5">
            <h3 className="font-bold text-gray-800 mb-5">Order Progress</h3>
            <div className="flex items-center justify-between relative">
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-100 z-0" />
              <div
                className="absolute top-4 left-0 h-0.5 bg-primary-500 z-0 transition-all duration-500"
                style={{ width: `${Math.max(0, (currentStep / (statusSteps.length - 1))) * 100}%` }}
              />
              {statusSteps.map((step, i) => {
                const cfg = statusConfig[step];
                const Icon = cfg.icon;
                const done = i <= currentStep;
                return (
                  <div key={step} className="flex flex-col items-center gap-2 z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      done ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-300'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-xs font-medium ${done ? 'text-primary-700' : 'text-gray-400'}`}>
                      {cfg.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Order items */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-5">
          <h3 className="font-bold text-gray-800 mb-4">Items Ordered</h3>
          <div className="space-y-4">
            {order.order_items?.map((item: any) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                  <Image
                    src={item.product?.image_url || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100'}
                    alt={item.product?.name || 'Product'} fill className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.product?.slug || ''}`}
                    className="font-semibold text-sm text-gray-800 hover:text-primary-700 line-clamp-1">
                    {item.product?.name}
                  </Link>
                  <p className="text-xs text-gray-400">{item.product?.unit} × {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-gray-800">{formatPrice(item.total_price)}</p>
                  <p className="text-xs text-gray-400">{formatPrice(item.unit_price)} each</p>
                </div>
              </div>
            ))}
          </div>

          {/* Price breakdown */}
          <div className="border-t border-gray-100 mt-5 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatPrice(order.total_amount)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery</span>
              <span className="text-green-600 font-medium">FREE</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t pt-2">
              <span>Total</span>
              <span className="text-primary-700">{formatPrice(order.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Delivery address */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-5">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary-600" /> Delivery Address
          </h3>
          <p className="text-sm font-semibold text-gray-700">{addr.fullName}</p>
          <p className="text-sm text-gray-500">{addr.phone}</p>
          <p className="text-sm text-gray-500 mt-1">
            {addr.addressLine1}
            {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
          </p>
          <p className="text-sm text-gray-500">
            {addr.city}, {addr.state} - {addr.pincode}
          </p>
        </div>

        {/* Payment info */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary-600" /> Payment Information
          </h3>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Method</span>
            <span className="font-semibold text-gray-800 uppercase">{order.payment_method}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-600">Status</span>
            <span className={`font-semibold ${
              order.payment_status === 'paid' ? 'text-green-600' :
              order.payment_status === 'failed' ? 'text-red-600' : 'text-yellow-600'
            }`}>
              {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link href="/products" className="btn-outline flex-1 justify-center text-sm py-2.5">
            Continue Shopping
          </Link>
          {order.status === 'pending' && (
            <button className="flex-1 border-2 border-red-200 text-red-600 hover:bg-red-50 font-semibold py-2.5 rounded-xl transition-colors text-sm">
              Cancel Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
