import { Star, Quote } from 'lucide-react';
import Image from 'next/image';

const stories = [
  {
    name: 'Ramesh Singh',
    role: 'Tomato Farmer, Punjab',
    avatar: 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=100',
    rating: 4,
    quote: "Village-Connect helped me reach more customers and increase my income significantly.",
  },
  {
    name: 'Savitri Devi',
    role: 'Organic Farmer, Bihar',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100',
    rating: 5,
    quote: "Now I can sell my organic vegetables directly without any middlemen. Great platform!",
  },
  {
    name: 'Mohan Kumar',
    role: 'Honey Producer, Odisha',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    rating: 5,
    quote: "My honey business grew with Village-Connect. Great platform for farmers.",
  },
];

export default function FarmerStories() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-px w-16 bg-primary-300" />
          <h2 className="text-2xl font-bold text-gray-800">Farmer Success Stories</h2>
          <div className="h-px w-16 bg-primary-300" />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {stories.map(({ name, role, avatar, rating, quote }) => (
            <div key={name} className="bg-gray-50 rounded-2xl p-6 relative">
              <Quote className="absolute top-4 right-4 w-8 h-8 text-primary-100" />
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0">
                  <Image src={avatar} alt={name} fill className="object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-800">{name}</h4>
                  <p className="text-xs text-gray-500">{role}</p>
                  <div className="flex mt-0.5">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} className={`w-3 h-3 ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 italic leading-relaxed">"{quote}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
