import Link from 'next/link';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import MobileStickyBar from '@/components/public/MobileStickyBar';
import Breadcrumbs from '@/components/public/Breadcrumbs';
import VehicleCard from '@/components/public/VehicleCard';
import { AutoDealerSchema } from '@/components/seo/JsonLd';
import { ArrowRight, Phone, MapPin, ShieldCheck, Gem } from 'lucide-react';
import { getCachedVehicles, getCachedSettings, getCachedContent } from '@/lib/cache';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Affordable Used Cars in NYC — Cash Cars Under $5,000 | TyFix Auto Sales',
  description:
    'Find affordable used cars across NYC at TyFix Auto Sales in Brooklyn. Quality inspected vehicles under $5,000. Serving Brooklyn, Queens, Manhattan, Bronx & Staten Island.',
  openGraph: {
    title: 'Affordable Used Cars NYC — TyFix Auto Sales',
    description: 'Cash cars under $5,000 for all five NYC boroughs.',
    url: 'https://tyfixautosales.com/affordable-cars-nyc',
  },
  alternates: { canonical: 'https://tyfixautosales.com/affordable-cars-nyc' },
};

export default async function AffordableCarsNYCPage() {
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
          <Breadcrumbs items={[{ label: 'Affordable Cars NYC', href: '/affordable-cars-nyc' }]} />

          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
            Affordable Used Cars in NYC
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl leading-relaxed mb-12">
            New York City doesn&apos;t have to mean expensive car buying. TyFix Auto Sales
            brings affordable, quality used vehicles to all five boroughs.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              { icon: <MapPin size={24} />, title: 'Serving All 5 Boroughs', desc: 'Located in Brooklyn, we serve buyers from Queens, Manhattan, the Bronx, and Staten Island.' },
              { icon: <ShieldCheck size={24} />, title: 'Inspected Vehicles', desc: 'Every car passes our inspection process. We\'re transparent about condition — always.' },
              { icon: <Gem size={24} />, title: 'Unbeatable Value', desc: 'We buy smart at auction and sell at fair prices. Most vehicles are $1,000 to $5,000.' },
            ].map((item, i) => (
              <div key={i} className="p-6 bg-gray-50 rounded-2xl">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4">{item.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="max-w-3xl mb-16">
            <h2 className="text-2xl font-black text-gray-900 mb-4">NYC&apos;s Best-Kept Car Buying Secret</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              In a city where everything costs more, TyFix Auto Sales stands out by keeping prices
              real and the buying process simple. We&apos;re not a flashy megadealership — we&apos;re a local,
              community-driven lot that puts our customers first.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              Whether you&apos;re a first-time buyer, a rideshare driver looking for a reliable work car,
              or a family that needs an affordable second vehicle, our curated inventory has options
              for every situation and every budget.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Can&apos;t make it to Brooklyn? Browse our <Link href="/inventory" className="text-primary font-bold hover:underline">full inventory online</Link>,
              then call us to arrange a viewing. We can also source specific vehicles through our{' '}
              <Link href="/autoconnect" className="text-primary font-bold hover:underline">AutoConnect™ program</Link> — tell us what you&apos;re looking for and we&apos;ll find it.
            </p>
          </div>

          {vehicles.length > 0 && (
            <div className="mb-16">
              <h2 className="text-2xl font-black text-gray-900 mb-6">Most Affordable Vehicles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {vehicles.map((v) => <VehicleCard key={v.id} vehicle={v} autoCarousel={false} />)}
              </div>
              <div className="text-center mt-8">
                <Link href="/inventory" className="btn-primary">See Full Inventory <ArrowRight size={18} /></Link>
              </div>
            </div>
          )}

          <div className="p-8 bg-gray-900 rounded-3xl text-center text-white">
            <h2 className="text-2xl font-black mb-3">Let&apos;s Find Your Car</h2>
            <p className="text-gray-400 mb-6">Serving all of NYC from our Brooklyn lot. Call today.</p>
            {settings?.phone_number && (
              <a href={`tel:${settings.phone_number.replace(/\D/g, '')}`} className="btn-primary"><Phone size={18} /> Call TyFix</a>
            )}
          </div>
        </div>
      </section>
      <Footer settings={settings} content={contentMap} />
      <MobileStickyBar settings={settings} />
    </div>
  );
}
