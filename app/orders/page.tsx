'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, ChevronRight, Clock, Truck, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatPrice } from '@/lib/utils';
import type { OrderWithItems } from '@/types/database';

const statusConfig = {
  pending: { label: 'Pending', color: 'text-yellow-600 bg-yellow-50', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'text-blue-600 bg-blue-50', icon: AlertCircle },
  processing: { label: 'Processing', color: 'text-purple-600 bg-purple-50', icon: Package },
  shipped: { label: 'Shipped', color: 'text-indigo-600 bg-indigo-50', icon: Truck },
  delivered: { label: 'Delivered', color: 'text-green-600 bg-green-50', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'text-red-600 bg-red-50', icon: XCircle },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }

      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*, product:products(name, image_url, unit))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setOrders(data || []);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-300 border-t-primary-700 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Orders</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-200" />
            <h2 className="font-bold text-gray-700 text-lg">No orders yet</h2>
            <p className="text-gray-500 text-sm mt-1 mb-6">Start shopping to see your orders here</p>
            <Link href="/products" className="btn-primary">Browse Products</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
              const StatusIcon = status.icon;

              return (
                <Link key={order.id} href={`/orders/${order.id}`}
                  className="bg-white rounded-2xl shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-sm text-gray-800">
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${status.color}`}>
                        <StatusIcon className="w-3 h-3" /> {status.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.order_items?.length || 0} item(s) · {order.payment_method?.toUpperCase()} ·{' '}
                      <span className={order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}>
                        {order.payment_status}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
                    <span className="font-bold text-primary-700 text-lg">{formatPrice(order.total_amount)}</span>
                    <ChevronRight className="w-5 h-5 text-gray-300" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
