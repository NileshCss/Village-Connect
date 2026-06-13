import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/layout/CartDrawer';

export const metadata: Metadata = {
  title: 'Village Connect — Fresh from the Farm',
  description:
    'Connecting Villages to the World. Fresh produce, handmade products and local services directly from rural communities.',
  keywords: 'fresh vegetables, organic food, farm produce, village products, India',
  openGraph: {
    title: 'Village Connect',
    description: 'Fresh produce directly from rural communities',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 font-body antialiased">
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              borderRadius: '8px',
              background: '#166534',
              color: '#fff',
              fontSize: '14px',
            },
          }}
        />
        <CartDrawer />
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
