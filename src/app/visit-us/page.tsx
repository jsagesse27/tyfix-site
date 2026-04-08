import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import MobileStickyBar from '@/components/public/MobileStickyBar';
import Breadcrumbs from '@/components/public/Breadcrumbs';
import BookTestDriveSection from './BookTestDriveSection';
import { AutoDealerSchema } from '@/components/seo/JsonLd';
import { MapPin, Clock, Phone, Navigation, Train, Car } from 'lucide-react';
import type { SiteSettings, SiteContent } from '@/lib/types';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Visit TyFix Auto Sales — 183 Bay 53rd St, Brooklyn NY 11214',
  description:
    'Visit TyFix Auto Sales at 183 Bay 53rd St, Brooklyn, NY 11214. Open 7 days 9AM-7PM by appointment. Cash-only used car dealer. Quality vehicles under $5,000.',
  openGraph: {
    title: 'Visit TyFix Auto Sales — 183 Bay 53rd St, Brooklyn NY 11214',
    description: 'Open 7 days 9AM-7PM by appointment. Quality cash cars under $5,000.',
    type: 'website',
    url: 'https://tyfixautosales.com/visit-us',
  },
  alternates: {
    canonical: 'https://tyfixautosales.com/visit-us',
  },
};

async function getData() {
  const supabase = await createClient();
  const [settingsRes, contentRes] = await Promise.all([
    supabase.from('site_settings').select('*').limit(1).single(),
    supabase.from('site_content').select('*'),
  ]);
  const contentMap: Record<string, string> = {};
  if (contentRes.data) (contentRes.data as SiteContent[]).forEach(c => { contentMap[c.content_key] = c.content_value; });
  return { settings: (settingsRes.data as SiteSettings) || null, content: contentMap };
}

export default async function VisitUsPage() {
  const { settings, content } = await getData();
  const phone = settings?.phone_number || '';
  const address = settings?.lot_address || '183 Bay 53rd St, Brooklyn, NY 11214';

  return (
    <div className="min-h-screen">
      <AutoDealerSchema settings={settings} />
      <Navbar settings={settings} />

      <section className="pt-28 pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: 'Visit Us', href: '/visit-us' }]} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Left: Content */}
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
                Visit TyFix Auto Sales in Brooklyn, NY
              </h1>

              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                TyFix Auto Sales is Brooklyn&apos;s trusted cash-only used car dealer, specializing in quality vehicles
                under $5,000. Located in the Coney Island area of Brooklyn, we serve buyers across all five boroughs
                and beyond. Whether you&apos;re looking for a reliable daily driver, a family SUV, or a budget-friendly
                commuter car, our lot has something for every budget.
              </p>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8">
                <p className="text-amber-800 font-bold text-sm">
                  📅 By Appointment Only — Please call or text before visiting to ensure someone is available
                  to assist you and that the vehicle you&apos;re interested in is on the lot.
                </p>
              </div>

              {/* Contact Cards */}
              <div className="space-y-6 mb-10">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                    <MapPin />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Our Address</h3>
                    <p className="text-gray-600">{address}</p>
                    <a
                      href="https://maps.google.com/?q=183+Bay+53rd+St+Brooklyn+NY+11214"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary font-bold text-sm mt-1 inline-flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      <Navigation size={14} /> Get Directions on Google Maps
                    </a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                    <Clock />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Hours of Operation</h3>
                    <p className="text-gray-600">Monday – Sunday: 9:00 AM – 7:00 PM</p>
                    <p className="text-gray-500 text-sm mt-1">By Appointment Only</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                    <Phone />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Phone</h3>
                    {phone && (
                      <a href={`tel:${phone.replace(/\D/g, '')}`} className="text-gray-600 hover:text-primary transition-colors">
                        {phone}
                      </a>
                    )}
                    <p className="text-gray-500 text-sm mt-1">Call or text to schedule your visit</p>
                  </div>
                </div>
              </div>

              {/* Getting Here */}
              <div className="mb-10">
                <h2 className="text-2xl font-black text-gray-900 mb-4">Getting Here</h2>

                <div className="space-y-4">
                  <div className="flex gap-3 items-start">
                    <Car size={20} className="text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">By Car</h3>
                      <p className="text-gray-600 text-sm">
                        Located on Bay 53rd Street, easily accessible from the Belt Parkway (exit at Bay Parkway / Cropsey Avenue).
                        Free street parking is available on surrounding blocks.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start">
                    <Train size={20} className="text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">By Subway</h3>
                      <p className="text-gray-600 text-sm">
                        Take the D train to Bay 50th Street station or the N train to Fort Hamilton Parkway.
                        Both stations are a short walk from our lot.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Why Visit */}
              <div className="mb-10">
                <h2 className="text-2xl font-black text-gray-900 mb-4">What to Expect When You Visit</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  When you arrive at TyFix Auto Sales, you&apos;ll meet with Ty or a team member who will walk you through
                  our current inventory. Every vehicle on our lot has been through our inspection process, and we&apos;re
                  transparent about the condition of every car we sell.
                </p>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We&apos;re a cash-only dealership — no credit checks, no financing paperwork, no hidden fees. You see the
                  price, you pay the price, and you drive away the same day. It&apos;s car buying the way it should be:
                  simple, honest, and stress-free.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Can&apos;t find what you&apos;re looking for on the lot? Ask about our{' '}
                  <a href="/autoconnect" className="text-primary font-bold hover:underline">AutoConnect™ program</a>,
                  where we source your ideal vehicle directly from auctions at below-market prices.
                </p>
              </div>

              {/* Book Appointment CTA */}
              <BookTestDriveSection />
            </div>

            {/* Right: Map */}
            <div className="lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-xl bg-gray-50 h-[500px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3029.0!2d-73.988411!3d40.5823498!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDM0JzU2LjUiTiA3M8KwNTknMTguMyJX!5e0!3m2!1sen!2sus!4v1"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="TyFix Auto Sales Location"
                />
              </div>

              <div className="mt-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <h3 className="font-black text-gray-900 text-lg mb-2">TyFix Auto Sales</h3>
                <p className="text-gray-600 text-sm mb-1">{address}</p>
                <p className="text-gray-600 text-sm mb-3">Open 7 Days · 9AM–7PM · By Appointment</p>
                <a
                  href="https://maps.google.com/?q=183+Bay+53rd+St+Brooklyn+NY+11214"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full text-center text-sm"
                >
                  <Navigation size={16} /> Open in Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer settings={settings} content={content} />
      <MobileStickyBar settings={settings} />
    </div>
  );
}
