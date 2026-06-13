'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = targetDate.getTime() - Date.now();
      if (diff <= 0) return;
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        secs: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

export default function OfferBanner() {
  const target = new Date(Date.now() + 2 * 86400000 + 14 * 3600000 + 35 * 60000);
  const { days, hours, mins, secs } = useCountdown(target);

  return (
    <section className="py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-primary-800 to-primary-600 rounded-2xl overflow-hidden">
          <div className="flex flex-col md:flex-row items-center gap-6 p-6 md:p-8">
            {/* Veggie image */}
            <div className="relative w-48 h-32 md:w-56 md:h-40 shrink-0 hidden sm:block">
              <Image
                src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400"
                alt="Fresh Vegetables"
                fill
                className="object-cover rounded-xl"
              />
            </div>

            {/* Content */}
            <div className="flex-1 text-white text-center md:text-left">
              <span className="bg-harvest text-gray-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                Special Offer
              </span>
              <h3 className="text-3xl md:text-4xl font-bold mt-3">
                Get 20% Off<br />
                <span className="text-primary-200">On Fresh Vegetables</span>
              </h3>
              <p className="text-primary-200 mt-2 text-sm">Limited time offer. Order now and eat healthy!</p>
            </div>

            {/* Countdown */}
            <div className="flex items-center gap-3 shrink-0">
              {[
                { value: days, label: 'Days' },
                { value: hours, label: 'Hours' },
                { value: mins, label: 'Mins' },
                { value: secs, label: 'Secs' },
              ].map(({ value, label }) => (
                <div key={label} className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-3 text-center min-w-[56px]">
                  <div className="text-2xl font-bold text-white tabular-nums">
                    {String(value).padStart(2, '0')}
                  </div>
                  <div className="text-xs text-primary-200 mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            <Link href="/products?category=vegetables" className="bg-harvest hover:bg-yellow-400 text-gray-900 font-bold px-6 py-3 rounded-xl transition-colors shrink-0">
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
