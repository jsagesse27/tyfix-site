'use server';

import { createClient } from '@/lib/supabase/server';
import { decodeSingleVin } from '@/lib/vpic';
import type { VinExtractionItem } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function updateVinListItems(id: string, items: VinExtractionItem[]) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('vin_extraction_lists')
    .update({ items, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Failed to update VIN list:', error);
    return { success: false, error: error.message };
  }
  
  revalidatePath(`/admin/vin-extractor/${id}`);
  return { success: true };
}

export async function decodeVinExtracted(vin: string) {
  try {
    const result = await decodeSingleVin(vin);
    return {
      success: true,
      data: {
        make: result.make || 'Unknown',
        model: result.model || 'Unknown',
        year: result.year || 'Unknown',
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
