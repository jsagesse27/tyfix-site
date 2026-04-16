import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { isRateLimited, getClientIp, isBotHoneypot, cap } from '@/lib/rate-limiter';
import { verifyTurnstile } from '@/lib/turnstile';

export async function POST(request: Request) {
  try {
    const ip = await getClientIp();
    if (isRateLimited(ip, 'subscribers', 5, 15 * 60 * 1000)) {
      return NextResponse.json({ error: 'Too many submissions.' }, { status: 429 });
    }

    const body = await request.json();

    // Honeypot
    if (isBotHoneypot(body)) {
      return NextResponse.json({ success: true });
    }

    // Turnstile verification
    const turnstileValid = await verifyTurnstile(body.turnstileToken);
    if (!turnstileValid) {
      return NextResponse.json({ error: 'Security verification failed. Please try again.' }, { status: 403 });
    }

    const firstName = cap(body.firstName, 50);
    const lastName = cap(body.lastName, 50);
    const email = cap(body.email, 150);
    const phone = cap(body.phone, 20);
    const instagram = cap(body.instagram, 50);
    const consent = !!body.consent;

    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase.from('leads').insert({
      name: `${firstName} ${lastName}`,
      phone,
      email,
      instagram: instagram || null,
      contact_consent: consent,
      message: `Newsletter Signup — $250 Off Claim${instagram ? ` | IG: ${instagram}` : ''}`,
      vehicle_of_interest: 'Newsletter Signup — $250 Off',
      lead_type: 'subscriber',
      status: 'new',
    });

    if (error) {
      console.error('Subscriber insert error:', error);
      return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
