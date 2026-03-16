import { MapPin, Clock, Phone } from 'lucide-react';
import type { SiteSettings } from '@/lib/types';
import InquiryForm from './InquiryForm';

interface ContactSectionProps {
  settings: SiteSettings | null;
}

export default function ContactSection({ settings }: ContactSectionProps) {
  const phone = settings?.phone_number || '(555) 123-4567';
  const address = settings?.lot_address || '123 Auto Mall Dr, Houston, TX 77001';
  const hours = settings?.hours_of_operation || 'Mon - Sat: 9:00 AM - 6:00 PM | Sunday: Closed';
  const mapsEmbed = settings?.google_maps_embed_url;

  return (
    <section id="contact" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <h2 className="text-4xl font-black text-gray-900 mb-8">Visit Our Lot</h2>
            <div className="space-y-8 mb-10">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                  <MapPin />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Location</h4>
                  <p className="text-gray-500">{address}</p>
                  {settings?.directions_note && (
                    <p className="text-gray-400 text-sm mt-1">{settings.directions_note}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                  <Clock />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Hours</h4>
                  <p className="text-gray-500 whitespace-pre-line">{hours.replace(/\|/g, '\n')}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                  <Phone />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Phone</h4>
                  <p className="text-gray-500">{phone}</p>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100">
              <h4 className="text-xl font-bold mb-4 text-gray-900">Send Us a Message</h4>
              <InquiryForm />
            </div>
          </div>

          <div className="h-[600px] rounded-3xl relative overflow-hidden shadow-2xl border-8 border-slate-100">
            {/* OpenStreetMap Iframe */}
            <iframe
              src="https://www.openstreetmap.org/export/embed.html?bbox=-74.005%2C40.565%2C-73.965%2C40.585&layer=mapnik&marker=40.5749%2C-73.9859"
              className="w-full h-full"
              style={{ border: 0, filter: 'grayscale(1) contrast(1.1) brightness(0.95)' }}
              allowFullScreen
              loading="lazy"
              title="TyFix Auto Sales Location"
            />
            
            {/* Dynamic theme tint overlays (syncs with global primary color) */}
            <div className="absolute inset-0 bg-primary mix-blend-color pointer-events-none opacity-70" />
            <div className="absolute inset-0 bg-primary mix-blend-overlay pointer-events-none opacity-30" />
            
            {/* Location Badge */}
            <div className="absolute bottom-6 left-6 z-10 bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-100 pointer-events-none">
              <p className="font-black text-gray-900 flex items-center gap-2">
                <MapPin size={16} className="text-primary" /> TyFix Auto Sales
              </p>
              <p className="text-xs text-slate-500 font-medium mt-1">Coney Island, Brooklyn</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
