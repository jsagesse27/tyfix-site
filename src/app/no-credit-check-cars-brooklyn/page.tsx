import Link from 'next/link';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import MobileStickyBar from '@/components/public/MobileStickyBar';
import Breadcrumbs from '@/components/public/Breadcrumbs';
import VehicleCard from '@/components/public/VehicleCard';
import { AutoDealerSchema } from '@/components/seo/JsonLd';
import { ArrowRight, Phone, XCircle, CheckCircle2, DollarSign } from 'lucide-react';
import { getCachedVehicles, getCachedSettings, getCachedContent } from '@/lib/cache';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'No Credit Check Cars in Brooklyn NY — Cash Only Dealer | TyFix Auto Sales',
  description:
    'Buy a car with no credit check in Brooklyn, NY. TyFix Auto Sales is a cash-only dealer — no financing needed, no credit score required. Quality used cars from $1,000.',
  openGraph: {
    title: 'No Credit Check Cars — TyFix Auto Sales Brooklyn',
    description: 'Cash-only dealer. No credit checks, no interest. Drive away today.',
    type: 'website',
    url: 'https://tyfixautosales.com/no-credit-check-cars-brooklyn',
  },
  alternates: { canonical: 'https://tyfixautosales.com/no-credit-check-cars-brooklyn' },
};

export default async function NoCreditCheckPage() {
  const [vehicles, settings, contentMap] = await Promise.all([
    getCachedVehicles().then(v => v.sort((a, b) => a.price - b.price).slice(0, 6)),
    getCachedSettings(),
    getCachedContent(),
  ]);

  return (
    <div className="min-h-screen">
      <AutoDealerSchema settings={settings} />
      <Navbar settings={settings} />
      <section className="pt-28 pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: 'No Credit Check Cars', href: '/no-credit-check-cars-brooklyn' }]} />

          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
            No Credit Check Cars in Brooklyn, NY
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl leading-relaxed mb-12">
            Your credit score doesn&apos;t define you — and it definitely shouldn&apos;t stop you from
            getting a reliable car. At TyFix, we don&apos;t run credit. Period.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              { icon: <XCircle size={24} />, title: 'Zero Credit Checks', desc: 'We don\'t pull your credit. We don\'t ask about your score. Cash is the only qualification.' },
              { icon: <DollarSign size={24} />, title: 'Cash & Drive', desc: 'Bring your cash, pick your car, and drive home. No waiting for approvals.' },
              { icon: <CheckCircle2 size={24} />, title: 'Everyone Qualifies', desc: 'Bad credit, no credit, collections, bankruptcy — none of it matters here.' },
            ].map((item, i) => (
              <div key={i} className="p-6 bg-gray-50 rounded-2xl">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4">{item.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="max-w-3xl mb-16">
            <h2 className="text-2xl font-black text-gray-900 mb-4">Why Cash Beats Financing</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Traditional buy-here-pay-here lots trap you in high-interest loans, hidden fees, and
              the constant stress of monthly payments. Miss one payment and they repossess the car.
              That&apos;s not how car ownership should work.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              At TyFix Auto Sales, everything is transparent. You see the price on the windshield,
              you pay that price, and the car is yours — free and clear. No lien, no repo risk,
              no surprise fees six months down the line. Your car. Your title. Your freedom.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We specialize in vehicles priced between $1,000 and $5,000 because we believe
              everyone deserves access to reliable transportation. Visit us at 183 Bay 53rd St
              in Brooklyn, or check out our <Link href="/inventory" className="text-primary font-bold hover:underline">full inventory</Link> online.
            </p>
          </div>

          {vehicles.length > 0 && (
            <div className="mb-16">
              <h2 className="text-2xl font-black text-gray-900 mb-6">Available Now — No Credit Required</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {vehicles.map((v) => <VehicleCard key={v.id} vehicle={v} autoCarousel={false} />)}
              </div>
              <div className="text-center mt-8">
                <Link href="/inventory" className="btn-primary">Browse All Inventory <ArrowRight size={18} /></Link>
              </div>
            </div>
          )}

          <div className="p-8 bg-gray-900 rounded-3xl text-center text-white">
            <h2 className="text-2xl font-black mb-3">Skip the Dealership Drama</h2>
            <p className="text-gray-400 mb-6">Call TyFix and find out how easy buying a car can be.</p>
            {settings?.phone_number && (
              <a href={`tel:${settings.phone_number.replace(/\D/g, '')}`} className="btn-primary"><Phone size={18} /> Call Now</a>
            )}
          </div>
        </div>
      </section>
      <Footer settings={settings} content={contentMap} />
      <MobileStickyBar settings={settings} />
    </div>
  );
}
