'use client';

import { useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';

export default function Newsletter() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success('Subscribed successfully!');
    setEmail('');
  };

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-primary-50 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Stay Connected</h2>
            <p className="text-gray-600 mb-6">
              Subscribe to our newsletter and get updates on offers, new products and more.
            </p>
            <form onSubmit={handleSubmit} className="flex max-w-md gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary-500 bg-white text-sm"
                required
              />
              <button type="submit" className="bg-primary-700 hover:bg-primary-800 text-white font-semibold px-6 py-3 rounded-xl transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </form>
          </div>
          <div className="relative w-48 h-36 hidden md:block">
            <Image
              src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=300"
              alt="Village fields"
              fill
              className="object-cover rounded-xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
