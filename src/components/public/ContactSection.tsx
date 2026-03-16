import { MapPin, Clock, Phone } from 'lucide-react';
import type { SiteSettings } from '@/lib/types';
import InquiryForm from './InquiryForm';

interface ContactSectionProps {
  settings: SiteSettings | null;
}

export default function ContactSection({ settings }: ContactSectionProps) {
  const phone = settings?.phone_number || '(555) 123-4567';
  const address = settings?.lot_address || 'Coney Island, Brooklyn, NY 11224';
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

          <div className="h-[600px] rounded-[2rem] relative overflow-hidden shadow-[0_24px_80px_-15px_rgba(0,0,0,0.2)] border-1 border-slate-100/50 group">
            {/* Map Frame with Gradient Border Overlay */}
            <div className="absolute inset-0 z-10 border-[12px] border-slate-50/50 pointer-events-none rounded-[2rem]" />
            <div className="absolute inset-0 z-10 border border-primary/10 pointer-events-none rounded-[2rem]" />

            {/* OpenStreetMap Iframe with 'Midnight Cinema' styling */}
            <iframe
              src="https://www.openstreetmap.org/export/embed.html?bbox=-73.992%2C40.568%2C-73.978%2C40.582&layer=mapnik&marker=40.5749%2C-73.9859"
              className="w-full h-full scale-105 transition-transform duration-1000 group-hover:scale-100"
              style={{ 
                border: 0, 
                filter: 'grayscale(1) invert(100%) brightness(0.7) contrast(1.4) saturate(0.5)' 
              }}
              allowFullScreen
              loading="lazy"
              title="TyFix Auto Sales Location"
            />
            
            {/* Dynamic theme tint overlays - matching Navy and Maroon palette */}
            <div className="absolute inset-0 bg-[#050A14] mix-blend-color pointer-events-none opacity-40" />
            <div className="absolute inset-0 bg-primary mix-blend-soft-light pointer-events-none opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050A14]/80 via-transparent to-transparent pointer-events-none" />
            
            {/* Location Badge - Pro Max Glassmorphism */}
            <div className="absolute bottom-8 left-8 right-8 z-20 md:left-8 md:right-auto">
              <div className="relative overflow-hidden bg-[#0F172A]/90 backdrop-blur-2xl px-6 py-5 rounded-[1.5rem] shadow-2xl border border-white/10 group-hover:border-primary/30 transition-all duration-500">
                {/* Glow effect */}
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/20 blur-3xl rounded-full" />
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/40 animate-pulse">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-white text-lg tracking-tight leading-none uppercase">TyFix Auto Sales</h4>
                    <p className="text-slate-400 text-sm font-bold mt-1.5 flex items-center gap-2">
                       Brooklyn, NY <span className="w-1 h-1 bg-primary rounded-full" /> Coney Island Area
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
