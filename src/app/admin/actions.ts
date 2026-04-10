'use server';

import { revalidateTag, revalidatePath } from 'next/cache';

/**
 * Programmatically clears specific Next.js cache tags.
 * Use this after updating the database to ensure public 
 * pages get the fresh data immediately.
 */
export async function clearCacheByKey(tag: string) {
  revalidateTag(tag);
}

/**
 * Emergency purge to wipe out all data caches.
 * Clears the full route cache and all specific tags.
 */
export async function clearAllCaches() {
  const tags = [
    'vehicles',
    'settings',
    'content',
    'testimonials',
    'sections',
    'blog',
    'leads'
  ];
  
  tags.forEach(tag => {
    revalidateTag(tag);
  });
  
  // Clear full route cache recursively for the entire public site
  revalidatePath('/', 'layout');
}
