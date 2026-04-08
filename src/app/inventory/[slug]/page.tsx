import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import MobileStickyBar from '@/components/public/MobileStickyBar';
import InquiryForm from '@/components/public/InquiryForm';
import VehicleGallery from '@/components/public/VehicleGallery';
import Breadcrumbs from '@/components/public/Breadcrumbs';
import SimilarVehicles from '@/components/public/SimilarVehicles';
import { CarSchema } from '@/components/seo/JsonLd';
import { formatPrice, formatMileage } from '@/lib/utils';
import { ArrowLeft, Phone, MessageCircle, ShieldCheck, ExternalLink, Zap, Palette, Settings2, Gauge, Calendar, Share2, Copy, Check } from 'lucide-react';
import type { Vehicle, SiteSettings, SiteContent } from '@/lib/types';
import type { Metadata } from 'next';

export const revalidate = 600; // ISR: 10 minutes

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getVehicleBySlug(slug: string) {
  const supabase = await createClient();
  // Try by slug first
  const { data } = await supabase
    .from('vehicles')
    .select('*, photos:vehicle_photos(*)')
    .eq('slug', slug)
    .single();
  return data as Vehicle | null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = await getVehicleBySlug(slug);
  if (!vehicle) return { title: 'Vehicle Not Found' };

  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ''} — ${formatPrice(vehicle.price)} | TyFix Auto Sales Brooklyn`;
  const description = `${vehicle.year} ${vehicle.make} ${vehicle.model} for ${formatPrice(vehicle.price)} at TyFix Auto Sales in Brooklyn, NY. ${vehicle.condition_notes || 'Quality inspected vehicle.'} Cash price, no hidden fees.`;
  const photos = vehicle.photos?.sort((a, b) => a.sort_order - b.sort_order) || [];
  const ogImage = photos.length > 0 ? photos[0].public_url : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://tyfixautosales.com/inventory/${slug}`,
      images: ogImage ? [{ url: ogImage, alt: `${vehicle.year} ${vehicle.make} ${vehicle.model}` }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : [],
    },
    alternates: {
      canonical: `https://tyfixautosales.com/inventory/${slug}`,
    },
  };
}

