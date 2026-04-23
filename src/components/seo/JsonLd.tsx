// ============================================================
// TyFix Auto Sales — JSON-LD Structured Data Components
// Server-rendered schema markup for SEO
// ============================================================

import type { Vehicle, SiteSettings, VehiclePhoto } from '@/lib/types';
import { formatPrice, getOptimizedImageUrl } from '@/lib/utils';
import { getVehicleUrl } from '@/lib/slug';

const BASE_URL = 'https://tyfixautosales.com';
const GOOGLE_REVIEW_URL = 'https://g.page/r/Cde5nVyjo3INEBM/review';

interface SchemaProps {
  settings?: SiteSettings | null;
}

/**
 * AutoDealer schema for homepage & /visit-us
 */
export function AutoDealerSchema({ settings }: SchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    name: 'TyFix Auto Sales',
    description:
      'Cash-only used car dealer in Brooklyn selling quality vehicles under $5,000. No credit checks, no financing, no hidden fees.',
    url: BASE_URL,
    logo: `${BASE_URL}/tyfix-logo.png`,
    image: `${BASE_URL}/tyfix-logo.png`,
    telephone: settings?.phone_number || '',
    email: settings?.contact_email || '',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '183 Bay 53rd St',
      addressLocality: 'Brooklyn',
      addressRegion: 'NY',
      postalCode: '11214',
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 40.5823498,
      longitude: -73.988411,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday', 'Tuesday', 'Wednesday', 'Thursday',
          'Friday', 'Saturday', 'Sunday',
        ],
        opens: '09:00',
        closes: '19:00',
      },
    ],
    priceRange: '$1,000 - $5,000',
    currenciesAccepted: 'USD',
    paymentAccepted: 'Cash',
    areaServed: [
      { '@type': 'City', name: 'Brooklyn' },
      { '@type': 'City', name: 'New York' },
      { '@type': 'State', name: 'New York' },
    ],
    sameAs: [
      settings?.instagram_url,
      settings?.facebook_url,
      settings?.tiktok_url,
      GOOGLE_REVIEW_URL,
    ].filter(Boolean),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * Car schema for individual VDP pages
 */
export function CarSchema({
  vehicle,
  settings,
}: {
  vehicle: Vehicle;
  settings?: SiteSettings | null;
}) {
  const photos = vehicle.photos?.sort((a, b) => a.sort_order - b.sort_order) || [];
  const vehicleUrl = `${BASE_URL}${getVehicleUrl(vehicle)}`;
  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ''}`;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Car',
    name: title,
    brand: { '@type': 'Brand', name: vehicle.make },
    model: vehicle.model,
    vehicleModelDate: vehicle.year,
    ...(vehicle.vin && { vehicleIdentificationNumber: vehicle.vin }),
    itemCondition: 'https://schema.org/UsedCondition',
    mileageFromOdometer: {
      '@type': 'QuantitativeValue',
      value: vehicle.mileage,
      unitCode: 'SMI',
    },
    ...(vehicle.exterior_color && { color: vehicle.exterior_color }),
    ...(vehicle.body_type && { bodyType: vehicle.body_type }),
    ...(vehicle.transmission && { vehicleTransmission: vehicle.transmission }),
    ...(vehicle.fuel_type && { fuelType: vehicle.fuel_type }),
    ...(vehicle.drivetrain && { driveWheelConfiguration: vehicle.drivetrain }),
    ...(vehicle.doors && { numberOfDoors: vehicle.doors }),
    image: photos.map((p: VehiclePhoto) => getOptimizedImageUrl(p.public_url)),
    url: vehicleUrl,
    offers: {
      '@type': 'Offer',
      price: vehicle.show_call_for_price ? undefined : vehicle.price,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'AutoDealer',
        name: 'TyFix Auto Sales',
        url: BASE_URL,
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * ItemList schema for inventory/SRP page
 */
export function ItemListSchema({ vehicles }: { vehicles: Vehicle[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'TyFix Auto Sales Inventory',
    numberOfItems: vehicles.length,
    itemListElement: vehicles.map((v, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${BASE_URL}${getVehicleUrl(v)}`,
      name: `${v.year} ${v.make} ${v.model}${v.trim ? ` ${v.trim}` : ''}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * BreadcrumbList schema
 */
export function BreadcrumbSchema({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
