import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Vehicle } from '@/lib/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * 301 redirect from old UUID-based VDP URL to new slug-based URL.
 * Preserves SEO equity during the URL migration.
 */
export default async function OldVehiclePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from('vehicles')
    .select('id, slug')
    .eq('id', id)
    .single();

  if (!data) {
    // Vehicle not found — redirect to inventory
    redirect('/inventory');
  }

  const vehicle = data as Pick<Vehicle, 'id' | 'slug'>;

  if (vehicle.slug) {
    // 301 to new slug URL
    redirect(`/inventory/${vehicle.slug}`);
  } else {
    // No slug yet — redirect to inventory
    redirect('/inventory');
  }
}
