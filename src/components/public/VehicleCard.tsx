'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Gauge, Settings2, ChevronRight, ShieldCheck } from 'lucide-react';
import type { Vehicle } from '@/lib/types';
import { formatPrice, formatMileage, getHeroPhoto } from '@/lib/utils';
import { getVehicleUrl } from '@/lib/slug';

export default function VehicleCard({ 
  vehicle, 
  autoCarousel = true, 
  interval = 4000 
}: { 
  vehicle: Vehicle;
  autoCarousel?: boolean;
  interval?: number;
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const photos = vehicle.photos && vehicle.photos.length > 0 
    ? vehicle.photos.sort((a, b) => a.sort_order - b.sort_order) 
    : [];

  useEffect(() => {
    if (!autoCarousel || photos.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % photos.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoCarousel, interval, photos.length]);

  const displayPhoto = photos.length > 0 ? photos[currentIdx].public_url : '/placeholder-car.jpg';

  return (
    <Link href={getVehicleUrl(vehicle)} className="vehicle-card group block">
      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-slate-100">
        <Image
          key={displayPhoto}
          src={displayPhoto}
          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className="object-cover transition-all duration-1000 group-hover:scale-105 animate-cross-fade"
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {vehicle.featured_label && (
            <span className="badge badge-featured text-[10px]">{vehicle.featured_label}</span>
          )}
          <span className="bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            {vehicle.year}
          </span>
        </div>

        {/* Price badge (glassmorphism) */}
        <div className="absolute bottom-3 right-3">
          {vehicle.show_call_for_price ? (
            <span className="bg-primary/90 backdrop-blur-sm text-white text-sm font-black px-3 py-1.5 rounded-xl shadow-lg">
              Call for Price
            </span>
          ) : (
            <span className="bg-primary/90 backdrop-blur-sm text-white text-lg font-black px-3 py-1.5 rounded-xl shadow-lg">
              {formatPrice(vehicle.price)}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">
          {vehicle.make} {vehicle.model}
          {vehicle.trim && (
            <span className="text-slate-400 font-normal text-sm ml-1.5">{vehicle.trim}</span>
          )}
        </h3>

        {/* Specs row */}
        <div className="flex items-center gap-4 mt-3 mb-4">
          <span className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <Gauge size={14} className="text-primary" />
            {formatMileage(vehicle.mileage)} mi
          </span>
          {vehicle.transmission && (
            <span className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
              <Settings2 size={14} className="text-primary" />
              {vehicle.transmission}
            </span>
          )}
          {vehicle.body_type && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full ml-auto">
              {vehicle.body_type}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="text-primary font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all duration-200">
            View Details <ChevronRight size={16} />
          </span>
          {vehicle.inspection_status === 'pass' && (
            <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
              <ShieldCheck size={13} strokeWidth={2.5} />
              Inspected
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
