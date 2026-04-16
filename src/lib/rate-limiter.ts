import { headers } from 'next/headers';

// ============================================================
// TyFix — Shared In-Memory Rate Limiter
// One shared map per route key. Auto-cleans stale entries.
// ============================================================

const stores = new Map<string, Map<string, { count: number; resetAt: number }>>();

function getStore(routeKey: string) {
  if (!stores.has(routeKey)) stores.set(routeKey, new Map());
  return stores.get(routeKey)!;
}

/**
 * Check if the current IP is rate-limited for a given route.
 * @param ip           - Client IP address
 * @param routeKey     - Unique key per route (e.g. 'leads', 'chat')
 * @param maxRequests  - Max requests per window
 * @param windowMs     - Window duration in ms
 */
export function isRateLimited(
  ip: string,
  routeKey: string,
  maxRequests: number,
  windowMs: number
): boolean {
  const store = getStore(routeKey);
  const now = Date.now();

  // Cleanup stale entries
  for (const [key, val] of store) {
    if (now > val.resetAt) store.delete(key);
  }

  const entry = store.get(ip);
  if (!entry) {
    store.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }
  if (now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }
  entry.count++;
  return entry.count > maxRequests;
}

/**
 * Helper to get the client IP from request headers.
 */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

// ============================================================
// Honeypot Validation
// ============================================================

/**
 * Silent honeypot check. If the honeypot field has a value,
 * the submission is from a bot. Returns true if bot detected.
 */
export function isBotHoneypot(body: Record<string, unknown>): boolean {
  return !!body?.company_url;
}

// ============================================================
// Input sanitisation helpers
// ============================================================

/** Truncate a string to a max length. */
export function cap(value: unknown, maxLen: number): string {
  if (typeof value !== 'string') return '';
  return value.slice(0, maxLen);
}
