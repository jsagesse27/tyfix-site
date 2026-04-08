import { createClient } from '@/lib/supabase/server';
import VehicleCard from '@/components/public/VehicleCard';
import type { Vehicle } from '@/lib/types';

interface SimilarVehiclesProps {
  currentVehicleId: string;
  bodyType: string;
  price: number;
  make: string;
}

/**
 * "Similar Vehicles You Might Like" section for VDPs.
 * Fetches 4 vehicles matching body type + similar price, or same make.
 */
export default async function SimilarVehicles({
  currentVehicleId,
  bodyType,
  price,
  make,
}: SimilarVehiclesProps) {
  const supabase = await createClient();

  // Try body type + price range first (±$500)
  const { data: byTypeAndPrice } = await supabase
    .from('vehicles')
    .select('*, photos:vehicle_photos(*)')
    .eq('listing_status', 'active')
    .eq('body_type', bodyType)
    .neq('id', currentVehicleId)
    .gte('price', price - 500)
    .lte('price', price + 500)
    .order('sort_order')
    .limit(4);

  let vehicles = (byTypeAndPrice as Vehicle[]) || [];

  // If not enough results, try same make
  if (vehicles.length < 3) {
    const { data: byMake } = await supabase
      .from('vehicles')
      .select('*, photos:vehicle_photos(*)')
      .eq('listing_status', 'active')
      .eq('make', make)
      .neq('id', currentVehicleId)
      .order('sort_order')
      .limit(4);

    const makeVehicles = (byMake as Vehicle[]) || [];
    // Merge, deduplicate
    const ids = new Set(vehicles.map((v) => v.id));
    for (const v of makeVehicles) {
      if (!ids.has(v.id) && vehicles.length < 4) {
        vehicles.push(v);
        ids.add(v.id);
      }
    }
  }

  // If still not enough, get any active vehicles
  if (vehicles.length < 3) {
    const existingIds = vehicles.map((v) => v.id);
    const { data: any } = await supabase
      .from('vehicles')
      .select('*, photos:vehicle_photos(*)')
      .eq('listing_status', 'active')
      .not('id', 'in', `(${[currentVehicleId, ...existingIds].join(',')})`)
      .order('sort_order')
      .limit(4 - vehicles.length);

    vehicles = [...vehicles, ...((any as Vehicle[]) || [])];
  }

  if (vehicles.length === 0) return null;

  return (
    <section className="mt-16 pt-12 border-t border-gray-100">
      <h2 className="text-2xl font-black text-gray-900 mb-8">
        Similar Vehicles You Might Like
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {vehicles.slice(0, 4).map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            autoCarousel={false}
          />
        ))}
      </div>
    </section>
  );
}
