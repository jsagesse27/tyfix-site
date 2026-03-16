'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Vehicle, SiteSettings } from '@/lib/types';
import VehicleCard from './VehicleCard';
import { useReveal, useStaggerReveal } from '@/lib/useReveal';

interface FeaturedVehiclesProps {
  vehicles: Vehicle[];
  settings: SiteSettings | null;
}

export default function FeaturedVehicles({ vehicles, settings }: FeaturedVehiclesProps) {
  const featured = vehicles.filter((v) => v.featured_label);
  const display = featured.length > 0 ? featured.slice(0, 6) : vehicles.slice(0, 6);
  const headingRef = useReveal();
  const gridRef = useStaggerReveal(0.05);

  if (display.length === 0) return null;

  return (
    <section id="inventory" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div ref={headingRef} className="reveal flex flex-col md:flex-row justify-between items-start md:items-end mb-14 gap-6">
          <div>
            <span className="section-label">Available Now</span>
            <h2 className="text-4xl font-black text-gray-900 leading-tight">
              {featured.length > 0 ? 'Featured Vehicles' : 'Current Inventory'}
            </h2>
            <p className="text-slate-500 mt-3 max-w-md">
              Our inventory moves fast. See something you like? Call us now to hold it.
            </p>
          </div>
          <Link href="/inventory" className="btn-primary whitespace-nowrap flex items-center gap-2">
            View All <ArrowRight size={18} />
          </Link>
        </div>

        {/* Grid */}
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 stagger">
          {display.map((vehicle) => (
            <div key={vehicle.id} className="reveal">
              <VehicleCard 
                vehicle={vehicle} 
                autoCarousel={settings?.auto_carousel_enabled ?? true}
                interval={(settings?.auto_carousel_interval ?? 4) * 1000}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
