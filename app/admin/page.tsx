'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  TrendingUp, Users, ShoppingBag, Folder, Search,
  Check, X, Eye, Trash2, Plus, Edit2, ShieldAlert,
  Loader2, Filter, AlertCircle, ShoppingCart, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import { formatPrice } from '@/lib/utils';

type Tab = 'overview' | 'products' | 'farmers' | 'orders' | 'categories';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  // Data States
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalFarmers: 0,
  });
  const [products, setProducts] = useState<any[]>([]);
  const [farmers, setFarmers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // Search & Filter States
  const [prodSearch, setProdSearch] = useState('');
  const [farmerSearch, setFarmerSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState('all');

  // Modals & Forms
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [selectedOrderItems, setSelectedOrderItems] = useState<any[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [catForm, setCatForm] = useState({ name: '', slug: '', description: '', image_url: '' });
  const [savingCat, setSavingCat] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/auth/login');
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        // @ts-ignore
        if (error || !profile || profile.role !== 'admin') {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        setIsAdmin(true);
        await loadAllData();
      } catch (err) {
        console.error(err);
        setIsAdmin(false);
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Orders & Calculate Revenue
      // @ts-ignore
      const { data: orderData } = await supabase
        .from('orders')
        .select('*, user:profiles(full_name, email)')
        .order('created_at', { ascending: false });
      const activeOrders = (orderData as any) || [];
      setOrders(activeOrders);

      const rev = activeOrders
        .filter((o: any) => o.status !== 'cancelled')
        .reduce((sum: number, o: any) => sum + Number(o.total_amount), 0);

      // 2. Fetch Products
      // @ts-ignore
      const { data: prodData } = await supabase
        .from('products')
        .select('*, farmer:farmers(farm_name)')
        .order('created_at', { ascending: false });
      const activeProducts = (prodData as any) || [];
      setProducts(activeProducts);

      // 3. Fetch Farmers
      // @ts-ignore
      const { data: farmerData } = await supabase
        .from('farmers')
        .select('*, user:profiles(full_name, email)')
        .order('created_at', { ascending: false });
      const activeFarmers = (farmerData as any) || [];
      setFarmers(activeFarmers);

      // 4. Fetch Profiles (Users)
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // 5. Fetch Categories
      // @ts-ignore
      const { data: catData } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      const activeCategories = (catData as any) || [];
      setCategories(activeCategories);

      setStats({
        totalRevenue: rev,
        totalOrders: activeOrders.length,
        totalProducts: activeProducts.length,
        totalUsers: userCount || 0,
        totalFarmers: activeFarmers.length,
      });
    } catch (err) {
      toast.error('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Farmer Verification Toggle
  const toggleVerification = async (farmerId: string, currentStatus: boolean) => {
    try {
      // @ts-ignore
      const { error } = await supabase.from('farmers').update({ verified: !currentStatus }).eq('id', farmerId);

      if (error) throw error;

      toast.success(currentStatus ? 'Farmer unverified' : 'Farmer verified successfully!');
      setFarmers((prev) =>
        prev.map((f) => (f.id === farmerId ? { ...f, verified: !currentStatus } : f))
      );
    } catch (err) {
      toast.error('Failed to update verification status');
    }
  };

  // Delete Product
  const handleDeleteProduct = async (prodId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

    try {
      // @ts-ignore
      const { error } = await supabase.from('products').delete().eq('id', prodId);
      if (error) throw error;

      toast.success('Product deleted successfully');
      setProducts((prev) => prev.filter((p) => p.id !== prodId));
      setStats((prev) => ({ ...prev, totalProducts: prev.totalProducts - 1 }));
    } catch (err) {
      toast.error('Failed to delete product. It might be linked to orders.');
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      // @ts-ignore
      const { error } = await supabase.from('orders').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', orderId);

      if (error) throw error;

      toast.success(`Order status updated to ${newStatus}`);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev: any) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      toast.error('Failed to update order status');
    }
  };

  // View Order Details
  const handleViewOrder = async (order: any) => {
    setSelectedOrder(order);
    setItemsLoading(true);
    try {
      // @ts-ignore
      const { data, error } = await supabase.from('order_items').select('*, product:products(name, image_url, unit)').eq('order_id', order.id);

      if (error) throw error;
      setSelectedOrderItems(data || []);
    } catch (err) {
      toast.error('Failed to load order items');
    } finally {
      setItemsLoading(false);
    }
  };

  // Add Category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.name || !catForm.slug) {
      toast.error('Name and Slug are required');
      return;
    }
    setSavingCat(true);
    try {
      // @ts-ignore
      const { data, error } = await supabase.from('categories').insert([catForm]).select();

      if (error) throw error;

      toast.success('Category added successfully!');
      if (data) setCategories((prev) => [...prev, data[0]]);
      setCatForm({ name: '', slug: '', description: '', image_url: '' });
      setShowCatModal(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to add category');
    } finally {
      setSavingCat(false);
    }
  };

  if (loading && isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-primary-700 animate-spin" />
          <p className="text-gray-500 font-medium">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">Access Denied</h1>
          <p className="text-gray-500 mt-2 mb-6">
            You do not have administrative permissions to view this page.
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-primary-700 hover:bg-primary-800 text-white font-semibold py-3 rounded-xl transition"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary-950 via-primary-800 to-primary-900 text-white py-10 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Admin Dashboard</h1>
            <p className="text-primary-100 text-sm mt-1">
              Monitor orders, products, verify farmers and structure categories.
            </p>
          </div>
          <button
            onClick={loadAllData}
            className="self-start md:self-center bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Refresh Data
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav */}
        <aside className="md:w-64 shrink-0">
          <nav className="flex flex-col gap-1 bg-white p-3 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'orders', label: 'Manage Orders', icon: ShoppingCart },
              { id: 'products', label: 'Manage Products', icon: ShoppingBag },
              { id: 'farmers', label: 'Verify Farmers', icon: Users },
              { id: 'categories', label: 'Categories', icon: Folder },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-800'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-primary-700' : 'text-gray-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Tab Contents */}
        <main className="flex-1 min-w-0">
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary-700 animate-spin" />
            </div>
          ) : (
            <>
              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <div className="space-y-8 animate-fade-in">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: TrendingUp, color: 'text-green-700 bg-green-50' },
                      { label: 'Orders Placed', value: stats.totalOrders, icon: ShoppingCart, color: 'text-blue-700 bg-blue-50' },
                      { label: 'Products Listed', value: stats.totalProducts, icon: ShoppingBag, color: 'text-purple-700 bg-purple-50' },
                      { label: 'Total Sellers', value: stats.totalFarmers, icon: Users, color: 'text-amber-700 bg-amber-50' },
                    ].map((card) => {
                      const Icon = card.icon;
                      return (
                        <div key={card.label} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between min-h-[120px]">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{card.label}</span>
                            <div className={`p-2 rounded-xl ${card.color}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                          </div>
                          <span className="text-2xl font-bold text-gray-800 mt-2 truncate">{card.value}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Recent Activity / System status */}
                  <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-bold text-gray-800 text-lg mb-4">Quick Statistics</h3>
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="border border-gray-50 rounded-xl p-4 bg-gray-50/50">
                        <div className="text-sm font-semibold text-gray-500">App Users Count</div>
                        <div className="text-3xl font-extrabold text-primary-800 mt-1">{stats.totalUsers}</div>
                        <p className="text-xs text-gray-400 mt-1">Total customer profiles registered on the platform.</p>
                      </div>
                      <div className="border border-gray-50 rounded-xl p-4 bg-gray-50/50">
                        <div className="text-sm font-semibold text-gray-500">Unverified Farmers</div>
                        <div className="text-3xl font-extrabold text-amber-700 mt-1">
                          {farmers.filter((f) => !f.verified).length}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Farmer applications awaiting admin review.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ORDERS TAB */}
              {activeTab === 'orders' && (
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden animate-fade-in">
                  <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h3 className="font-bold text-gray-800 text-lg">Order Records</h3>
                    <div className="flex items-center gap-2 self-start">
                      <Filter className="w-4 h-4 text-gray-400" />
                      <select
                        value={orderFilter}
                        onChange={(e) => setOrderFilter(e.target.value)}
                        className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm font-medium focus:outline-none focus:border-primary-500 bg-gray-50"
                      >
                        <option value="all">All Orders</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-gray-400 uppercase text-xs font-semibold tracking-wider border-b border-gray-100">
                          <th className="px-6 py-4">Order ID</th>
                          <th className="px-6 py-4">Customer</th>
                          <th className="px-6 py-4">Total Amount</th>
                          <th className="px-6 py-4">Payment</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm">
                        {orders
                          .filter((o) => orderFilter === 'all' || o.status === orderFilter)
                          .map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50/50">
                              <td className="px-6 py-4 font-bold text-gray-700">
                                #{order.id.slice(0, 8).toUpperCase()}
                              </td>
                              <td className="px-6 py-4">
                                <div className="font-semibold text-gray-800">{order.user?.full_name || 'Anonymous'}</div>
                                <div className="text-xs text-gray-400">{order.user?.email}</div>
                              </td>
                              <td className="px-6 py-4 font-bold text-primary-700">
                                {formatPrice(order.total_amount)}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                  order.payment_status === 'paid' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                                }`}>
                                  {order.payment_status}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <select
                                  value={order.status}
                                  onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                  className={`text-xs font-semibold rounded-full px-2.5 py-1 border-0 focus:ring-2 focus:ring-primary-500 cursor-pointer ${
                                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-blue-100 text-blue-800'
                                  }`}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="confirmed">Confirmed</option>
                                  <option value="processing">Processing</option>
                                  <option value="shipped">Shipped</option>
                                  <option value="delivered">Delivered</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() => handleViewOrder(order)}
                                  className="text-gray-400 hover:text-primary-700 p-1 rounded-lg hover:bg-gray-100"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* PRODUCTS TAB */}
              {activeTab === 'products' && (
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden animate-fade-in">
                  <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h3 className="font-bold text-gray-800 text-lg">Product Listings</h3>
                    <div className="relative w-full max-w-xs">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={prodSearch}
                        onChange={(e) => setProdSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 bg-gray-50"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-gray-400 uppercase text-xs font-semibold tracking-wider border-b border-gray-100">
                          <th className="px-6 py-4">Product</th>
                          <th className="px-6 py-4">Farmer/Seller</th>
                          <th className="px-6 py-4">Price / Unit</th>
                          <th className="px-6 py-4">Stock</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm">
                        {products
                          .filter((p) => p.name.toLowerCase().includes(prodSearch.toLowerCase()))
                          .map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50/50">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-100 relative shrink-0 bg-gray-50">
                                    {product.image_url ? (
                                      <img src={product.image_url} alt="" className="object-cover w-full h-full" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">N/A</div>
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-gray-800">{product.name}</div>
                                    <div className="text-xs text-gray-400">{product.is_organic ? '🌱 Organic' : 'Conventional'}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-gray-600 font-medium">
                                {product.farmer?.farm_name || 'Unknown Farm'}
                              </td>
                              <td className="px-6 py-4 font-bold text-gray-800">
                                {formatPrice(product.price)} <span className="text-xs font-normal text-gray-400">/ {product.unit}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`font-semibold ${product.stock_quantity > 10 ? 'text-green-600' : 'text-red-500'}`}>
                                  {product.stock_quantity}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* FARMERS TAB */}
              {activeTab === 'farmers' && (
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden animate-fade-in">
                  <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h3 className="font-bold text-gray-800 text-lg">Verify Sellers</h3>
                    <div className="relative w-full max-w-xs">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search farm or seller..."
                        value={farmerSearch}
                        onChange={(e) => setFarmerSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 bg-gray-50"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-gray-400 uppercase text-xs font-semibold tracking-wider border-b border-gray-100">
                          <th className="px-6 py-4">Farm Details</th>
                          <th className="px-6 py-4">Seller Owner</th>
                          <th className="px-6 py-4">Location</th>
                          <th className="px-6 py-4">Verified</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm">
                        {farmers
                          .filter((f) =>
                            f.farm_name.toLowerCase().includes(farmerSearch.toLowerCase()) ||
                            (f.user?.full_name || '').toLowerCase().includes(farmerSearch.toLowerCase())
                          )
                          .map((farmer) => (
                            <tr key={farmer.id} className="hover:bg-gray-50/50">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 relative bg-gray-50 shrink-0">
                                    <img
                                      src={farmer.avatar_url || 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=100'}
                                      alt="" className="object-cover w-full h-full"
                                    />
                                  </div>
                                  <div>
                                    <div className="font-bold text-gray-800">{farmer.farm_name}</div>
                                    <div className="text-xs text-gray-400 line-clamp-1">{farmer.bio || 'No bio'}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="font-semibold text-gray-800">{farmer.user?.full_name || 'Farmer'}</div>
                                <div className="text-xs text-gray-400">{farmer.user?.email}</div>
                              </td>
                              <td className="px-6 py-4 text-gray-600 font-medium">
                                {farmer.location}, {farmer.state}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                                  farmer.verified ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                }`}>
                                  {farmer.verified ? 'VERIFIED' : 'PENDING'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() => toggleVerification(farmer.id, farmer.verified)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                    farmer.verified
                                      ? 'border-red-200 text-red-600 hover:bg-red-50'
                                      : 'border-green-200 text-green-700 hover:bg-green-50'
                                  }`}
                                >
                                  {farmer.verified ? 'Revoke' : 'Verify'}
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* CATEGORIES TAB */}
              {activeTab === 'categories' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="font-bold text-gray-800 text-lg">Product Categories</h3>
                      <button
                        onClick={() => setShowCatModal(true)}
                        className="bg-primary-700 hover:bg-primary-800 text-white font-semibold px-4 py-2 rounded-xl text-sm transition flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" /> Add Category
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50 text-gray-400 uppercase text-xs font-semibold tracking-wider border-b border-gray-100">
                            <th className="px-6 py-4">Image</th>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Slug</th>
                            <th className="px-6 py-4">Description</th>
                            <th className="px-6 py-4">Product Count</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                          {categories.map((cat) => (
                            <tr key={cat.id} className="hover:bg-gray-50/50">
                              <td className="px-6 py-4">
                                <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-100 relative shrink-0 bg-gray-50">
                                  {cat.image_url ? (
                                    <img src={cat.image_url} alt="" className="object-cover w-full h-full" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">N/A</div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 font-bold text-gray-800">{cat.name}</td>
                              <td className="px-6 py-4 text-gray-400 font-mono text-xs">{cat.slug}</td>
                              <td className="px-6 py-4 text-gray-600 line-clamp-1">{cat.description || 'No description'}</td>
                              <td className="px-6 py-4 font-semibold text-gray-700">{cat.product_count || 0}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-primary-950 text-white">
              <div>
                <h3 className="font-extrabold text-lg">Order Details</h3>
                <p className="text-xs text-primary-200 mt-0.5">#{selectedOrder.id}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-white/80 hover:text-white p-1 bg-white/10 hover:bg-white/20 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Order Status & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase">Status</div>
                  <div className="mt-1">
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value)}
                      className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm font-semibold focus:outline-none focus:border-primary-500 bg-gray-50"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                <div className="sm:text-right">
                  <div className="text-xs font-semibold text-gray-400 uppercase">Total Value</div>
                  <div className="text-xl font-bold text-primary-700 mt-1">
                    {formatPrice(selectedOrder.total_amount)}
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid sm:grid-cols-2 gap-4 border-b border-gray-100 pb-5 text-sm">
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Customer Profile</h4>
                  <div className="space-y-1 text-gray-600">
                    <div><strong>Name:</strong> {selectedOrder.user?.full_name || 'Anonymous'}</div>
                    <div><strong>Email:</strong> {selectedOrder.user?.email || 'N/A'}</div>
                    <div><strong>Date:</strong> {new Date(selectedOrder.created_at).toLocaleString('en-IN')}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Delivery Address</h4>
                  <div className="text-gray-600 leading-relaxed">
                    {selectedOrder.delivery_address ? (
                      <div>
                        <div>{selectedOrder.delivery_address.fullName}</div>
                        <div>{selectedOrder.delivery_address.addressLine1}</div>
                        {selectedOrder.delivery_address.addressLine2 && <div>{selectedOrder.delivery_address.addressLine2}</div>}
                        <div>{selectedOrder.delivery_address.city}, {selectedOrder.delivery_address.state} - {selectedOrder.delivery_address.pincode}</div>
                        <div>Phone: {selectedOrder.delivery_address.phone}</div>
                      </div>
                    ) : (
                      'N/A'
                    )}
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="font-bold text-gray-800 mb-3">Order Items</h4>
                {itemsLoading ? (
                  <div className="flex items-center gap-2 py-4 justify-center">
                    <Loader2 className="w-5 h-5 text-primary-700 animate-spin" />
                    <span className="text-sm text-gray-500">Loading items...</span>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                    {selectedOrderItems.map((item) => (
                      <div key={item.id} className="p-4 flex items-center justify-between gap-4 text-sm hover:bg-gray-50/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-100 relative bg-gray-50">
                            {item.product?.image_url ? (
                              <img src={item.product.image_url} alt="" className="object-cover w-full h-full" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">N/A</div>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">{item.product?.name || 'Product deleted'}</div>
                            <div className="text-xs text-gray-400">{item.quantity} x {formatPrice(item.unit_price)}</div>
                          </div>
                        </div>
                        <div className="font-bold text-gray-800">
                          {formatPrice(item.total_price)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD CATEGORY MODAL */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-primary-950 text-white flex items-center justify-between">
              <h3 className="font-extrabold text-lg">Add New Category</h3>
              <button
                onClick={() => setShowCatModal(false)}
                className="text-white/80 hover:text-white p-1 bg-white/10 hover:bg-white/20 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCategory}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={catForm.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCatForm((prev) => ({
                        ...prev,
                        name: val,
                        slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                      }));
                    }}
                    placeholder="e.g. Organic Grains"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Slug (Auto-generated) *</label>
                  <input
                    type="text"
                    required
                    value={catForm.slug}
                    onChange={(e) => setCatForm((prev) => ({ ...prev, slug: e.target.value }))}
                    placeholder="organic-grains"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                  <textarea
                    rows={3}
                    value={catForm.description}
                    onChange={(e) => setCatForm((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Short description of this category..."
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Image URL</label>
                  <input
                    type="url"
                    value={catForm.image_url}
                    onChange={(e) => setCatForm((prev) => ({ ...prev, image_url: e.target.value }))}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCatModal(false)}
                  className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCat}
                  className="bg-primary-700 hover:bg-primary-800 disabled:opacity-75 text-white font-semibold px-4 py-2 rounded-xl text-sm transition"
                >
                  {savingCat ? 'Saving...' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
