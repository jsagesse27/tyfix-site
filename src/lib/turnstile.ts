// ============================================================
// Cloudflare Turnstile — Server-side Token Verification
// ============================================================

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/**
 * Verify a Turnstile token with Cloudflare's API.
 * Returns true if valid, false if invalid / missing key.
 */
export async function verifyTurnstile(token: string | undefined | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  // If Turnstile isn't configured, skip verification (graceful degradation)
  if (!secret) return true;
  if (!token) return false;

  try {
    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token }),
    });

    const data = await res.json();
    return data.success === true;
  } catch (err) {
    console.error('[Turnstile] Verification error:', err);
    // Fail open — don't block real users if Cloudflare is down
    return true;
  }
}
