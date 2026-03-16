import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import MobileStickyBar from '@/components/public/MobileStickyBar';
import InventoryClient from '@/components/public/InventoryClient';
import type { Vehicle, SiteSettings, SiteContent } from '@/lib/types';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Inventory | TyFix Auto Sales',
  description: 'Browse our full inventory of quality used cars under $5,000. Filter by make, price, body type, and more. Cash prices, no hidden fees.',
};

interface PageProps {
  searchParams: Promise<{ bodyType?: string; maxPrice?: string }>;
}

export default async function InventoryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const [vehiclesRes, settingsRes, contentRes] = await Promise.all([
    supabase.from('vehicles').select('*, photos:vehicle_photos(*)').eq('listing_status', 'active').order('sort_order'),
    supabase.from('site_settings').select('*').limit(1).single(),
    supabase.from('site_content').select('*'),
  ]);

  const contentMap: Record<string, string> = {};
  if (contentRes.data) {
    (contentRes.data as SiteContent[]).forEach((c) => {
      contentMap[c.content_key] = c.content_value;
    });
  }

  return (
    <div className="min-h-screen">
      <Navbar settings={settingsRes.data as SiteSettings} />

      <section className="pt-28 pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-black text-gray-900 mb-4">Our Inventory</h1>
            <p className="text-gray-500 max-w-lg">
              Every vehicle has been inspected and is priced transparently. See something you like? Call us now.
            </p>
          </div>

          <InventoryClient
            vehicles={(vehiclesRes.data as Vehicle[]) || []}
            settings={settingsRes.data as SiteSettings}
            initialFilters={{
              bodyType: params.bodyType,
              maxPrice: params.maxPrice,
            }}
          />
        </div>
      </section>

      <Footer settings={settingsRes.data as SiteSettings} content={contentMap} />
      <MobileStickyBar settings={settingsRes.data as SiteSettings} />
    </div>
  );
}
