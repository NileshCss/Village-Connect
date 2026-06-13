import Image from 'next/image';
import Link from 'next/link';
import { Leaf, Target, Users, Globe, Heart, Award } from 'lucide-react';

const team = [
  { name: 'Arjun Sharma', role: 'Founder & CEO', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' },
  { name: 'Priya Nair', role: 'Head of Farmer Relations', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200' },
  { name: 'Rahul Mehta', role: 'Chief Technology Officer', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200' },
  { name: 'Sunita Devi', role: 'Community Manager', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200' },
];

const values = [
  { icon: Heart, title: 'Community First', desc: 'We put rural communities at the heart of everything we do.' },
  { icon: Leaf, title: 'Sustainability', desc: 'Promoting eco-friendly farming and sustainable practices.' },
  { icon: Users, title: 'Empowerment', desc: 'Giving farmers the tools to thrive in modern markets.' },
  { icon: Globe, title: 'Transparency', desc: 'Direct farmer-to-consumer connections with no hidden costs.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-900 to-primary-700 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm mb-6">
            <Leaf className="w-4 h-4" /> Our Story
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Connecting Villages to<br />the World Since 2020
          </h1>
          <p className="text-primary-200 text-lg max-w-2xl mx-auto leading-relaxed">
            Village Connect was born from a simple belief — that every farmer deserves fair prices,
            and every consumer deserves fresh, honest food.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-12 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { n: '50K+', label: 'Happy Customers' },
            { n: '2K+', label: 'Verified Farmers' },
            { n: '500+', label: 'Villages Connected' },
            { n: '10K+', label: 'Products Listed' },
          ].map(({ n, label }) => (
            <div key={label} className="p-4">
              <div className="text-4xl font-bold text-primary-700 mb-2">{n}</div>
              <div className="text-gray-500 text-sm">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-2 text-primary-600 font-semibold text-sm mb-3">
              <Target className="w-4 h-4" /> Our Mission
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-5">
              Eliminating the Middlemen, Empowering Farmers
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Traditional supply chains leave farmers with a fraction of the actual market price.
              Village Connect eliminates intermediaries, ensuring farmers earn more while consumers
              pay less for fresher produce.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              We provide farmers with digital tools, market access, and community support to
              build sustainable livelihoods, while connecting urban consumers with authentic
              rural produce.
            </p>
            <Link href="/farmers" className="btn-primary">
              Meet Our Farmers
            </Link>
          </div>
          <div className="relative h-72 rounded-2xl overflow-hidden shadow-lg">
            <Image
              src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600"
              alt="Farm field" fill className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-10">Our Values</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-primary-50 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-primary-700" />
                </div>
                <h3 className="font-bold text-gray-800 mb-2">{title}</h3>
                <p className="text-sm text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-10">Meet the Team</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {team.map(({ name, role, avatar }) => (
              <div key={name} className="text-center">
                <div className="relative w-24 h-24 rounded-full overflow-hidden mx-auto mb-3 shadow-md">
                  <Image src={avatar} alt={name} fill className="object-cover" />
                </div>
                <h4 className="font-bold text-gray-800 text-sm">{name}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Award */}
      <section className="bg-primary-800 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Award className="w-12 h-12 text-harvest mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Join Our Mission</h2>
          <p className="text-primary-200 mb-8 text-lg">
            Whether you're a farmer looking to sell, or a consumer seeking fresh produce,
            Village Connect is your trusted partner.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/auth/register" className="bg-white text-primary-800 font-bold px-8 py-3 rounded-xl hover:bg-primary-50 transition">
              Get Started
            </Link>
            <Link href="/products" className="border-2 border-white/60 text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/10 transition">
              Shop Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
