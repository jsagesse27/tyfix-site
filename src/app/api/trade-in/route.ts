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

    const body = await request.json();
    const { name, phone, email, vin, year, make, model, trim, mileage, exteriorColor, isOriginalOwner, ownershipDuration, exteriorLook, dentsScratches, windshield, tireCondition, rust, interiorCondition, odors, warningLights, workingFeatures, lastOilChange, accidentHistory, notes } = body;
    if (!name || !phone) return NextResponse.json({ error: 'Name and phone required' }, { status: 400 });

    const supabase = await createClient();
    const vehicleDesc = `${year || ''} ${make || ''} ${model || ''} ${trim || ''}`.trim();
    const message = `TRADE-IN SUBMISSION:\nVehicle: ${vehicleDesc}\nVIN: ${vin || 'Not provided'}\nMileage: ${mileage || 'N/A'}\nColor: ${exteriorColor || 'N/A'}\nOriginal Owner: ${isOriginalOwner || 'N/A'}\nOwned: ${ownershipDuration || 'N/A'}\n\nCONDITION:\nExterior Look: ${exteriorLook || 'N/A'}\nDents/Scratches: ${dentsScratches || 'N/A'}\nWindshield: ${windshield || 'N/A'}\nTires: ${tireCondition || 'N/A'}\nRust: ${rust || 'N/A'}\nInterior: ${interiorCondition || 'N/A'}\nOdors: ${odors || 'N/A'}\nWarning Lights: ${warningLights || 'N/A'}\nWorking Features: ${workingFeatures || 'N/A'}\nLast Oil Change: ${lastOilChange || 'N/A'}\nAccidents: ${accidentHistory || 'N/A'}\n\nNotes: ${notes || 'None'}`;

    const { error } = await supabase.from('leads').insert({
      name, phone, email: email || '',
      message,
      vehicle_of_interest: `Trade-In: ${vehicleDesc || 'Vehicle'}`,
      lead_type: 'trade_in',
      status: 'new',
      extra_data: { vin, year, make, model, trim, mileage, exteriorColor, isOriginalOwner, ownershipDuration, exteriorLook, dentsScratches, windshield, tireCondition, rust, interiorCondition, odors, warningLights, workingFeatures, lastOilChange, accidentHistory, notes },
    });

    if (error) { console.error('Trade-in insert error:', error); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }
}
