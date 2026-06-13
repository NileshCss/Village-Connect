'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Leaf, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else setSent(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-700 rounded-full flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-primary-800 text-xl">Village Connect</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-800 mb-2">Check your inbox!</h2>
              <p className="text-gray-500 text-sm mb-6">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <Link href="/auth/login" className="btn-primary w-full justify-center">
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-5">
                <ArrowLeft className="w-4 h-4" /> Back to login
              </Link>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Forgot password?</h1>
              <p className="text-gray-500 text-sm mb-6">
                Enter your email and we'll send you a reset link.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com" required
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500" />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="btn-primary w-full justify-center">
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
