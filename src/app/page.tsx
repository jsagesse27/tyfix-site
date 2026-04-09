import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/public/Navbar';
import Hero from '@/components/public/Hero';
import TrustBadges from '@/components/public/TrustBadges';
import FeaturedVehicles from '@/components/public/FeaturedVehicles';
import CashAdvantage from '@/components/public/CashAdvantage';
import CashCalculatorSection from '@/components/public/CashCalculatorSection';
import AutoConnectProgram from '@/components/public/AutoConnectProgram';
import Testimonials from '@/components/public/Testimonials';
import ContactSection from '@/components/public/ContactSection';
import Footer from '@/components/public/Footer';
import MobileStickyBar from '@/components/public/MobileStickyBar';
import LeadCapturePopup from '@/components/public/LeadCapturePopup';
import SocialBridge from '@/components/public/SocialBridge';
import RequestVehicleSection from '@/components/public/RequestVehicleSection';
import SellYourCarSection from '@/components/public/SellYourCarSection';
import { AutoDealerSchema } from '@/components/seo/JsonLd';
import type { Vehicle, Testimonial, SiteSettings, SiteContent, HomepageSection } from '@/lib/types';

export const revalidate = 3600; // ISR: 1 hour


async function getData() {
  const supabase = await createClient();

  const [vehiclesRes, testimonialsRes, settingsRes, contentRes, soldCountRes, sectionsRes] = await Promise.all([
    supabase.from('vehicles').select('*, photos:vehicle_photos(*)').eq('listing_status', 'active').order('sort_order'),
    supabase.from('testimonials').select('*').eq('is_visible', true).order('sort_order'),
    supabase.from('site_settings').select('*').limit(1).single(),
    supabase.from('site_content').select('*'),
    supabase.from('vehicles').select('*', { count: 'exact', head: true }).eq('listing_status', 'sold'),
    supabase.from('homepage_sections').select('*').order('sort_order'),
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
    sections: (sectionsRes.data as HomepageSection[]) || [],
  };
}

export default async function HomePage() {
  const { vehicles, testimonials, settings, content, soldCount, sections } = await getData();

  // Map section IDs to their React components
  const sectionComponents: Record<string, React.ReactNode> = {
    hero: <Hero key="hero" settings={settings} content={content} soldCount={soldCount} />,
    trust_badges: <TrustBadges key="trust_badges" content={content} />,
    featured_vehicles: <FeaturedVehicles key="featured_vehicles" vehicles={vehicles} settings={settings} />,
    request_vehicle: <RequestVehicleSection key="request_vehicle" />,
    cash_advantage: <CashAdvantage key="cash_advantage" content={content} />,
    cash_calculator: <CashCalculatorSection key="cash_calculator" />,
    autoconnect: <AutoConnectProgram key="autoconnect" />,
    testimonials: <Testimonials key="testimonials" testimonials={testimonials} settings={settings} />,
    social_bridge: <SocialBridge key="social_bridge" settings={settings} />,
    sell_your_car: <SellYourCarSection key="sell_your_car" />,
    contact: <ContactSection key="contact" settings={settings} />,
  };

  // Default section order if DB is empty (fallback)
  const defaultOrder = [
    'hero', 'trust_badges', 'featured_vehicles', 'request_vehicle',
    'cash_advantage', 'cash_calculator', 'autoconnect', 'testimonials',
    'social_bridge', 'sell_your_car', 'contact',
  ];

  // Use DB sections if available, otherwise default order
  const orderedSections = sections.length > 0
    ? sections.filter((s) => s.is_visible).map((s) => s.id)
    : defaultOrder;

  return (
    <div className="min-h-screen">
      <AutoDealerSchema settings={settings} />
      <Navbar settings={settings} />

      {orderedSections.map((id) => sectionComponents[id] || null)}

      <Footer settings={settings} content={content} />
      <MobileStickyBar settings={settings} />
      <LeadCapturePopup />
    </div>
  );
}
