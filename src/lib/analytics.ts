// ============================================================
// TyFix Auto Sales — Analytics Utility
// GA4 + Meta Pixel event helpers
// ============================================================

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/** Push a GA4 event */
function gtagEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
}

/** Push a Meta Pixel event */
function fbqEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, params);
  }
}

// ============================================================
// Pre-built event functions
// ============================================================

export function trackFormSubmission(formType: string, vehicleInterest?: string) {
  gtagEvent('form_submission', { form_type: formType, vehicle_interest: vehicleInterest });
  fbqEvent('Lead', { content_name: formType, content_category: vehicleInterest });
}

export function trackClickToCall(source: string) {
  gtagEvent('click_to_call', { source });
  fbqEvent('Contact', { content_name: 'click_to_call', content_category: source });
}

export function trackClickToText(source: string) {
  gtagEvent('click_to_text', { source });
  fbqEvent('Contact', { content_name: 'click_to_text', content_category: source });
}

export function trackVDPView(vehicle: {
  id: string;
  title: string;
  price: number;
  bodyType: string;
}) {
  gtagEvent('vdp_view', {
    vehicle_id: vehicle.id,
    vehicle_title: vehicle.title,
    vehicle_price: vehicle.price,
    vehicle_body_type: vehicle.bodyType,
  });
  fbqEvent('ViewContent', {
    content_name: vehicle.title,
    content_category: vehicle.bodyType,
    content_ids: [vehicle.id],
    value: vehicle.price,
    currency: 'USD',
  });
}

export function trackChatInitiated() {
  gtagEvent('chat_initiated');
  fbqEvent('Contact', { content_name: 'chat_widget' });
}

export function trackAppointmentBooked(vehicleInterest?: string) {
  gtagEvent('appointment_booked', { vehicle_interest: vehicleInterest });
  fbqEvent('Schedule', { content_name: 'test_drive', content_category: vehicleInterest });
}

export function trackDirectionsClicked() {
  gtagEvent('directions_clicked');
}

export function trackInventorySearch(filters: Record<string, unknown>) {
  gtagEvent('inventory_search', filters);
  fbqEvent('Search', { search_string: JSON.stringify(filters) });
}

export function trackSocialClick(platform: string) {
  gtagEvent('social_click', { platform });
}

export function trackShareClick(method: string, vehicleTitle?: string) {
  gtagEvent('share', { method, content: vehicleTitle });
}
