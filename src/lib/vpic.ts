import { MAKES, BODY_TYPES, TRANSMISSIONS, FUEL_TYPES, DRIVETRAINS } from './constants';

export interface VinDecodeResult {
  vin: string;
  year: string;
  make: string;
  model: string;
  trim: string;
  body_type: string;
  transmission: string;
  fuel_type: string;
  drivetrain: string;
  cylinders: string;
  doors: string;
  engine: string;
  error?: string;
}

export const BODY_CLASS_MAP: Record<string, string> = {
  'Sedan/Saloon': 'Sedan',
  'Sport Utility Vehicle (SUV)/Multi-Purpose Vehicle (MPV)': 'SUV',
  'Crossover Utility Vehicle (CUV)': 'Crossover',
  'Coupe': 'Coupe',
  'Convertible/Cabriolet': 'Convertible',
  'Hatchback/Liftback/Notchback': 'Hatchback',
  'Wagon': 'Wagon',
  'Pickup': 'Truck',
  'Truck ': 'Truck',
  'Minivan': 'Minivan',
  'Van': 'Van',
  'Cargo Van': 'Van',
};

export const TRANSMISSION_MAP: Record<string, string> = {
  'Automatic': 'Automatic',
  'Automated Manual Transmission (AMT)': 'Automatic',
  'Continuously Variable Transmission (CVT)': 'Automatic',
  'Electronic Continuously Variable (e-CVT)': 'Automatic',
  'Direct Drive': 'Automatic',
  'Dual-Clutch Transmission (DCT)': 'DCT',
  'Manual/Standard': 'Manual',
};

export const DRIVE_TYPE_MAP: Record<string, string> = {
  'FWD/Front-Wheel Drive': 'FWD',
  'RWD/Rear-Wheel Drive': 'RWD',
  'AWD/All-Wheel Drive': 'AWD',
  '4WD/4-Wheel Drive/4x4': '4WD',
  '2WD/4WD': '4WD',
  '4x2': 'RWD',
};

export const FUEL_TYPE_MAP: Record<string, string> = {
  'Gasoline': 'Gasoline',
  'Diesel': 'Diesel',
  'Electric': 'Electric',
  'Flexible Fuel Vehicle (FFV)': 'Flex Fuel',
  'Ethanol (E85)': 'Flex Fuel',
  'Compressed Natural Gas (CNG)': 'Gasoline',
  'Natural Gas': 'Gasoline',
  'Liquefied Natural Gas (LNG)': 'Gasoline',
  'Fuel Cell': 'Electric',
  'Compressed Hydrogen/Hydrogen': 'Electric',
};

