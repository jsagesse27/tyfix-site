'use client';

import Link from 'next/link';
import { useReveal } from '@/lib/useReveal';

export default function SellYourCarSection() {
  const ref = useReveal();

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className="reveal max-w-lg mx-auto">
          <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 text-slate-900 transition-all hover:bg-white hover:shadow-lg hover:shadow-slate-200/50">
            <h3 className="text-2xl font-black mb-2">Sell Us Your Car</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              We buy cars for cash, even if you don&apos;t buy from us. Get a fast, fair offer today.
            </p>
            <Link
              href="/trade-in"
              className="btn-primary w-full text-center block text-sm shadow-lg shadow-primary/20"
            >
              Get Cash Offer
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
