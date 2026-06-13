import { Truck, Sprout, Tag, ShieldCheck } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: 'Fast Delivery',
    desc: 'Quick delivery to your doorstep',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Sprout,
    title: 'Direct From Farmers',
    desc: '100% products from local farmers',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: Tag,
    title: 'Better Prices',
    desc: 'Best quality at affordable prices',
    color: 'bg-yellow-50 text-yellow-600',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Payments',
    desc: '100% safe and secure transactions',
    color: 'bg-purple-50 text-purple-600',
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="section-heading">Why Choose Village-Connect?</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-800 mb-1 text-sm">{title}</h3>
              <p className="text-xs text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
