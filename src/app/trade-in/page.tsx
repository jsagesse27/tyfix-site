import Link from 'next/link';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import MobileStickyBar from '@/components/public/MobileStickyBar';
import TradeInCalculator from '@/components/public/TradeInCalculator';
import Breadcrumbs from '@/components/public/Breadcrumbs';
import { getCachedSettings, getCachedContent } from '@/lib/cache';
import { ArrowRight, Car } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sell Us Your Car for Cash in Brooklyn — TyFix Auto Sales',
  description:
    'Get a fast, fair cash offer for your vehicle at TyFix Auto Sales in Brooklyn, NY. No lowball quotes, no hassle. Tell us about your car and get a real offer.',
  openGraph: {
    title: 'Sell Us Your Car for Cash — TyFix Auto Sales',
    description: 'Fast, fair cash offers for your vehicle in Brooklyn.',
    url: 'https://tyfixautosales.com/trade-in',
  },
  alternates: { canonical: 'https://tyfixautosales.com/trade-in' },
};

async function getData() {
  const [settings, content] = await Promise.all([
    getCachedSettings(),
    getCachedContent(),
  ]);
  return { settings, content };
}

export default async function TradeInPage() {
  const { settings, content } = await getData();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar settings={settings} />
      <section className="pt-32 pb-24 px-4">
        <div className="max-w-4xl mx-auto">
          <Breadcrumbs items={[{ label: 'Sell Us Your Car', href: '/trade-in' }]} />
          <div className="text-center mb-12">
            <span className="inline-block bg-primary/10 text-primary text-sm font-bold px-4 py-1 rounded-full mb-4 uppercase tracking-[0.15em]">TyFix Buy Back Program</span>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">Sell Us Your Car for Cash in Brooklyn</h1>
            <p className="text-slate-500 max-w-xl mx-auto text-lg">Get a fast, fair, and transparent cash offer for your vehicle — no stress, no lowball quotes.</p>
          </div>
        </div>
        <TradeInCalculator />

        {/* Internal cross-link to inventory */}
        <div className="max-w-2xl mx-auto mt-16 text-center">
          <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-lg">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Car size={28} className="text-primary" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Browse What You Could Drive Next</h2>
            <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
              Use the cash from your trade-in toward one of our quality-inspected vehicles — all priced under $5,000 with no hidden fees.
            </p>
            <Link
              href="/inventory"
              className="btn-primary inline-flex items-center gap-2 px-8"
            >
              View Full Inventory <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
      <Footer settings={settings} content={content} />
      <MobileStickyBar settings={settings} />
    </div>
  );
}
