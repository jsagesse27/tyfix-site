// ============================================================
// TyFix Auto Sales — TypeScript Types
// All database table shapes + UI helper types
// ============================================================

export interface Vehicle {
  id: string;
  year: string;
  make: string;
  model: string;
  trim: string | null;
  mileage: number;
  price: number;
  cash_price: number | null;
  internet_price: number | null;
  msrp: number | null;
  stock_number: string | null;
  vin: string | null;
  body_type: string;
  exterior_color: string | null;
  interior_color: string | null;
  transmission: string;
  engine: string | null;
  fuel_type: string;
  drivetrain: string;
  cylinders: string | null;
  doors: number;
  condition_notes: string | null;
  inspection_status: 'pass' | 'fail' | null;
  history_report_url: string | null;
  listing_status: 'active' | 'sold' | 'hidden';
  featured_label: string | null;
  show_cash_price: boolean;
  show_internet_price: boolean;
  show_msrp: boolean;
  show_call_for_price: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  // Joined
  photos?: VehiclePhoto[];
}

export interface VehiclePhoto {
  id: string;
  vehicle_id: string;
  storage_path: string;
  public_url: string;
  sort_order: number;
  created_at: string;
}

export interface Lead {
  id: string;
  vehicle_id: string | null;
  name: string;
  phone: string;
  email: string;
  message: string | null;
  vehicle_of_interest: string;
  status: 'new' | 'contacted' | 'closed';
  created_at: string;
}

export interface Testimonial {
  id: string;
  name: string;
  star_rating: number;
  review_text: string;
  date_label: string | null;
  is_visible: boolean;
  sort_order: number;
  created_at: string;
}

export interface SiteSettings {
  id: string;
  phone_number: string;
  sms_number: string;
  contact_email: string;
  lot_address: string;
  hours_of_operation: string;
  google_maps_embed_url: string | null;
  directions_note: string | null;
  footer_text: string;
  legal_disclaimer: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  google_reviews_embed: string | null;
  show_reviews_section: boolean;
  show_price_tagline: boolean;
  price_tagline_text: string;
  logo_url: string | null;
  primary_color: string;
  font_family: string;
  auto_carousel_enabled: boolean;
  auto_carousel_interval: number;
  updated_at: string;
}

export interface SiteContent {
  id: string;
  content_key: string;
  content_value: string;
  content_type: 'text' | 'html' | 'image_url';
  updated_at: string;
}

// UI Filter state
export interface InventoryFilters {
  make: string;
  bodyType: string;
  transmission: string;
  fuelType: string;
  drivetrain: string;
  minPrice: number;
  maxPrice: number;
  minYear: number;
  maxYear: number;
  maxMileage: number;
  search: string;
}
