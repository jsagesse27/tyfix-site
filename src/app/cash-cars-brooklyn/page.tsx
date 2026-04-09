import Link from 'next/link';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import MobileStickyBar from '@/components/public/MobileStickyBar';
import Breadcrumbs from '@/components/public/Breadcrumbs';
import VehicleCard from '@/components/public/VehicleCard';
import { AutoDealerSchema } from '@/components/seo/JsonLd';
import { ArrowRight, Phone, DollarSign, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { getCachedVehicles, getCachedSettings, getCachedContent } from '@/lib/cache';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cash Cars for Sale in Brooklyn NY — No Credit Check, Drive Away Today',
  description:
    'Browse affordable cash cars for sale in Brooklyn, NY at TyFix Auto Sales. Quality used vehicles under $5,000. No credit checks, no interest, no hidden fees. Pay cash and drive today.',
  openGraph: {
    title: 'Cash Cars for Sale in Brooklyn NY — TyFix Auto Sales',
    description: 'Quality used vehicles under $5,000. No credit checks. Pay cash and drive today.',
    type: 'website',
    url: 'https://tyfixautosales.com/cash-cars-brooklyn',
  },
  alternates: { canonical: 'https://tyfixautosales.com/cash-cars-brooklyn' },
};

export default async function CashCarsBrooklynPage() {
  const [vehicles, settings, contentMap] = await Promise.all([
    getCachedVehicles().then(v => v.slice(0, 6)),
    getCachedSettings(),
    getCachedContent(),
  ]);

  return (
    <div className="min-h-screen">
      <AutoDealerSchema settings={settings} />
      <Navbar settings={settings} />

      <section className="pt-28 pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: 'Cash Cars Brooklyn', href: '/cash-cars-brooklyn' }]} />

          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
            Cash Cars for Sale in Brooklyn, NY
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl leading-relaxed mb-12">
            Looking for a reliable car you can buy with cash today? TyFix Auto Sales is Brooklyn&apos;s
            go-to dealer for quality used vehicles you can drive away same day — no banks, no paperwork,
            no headaches.
          </p>

          {/* Value Props */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              { icon: <DollarSign size={24} />, title: 'Cash Only, No Surprises', desc: 'The price you see is the price you pay. No interest, no dealer fees, no last-minute add-ons.' },
              { icon: <ShieldCheck size={24} />, title: 'Quality Inspected', desc: 'Every vehicle goes through our inspection process so you know exactly what you\'re buying.' },
              { icon: <CheckCircle2 size={24} />, title: 'Drive Away Today', desc: 'Bring your cash, sign the paperwork, and drive home in your new car. It\'s that simple.' },
            ].map((item, i) => (
              <div key={i} className="p-6 bg-gray-50 rounded-2xl">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="max-w-3xl mb-16">
            <h2 className="text-2xl font-black text-gray-900 mb-4">Why Buy a Cash Car in Brooklyn?</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Buying a cash car means freedom. No monthly payments hanging over your head, no interest charges
              eating into your budget, and no credit checks holding you back. At TyFix Auto Sales, we believe
              car buying should be accessible to everyone — whether you have perfect credit, bad credit, or
              no credit at all.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              Our inventory is carefully selected from dealer auctions across the tri-state area. We specialize
              in affordable, reliable vehicles priced between $1,000 and $5,000 — the sweet spot where you get
              a dependable daily driver without breaking the bank.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Located at 183 Bay 53rd St in the Coney Island area of Brooklyn, we serve car buyers from
              all five NYC boroughs: Brooklyn, Queens, Manhattan, the Bronx, and Staten Island. Schedule
              an appointment and come see what&apos;s on the lot today.
            </p>
          </div>

          {/* Featured Vehicles */}
          {vehicles.length > 0 && (
            <div className="mb-16">
              <h2 className="text-2xl font-black text-gray-900 mb-6">Cash Cars Available Now</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {vehicles.map((v) => (
                  <VehicleCard key={v.id} vehicle={v} autoCarousel={false} />
                ))}
              </div>
              <div className="text-center mt-8">
                <Link href="/inventory" className="btn-primary">
                  View Full Inventory <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="p-8 bg-gray-900 rounded-3xl text-center text-white">
            <h2 className="text-2xl font-black mb-3">Ready to Shop?</h2>
            <p className="text-gray-400 mb-6">Call or text us to schedule a visit. By appointment only.</p>
            {settings?.phone_number && (
              <a href={`tel:${settings.phone_number.replace(/\D/g, '')}`} className="btn-primary">
                <Phone size={18} /> Call TyFix Now
              </a>
            )}
          </div>
        </div>
      </section>

      <Footer settings={settings} content={contentMap} />
      <MobileStickyBar settings={settings} />
    </div>
  );
}
