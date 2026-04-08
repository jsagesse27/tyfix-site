/**
 * Generate a URL-safe slug from vehicle data.
 * Format: "2019-toyota-camry-le-tf001"
 */
export function generateVehicleSlug(vehicle: {
  year: string;
  make: string;
  model: string;
  trim?: string | null;
  stock_number?: string | null;
}): string {
  const parts = [
    vehicle.year,
    vehicle.make,
    vehicle.model,
    vehicle.trim,
    vehicle.stock_number,
  ];

  return parts
    .filter(Boolean)
    .join('-')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 75); // Keep URLs under 75 characters
}

/**
 * Get the VDP URL for a vehicle.
 * Uses slug if available, falls back to UUID.
 */
export function getVehicleUrl(vehicle: {
  id: string;
  slug?: string | null;
}): string {
  if (vehicle.slug) {
    return `/inventory/${vehicle.slug}`;
  }
  return `/vehicles/${vehicle.id}`;
}
