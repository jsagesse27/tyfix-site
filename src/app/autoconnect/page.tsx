import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import MobileStickyBar from '@/components/public/MobileStickyBar';
import Breadcrumbs from '@/components/public/Breadcrumbs';
import AutoConnectForm from './AutoConnectForm';
import { AutoDealerSchema } from '@/components/seo/JsonLd';
import { Search, DollarSign, Truck, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import type { SiteSettings, SiteContent } from '@/lib/types';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AutoConnect™ Car Sourcing — We Find Your Dream Car | TyFix Auto Sales',
  description:
    'Can\'t find your dream car? TyFix AutoConnect™ sources vehicles directly from dealer auctions at below-market prices. Tell us what you want, we\'ll find it. Starting at $3,500.',
  openGraph: {
    title: 'AutoConnect™ Custom Car Sourcing — TyFix Auto Sales',
    description: 'We source your ideal vehicle from auctions at below-market prices.',
    url: 'https://tyfixautosales.com/autoconnect',
  },
  alternates: { canonical: 'https://tyfixautosales.com/autoconnect' },
};

export default async function AutoConnectPage() {
  const supabase = await createClient();
  const [settingsRes, contentRes] = await Promise.all([
    supabase.from('site_settings').select('*').limit(1).single(),
    supabase.from('site_content').select('*'),
  ]);
  const settings = settingsRes.data as SiteSettings;
  const contentMap: Record<string, string> = {};
  if (contentRes.data) (contentRes.data as SiteContent[]).forEach(c => { contentMap[c.content_key] = c.content_value; });

  return (
    <div className="min-h-screen">
      <AutoDealerSchema settings={settings} />
      <Navbar settings={settings} />

      <section className="pt-28 pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: 'AutoConnect™', href: '/autoconnect' }]} />

          {/* Hero */}
          <div className="max-w-3xl mb-16">
            <span className="inline-block px-4 py-1 bg-primary/10 text-primary font-bold text-sm rounded-full mb-4">
              AutoConnect™ Program
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              Can&apos;t Find Your Dream Car? We&apos;ll Find It For You.
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              TyFix AutoConnect™ is our custom vehicle sourcing service. Tell us exactly what you&apos;re
              looking for — make, model, color, features, budget — and we&apos;ll find it at dealer
              auctions across the tri-state area at below-market prices.
            </p>
          </div>

          {/* How It Works */}
          <div className="mb-20">
            <h2 className="text-2xl font-black text-gray-900 mb-8 text-center">How AutoConnect™ Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {[
                { step: '1', icon: <Search size={24} />, title: 'Tell Us What You Want', desc: 'Share your ideal vehicle — year, make, model, features, and budget.' },
                { step: '2', icon: <DollarSign size={24} />, title: 'Place Your Deposit', desc: '$1,000 refundable deposit to start the search.' },
                { step: '3', icon: <ShieldCheck size={24} />, title: 'We Search & Inspect', desc: 'We search dealer auctions and inspect vehicles that match.' },
                { step: '4', icon: <Truck size={24} />, title: 'We Deliver', desc: 'Once approved, we purchase and bring it to the lot.' },
                { step: '5', icon: <CheckCircle2 size={24} />, title: 'You Drive Away', desc: 'Pay the remaining balance and drive away in your new car.' },
              ].map((item) => (
                <div key={item.step} className="relative text-center p-6 bg-gray-50 rounded-2xl">
                  <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-black text-sm mx-auto mb-3">
                    {item.step}
                  </div>
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mx-auto mb-3">
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{item.title}</h3>
                  <p className="text-gray-500 text-xs">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing & Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-6">Pricing & Details</h2>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 uppercase font-bold mb-1">Minimum Budget</p>
                  <p className="text-lg font-black text-gray-900">$3,500</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 uppercase font-bold mb-1">Deposit (Refundable)</p>
                  <p className="text-lg font-black text-gray-900">$1,000</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 uppercase font-bold mb-1">Average Timeline</p>
                  <p className="text-lg font-black text-gray-900">~3 Weeks</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 uppercase font-bold mb-1">Our Fee</p>
                  <p className="text-lg font-black text-gray-900">Built into the final price</p>
                  <p className="text-xs text-gray-400 mt-1">No surprise charges. You agree to the price before we bid.</p>
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {[
                  { q: 'What if you can\'t find my car?', a: 'Your $1,000 deposit is fully refundable if we can\'t locate a vehicle that meets your criteria.' },
                  { q: 'Can I request a specific color or features?', a: 'Absolutely. The more specific you are, the better. We\'ll search for exact matches or close alternatives.' },
                  { q: 'Do I get to approve the vehicle before purchase?', a: 'Yes. We\'ll send you photos, condition details, and a proposed price. You approve before we bid.' },
                  { q: 'How do you find cars cheaper than retail?', a: 'We\'re licensed dealers with access to wholesale auctions where vehicles sell significantly below retail value.' },
                  { q: 'Is there a guarantee?', a: 'Every AutoConnect™ vehicle goes through our standard inspection. We stand behind what we sell.' },
                ].map((faq, i) => (
                  <details key={i} className="group p-4 bg-gray-50 rounded-xl cursor-pointer">
                    <summary className="font-bold text-gray-900 text-sm list-none flex items-center justify-between">
                      {faq.q}
                      <span className="text-primary text-lg group-open:rotate-45 transition-transform">+</span>
                    </summary>
                    <p className="text-gray-600 text-sm mt-2">{faq.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>

          {/* Enrollment Form */}
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-gray-900 mb-2">Start Your AutoConnect™ Search</h2>
              <p className="text-gray-500">Tell us what you&apos;re looking for and we&apos;ll get started.</p>
            </div>
            <AutoConnectForm />
          </div>
        </div>
      </section>

      <Footer settings={settings} content={contentMap} />
      <MobileStickyBar settings={settings} />
    </div>
  );
}
