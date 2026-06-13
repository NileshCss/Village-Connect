'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Leaf, Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', role: 'customer' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.fullName, phone: form.phone, role: form.role } },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Account created! Check your email for verification.');
      router.push('/auth/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-700 rounded-full flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-primary-800 text-xl">Village Connect</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-6">Create account</h1>
          <p className="text-gray-500 text-sm mt-1">Join thousands of happy customers</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Role selector */}
          <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
            {['customer', 'farmer'].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => update('role', role)}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                  form.role === role ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500'
                }`}
              >
                {role === 'customer' ? '🛍️ Customer' : '🌾 Farmer'}
              </button>
            ))}
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={form.fullName} onChange={(e) => update('fullName', e.target.value)}
                  placeholder="Your full name" required
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)}
                  placeholder="you@example.com" required
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type={showPass ? 'text' : 'password'} value={form.password} onChange={(e) => update('password', e.target.value)}
                  placeholder="Min. 6 characters" required
                  className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-500">
              By signing up, you agree to our{' '}
              <Link href="/terms" className="text-primary-700 hover:underline">Terms</Link> and{' '}
              <Link href="/privacy" className="text-primary-700 hover:underline">Privacy Policy</Link>.
            </p>

            <button type="submit" disabled={loading}
              className="w-full bg-primary-700 hover:bg-primary-800 disabled:opacity-70 text-white font-semibold py-3 rounded-xl transition-colors">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-primary-700 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
