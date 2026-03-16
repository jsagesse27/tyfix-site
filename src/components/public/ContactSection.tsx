'use client';

import { MapPin, Clock, Phone } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { SiteSettings } from '@/lib/types';
import InquiryForm from './InquiryForm';

interface ContactSectionProps {
  settings: SiteSettings | null;
}

export default function ContactSection({ settings }: ContactSectionProps) {
  const phone = settings?.phone_number || '(555) 123-4567';
  const address = settings?.lot_address || 'Coney Island, Brooklyn, NY 11224';
  const hours = settings?.hours_of_operation || 'Mon - Sat: 9:00 AM - 6:00 PM | Sunday: Closed';
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Prevent double initialization
    if (mapLoaded || !mapContainerRef.current) return;

    // Load Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    // Load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => {
      const L = (window as any).L;
      if (!L || !mapContainerRef.current) return;

      const coords: [number, number] = [40.5749, -73.9850];
      const map = L.map(mapContainerRef.current, {
        scrollWheelZoom: false,
        zoomControl: false,
      }).setView(coords, 15);

      // Simple Clean Tiles (CartoDB Positron)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      // Custom Maroon Pin Marker
      const icon = L.divIcon({
        html: `
          <div class="relative -top-10 -left-5">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="#8B0000" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 4px 12px rgba(139,0,0,0.4))">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3" fill="white"></circle>
            </svg>
          </div>
        `,
        className: 'custom-map-pin',
        iconSize: [0, 0],
      });

      L.marker(coords, { icon }).addTo(map);
      setMapLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup tags if necessary, but Leaflet instance cleanup is hard without the ref
    };
  }, [mapLoaded]);

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

          <div className="h-[600px] rounded-[2.5rem] relative overflow-hidden shadow-[0_24px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 group bg-slate-50">
            {/* Map Placeholder/Container */}
            <div ref={mapContainerRef} className="w-full h-full grayscale-[0.2]" />
            
            {/* Map Frame with Clean Border Overlay */}
            <div className="absolute inset-0 z-[1000] border-[12px] border-white/80 pointer-events-none rounded-[2.5rem]" />
            
            {/* Subtle palette overlays */}
            <div className="absolute inset-0 bg-white/20 pointer-events-none z-[500]" />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent pointer-events-none opacity-40 z-[500]" />
            
            {/* Location Badge - Clean Modern Style */}
            <div className="absolute bottom-8 left-8 right-8 z-[1001] md:left-8 md:right-auto">
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
