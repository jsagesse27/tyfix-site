import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 3;
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

    const body = await request.json();
    const { name, phone, email, budget, vehicleType, preferences, flexibility, yearRange, maxMileage, colorPref, depositAck } = body;
    if (!name || !phone || !budget) return NextResponse.json({ error: 'Name, phone, and budget required' }, { status: 400 });

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

    if (error) { console.error('AutoConnect insert error:', error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }
}
