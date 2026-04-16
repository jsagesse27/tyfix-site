import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { isRateLimited, getClientIp, isBotHoneypot, cap } from '@/lib/rate-limiter';

export async function POST(request: Request) {
  try {
    // Rate limit
    const ip = await getClientIp();
    if (isRateLimited(ip, 'leads', 5, 15 * 60 * 1000)) {
      return NextResponse.json({ error: 'Too many submissions. Please try again later.' }, { status: 429 });
    }

    const body = await request.json();

    // Honeypot — silently accept but don't save
    if (isBotHoneypot(body)) {
      return NextResponse.json({ success: true });
    }

    const name = cap(body.name, 100);
    const phone = cap(body.phone, 20);
    const email = cap(body.email, 150);
    const message = cap(body.message, 2000);
    const vehicle_of_interest = cap(body.vehicle_of_interest, 200);
    const vehicle_id = body.vehicle_id || null;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const supabase = await createClient();

    const { error } = await supabase.from('leads').insert({
      name,
      phone: phone || '',
      email: email || '',
      message: message || null,
      vehicle_of_interest: vehicle_of_interest || '',
      vehicle_id: vehicle_id || null,
      status: 'new',
    });

    if (error) {
      console.error('Lead insert error:', error);
      return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
