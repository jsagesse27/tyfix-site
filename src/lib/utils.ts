export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatMileage(mileage: number): string {
  return new Intl.NumberFormat('en-US').format(mileage);
}

export function getOptimizedImageUrl(fullUrl: string): string {
  if (!fullUrl) return fullUrl;

  if (fullUrl.includes('orzvwpiqsvjzbbxiejfu.supabase.co')) {
    return fullUrl.replace('orzvwpiqsvjzbbxiejfu.supabase.co', 'cdn.tyfixautosales.com');
  }
  return fullUrl;
}

export function getHeroPhoto(photos?: { public_url: string; sort_order: number }[]): string {
  if (!photos || photos.length === 0) {
    return '/placeholder-car.svg';
  }
  const sorted = [...photos].sort((a, b) => a.sort_order - b.sort_order);
  return getOptimizedImageUrl(sorted[0].public_url);
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}
