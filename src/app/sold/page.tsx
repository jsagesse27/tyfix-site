import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import MobileStickyBar from '@/components/public/MobileStickyBar';
import Link from 'next/link';
import { formatPrice, formatMileage, getHeroPhoto } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import type { Vehicle, SiteSettings, SiteContent } from '@/lib/types';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Recently Sold | TyFix Auto Sales',
  description: 'Browse vehicles recently sold at TyFix Auto Sales. See the quality of cars we offer — similar vehicles arrive weekly!',
};

export default async function SoldPage() {
  const supabase = await createClient();

  const [vehiclesRes, settingsRes, contentRes] = await Promise.all([
    supabase.from('vehicles').select('*, photos:vehicle_photos(*)').eq('listing_status', 'sold').order('updated_at', { ascending: false }),
    supabase.from('site_settings').select('*').limit(1).single(),
    supabase.from('site_content').select('*'),
  ]);

  const vehicles = (vehiclesRes.data as Vehicle[]) || [];
  const settings = settingsRes.data as SiteSettings;
  const contentMap: Record<string, string> = {};
  if (contentRes.data) {
    (contentRes.data as SiteContent[]).forEach((c) => {
      contentMap[c.content_key] = c.content_value;
    });
  }

  return (
    <div className="min-h-screen">
      <Navbar settings={settings} />

      <section className="pt-28 pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/inventory" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary mb-6 text-sm font-medium">
            <ArrowLeft size={16} /> Back to Active Inventory
          </Link>

          <div className="mb-10">
            <h1 className="text-4xl font-black text-gray-900 mb-4">Recently Sold</h1>
            <p className="text-gray-500 max-w-lg">
              These vehicles have already found new homes. Like what you see? Similar vehicles arrive weekly — check our active inventory or contact us to get first pick.
            </p>
          </div>

          {vehicles.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg mb-4">No sold vehicles to show yet.</p>
              <Link href="/inventory" className="btn-primary">Browse Active Inventory</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {vehicles.map((v) => (
                <div key={v.id} className="relative group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  {/* SOLD badge */}
                  <div className="absolute top-3 left-3 z-10 bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                    Sold
                  </div>

                  {/* Image */}
                  <div className="relative h-48 bg-gray-100 overflow-hidden">
                    <img
                      src={getHeroPhoto(v.photos)}
                      alt={`${v.year} ${v.make} ${v.model}`}
                      className="w-full h-full object-cover grayscale-[30%] opacity-80"
                    />
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 text-lg">{v.year} {v.make} {v.model}</h3>
                    {v.trim && <p className="text-gray-400 text-sm">{v.trim}</p>}
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span>{formatMileage(v.mileage)} mi</span>
                      <span>•</span>
                      <span className="line-through text-gray-400">{formatPrice(v.price)}</span>
                    </div>
                    {v.body_type && (
                      <span className="inline-block mt-3 text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                        {v.body_type}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          {vehicles.length > 0 && (
            <div className="mt-16 text-center p-10 bg-gray-50 rounded-3xl border border-gray-100">
              <h3 className="text-2xl font-black text-gray-900 mb-3">Looking for something similar?</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                We get new inventory weekly. Check what&apos;s available now or contact us to get notified when a specific vehicle arrives.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link href="/inventory" className="btn-primary">Browse Active Inventory</Link>
                <Link href="/#contact" className="btn-outline">Contact Us</Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer settings={settings} content={contentMap} />
      <MobileStickyBar settings={settings} />
    </div>
  );
}
