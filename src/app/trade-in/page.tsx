import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import MobileStickyBar from '@/components/public/MobileStickyBar';
import TradeInCalculator from '@/components/public/TradeInCalculator';
import Breadcrumbs from '@/components/public/Breadcrumbs';
import { getCachedSettings, getCachedContent } from '@/lib/cache';
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
      </section>
      <Footer settings={settings} content={content} />
      <MobileStickyBar settings={settings} />
    </div>
  );
}
