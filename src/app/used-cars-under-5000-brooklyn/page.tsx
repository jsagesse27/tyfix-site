import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import MobileStickyBar from '@/components/public/MobileStickyBar';
import Breadcrumbs from '@/components/public/Breadcrumbs';
import VehicleCard from '@/components/public/VehicleCard';
import { AutoDealerSchema } from '@/components/seo/JsonLd';
import { ArrowRight, Phone, Banknote, TrendingDown, Search } from 'lucide-react';
import type { SiteSettings, SiteContent, Vehicle } from '@/lib/types';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Used Cars Under $5,000 for Sale in Brooklyn NY — TyFix Auto Sales',
  description:
    'Find quality used cars under $5,000 in Brooklyn, NY. TyFix Auto Sales specializes in affordable, inspected vehicles. Cash only, no credit checks, no hidden fees.',
  openGraph: {
    title: 'Used Cars Under $5,000 — TyFix Auto Sales Brooklyn',
    description: 'Quality used vehicles starting from $1,000. Cash only dealer in Brooklyn.',
    type: 'website',
    url: 'https://tyfixautosales.com/used-cars-under-5000-brooklyn',
  },
  alternates: { canonical: 'https://tyfixautosales.com/used-cars-under-5000-brooklyn' },
};

export default async function UsedCarsUnder5000Page() {
  const supabase = await createClient();
  const [settingsRes, contentRes, vehiclesRes] = await Promise.all([
    supabase.from('site_settings').select('*').limit(1).single(),
    supabase.from('site_content').select('*'),
    supabase.from('vehicles').select('*, photos:vehicle_photos(*)').eq('listing_status', 'active').lte('price', 5000).order('price', { ascending: true }).limit(6),
  ]);
  const settings = settingsRes.data as SiteSettings;
  const vehicles = (vehiclesRes.data as Vehicle[]) || [];
  const contentMap: Record<string, string> = {};
  if (contentRes.data) (contentRes.data as SiteContent[]).forEach(c => { contentMap[c.content_key] = c.content_value; });

  return (
    <div className="min-h-screen">
      <AutoDealerSchema settings={settings} />
      <Navbar settings={settings} />
      <section className="pt-28 pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: 'Used Cars Under $5,000', href: '/used-cars-under-5000-brooklyn' }]} />

          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
            Used Cars Under $5,000 in Brooklyn
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl leading-relaxed mb-12">
            Budget-friendly doesn&apos;t mean unreliable. At TyFix Auto Sales, every vehicle on our lot
            is inspected and priced to give you the best value for your money.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              { icon: <Banknote size={24} />, title: 'Prices from $1,000', desc: 'Sedans, SUVs, and more — all priced between $1,000 and $5,000.' },
              { icon: <TrendingDown size={24} />, title: 'Below Market Value', desc: 'We buy smart at auction and pass the savings directly to you.' },
              { icon: <Search size={24} />, title: 'Can\'t Find It? We\'ll Find It', desc: 'Our AutoConnect™ program sources your dream car from auctions.' },
            ].map((item, i) => (
              <div key={i} className="p-6 bg-gray-50 rounded-2xl">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4">{item.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="max-w-3xl mb-16">
            <h2 className="text-2xl font-black text-gray-900 mb-4">Affordable Cars That Don&apos;t Compromise</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We know that a $3,000 or $4,000 car is a major purchase for many families. That&apos;s why we
              take sourcing seriously. Our inventory comes from licensed dealer auctions — not random
              salvage yards or sketchy buy-here-pay-here lots. We inspect what we buy and are upfront
              about the condition of every vehicle.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              Whether you need a sedan for commuting to work, a minivan for the family, or an SUV for
              weekend adventures, we&apos;ve got you covered. And since we&apos;re cash only, there&apos;s no
              financing to worry about — you pay the sticker price, handle your DMV paperwork, and
              you&apos;re on the road.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Based in Brooklyn at 183 Bay 53rd St, TyFix Auto Sales has become the neighborhood&apos;s
              go-to spot for honest, no-nonsense car buying. Check out our latest inventory below,
              or <Link href="/autoconnect" className="text-primary font-bold hover:underline">let us find your car</Link> through our AutoConnect™ service.
            </p>
          </div>

          {vehicles.length > 0 && (
            <div className="mb-16">
              <h2 className="text-2xl font-black text-gray-900 mb-6">Vehicles Under $5,000</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {vehicles.map((v) => <VehicleCard key={v.id} vehicle={v} autoCarousel={false} />)}
              </div>
              <div className="text-center mt-8">
                <Link href="/inventory?maxPrice=5000" className="btn-primary">
                  View All Under $5,000 <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          )}

          <div className="p-8 bg-gray-900 rounded-3xl text-center text-white">
            <h2 className="text-2xl font-black mb-3">Find Your Next Car</h2>
            <p className="text-gray-400 mb-6">Call or text to see what&apos;s available. New inventory added weekly.</p>
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
