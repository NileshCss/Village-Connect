'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart, Heart, Bell, Search, Menu, X, User,
  ChevronDown, Leaf, LogOut, Package, MapPin
} from 'lucide-react';
import { useCartStore } from '@/lib/store/cart';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/types/database';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Categories', href: '/categories' },
  { label: 'Farmers', href: '/farmers' },
  { label: 'About Us', href: '/about' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<Profile | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { totalItems, toggleCart } = useCartStore();
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          // @ts-ignore
          const { data, error } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();
          if (data && !error) {
            setUser(data as any);
          } else {
            setUser({
              id: authUser.id,
              email: authUser.email || '',
              full_name: authUser.user_metadata?.full_name || 'User',
              phone: authUser.user_metadata?.phone || '',
              avatar_url: authUser.user_metadata?.avatar_url || '',
              role: authUser.user_metadata?.role || 'customer',
              created_at: authUser.created_at,
              updated_at: authUser.created_at,
            });
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          try {
            // @ts-ignore
            const { data, error } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
            if (data && !error) {
              setUser(data as any);
            } else {
              const authUser = session.user;
              setUser({
                id: authUser.id,
                email: authUser.email || '',
                full_name: authUser.user_metadata?.full_name || 'User',
                phone: authUser.user_metadata?.phone || '',
                avatar_url: authUser.user_metadata?.avatar_url || '',
                role: authUser.user_metadata?.role || 'customer',
                created_at: authUser.created_at,
                updated_at: authUser.created_at,
              });
            }
          } catch (err) {
            console.error(err);
          }
        } else {
          setUser(null);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUserMenuOpen(false);
    router.push('/');
  };

  const cartCount = totalItems();

  return (
    <>
      {/* Top bar */}
      <div className="bg-primary-800 text-white text-xs py-2 px-4 flex items-center justify-between">
        <span className="hidden sm:block">🚚 Free Delivery on orders above ₹499</span>
        <span className="text-center flex-1 sm:flex-none">Connecting Villages. Empowering Communities.</span>
        <div className="hidden sm:flex items-center gap-4">
          <Link href="/support" className="hover:text-primary-200 transition">Support</Link>
          <Link href="/orders" className="hover:text-primary-200 transition">Track Order</Link>
        </div>
      </div>

      {/* Main header */}
      <header className={`sticky top-0 z-50 bg-white transition-shadow duration-200 ${scrolled ? 'shadow-md' : 'shadow-sm'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-16 gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 bg-primary-700 rounded-full flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-primary-800 text-lg leading-tight">
                VILLAGE<br className="hidden sm:block" />
                <span className="text-xs font-semibold tracking-widest text-primary-600">CONNECT</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-6 flex-1 ml-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-gray-700 hover:text-primary-700 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Search */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xs items-center">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products..."
                  className="w-full pl-4 pr-10 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-primary-500 bg-gray-50"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600">
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Right icons */}
            <div className="flex items-center gap-1 sm:gap-2 ml-auto lg:ml-0">
              <Link href="/wishlist" className="p-2 text-gray-600 hover:text-red-500 transition">
                <Heart className="w-5 h-5" />
              </Link>
              <button onClick={toggleCart} className="relative p-2 text-gray-600 hover:text-primary-700 transition">
                <ShoppingCart className="w-5 h-5" />
                {mounted && cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>
              <button className="hidden sm:flex p-2 text-gray-600 hover:text-primary-700 transition">
                <Bell className="w-5 h-5" />
              </button>

              {/* User menu */}
              {mounted && (user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1 p-1.5 rounded-full bg-primary-700 text-white hover:bg-primary-800 transition"
                  >
                    <span className="w-6 h-6 flex items-center justify-center font-semibold text-sm">
                      {(user.full_name || user.email)[0].toUpperCase()}
                    </span>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-fade-in">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-sm text-gray-800 truncate">{user.full_name || 'User'}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      {user.role === 'admin' && (
                        <Link href="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-50 border-b border-gray-100">
                          <Leaf className="w-4 h-4" /> Admin Dashboard
                        </Link>
                      )}
                      {user.role === 'farmer' && (
                        <Link href="/farmer" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-50 border-b border-gray-100">
                          <Leaf className="w-4 h-4" /> Farmer Dashboard
                        </Link>
                      )}
                      <Link href="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <User className="w-4 h-4" /> My Profile
                      </Link>
                      <Link href="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <Package className="w-4 h-4" /> My Orders
                      </Link>
                      <Link href="/addresses" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <MapPin className="w-4 h-4" /> Addresses
                      </Link>
                      <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="w-8 h-8 bg-primary-700 text-white rounded-full flex items-center justify-center hover:bg-primary-800 transition"
                >
                  <User className="w-4 h-4" />
                </Link>
              ))}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-primary-700"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mounted && mobileOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white animate-slide-up">
            <div className="px-4 py-3">
              <form onSubmit={handleSearch} className="flex items-center gap-2 mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 pl-4 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-primary-500"
                />
                <button type="submit" className="bg-primary-700 text-white p-2 rounded-full">
                  <Search className="w-4 h-4" />
                </button>
              </form>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-3 text-gray-700 border-b border-gray-50 font-medium hover:text-primary-700 transition"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
