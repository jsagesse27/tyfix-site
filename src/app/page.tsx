import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/public/Navbar';
import Hero from '@/components/public/Hero';
import TrustBadges from '@/components/public/TrustBadges';
import FeaturedVehicles from '@/components/public/FeaturedVehicles';
import CashAdvantage from '@/components/public/CashAdvantage';
import Testimonials from '@/components/public/Testimonials';
import ContactSection from '@/components/public/ContactSection';
import Footer from '@/components/public/Footer';
import MobileStickyBar from '@/components/public/MobileStickyBar';
import type { Vehicle, Testimonial, SiteSettings, SiteContent } from '@/lib/types';

async function getData() {
  const supabase = await createClient();

  const [vehiclesRes, testimonialsRes, settingsRes, contentRes, soldCountRes] = await Promise.all([
    supabase.from('vehicles').select('*, photos:vehicle_photos(*)').eq('listing_status', 'active').order('sort_order'),
    supabase.from('testimonials').select('*').eq('is_visible', true).order('sort_order'),
    supabase.from('site_settings').select('*').limit(1).single(),
    supabase.from('site_content').select('*'),
    supabase.from('vehicles').select('*', { count: 'exact', head: true }).eq('listing_status', 'sold'),
  ]);

  const contentMap: Record<string, string> = {};
  if (contentRes.data) {
    (contentRes.data as SiteContent[]).forEach((c) => {
      contentMap[c.content_key] = c.content_value;
    });
  }

  return {
    vehicles: (vehiclesRes.data as Vehicle[]) || [],
    testimonials: (testimonialsRes.data as Testimonial[]) || [],
    settings: (settingsRes.data as SiteSettings) || null,
    content: contentMap,
    soldCount: soldCountRes.count || 0,
  };
}

export default async function HomePage() {
  const { vehicles, testimonials, settings, content, soldCount } = await getData();

  return (
    <div className="min-h-screen">
      <Navbar settings={settings} />
      <Hero settings={settings} content={content} soldCount={soldCount} />
      <TrustBadges content={content} />
      <FeaturedVehicles vehicles={vehicles} settings={settings} />
      <CashAdvantage content={content} />
      <Testimonials testimonials={testimonials} showSection={settings?.show_reviews_section ?? true} />
      <ContactSection settings={settings} />
      <Footer settings={settings} content={content} />
      <MobileStickyBar settings={settings} />
    </div>
  );
}
