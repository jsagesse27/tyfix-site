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

          <div className="h-[600px] rounded-[2rem] relative overflow-hidden shadow-[0_24px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 group">
            {/* Map Frame with Clean Border Overlay */}
            <div className="absolute inset-0 z-10 border-[12px] border-white/80 pointer-events-none rounded-[2rem]" />

            {/* OpenStreetMap Iframe with 'Clean Paper' styling */}
            <iframe
              src="https://www.openstreetmap.org/export/embed.html?bbox=-73.989%2C40.572%2C-73.982%2C40.578&layer=mapnik"
              className="w-full h-full scale-110 transition-transform duration-1000 group-hover:scale-100"
              style={{ 
                border: 0, 
                filter: 'grayscale(1) brightness(1.0) contrast(1.1) opacity(0.8)' 
              }}
              allowFullScreen
              loading="lazy"
              title="TyFix Auto Sales Location"
            />
            
            {/* Custom Primary Pin Marker */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none mb-4">
              <MapPin size={40} className="text-primary fill-primary/10 drop-shadow-[0_4px_12px_rgba(139,0,0,0.5)] animate-float" />
            </div>

            {/* Subtle palette overlays - using White, Navy, and Maroon accents */}
            <div className="absolute inset-0 bg-white/40 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent pointer-events-none opacity-60" />
            
            {/* Location Badge - Clean Modern Style */}
            <div className="absolute bottom-8 left-8 right-8 z-20 md:left-8 md:right-auto">
              <div className="relative overflow-hidden bg-white/95 backdrop-blur-xl px-6 py-5 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(139,0,0,0.15)] group-hover:border-primary/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#0F172A] rounded-xl flex items-center justify-center text-white shadow-lg">
                    <MapPin size={24} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="font-black text-[#0F172A] text-lg tracking-tight leading-none uppercase">TyFix Auto Sales</h4>
                    <p className="text-slate-500 text-sm font-bold mt-1.5 flex items-center gap-2">
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
