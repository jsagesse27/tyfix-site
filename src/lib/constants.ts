// ============================================================
// TyFix — Vehicle option constants for dropdowns
// Used in both admin forms and public filters
// ============================================================

export const YEARS = Array.from({ length: 30 }, (_, i) => String(2026 - i));

export const MAKES = [
  'Acura', 'Audi', 'BMW', 'Buick', 'Cadillac', 'Chevrolet', 'Chrysler',
  'Dodge', 'Ford', 'Genesis', 'GMC', 'Honda', 'Hyundai', 'Infiniti',
  'Jaguar', 'Jeep', 'Kia', 'Land Rover', 'Lexus', 'Lincoln', 'Mazda',
  'Mercedes-Benz', 'Mercury', 'Mini', 'Mitsubishi', 'Nissan', 'Pontiac',
  'Ram', 'Saturn', 'Scion', 'Subaru', 'Suzuki', 'Tesla', 'Toyota',
  'Volkswagen', 'Volvo', 'Other',
];

export const BODY_TYPES = [
  'Sedan', 'SUV', 'Truck', 'Coupe', 'Hatchback', 'Van', 'Minivan',
  'Wagon', 'Convertible', 'Crossover',
];

export const TRANSMISSIONS = ['Automatic', 'Manual', 'CVT'];

export const FUEL_TYPES = ['Gasoline', 'Diesel', 'Hybrid', 'Electric', 'Flex Fuel'];

export const DRIVETRAINS = ['FWD', 'RWD', 'AWD', '4WD'];

export const CYLINDERS = ['3-Cylinder', '4-Cylinder', '5-Cylinder', '6-Cylinder', '8-Cylinder', '10-Cylinder', '12-Cylinder', 'Electric', 'Rotary'];

export const EXTERIOR_COLORS = [
  'Black', 'White', 'Silver', 'Gray', 'Red', 'Blue', 'Green', 'Brown',
  'Beige', 'Gold', 'Orange', 'Yellow', 'Purple', 'Burgundy', 'Charcoal',
  'Champagne', 'Other',
];

export const INTERIOR_COLORS = [
  'Black', 'Gray', 'Tan', 'Beige', 'Brown', 'White', 'Red', 'Blue', 'Other',
];

export const DOORS = [2, 3, 4, 5];

export const FEATURED_LABELS = [
  '', 'Just Arrived', 'Price Reduced', 'Best Deal', 'Featured', 'Low Miles', 'One Owner',
];

export const LISTING_STATUSES = [
  { value: 'active', label: '✅ Active', emoji: '✅' },
  { value: 'sold', label: '🔴 Sold', emoji: '🔴' },
  { value: 'hidden', label: '⬜ Hidden', emoji: '⬜' },
];

export const PRICE_RANGES = [
  { value: 99999, label: 'Any Price' },
  { value: 3000, label: 'Under $3,000' },
  { value: 4000, label: 'Under $4,000' },
  { value: 5000, label: 'Under $5,000' },
  { value: 6000, label: 'Under $6,000' },
  { value: 7000, label: 'Under $7,000' },
  { value: 7500, label: 'Under $7,500' },
  { value: 10000, label: 'Under $10,000' },
  { value: 15000, label: 'Under $15,000' },
];

export const MILEAGE_RANGES = [
  { value: 999999, label: 'Any Mileage' },
  { value: 25000, label: 'Under 25,000' },
  { value: 50000, label: 'Under 50,000' },
  { value: 75000, label: 'Under 75,000' },
  { value: 100000, label: 'Under 100,000' },
  { value: 125000, label: 'Under 125,000' },
  { value: 150000, label: 'Under 150,000' },
  { value: 200000, label: 'Under 200,000' },
];

export const YEAR_RANGES = [
  { value: 0, label: 'Any Year' },
  { value: 2024, label: '2024+' },
  { value: 2022, label: '2022+' },
  { value: 2020, label: '2020+' },
  { value: 2018, label: '2018+' },
  { value: 2015, label: '2015+' },
  { value: 2012, label: '2012+' },
  { value: 2010, label: '2010+' },
  { value: 2005, label: '2005+' },
];
