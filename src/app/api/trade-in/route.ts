import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { isRateLimited, getClientIp, isBotHoneypot, cap } from '@/lib/rate-limiter';

export async function POST(request: Request) {
  try {
    const ip = await getClientIp();
    if (isRateLimited(ip, 'trade-in', 5, 15 * 60 * 1000)) {
      return NextResponse.json({ error: 'Too many submissions.' }, { status: 429 });
    }

    const body = await request.json();

    // Honeypot
    if (isBotHoneypot(body)) {
      return NextResponse.json({ success: true });
    }

    const name = cap(body.name, 100);
    const phone = cap(body.phone, 20);
    const email = cap(body.email, 150);
    const vin = cap(body.vin, 20);
    const year = cap(body.year, 4);
    const make = cap(body.make, 50);
    const model = cap(body.model, 50);
    const trim = cap(body.trim, 50);
    const notes = cap(body.notes, 2000);

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone required' }, { status: 400 });
    }

    const supabase = await createClient();
    const vehicleDesc = `${year} ${make} ${model} ${trim}`.trim();

    // Pass through condition fields (capped)
    const engine = cap(body.engine, 100);
    const body_type = cap(body.body_type, 50);
    const transmission = cap(body.transmission, 50);
    const fuel_type = cap(body.fuel_type, 50);
    const drivetrain = cap(body.drivetrain, 50);
    const cylinders = cap(body.cylinders, 10);
    const doors = cap(body.doors, 5);
    const mileage = cap(body.mileage, 20);
    const exteriorColor = cap(body.exteriorColor, 50);

    let silentDataStr = '';
    if (engine || body_type || transmission || drivetrain) {
      silentDataStr = `\n\nDECODED SPECS:\nEngine: ${engine || 'N/A'}\nBody: ${body_type || 'N/A'}\nTrans: ${transmission || 'N/A'}\nDrive: ${drivetrain || 'N/A'}\nFuel: ${fuel_type || 'N/A'}\nCylinders: ${cylinders || 'N/A'}\nDoors: ${doors || 'N/A'}`;
    }

    const isOriginalOwner = cap(body.isOriginalOwner, 10);
    const ownershipDuration = cap(body.ownershipDuration, 30);
    const exteriorLook = cap(body.exteriorLook, 50);
    const dentsScratches = cap(body.dentsScratches, 50);
    const windshield = cap(body.windshield, 50);
    const tireCondition = cap(body.tireCondition, 50);
    const rust = cap(body.rust, 50);
    const interiorCondition = cap(body.interiorCondition, 50);
    const odors = cap(body.odors, 50);
    const warningLights = cap(body.warningLights, 50);
    const workingFeatures = cap(body.workingFeatures, 200);
    const lastOilChange = cap(body.lastOilChange, 50);
    const accidentHistory = cap(body.accidentHistory, 200);

    const message = `TRADE-IN SUBMISSION:\nVehicle: ${vehicleDesc}\nVIN: ${vin || 'Not provided'}\nMileage: ${mileage || 'N/A'}\nColor: ${exteriorColor || 'N/A'}\nOriginal Owner: ${isOriginalOwner || 'N/A'}\nOwned: ${ownershipDuration || 'N/A'}${silentDataStr}\n\nCONDITION:\nExterior Look: ${exteriorLook || 'N/A'}\nDents/Scratches: ${dentsScratches || 'N/A'}\nWindshield: ${windshield || 'N/A'}\nTires: ${tireCondition || 'N/A'}\nRust: ${rust || 'N/A'}\nInterior: ${interiorCondition || 'N/A'}\nOdors: ${odors || 'N/A'}\nWarning Lights: ${warningLights || 'N/A'}\nWorking Features: ${workingFeatures || 'N/A'}\nLast Oil Change: ${lastOilChange || 'N/A'}\nAccidents: ${accidentHistory || 'N/A'}\n\nNotes: ${notes || 'None'}`;

    const { error } = await supabase.from('leads').insert({
      name, phone, email: email || '',
      message,
      vehicle_of_interest: `Trade-In: ${vehicleDesc || 'Vehicle'}`,
      lead_type: 'trade_in',
      status: 'new',
      extra_data: { vin, year, make, model, trim, engine, body_type, transmission, fuel_type, drivetrain, cylinders, doors, mileage, exteriorColor, isOriginalOwner, ownershipDuration, exteriorLook, dentsScratches, windshield, tireCondition, rust, interiorCondition, odors, warningLights, workingFeatures, lastOilChange, accidentHistory, notes },
    });

    if (error) {
      console.error('Trade-in insert error:', error);
      return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
