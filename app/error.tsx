'use client';

import { useEffect } from 'react';
import { RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-4">😕</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">Something went wrong</h1>
        <p className="text-gray-500 mb-8">
          An unexpected error occurred. Please try again.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <button onClick={reset} className="btn-primary">
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
          <Link href="/" className="btn-outline">
            <Home className="w-4 h-4" /> Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
