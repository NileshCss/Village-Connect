import Link from 'next/link';
import { Leaf, Facebook, Instagram, Twitter, Linkedin, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const footerLinks = {
  quickLinks: [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Categories', href: '/categories' },
    { label: 'Farmers', href: '/farmers' },
    { label: 'About Us', href: '/about' },
    { label: 'Contact Us', href: '/contact' },
  ],
  categories: [
    { label: 'Vegetables', href: '/categories/vegetables' },
    { label: 'Fruits', href: '/categories/fruits' },
    { label: 'Dairy', href: '/categories/dairy' },
    { label: 'Grains', href: '/categories/grains' },
    { label: 'Fish', href: '/categories/fish' },
    { label: 'Handicrafts', href: '/categories/handicrafts' },
    { label: 'Spices', href: '/categories/spices' },
    { label: 'Organic Products', href: '/categories/organic' },
  ],
  customer: [
    { label: 'Track Order', href: '/orders' },
    { label: 'Returns & Refunds', href: '/returns' },
    { label: 'Shipping Policy', href: '/shipping' },
    { label: 'Terms & Conditions', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Help & Support', href: '/support' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-forest text-gray-300">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white text-lg">VILLAGE CONNECT</span>
          </Link>
          <p className="text-sm leading-relaxed text-gray-400">
            Connecting villages. Empowering communities. Facilitating direct commerce and resource management for sustainable rural development.
          </p>
          <div className="flex gap-3">
            {[Facebook, Instagram, Twitter, Linkedin, Youtube].map((Icon, i) => (
              <a key={i} href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary-600 transition-colors">
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Quick Links</h3>
          <ul className="space-y-2">
            {footerLinks.quickLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Categories</h3>
          <ul className="space-y-2">
            {footerLinks.categories.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Contact Us</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-sm text-gray-400">
              <Phone className="w-4 h-4 mt-0.5 shrink-0 text-primary-400" />
              <span>+91 12345 67890</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-gray-400">
              <Mail className="w-4 h-4 mt-0.5 shrink-0 text-primary-400" />
              <span>support@village-connect.com</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-gray-400">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary-400" />
              <span>Village Connect Headquarters<br />123 Green Street, Rural Area<br />India - 560001</span>
            </li>
          </ul>

          {/* Customer service links */}
          <div className="mt-6">
            <h4 className="font-semibold text-white text-sm mb-3">Customer Service</h4>
            <ul className="space-y-2">
              {footerLinks.customer.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">© 2025 Village-Connect. All rights reserved.</p>
          <div className="flex items-center gap-2">
            {['VISA', 'MC', 'UPI', 'PayTM'].map((method) => (
              <span key={method} className="bg-white/10 text-gray-300 text-xs px-2 py-1 rounded font-medium">
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
