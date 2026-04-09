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
import {
  getCachedVehicles,
  getCachedTestimonials,
  getCachedSettings,
  getCachedContent,
  getCachedSoldCount,
  getCachedHomepageSections,
} from '@/lib/cache';
import type { HomepageSection } from '@/lib/types';

export const revalidate = 3600; // ISR: 1 hour


async function getData() {
  const [vehicles, testimonials, settings, content, soldCount, sections] =
    await Promise.all([
      getCachedVehicles(),
      getCachedTestimonials(),
      getCachedSettings(),
      getCachedContent(),
      getCachedSoldCount(),
      getCachedHomepageSections(),
    ]);

  return { vehicles, testimonials, settings, content, soldCount, sections };
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
    ? sections.filter((s: HomepageSection) => s.is_visible).map((s: HomepageSection) => s.id)
    : defaultOrder;

  return (
    <div className="min-h-screen">
      <AutoDealerSchema settings={settings} />
      <Navbar settings={settings} />

      {orderedSections.map((id: string) => sectionComponents[id] || null)}

      <Footer settings={settings} content={content} />
      <MobileStickyBar settings={settings} />
      <LeadCapturePopup />
    </div>
  );
}