export default async function VehicleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const vehicle = await getVehicleBySlug(slug);
  if (!vehicle) notFound();

  const [settingsRes, contentRes] = await Promise.all([
    supabase.from('site_settings').select('*').limit(1).single(),
    supabase.from('site_content').select('*'),
  ]);

  const settings = settingsRes.data as SiteSettings;
  const smsNumber = settings?.sms_number || '';
  const phone = settings?.phone_number || '';

  const contentMap: Record<string, string> = {};
  if (contentRes.data) {
    (contentRes.data as SiteContent[]).forEach((c) => {
      contentMap[c.content_key] = c.content_value;
    });
  }

  const photos = vehicle.photos?.sort((a, b) => a.sort_order - b.sort_order) || [];
  const vehicleTitle = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  const fullTitle = `${vehicleTitle}${vehicle.trim ? ` ${vehicle.trim}` : ''}`;
  const smsBody = encodeURIComponent(`Hi, I'm interested in the ${vehicleTitle} (Stock #${vehicle.stock_number || 'N/A'}). Is it still available?`);

  const specs = [
    { icon: <Calendar size={18} />, label: 'Year', value: vehicle.year },
    { icon: <Gauge size={18} />, label: 'Mileage', value: `${formatMileage(vehicle.mileage)} mi` },
    { icon: <Settings2 size={18} />, label: 'Transmission', value: vehicle.transmission },
    vehicle.engine ? { icon: <Zap size={18} />, label: 'Engine', value: vehicle.engine } : null,
    vehicle.fuel_type ? { icon: <Zap size={18} />, label: 'Fuel', value: vehicle.fuel_type } : null,
    vehicle.drivetrain ? { icon: <Settings2 size={18} />, label: 'Drivetrain', value: vehicle.drivetrain } : null,
    vehicle.cylinders ? { icon: <Zap size={18} />, label: 'Cylinders', value: vehicle.cylinders } : null,
    vehicle.body_type ? { icon: <Zap size={18} />, label: 'Body Type', value: vehicle.body_type } : null,
    vehicle.doors ? { icon: <Settings2 size={18} />, label: 'Doors', value: `${vehicle.doors}` } : null,
    vehicle.exterior_color ? { icon: <Palette size={18} />, label: 'Exterior', value: vehicle.exterior_color } : null,
    vehicle.interior_color ? { icon: <Palette size={18} />, label: 'Interior', value: vehicle.interior_color } : null,
  ].filter(Boolean);

  return (
    <div className="min-h-screen pb-16 md:pb-0">
      <CarSchema vehicle={vehicle} settings={settings} />
      <Navbar settings={settings} />

      <section className="pt-24 pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <Breadcrumbs
            items={[
              { label: 'Inventory', href: '/inventory' },
              { label: fullTitle, href: `/inventory/${slug}` },
            ]}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left: Gallery + Specs */}
            <div className="lg:col-span-2">
              {/* Photo Gallery */}
              <VehicleGallery photos={photos} alt={`${fullTitle} at TyFix Auto Sales Brooklyn`} />

              {/* Title + Price (mobile) */}
              <div className="lg:hidden mt-6 mb-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    {vehicle.featured_label && (
                      <span className="badge badge-featured mb-2 inline-block">{vehicle.featured_label}</span>
                    )}
                    <h1 className="text-3xl font-black text-gray-900">
                      {vehicleTitle} for Sale in Brooklyn
                    </h1>
                    {vehicle.trim && <p className="text-gray-400 text-lg">{vehicle.trim}</p>}
                  </div>
                  <div className="text-right">
                    {vehicle.show_call_for_price ? (
                      <p className="text-2xl font-black text-primary">Call for Price</p>
                    ) : (
                      <p className="text-3xl font-black text-primary">{formatPrice(vehicle.price)}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="mt-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Vehicle Details</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {specs.map((spec, i) => spec && (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="text-primary">{spec.icon}</div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase font-bold">{spec.label}</p>
                        <p className="text-sm font-bold text-gray-900">{spec.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* VIN + Stock */}
              {(vehicle.vin || vehicle.stock_number) && (
                <div className="mt-6 flex gap-6 text-sm text-gray-400">
                  {vehicle.stock_number && <p>Stock #: <span className="text-gray-600 font-mono">{vehicle.stock_number}</span></p>}
                  {vehicle.vin && <p>VIN: <span className="text-gray-600 font-mono">{vehicle.vin}</span></p>}
                </div>
              )}

              {/* Condition Notes / Description */}
              {vehicle.condition_notes && (
                <div className="mt-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">About This Vehicle</h2>
                  <p className="text-gray-600 leading-relaxed">{vehicle.condition_notes}</p>
                </div>
              )}

              {/* Inspection + History */}
              <div className="mt-8 flex flex-wrap gap-4">
                {vehicle.inspection_status === 'pass' && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full font-bold text-sm">
                    <ShieldCheck size={18} />
                    25-Point Inspection: PASSED
                  </div>
                )}
                {vehicle.inspection_status === 'fail' && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-full font-bold text-sm">
                    <ShieldCheck size={18} />
                    Inspection: Needs Work
                  </div>
                )}
                {vehicle.history_report_url && (
                  <a
                    href={vehicle.history_report_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full font-bold text-sm hover:bg-blue-100 transition-colors"
                  >
                    <ExternalLink size={18} />
                    View Vehicle History
                  </a>
                )}
              </div>

              {/* Similar Vehicles */}
              <SimilarVehicles
                currentVehicleId={vehicle.id}
                bodyType={vehicle.body_type}
                price={vehicle.price}
                make={vehicle.make}
              />
            </div>

            {/* Right: Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Price Card (desktop) */}
                <div className="hidden lg:block admin-card">
                  {vehicle.featured_label && (
                    <span className="badge badge-featured mb-3 inline-block">{vehicle.featured_label}</span>
                  )}
                  <h1 className="text-2xl font-black text-gray-900 mb-1">
                    {vehicleTitle} for Sale in Brooklyn
                  </h1>
                  {vehicle.trim && <p className="text-gray-400 mb-4">{vehicle.trim}</p>}

                  {vehicle.show_call_for_price ? (
                    <p className="text-3xl font-black text-primary mb-4">Call for Price</p>
                  ) : (
                    <>
                      <p className="text-3xl font-black text-primary mb-1">{formatPrice(vehicle.price)}</p>
                      <div className="space-y-1 mb-4">
                        {vehicle.show_cash_price && vehicle.cash_price && (
                          <p className="text-sm text-gray-500">Cash Price: <span className="font-bold text-gray-700">{formatPrice(vehicle.cash_price)}</span></p>
                        )}
                        {vehicle.show_internet_price && vehicle.internet_price && (
                          <p className="text-sm text-gray-500">Internet Price: <span className="font-bold text-gray-700">{formatPrice(vehicle.internet_price)}</span></p>
                        )}
                        {vehicle.show_msrp && vehicle.msrp && (
                          <p className="text-sm text-gray-500 line-through">MSRP: {formatPrice(vehicle.msrp)}</p>
                        )}
                      </div>
                    </>
                  )}

                  {settings?.show_price_tagline && (
                    <p className="text-xs text-primary font-bold mb-4">{settings.price_tagline_text}</p>
                  )}
                </div>

                {/* CTA Buttons */}
                <div className="admin-card space-y-3">
                  <a
                    href={`tel:${(phone || smsNumber).replace(/\D/g, '')}`}
                    className="btn-primary w-full"
                    id="vdp-call-button"
                  >
                    <Phone size={20} />
                    Call About This Vehicle
                  </a>
                  <a
                    href={`sms:${smsNumber}?body=${smsBody}`}
                    className="btn-outline w-full"
                    id="vdp-text-button"
                  >
                    <MessageCircle size={20} />
                    Text Us
                  </a>
                </div>

                {/* Inquiry Form */}
                <div className="admin-card">
                  <h3 className="font-bold text-gray-900 mb-4">Interested in this vehicle?</h3>
                  <InquiryForm
                    vehicleOfInterest={fullTitle}
                    vehicleId={vehicle.id}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer settings={settings} content={contentMap} />
      <MobileStickyBar settings={settings} />
    </div>
  );
}
