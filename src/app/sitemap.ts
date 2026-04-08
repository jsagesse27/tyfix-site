import type { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://tyfixautosales.com';
  const now = new Date().toISOString();

  // Fetch all active vehicles for VDP entries
  const supabase = await createClient();
  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('id, slug, year, make, model, updated_at, listing_status')
    .eq('listing_status', 'active');

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/inventory`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/trade-in`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/visit-us`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/autoconnect`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    // Keyword landing pages
    {
      url: `${baseUrl}/cash-cars-brooklyn`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/used-cars-under-5000-brooklyn`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/no-credit-check-cars-brooklyn`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/affordable-cars-nyc`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.6,
    },
  ];

  // Dynamic VDP pages
  const vehiclePages: MetadataRoute.Sitemap = (vehicles || []).map((v) => {
    // Use slug if available, fallback to ID
    const path = v.slug
      ? `/inventory/${v.slug}`
      : `/vehicles/${v.id}`;

    return {
      url: `${baseUrl}${path}`,
      lastModified: v.updated_at || now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    };
  });

  // Fetch published blog posts
  const { data: blogPosts } = await supabase
    .from('blog_posts')
    .select('slug, updated_at')
    .eq('is_published', true);

  const blogPages: MetadataRoute.Sitemap = (blogPosts || []).map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updated_at || now,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...vehiclePages, ...blogPages];
}
