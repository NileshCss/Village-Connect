import HeroSection from '@/components/home/HeroSection';
import CategoriesSection from '@/components/home/CategoriesSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import FarmerStories from '@/components/home/FarmerStories';
import OfferBanner from '@/components/home/OfferBanner';
import Newsletter from '@/components/home/Newsletter';

// Brand logos
const brands = [
  { name: 'LOCAL RICE', color: 'text-yellow-700' },
  { name: 'VILLAGE FRESH', color: 'text-green-700' },
  { name: 'ORGANIC FARMS', color: 'text-primary-700' },
  { name: 'PURE HONEY', color: 'text-amber-600' },
  { name: 'GREEN HARVEST', color: 'text-emerald-700' },
  { name: 'NATURAL ROOTS', color: 'text-teal-700' },
];

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <FeaturedProducts />

      {/* Trusted Brands */}
      <section className="py-10 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-primary-600 rounded-full" />
              <h2 className="text-xl font-bold text-gray-800">Trusted Village Brands</h2>
            </div>
            <a href="/products" className="text-sm font-medium text-primary-700">View All Brands →</a>
          </div>
          <div className="flex items-center justify-around flex-wrap gap-6 py-2">
            {brands.map(({ name, color }) => (
              <div key={name} className={`font-bold text-lg ${color} opacity-70 hover:opacity-100 transition-opacity cursor-pointer`}>
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      <WhyChooseUs />
      <FarmerStories />
      <OfferBanner />
      <Newsletter />
    </>
  );
}
