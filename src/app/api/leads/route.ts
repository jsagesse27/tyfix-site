import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

/* ── In-Memory Rate Limiter ─────────────────── */
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 5;

const ipMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();

  // Clean stale entries every check (lightweight since map is small)
  for (const [key, val] of ipMap) {
    if (now > val.resetAt) ipMap.delete(key);
  }

  const entry = ipMap.get(ip);
  if (!entry) {
    ipMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  if (now > entry.resetAt) {
    ipMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > MAX_REQUESTS;
}

export async function POST(request: Request) {
  try {
    // Rate limit by IP
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many submissions. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, phone, email, message, vehicle_of_interest, vehicle_id } = body;

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

    // Optional: Send email notification via Resend
    // Uncomment when RESEND_API_KEY is configured
    /*
    if (process.env.RESEND_API_KEY) {
      try {
        const settingsRes = await supabase.from('site_settings').select('contact_email').limit(1).single();
        const contactEmail = settingsRes.data?.contact_email || 'info@tyfixauto.com';

        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'TyFix Leads <leads@tyfixauto.com>',
            to: contactEmail,
            subject: `New Lead: ${name} — ${vehicle_of_interest || 'General Inquiry'}`,
            html: `
              <h2>New Lead from TyFix Website</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
              <p><strong>Email:</strong> ${email || 'Not provided'}</p>
              <p><strong>Vehicle:</strong> ${vehicle_of_interest || 'General inquiry'}</p>
              <p><strong>Message:</strong> ${message || 'None'}</p>
            `,
          }),
        });
      } catch (emailErr) {
        console.error('Email notification failed:', emailErr);
      }
    }
    */

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
