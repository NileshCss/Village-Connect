import Link from 'next/link';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-9xl font-bold text-primary-100 mb-4">404</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-3">Page Not Found</h1>
        <p className="text-gray-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/" className="btn-primary">
            <Home className="w-4 h-4" /> Go Home
          </Link>
          <Link href="/products" className="btn-outline">
            <Search className="w-4 h-4" /> Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
