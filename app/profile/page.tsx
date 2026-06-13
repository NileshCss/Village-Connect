'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, Save, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/types/database';

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState({ full_name: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }
      // @ts-ignore
      const { data: rawData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      const data = rawData as any;
      if (data) {
        setProfile(data);
        setForm({ full_name: data.full_name || '', phone: data.phone || '' });
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    // @ts-ignore
    const { error } = await supabase.from('profiles').update({ full_name: form.full_name, phone: form.phone, updated_at: new Date().toISOString() }).eq('id', profile.id);
    setSaving(false);
    if (error) toast.error('Failed to update profile');
    else toast.success('Profile updated!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-300 border-t-primary-700 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Avatar section */}
          <div className="bg-gradient-to-r from-primary-700 to-primary-500 px-6 py-8 flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-white text-3xl font-bold">
                {(profile?.full_name || profile?.email || 'U')[0].toUpperCase()}
              </div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow text-primary-700 hover:bg-gray-50 transition">
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="text-white">
              <h2 className="font-bold text-xl">{profile?.full_name || 'User'}</h2>
              <p className="text-primary-200 text-sm mt-0.5">{profile?.email}</p>
              <span className="inline-flex items-center mt-2 text-xs bg-white/20 text-white px-2.5 py-0.5 rounded-full font-medium">
                {profile?.role?.charAt(0).toUpperCase()}{profile?.role?.slice(1)}
              </span>
            </div>
          </div>

          {/* Form */}
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                  placeholder="Your full name"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="w-full pl-10 pr-4 py-3 border border-gray-100 rounded-xl text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary w-full justify-center"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          {[
            { label: 'My Orders', href: '/orders', emoji: '📦' },
            { label: 'Saved Addresses', href: '/addresses', emoji: '📍' },
            { label: 'Wishlist', href: '/wishlist', emoji: '❤️' },
            { label: 'Help & Support', href: '/support', emoji: '💬' },
          ].map(({ label, href, emoji }) => (
            <a key={href} href={href}
              className="bg-white rounded-xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
              <span className="text-2xl">{emoji}</span>
              <span className="font-medium text-gray-700 text-sm">{label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
