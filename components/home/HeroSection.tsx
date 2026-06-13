'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShieldCheck, Sprout, CreditCard } from 'lucide-react';

export default function HeroSection() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/products?search=${encodeURIComponent(query)}`);
  };

  const badges = [
    { icon: ShieldCheck, label: '100% Original Products' },
    { icon: Sprout, label: 'Direct from Farmers' },
    { icon: CreditCard, label: 'Secure Payments' },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 min-h-[520px] flex items-center">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-harvest rounded-full blur-3xl" />
      </div>

      {/* Background image overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16 w-full">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* Left content */}
          <div className="text-white space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>Fresh produce delivered daily</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Connecting<br />
              <span className="text-harvest">Villages</span> to<br />
              the World
            </h1>

            <p className="text-primary-100 text-lg max-w-md leading-relaxed">
              Fresh produce, handmade products and local services directly from rural communities.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex max-w-md">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search vegetables, fruits, dairy..."
                className="flex-1 pl-5 pr-3 py-3.5 rounded-l-xl text-gray-800 bg-white focus:outline-none text-sm"
              />
              <button type="submit" className="bg-harvest hover:bg-yellow-500 text-gray-900 px-5 py-3.5 rounded-r-xl font-semibold flex items-center gap-2 transition-colors">
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </form>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-3">
              <Link href="/products" className="bg-white text-primary-800 hover:bg-primary-50 font-bold px-7 py-3 rounded-xl transition-colors inline-flex items-center gap-2">
                Shop Now
              </Link>
              <Link href="/categories" className="border-2 border-white/60 text-white hover:bg-white/10 font-semibold px-7 py-3 rounded-xl transition-colors inline-flex items-center gap-2">
                Explore Categories
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-4 pt-2">
              {badges.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm text-primary-100">
                  <Icon className="w-4 h-4 text-green-400 shrink-0" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — decorative stats */}
          <div className="hidden lg:flex flex-col items-end gap-4">
            {[
              { number: '50,000+', label: 'Happy Customers' },
              { number: '2,000+', label: 'Verified Farmers' },
              { number: '10,000+', label: 'Products Listed' },
              { number: '500+', label: 'Villages Connected' },
            ].map(({ number, label }) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-8 py-4 text-white text-right w-56">
                <div className="text-2xl font-bold text-harvest">{number}</div>
                <div className="text-sm text-primary-200 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
