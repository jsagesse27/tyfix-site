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

          <div className="h-[600px] rounded-[2.5rem] relative overflow-hidden bg-white shadow-[0_30px_100px_-20px_rgba(0,0,0,0.08)] border border-slate-100 group">
            {/* Minimalist Watermark Map */}
            <iframe
              src="https://www.openstreetmap.org/export/embed.html?bbox=-74.05%2C40.54%2C-73.90%2C40.64&layer=mapnik"
              className="w-full h-full scale-110"
              style={{ 
                border: 0, 
                filter: 'grayscale(1) brightness(1.3) contrast(0.6) opacity(0.35) saturate(0)' 
              }}
              allowFullScreen
              loading="lazy"
              title="TyFix Auto Sales Service Area"
            />
            
            {/* Stylized Borough Overlays - Matching Kaytee's look */}
            <div className="absolute inset-0 pointer-events-none select-none">
              <span className="absolute top-[35%] left-[45%] text-[clamp(2rem,6vw,4rem)] font-black text-slate-200/40 tracking-[0.2em] uppercase origin-center rotate-[-15deg]">
                Brooklyn
              </span>
              <span className="absolute bottom-[20%] left-[30%] text-xs font-black text-slate-300 tracking-[0.5em] uppercase">
                Coney Island Area
              </span>
            </div>

            {/* Gradient Vignette to blend edges */}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white/40 pointer-events-none" />
            
            {/* Location Badge - Ultra Minimal */}
            <div className="absolute bottom-10 left-10 right-10 z-20 md:left-10 md:right-auto">
              <div className="bg-white/90 backdrop-blur-md px-8 py-6 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.05)] border border-slate-100/50">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <MapPin size={28} className="text-primary animate-bounce shadow-primary" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-xl tracking-tight leading-none uppercase">TyFix Auto Sales</h4>
                    <p className="text-slate-400 text-sm font-bold mt-2 flex items-center gap-2">
                      Brooklyn, NY <span className="w-1.5 h-1.5 bg-primary rounded-full" /> Visit Us Today
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
