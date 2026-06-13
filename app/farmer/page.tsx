'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sprout, Plus, Edit2, Trash2, ShieldCheck, ShieldAlert,
  Loader2, Star, MapPin, ClipboardList, Settings, Eye,
  X, Check, AlertCircle, RefreshCw, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import { formatPrice } from '@/lib/utils';

type Tab = 'overview' | 'products' | 'orders' | 'settings';

export default function FarmerDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isFarmer, setIsFarmer] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Farmer profile record
  const [farmer, setFarmer] = useState<any | null>(null);
  const [onboardingForm, setOnboardingForm] = useState({
    farm_name: '',
    location: '',
    state: '',
    bio: '',
    avatar_url: '',
    cover_url: '',
  });

  // Data States
  const [products, setProducts] = useState<any[]>([]);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // Modals & Forms
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    original_price: '',
    unit: '1kg',
    stock_quantity: '10',
    image_url: '',
    category_id: '',
    is_organic: false,
    is_featured: false,
  });
  const [savingProduct, setSavingProduct] = useState(false);

  // Settings form
  const [settingsForm, setSettingsForm] = useState({
    farm_name: '',
    location: '',
    state: '',
    bio: '',
    avatar_url: '',
    cover_url: '',
  });
  const [savingSettings, setSavingSettings] = useState(false);

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
        if (error || !profile || (profile.role !== 'farmer' && profile.role !== 'admin')) {
          setIsFarmer(false);
          setLoading(false);
          return;
        }

        setIsFarmer(true);
        setUserProfile(profile);
        await loadFarmerData(user.id);
      } catch (err) {
        console.error(err);
        setIsFarmer(false);
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const loadFarmerData = async (userId: string) => {
    try {
      // Fetch farmer profile
      // @ts-ignore
      const { data: farmerDataRaw, error } = await supabase.from('farmers').select('*').eq('user_id', userId).maybeSingle();
      const farmerData = farmerDataRaw as any;

      if (error) throw error;

      if (farmerData) {
        setFarmer(farmerData);
        setSettingsForm({
          farm_name: farmerData.farm_name || '',
          location: farmerData.location || '',
          state: farmerData.state || '',
          bio: farmerData.bio || '',
          avatar_url: farmerData.avatar_url || '',
          cover_url: farmerData.cover_url || '',
        });

        // Load categories, products, and incoming orders
        const [catRes, prodRes] = await Promise.all([
          // @ts-ignore
          supabase.from('categories').select('*').order('name'),
          // @ts-ignore
          supabase.from('products').select('*').eq('farmer_id', farmerData.id).order('created_at', { ascending: false }),
        ]);

        setCategories(catRes.data || []);
        const farmerProducts = (prodRes.data as any[]) || [];
        setProducts(farmerProducts);

        // Fetch order items for this farmer's products
        if (farmerProducts.length > 0) {
          const productIds = farmerProducts.map((p) => p.id);
          // @ts-ignore
          const { data: orderItemData } = await supabase.from('order_items').select('*, order:orders(*), product:products(*)').in('product_id', productIds).order('id', { ascending: false });

          setOrderItems(orderItemData || []);
        } else {
          setOrderItems([]);
        }
      }
    } catch (err) {
      console.error('Error loading farmer data:', err);
      toast.error('Failed to load farmer dashboard information');
    } finally {
      setLoading(false);
    }
  };

  // Onboarding Form Submit
  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardingForm.farm_name || !onboardingForm.location || !onboardingForm.state) {
      toast.error('Farm Name, Location, and State are required');
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // @ts-ignore
      const { data, error } = await supabase.from('farmers').insert([{ user_id: user.id, farm_name: onboardingForm.farm_name, location: onboardingForm.location, state: onboardingForm.state, bio: onboardingForm.bio || null, avatar_url: onboardingForm.avatar_url || null, cover_url: onboardingForm.cover_url || null }]).select();

      if (error) throw error;

      toast.success('Farm Profile Created Successfully!');
      if (data) {
        setFarmer(data[0]);
        await loadFarmerData(user.id);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create farm profile');
    } finally {
      setLoading(false);
    }
  };

  // Add or Edit Product Submit
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price || !productForm.category_id) {
      toast.error('Product Name, Price, and Category are required');
      return;
    }
    setSavingProduct(true);
    try {
      const slug = productForm.slug || productForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const prodPayload = {
        farmer_id: farmer.id,
        category_id: productForm.category_id,
        name: productForm.name,
        slug: slug,
        description: productForm.description || null,
        price: parseFloat(productForm.price),
        original_price: productForm.original_price ? parseFloat(productForm.original_price) : null,
        unit: productForm.unit,
        stock_quantity: parseInt(productForm.stock_quantity),
        image_url: productForm.image_url || null,
        is_organic: productForm.is_organic,
        is_featured: productForm.is_featured,
      };

      if (editingProduct) {
        // Edit
        // @ts-ignore
        const { error } = await supabase.from('products').update({ ...prodPayload, updated_at: new Date().toISOString() }).eq('id', editingProduct.id);

        if (error) throw error;
        toast.success('Product updated successfully!');
      } else {
        // Create
        // @ts-ignore
        const { error } = await supabase.from('products').insert([prodPayload]);

        if (error) throw error;
        toast.success('Product added successfully!');
      }

      setShowProductModal(false);
      setEditingProduct(null);
      setProductForm({
        name: '', slug: '', description: '', price: '', original_price: '',
        unit: '1kg', stock_quantity: '10', image_url: '', category_id: '',
        is_organic: false, is_featured: false
      });
      // Reload product data
      // @ts-ignore
      const { data: prodData } = await supabase.from('products').select('*').eq('farmer_id', farmer.id).order('created_at', { ascending: false });
      setProducts(prodData || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save product');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleEditProductClick = (product: any) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || '',
      slug: product.slug || '',
      description: product.description || '',
      price: product.price ? product.price.toString() : '',
      original_price: product.original_price ? product.original_price.toString() : '',
      unit: product.unit || '1kg',
      stock_quantity: product.stock_quantity ? product.stock_quantity.toString() : '10',
      image_url: product.image_url || '',
      category_id: product.category_id || '',
      is_organic: product.is_organic || false,
      is_featured: product.is_featured || false,
    });
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      // @ts-ignore
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) throw error;

      toast.success('Product deleted successfully');
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      toast.error('Failed to delete product. It might be referenced in orders.');
    }
  };

  // Update Settings Submit
  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsForm.farm_name || !settingsForm.location || !settingsForm.state) {
      toast.error('Farm Name, Location, and State are required');
      return;
    }
    setSavingSettings(true);
    try {
      // @ts-ignore
      const { error } = await supabase.from('farmers').update({ farm_name: settingsForm.farm_name, location: settingsForm.location, state: settingsForm.state, bio: settingsForm.bio || null, avatar_url: settingsForm.avatar_url || null, cover_url: settingsForm.cover_url || null }).eq('id', farmer.id);

      if (error) throw error;

      toast.success('Farm profile updated successfully!');
      setFarmer((prev: any) => ({
        ...prev,
        ...settingsForm
      }));
    } catch (err: any) {
      toast.error(err.message || 'Failed to update settings');
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading && isFarmer === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-primary-700 animate-spin" />
          <p className="text-gray-500 font-medium">Verifying seller profile...</p>
        </div>
      </div>
    );
  }

  if (isFarmer === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">Access Denied</h1>
          <p className="text-gray-500 mt-2 mb-6">
            You do not have a farmer/seller account role.
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

  // ONBOARDING SCREEN
  if (!farmer) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-700 mx-auto mb-4">
              <Sprout className="w-10 h-10 animate-pulse-slow" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-800">Set Up Your Farm Profile</h1>
            <p className="text-gray-500 mt-2">
              Let rural communities and buyers know who you are by establishing your seller farm profile.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-lg">
            <form onSubmit={handleOnboardingSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Farm / Shop Name *</label>
                  <input
                    type="text"
                    required
                    value={onboardingForm.farm_name}
                    onChange={(e) => setOnboardingForm({ ...onboardingForm, farm_name: e.target.value })}
                    placeholder="e.g. Green Valley Organic Farm"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Village / City *</label>
                  <input
                    type="text"
                    required
                    value={onboardingForm.location}
                    onChange={(e) => setOnboardingForm({ ...onboardingForm, location: e.target.value })}
                    placeholder="e.g. Amritsar"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">State *</label>
                  <input
                    type="text"
                    required
                    value={onboardingForm.state}
                    onChange={(e) => setOnboardingForm({ ...onboardingForm, state: e.target.value })}
                    placeholder="e.g. Punjab"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Farm Bio / Story</label>
                  <textarea
                    rows={4}
                    value={onboardingForm.bio}
                    onChange={(e) => setOnboardingForm({ ...onboardingForm, bio: e.target.value })}
                    placeholder="Tell your customers how you grow your products, your traditional values, and sustainable techniques..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Avatar URL (Logo/Face)</label>
                  <input
                    type="url"
                    value={onboardingForm.avatar_url}
                    onChange={(e) => setOnboardingForm({ ...onboardingForm, avatar_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cover Image URL (Farm photo)</label>
                  <input
                    type="url"
                    value={onboardingForm.cover_url}
                    onChange={(e) => setOnboardingForm({ ...onboardingForm, cover_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary-700 hover:bg-primary-800 text-white font-semibold py-3.5 rounded-xl transition shadow-md shadow-primary-700/10 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Initialize Farm Profile
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // FARMER DASHBOARD SCREEN
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Farm Header */}
      <div className="bg-gradient-to-r from-primary-950 via-primary-800 to-primary-900 text-white py-12 px-4 sm:px-6 shadow-sm relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white/20 bg-white/10 shrink-0 relative">
              <img
                src={farmer.avatar_url || 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=200'}
                alt="" className="object-cover w-full h-full"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{farmer.farm_name}</h1>
                {farmer.verified ? (
                  <span className="flex items-center gap-0.5 text-[10px] font-bold bg-green-500 text-white px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3" /> VERIFIED
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5 text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full">
                    PENDING VERIFICATION
                  </span>
                )}
              </div>
              <p className="text-primary-200 text-sm mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {farmer.location}, {farmer.state}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="bg-white/10 px-4 py-2 rounded-xl text-center">
              <div className="flex items-center gap-1 justify-center text-yellow-400 font-bold text-lg">
                <Star className="w-4 h-4 fill-yellow-400" /> {Number(farmer.rating).toFixed(1)}
              </div>
              <div className="text-xs text-primary-200 mt-0.5">{farmer.total_reviews} Reviews</div>
            </div>
            <button
              onClick={() => loadFarmerData(userProfile.id)}
              className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-xl transition-all"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 flex flex-col md:flex-row gap-8">
        {/* Navigation */}
        <aside className="md:w-64 shrink-0">
          <nav className="flex flex-col gap-1 bg-white p-3 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
            {[
              { id: 'overview', label: 'Farm Overview', icon: Sprout },
              { id: 'products', label: 'My Products', icon: Plus },
              { id: 'orders', label: 'Fulfillment Orders', icon: ClipboardList },
              { id: 'settings', label: 'Farm Settings', icon: Settings },
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
              {/* OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="grid sm:grid-cols-3 gap-5">
                    <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm">
                      <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Products Listed</div>
                      <div className="text-3xl font-extrabold text-primary-800 mt-1">{products.length}</div>
                      <p className="text-xs text-gray-400 mt-1">Total items currently published on shop.</p>
                    </div>

                    <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm">
                      <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Incoming Orders</div>
                      <div className="text-3xl font-extrabold text-blue-700 mt-1">{orderItems.length}</div>
                      <p className="text-xs text-gray-400 mt-1">Total product purchases to fulfill.</p>
                    </div>

                    <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm">
                      <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Farm Rating</div>
                      <div className="text-3xl font-extrabold text-amber-600 mt-1 flex items-center gap-1">
                        <Star className="w-6 h-6 fill-amber-500 text-amber-500" /> {Number(farmer.rating).toFixed(1)}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Weighted average from customer reviews.</p>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
                    <h3 className="font-bold text-gray-800 text-lg mb-3">Farm Bio / Story</h3>
                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                      {farmer.bio || 'Your farm story is empty. Go to settings to write a compelling bio!'}
                    </p>
                  </div>
                </div>
              )}

              {/* PRODUCTS */}
              {activeTab === 'products' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-800 text-lg">My Product Catalog</h3>
                    <button
                      onClick={() => {
                        setEditingProduct(null);
                        setProductForm({
                          name: '', slug: '', description: '', price: '', original_price: '',
                          unit: '1kg', stock_quantity: '10', image_url: '',
                          category_id: categories[0]?.id || '', is_organic: false, is_featured: false
                        });
                        setShowProductModal(true);
                      }}
                      className="bg-primary-700 hover:bg-primary-800 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2 shadow"
                    >
                      <Plus className="w-4 h-4" /> Add Product
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <div key={product.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm flex flex-col justify-between">
                        <div>
                          {/* Image */}
                          <div className="h-44 bg-gray-50 relative border-b border-gray-50 overflow-hidden">
                            {product.image_url ? (
                              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Image Provided</div>
                            )}
                            {product.is_organic && (
                              <span className="absolute top-3 left-3 bg-green-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                                🌱 ORGANIC
                              </span>
                            )}
                          </div>

                          <div className="p-4">
                            <h4 className="font-bold text-gray-800 text-base leading-snug line-clamp-1">{product.name}</h4>
                            <p className="text-xs text-gray-400 mt-0.5 uppercase tracking-wide">
                              {categories.find((c) => c.id === product.category_id)?.name || 'Default'}
                            </p>
                            <p className="text-gray-500 text-xs mt-2 line-clamp-2 min-h-[32px]">{product.description || 'No description'}</p>
                          </div>
                        </div>

                        <div className="p-4 border-t border-gray-50 flex items-center justify-between">
                          <div>
                            <span className="text-lg font-bold text-primary-700">{formatPrice(product.price)}</span>
                            <span className="text-xs text-gray-400"> / {product.unit}</span>
                            <div className="text-xs mt-0.5 text-gray-500">Stock: <strong className={product.stock_quantity > 0 ? 'text-gray-700' : 'text-red-500'}>{product.stock_quantity}</strong></div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEditProductClick(product)}
                              className="text-gray-400 hover:text-primary-700 p-2 rounded-lg hover:bg-gray-50"
                            >
                              <Edit2 className="w-4.5 h-4.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {products.length === 0 && (
                      <div className="sm:col-span-2 lg:col-span-3 text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
                        <Sprout className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h4 className="font-bold text-gray-700">No products listed</h4>
                        <p className="text-sm text-gray-400 mt-1">Get started by listing your fresh farm produce.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ORDERS */}
              {activeTab === 'orders' && (
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden animate-fade-in">
                  <div className="p-5 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800 text-lg">Purchased Products (Fulfillment)</h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-gray-400 uppercase text-xs font-semibold tracking-wider border-b border-gray-100">
                          <th className="px-6 py-4">Product Detail</th>
                          <th className="px-6 py-4">Qty Ordered</th>
                          <th className="px-6 py-4">Total Revenue</th>
                          <th className="px-6 py-4">Buyer Address</th>
                          <th className="px-6 py-4">Order Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm">
                        {orderItems.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50/50">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg overflow-hidden border border-gray-100 relative bg-gray-50 shrink-0">
                                  <img src={item.product?.image_url} alt="" className="object-cover w-full h-full" />
                                </div>
                                <div className="font-semibold text-gray-800">{item.product?.name}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-semibold text-gray-700">
                              {item.quantity} {item.product?.unit}
                            </td>
                            <td className="px-6 py-4 font-bold text-primary-700">
                              {formatPrice(item.total_price)}
                            </td>
                            <td className="px-6 py-4">
                              {item.order?.delivery_address ? (
                                <div className="text-xs text-gray-600 max-w-[200px] leading-relaxed">
                                  <div className="font-semibold">{item.order.delivery_address.fullName}</div>
                                  <div className="line-clamp-1">{item.order.delivery_address.addressLine1}</div>
                                  <div>{item.order.delivery_address.city}, {item.order.delivery_address.state}</div>
                                  <div>Ph: {item.order.delivery_address.phone}</div>
                                </div>
                              ) : (
                                <span className="text-gray-400">N/A</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                item.order?.status === 'delivered' ? 'bg-green-50 text-green-700' :
                                item.order?.status === 'cancelled' ? 'bg-red-50 text-red-700' :
                                item.order?.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                                'bg-blue-50 text-blue-700'
                              }`}>
                                {item.order?.status?.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))}

                        {orderItems.length === 0 && (
                          <tr>
                            <td colSpan={5} className="text-center py-12 text-gray-400">
                              No orders received yet for your products.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SETTINGS */}
              {activeTab === 'settings' && (
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm animate-fade-in">
                  <h3 className="font-bold text-gray-800 text-lg mb-6 pb-2 border-b border-gray-50">Farm Profile Settings</h3>

                  <form onSubmit={handleUpdateSettings} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Farm Name *</label>
                        <input
                          type="text"
                          required
                          value={settingsForm.farm_name}
                          onChange={(e) => setSettingsForm({ ...settingsForm, farm_name: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Location / City *</label>
                        <input
                          type="text"
                          required
                          value={settingsForm.location}
                          onChange={(e) => setSettingsForm({ ...settingsForm, location: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">State *</label>
                        <input
                          type="text"
                          required
                          value={settingsForm.state}
                          onChange={(e) => setSettingsForm({ ...settingsForm, state: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Farm Bio / Story</label>
                        <textarea
                          rows={4}
                          value={settingsForm.bio}
                          onChange={(e) => setSettingsForm({ ...settingsForm, bio: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Avatar Logo URL</label>
                        <input
                          type="url"
                          value={settingsForm.avatar_url}
                          onChange={(e) => setSettingsForm({ ...settingsForm, avatar_url: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cover Photo URL</label>
                        <input
                          type="url"
                          value={settingsForm.cover_url}
                          onChange={(e) => setSettingsForm({ ...settingsForm, cover_url: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={savingSettings}
                        className="bg-primary-700 hover:bg-primary-800 disabled:opacity-75 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition"
                      >
                        {savingSettings ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ADD/EDIT PRODUCT MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-xl overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-primary-950 text-white flex items-center justify-between">
              <h3 className="font-extrabold text-lg">{editingProduct ? 'Edit Product Listing' : 'Add Product Listing'}</h3>
              <button
                onClick={() => {
                  setShowProductModal(false);
                  setEditingProduct(null);
                }}
                className="text-white/80 hover:text-white p-1 bg-white/10 hover:bg-white/20 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="overflow-y-auto flex-1 p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setProductForm((prev) => ({
                        ...prev,
                        name: val,
                        slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                      }));
                    }}
                    placeholder="e.g. Organic Red Carrots"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Slug (Auto-generated)</label>
                  <input
                    type="text"
                    value={productForm.slug}
                    onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })}
                    placeholder="organic-red-carrots"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Category *</label>
                  <select
                    required
                    value={productForm.category_id}
                    onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 bg-white"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="e.g. 80.00"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Original Price (₹ - Optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.original_price}
                    onChange={(e) => setProductForm({ ...productForm, original_price: e.target.value })}
                    placeholder="e.g. 100.00"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Selling Unit *</label>
                  <input
                    type="text"
                    required
                    value={productForm.unit}
                    onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                    placeholder="e.g. 1kg, 500g, 1 piece"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    value={productForm.stock_quantity}
                    onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Image URL</label>
                  <input
                    type="url"
                    value={productForm.image_url}
                    onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Product Description</label>
                  <textarea
                    rows={3}
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="Brief description of the product qualities, benefits, freshness..."
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_organic"
                    checked={productForm.is_organic}
                    onChange={(e) => setProductForm({ ...productForm, is_organic: e.target.checked })}
                    className="w-4 h-4 text-primary-700 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="is_organic" className="text-sm font-semibold text-gray-700 cursor-pointer">
                    Certified Organic produce
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={productForm.is_featured}
                    onChange={(e) => setProductForm({ ...productForm, is_featured: e.target.checked })}
                    className="w-4 h-4 text-primary-700 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="is_featured" className="text-sm font-semibold text-gray-700 cursor-pointer">
                    Feature on Homepage
                  </label>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 -mx-6 -mb-6 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowProductModal(false);
                    setEditingProduct(null);
                  }}
                  className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="bg-primary-700 hover:bg-primary-800 disabled:opacity-75 text-white font-semibold px-4 py-2 rounded-xl text-sm transition"
                >
                  {savingProduct ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
