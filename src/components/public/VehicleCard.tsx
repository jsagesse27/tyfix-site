import Link from 'next/link';
import { Zap, ShieldCheck, ChevronRight } from 'lucide-react';
import type { Vehicle } from '@/lib/types';
import { formatPrice, formatMileage, getHeroPhoto } from '@/lib/utils';

export default function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const heroPhoto = getHeroPhoto(vehicle.photos);

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100">
      <div className="relative h-56 overflow-hidden">
        <img
          src={heroPhoto}
          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          {vehicle.featured_label && (
            <span className="badge badge-featured">{vehicle.featured_label}</span>
          )}
          <span className="bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {vehicle.year}
          </span>
        </div>
        <div className="absolute bottom-4 right-4">
          {vehicle.show_call_for_price ? (
            <span className="bg-primary text-white text-lg font-black px-4 py-1 rounded-lg shadow-lg">
              Call for Price
            </span>
          ) : (
            <span className="bg-primary text-white text-xl font-black px-4 py-1 rounded-lg shadow-lg">
              {formatPrice(vehicle.price)}
            </span>
          )}
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {vehicle.make} {vehicle.model}
          {vehicle.trim && <span className="text-gray-400 font-normal text-base ml-2">{vehicle.trim}</span>}
        </h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Zap size={16} className="text-primary" />
            <span>{formatMileage(vehicle.mileage)} miles</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <ShieldCheck size={16} className="text-primary" />
            <span>{vehicle.transmission}</span>
          </div>
        </div>
        {vehicle.condition_notes && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{vehicle.condition_notes}</p>
        )}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <Link
            href={`/vehicles/${vehicle.id}`}
            className="text-primary font-bold flex items-center gap-1 hover:gap-2 transition-all"
          >
            View Details <ChevronRight size={18} />
          </Link>
          {vehicle.inspection_status === 'pass' && (
            <span className="flex items-center gap-1 text-success text-xs font-bold">
              <ShieldCheck size={14} />
              Inspected
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
