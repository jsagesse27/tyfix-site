import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 5;
const ipMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  for (const [key, val] of ipMap) { if (now > val.resetAt) ipMap.delete(key); }
  const entry = ipMap.get(ip);
  if (!entry) { ipMap.set(ip, { count: 1, resetAt: now + WINDOW_MS }); return false; }
  if (now > entry.resetAt) { ipMap.set(ip, { count: 1, resetAt: now + WINDOW_MS }); return false; }
  entry.count++;
  return entry.count > MAX_REQUESTS;
}

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (isRateLimited(ip)) return NextResponse.json({ error: 'Too many submissions.' }, { status: 429 });

    const { firstName, lastName, email, phone, instagram, consent } = await request.json();
    if (!firstName || !lastName || !email || !phone) return NextResponse.json({ error: 'All fields required' }, { status: 400 });

    const supabase = await createClient();
    const { error } = await supabase.from('leads').insert({
      name: `${firstName} ${lastName}`,
      phone,
      email,
      instagram: instagram || null,
      contact_consent: consent || false,
      message: `Newsletter Signup — $200 Off Claim${instagram ? ` | IG: ${instagram}` : ''}`,
      vehicle_of_interest: 'Newsletter Signup — $200 Off',
      lead_type: 'subscriber',
      status: 'new',
    });

    if (error) { console.error('Subscriber insert error:', error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }
}
