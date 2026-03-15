import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Vehicle } from '@/lib/types';
import VehicleCard from './VehicleCard';

interface FeaturedVehiclesProps {
  vehicles: Vehicle[];
}

export default function FeaturedVehicles({ vehicles }: FeaturedVehiclesProps) {
  const featured = vehicles.filter((v) => v.featured_label);
  const display = featured.length > 0 ? featured.slice(0, 6) : vehicles.slice(0, 6);

  if (display.length === 0) return null;

  return (
    <section id="inventory" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              {featured.length > 0 ? 'Featured Vehicles' : 'Current Inventory'}
            </h2>
            <p className="text-gray-500 max-w-lg">
              Our inventory moves fast. See something you like? Call us now to schedule a test drive.
            </p>
          </div>
          <Link
            href="/inventory"
            className="btn-primary flex items-center gap-2 whitespace-nowrap"
          >
            View All Inventory <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {display.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      </div>
    </section>
  );
}
