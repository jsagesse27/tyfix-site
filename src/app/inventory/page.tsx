import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import MobileStickyBar from '@/components/public/MobileStickyBar';
import InventoryClient from '@/components/public/InventoryClient';
import Breadcrumbs from '@/components/public/Breadcrumbs';
import { ItemListSchema } from '@/components/seo/JsonLd';
import { getCachedVehicles, getCachedSettings, getCachedContent } from '@/lib/cache';
import type { Metadata } from 'next';

export const revalidate = 300; // ISR: 5 minutes

export const metadata: Metadata = {
  title: 'Used Cars Under $5,000 for Sale — TyFix Auto Sales Brooklyn',
  description:
    'Browse our full inventory of quality used cars under $5,000 in Brooklyn, NY. Filter by make, price, body type, and more. Cash prices, no hidden fees.',
  openGraph: {
    title: 'Used Cars Under $5,000 — TyFix Auto Sales Brooklyn',
    description: 'Browse affordable cash cars in Brooklyn. Cash-only dealer with no hidden fees.',
    url: 'https://tyfixautosales.com/inventory',
  },
  alternates: { canonical: 'https://tyfixautosales.com/inventory' },
};

interface PageProps {
  searchParams: Promise<{ bodyType?: string; maxPrice?: string }>;
}

export default async function InventoryPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const [vehicles, settings, content] = await Promise.all([
    getCachedVehicles(),
    getCachedSettings(),
    getCachedContent(),
  ]);

  return (
    <div className="min-h-screen">
      <Navbar settings={settings} />

      <section className="pt-28 pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ItemListSchema vehicles={vehicles} />
          <Breadcrumbs items={[{ label: 'Inventory', href: '/inventory' }]} />
          <div className="mb-8">
            <h1 className="text-4xl font-black text-gray-900 mb-4">Used Cars Under $5,000 in Brooklyn</h1>
            <p className="text-gray-500 max-w-lg">
              Every vehicle has been inspected and is priced transparently. See something you like? Call us now.
            </p>
          </div>

          <InventoryClient
            vehicles={vehicles}
            settings={settings}
            initialFilters={{
              bodyType: params.bodyType,
              maxPrice: params.maxPrice,
            }}
          />
        </div>
      </section>

      <Footer settings={settings} content={content} />
      <MobileStickyBar settings={settings} />
    </div>
  );
}
