// ============================================================
// TyFix Auto Sales — TypeScript Types
// All database table shapes + UI helper types
// ============================================================

export interface Vehicle {
  id: string;
  slug: string | null;
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
  status: 'new' | 'contacted' | 'appointment_set' | 'showed' | 'sold' | 'lost' | 'closed';
  lead_type: 'inquiry' | 'trade-in' | 'autoconnect' | 'chatbot';
  instagram?: string | null;
  contact_consent: boolean;
  timeline?: string | null;
  extra_data?: any;
  created_at: string;
}

export interface Testimonial {
  id: string;
  name: string;
  star_rating: number;
  review_text: string;
  date_label: string | null;
  source: 'site' | 'google' | 'yelp';
  google_review_url: string | null;
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
  tiktok_url: string | null;
  google_reviews_embed: string | null;
  show_reviews_section: boolean;
  show_price_tagline: boolean;
  price_tagline_text: string;
  logo_url: string | null;
  primary_color: string;
  font_family: string;
  auto_carousel_enabled: boolean;
  auto_carousel_interval: number;
  admin_leads_per_page: number;
  admin_inventory_per_page: number;
  dealer_signature_data: string | null;
  dealer_printed_name: string;
  show_lead_popup: boolean;
  lead_popup_title: string;
  lead_popup_text: string;
  admin_pin: string | null;
  inactivity_timeout_minutes: number;
  lock_failures: number;
  updated_at: string;
}

export interface SiteContent {
  id: string;
  content_key: string;
  content_value: string;
  content_type: 'text' | 'html' | 'image_url';
  updated_at: string;
}

export interface BillOfSale {
  id: string;
  vehicle_id: string | null;
  vehicle_year: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_vin: string | null;
  vehicle_stock_number: string | null;
  vehicle_mileage: number | null;
  vehicle_color: string | null;
  vehicle_price: number;
  buyer_name: string;
  buyer_phone: string | null;
  buyer_address: string | null;
  sale_price: number;
  sale_date: string;
  pdf_storage_path: string;
  pdf_public_url: string;
  buyer_signature_data: string | null;
  created_at: string;
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

// ============================================================
// AI Bot Types
// ============================================================

export interface BotSettings {
  id: string;
  // Simple Settings
  bot_name: string;
  bot_personality: string;
  dealership_name: string;
  dealership_location: string;
  payment_model: 'cash-only' | 'financing' | 'both';
  price_range: string;
  greeting_message: string;
  allow_price_negotiation: boolean;
  collect_leads: boolean;
  bot_enabled: boolean;
  // Advanced Settings
  system_prompt_override: string | null;
  banned_phrases: string;
  appointment_nudges: string;
  custom_instructions: string | null;
  temperature: number;
  max_tokens: number;
  frequency_penalty: number;
  presence_penalty: number;
  rate_limit_enabled: boolean;
  rate_limit_requests: number;
  rate_limit_window_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  session_id: string;
  lead_id: string | null;
  source_channel: 'web_chat' | 'phone' | 'sms' | 'instagram';
  context: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ChatMessageRecord {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  tool_calls: Record<string, unknown>[] | null;
  tool_results: Record<string, unknown>[] | null;
  tokens_used: number | null;
  provider: string | null;
  created_at: string;
}

export interface Appointment {
  id: string;
  lead_id: string | null;
  name: string;
  phone: string;
  preferred_date: string;
  preferred_time: string;
  vehicle_interest: string | null;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes: string | null;
  created_at: string;
}

// ============================================================
// Blog Types
// ============================================================

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image_url: string | null;
  author: string;
  category: string | null;
  tags: string[];
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Homepage Section Manager Types
// ============================================================

export interface HomepageSection {
  id: string;
  label: string;
  sort_order: number;
  is_visible: boolean;
  updated_at: string;
}

// ============================================================
// VIN Extractor Types
// ============================================================

export interface VinExtractionItem {
  vin: string;
  make: string;
  model: string;
  year: string;
  status: 'valid' | 'invalid' | 'warning';
  notes?: string;
  confidence?: string;
}

export interface VinExtractionList {
  id: string;
  title: string;
  items: VinExtractionItem[];
  created_at: string;
  updated_at: string;
}


