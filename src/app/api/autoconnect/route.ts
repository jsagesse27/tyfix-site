import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { isRateLimited, getClientIp, isBotHoneypot, cap } from '@/lib/rate-limiter';
import { verifyTurnstile } from '@/lib/turnstile';

export async function POST(request: Request) {
  try {
    const ip = await getClientIp();
    if (isRateLimited(ip, 'autoconnect', 3, 15 * 60 * 1000)) {
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

    const name = cap(body.name, 100);
    const phone = cap(body.phone, 20);
    const email = cap(body.email, 150);
    const budget = cap(body.budget, 20);
    const vehicleType = cap(body.vehicleType, 200);
    const preferences = cap(body.preferences, 1000);
    const flexibility = cap(body.flexibility, 100);
    const yearRange = cap(body.yearRange, 30);
    const maxMileage = cap(body.maxMileage, 20);
    const colorPref = cap(body.colorPref, 50);
    const depositAck = !!body.depositAck;

    if (!name || !phone || !budget) {
      return NextResponse.json({ error: 'Name, phone, and budget required' }, { status: 400 });
    }

    const supabase = await createClient();
    const message = `AUTOCONNECT ENROLLMENT:\nBudget: $${budget}\nVehicle Type: ${vehicleType || 'Not specified'}\nPreferences: ${preferences || 'None'}\nYear Range: ${yearRange || 'Any'}\nMax Mileage: ${maxMileage || 'Any'}\nColor: ${colorPref || 'Any'}\nFlexibility: ${flexibility || 'Not specified'}\nDeposit Acknowledged: ${depositAck ? 'Yes' : 'No'}`;

    const { error } = await supabase.from('leads').insert({
      name, phone, email: email || '',
      message,
      vehicle_of_interest: 'AutoConnect Enrollment',
      lead_type: 'autoconnect',
      status: 'new',
      extra_data: { budget, vehicleType, preferences, flexibility, yearRange, maxMileage, colorPref, depositAck },
    });

    if (error) {
      console.error('AutoConnect insert error:', error);
      return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