export function validateVin(vin: string): { valid: boolean; error?: string } {
  const cleanVin = vin.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (cleanVin.length < 11 || cleanVin.length > 17) {
    return { valid: false, error: 'VIN must be between 11 and 17 characters.' };
  }
  if (cleanVin.includes('I') || cleanVin.includes('O') || cleanVin.includes('Q')) {
    return { valid: false, error: 'VIN cannot contain letters I, O, or Q.' };
  }
  return { valid: true };
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

export function mapNhtsaResult(nhtsaData: any): VinDecodeResult {
  const result: VinDecodeResult = {
    vin: nhtsaData.VIN || '',
    year: nhtsaData.ModelYear || '',
    make: '',
    model: nhtsaData.Model || '',
    trim: nhtsaData.Trim || '',
    body_type: '',
    transmission: '',
    fuel_type: '',
    drivetrain: '',
    cylinders: '',
    doors: '',
    engine: '',
    error: nhtsaData.ErrorCode && nhtsaData.ErrorCode !== '0' && !nhtsaData.ErrorCode.startsWith('0') ? nhtsaData.ErrorText : undefined,
  };

  // Map Make
  if (nhtsaData.Make) {
    const titleMake = nhtsaData.Make.charAt(0).toUpperCase() + nhtsaData.Make.slice(1).toLowerCase();
    const foundMake = MAKES.find((m) => m.toLowerCase() === titleMake.toLowerCase());
    result.make = foundMake || 'Other';
  }

  // Map Body Type
  if (nhtsaData.BodyClass && BODY_CLASS_MAP[nhtsaData.BodyClass]) {
    const mapped = BODY_CLASS_MAP[nhtsaData.BodyClass];
    if (BODY_TYPES.includes(mapped)) {
      result.body_type = mapped;
    }
  }

  // Map Transmission
  if (nhtsaData.TransmissionStyle && TRANSMISSION_MAP[nhtsaData.TransmissionStyle]) {
    const mapped = TRANSMISSION_MAP[nhtsaData.TransmissionStyle];
    if (TRANSMISSIONS.includes(mapped)) {
      result.transmission = mapped;
    }
  }

  // Map Drive Type
  if (nhtsaData.DriveType && DRIVE_TYPE_MAP[nhtsaData.DriveType]) {
    const mapped = DRIVE_TYPE_MAP[nhtsaData.DriveType];
    if (DRIVETRAINS.includes(mapped)) {
      result.drivetrain = mapped;
    }
  }

  // Map Fuel Type
  if (nhtsaData.FuelTypePrimary && FUEL_TYPE_MAP[nhtsaData.FuelTypePrimary]) {
    const mapped = FUEL_TYPE_MAP[nhtsaData.FuelTypePrimary];
    if (FUEL_TYPES.includes(mapped)) {
      result.fuel_type = mapped;
    }
  }

  // Map Cylinders
  if (nhtsaData.EngineCylinders) {
    result.cylinders = `${nhtsaData.EngineCylinders}-Cylinder`;
  }

  // Map Doors
  if (nhtsaData.Doors) {
    const doorsInt = parseInt(nhtsaData.Doors, 10);
    if (!isNaN(doorsInt)) {
      result.doors = doorsInt.toString();
    }
  }

  // Map Engine Composition
  const engineParts = [];
  if (nhtsaData.DisplacementL) {
    const disp = parseFloat(nhtsaData.DisplacementL);
    if (!isNaN(disp)) {
      engineParts.push(`${disp.toFixed(1)}L`);
    } else {
      engineParts.push(`${nhtsaData.DisplacementL}L`);
    }
  }
  
  if (result.fuel_type) engineParts.push(result.fuel_type);
  
  if (engineParts.length > 0) {
    result.engine = engineParts.join(' ');
  }

  return result;
}

export async function decodeSingleVin(vin: string): Promise<VinDecodeResult> {
  const { valid, error } = validateVin(vin);
  if (!valid) {
    return { vin, year: '', make: '', model: '', trim: '', body_type: '', transmission: '', fuel_type: '', drivetrain: '', cylinders: '', doors: '', engine: '', error };
  }

  try {
    const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`);
    if (!res.ok) {
      throw new Error('Failed to fetch from NHTSA API');
    }
    const data = await res.json();
    if (data && data.Results && data.Results.length > 0) {
      // Decode returns array of objects with Variable and Value. We need to convert it to a flat object to use mapNhtsaResult
      const flatObj: any = { VIN: vin };
      data.Results.forEach((item: any) => {
        // Variable name without spaces to match DecodeVINValuesBatch style keys if possible
        const key = item.Variable.replace(/[\s-]/g, '');
        // Special mapping since API returns slightly different keys in the get variables vs batch
        if (item.Variable === 'Model Year') flatObj.ModelYear = item.Value;
        if (item.Variable === 'Make') flatObj.Make = item.Value;
        if (item.Variable === 'Model') flatObj.Model = item.Value;
        if (item.Variable === 'Series') flatObj.Trim = item.Value; // Series -> Trim conceptually
        if (item.Variable === 'Trim') {
            if(!flatObj.Trim || flatObj.Trim === '') flatObj.Trim = item.Value;
        }
        if (item.Variable === 'Body Class') flatObj.BodyClass = item.Value;
        if (item.Variable === 'Transmission Style') flatObj.TransmissionStyle = item.Value;
        if (item.Variable === 'Drive Type') flatObj.DriveType = item.Value;
        if (item.Variable === 'Fuel Type - Primary') flatObj.FuelTypePrimary = item.Value;
        if (item.Variable === 'Engine Number of Cylinders') flatObj.EngineCylinders = item.Value;
        if (item.Variable === 'Doors') flatObj.Doors = item.Value;
        if (item.Variable === 'Displacement (L)') flatObj.DisplacementL = item.Value;
        if (item.Variable === 'Error Code') {
            flatObj.ErrorCode = item.Value;
            flatObj.ErrorText = item.Value;
        }
      });
      return mapNhtsaResult(flatObj);
    }
    return { vin, year: '', make: '', model: '', trim: '', body_type: '', transmission: '', fuel_type: '', drivetrain: '', cylinders: '', doors: '', engine: '', error: 'No results found.' };
  } catch (err: any) {
    return { vin, year: '', make: '', model: '', trim: '', body_type: '', transmission: '', fuel_type: '', drivetrain: '', cylinders: '', doors: '', engine: '', error: err.message || 'Unknown error' };
  }
}

export async function decodeBatchVins(vins: string[]): Promise<VinDecodeResult[]> {
  const validVins = vins.filter(v => validateVin(v).valid).map(v => v.toUpperCase().replace(/[^A-Z0-9]/g, ''));
  if (validVins.length === 0) return [];

  // API limit is 50 per batch. If they give us more, chunk it.
  const chunks = chunkArray(validVins, 50);
  const allResults: VinDecodeResult[] = [];

  for (const chunk of chunks) {
    const dataString = chunk.join(';') + ';';
    try {
      const formBody = 'format=json&data=' + encodeURIComponent(dataString);
      const res = await fetch('https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVINValuesBatch/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody,
      });
      
      if (!res.ok) {
        console.error('Batch error:', await res.text());
        continue;
      }
      
      const json = await res.json();
      if (json && json.Results) {
        allResults.push(...json.Results.map(mapNhtsaResult));
      }
    } catch (err) {
      console.error('Batch fetch error:', err);
    }
  }

  return allResults;
}

export interface SafetyRatingResult {
  overall: string;
  frontCrash: string;
  sideCrash: string;
  rollover: string;
  error?: string;
}

export async function getSafetyRating(year: string, make: string, model: string): Promise<SafetyRatingResult | null> {
  try {
    // Step 1: Find the internal VehicleId for this Year/Make/Model
    const vehicleRes = await fetch(`https://api.nhtsa.gov/SafetyRatings/modelyear/${year}/make/${make}/model/${model}`);
    if (!vehicleRes.ok) return null;
    
    const vehicleData = await vehicleRes.json();
    if (!vehicleData.Results || vehicleData.Results.length === 0) return null;
    
    const vehicleId = vehicleData.Results[0].VehicleId;
    if (!vehicleId) return null;

    // Step 2: Fetch the actual ratings
    const ratingRes = await fetch(`https://api.nhtsa.gov/SafetyRatings/VehicleId/${vehicleId}`);
    if (!ratingRes.ok) return null;
    
    const ratingData = await ratingRes.json();
    if (!ratingData.Results || ratingData.Results.length === 0) return null;
    
    const r = ratingData.Results[0];
    
    // Only return if there is actually an overall rating (NHTSA uses 'Not Rated' for missing ones)
    if (r.OverallRating === 'Not Rated') return null;

    return {
      overall: r.OverallRating,
      frontCrash: r.OverallFrontCrashRating,
      sideCrash: r.OverallSideCrashRating,
      rollover: r.RolloverRating,
    };
  } catch (err) {
    console.error('Failed to fetch safety rating:', err);
    return null;
  }
}
