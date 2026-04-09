import { unstable_cache } from 'next/cache';
import { createPublicClient } from '@/lib/supabase/public';
import type { Vehicle, Testimonial, SiteSettings, SiteContent, HomepageSection, BlogPost } from '@/lib/types';

/**
 * Cached public data fetchers.
 *
 * These functions wrap Supabase queries in Next.js's `unstable_cache`,
 * which stores results on Vercel's edge for the specified `revalidate`
 * period. This means 1 Supabase read per cache window, no matter how
 * many visitors load the page.
 *
 * Tags allow on-demand revalidation from the admin dashboard later.
 */

// ── Active vehicle inventory (with photos) ────────────────────────
export const getCachedVehicles = unstable_cache(
  async () => {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from('vehicles')
      .select('*, photos:vehicle_photos(*)')
      .eq('listing_status', 'active')
      .order('sort_order');
    return (data as Vehicle[]) || [];
  },
  ['vehicles-active'],
  { revalidate: 300, tags: ['vehicles'] } // 5 minutes
);

// ── Single vehicle by slug ────────────────────────────────────────
export const getCachedVehicleBySlug = (slug: string) =>
  unstable_cache(
    async () => {
      const supabase = createPublicClient();
      const { data } = await supabase
        .from('vehicles')
        .select('*, photos:vehicle_photos(*)')
        .eq('slug', slug)
        .single();
      return (data as Vehicle) || null;
    },
    [`vehicle-${slug}`],
    { revalidate: 600, tags: ['vehicles'] } // 10 minutes
  )();

// ── Site settings ─────────────────────────────────────────────────
export const getCachedSettings = unstable_cache(
  async () => {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from('site_settings')
      .select('*')
      .limit(1)
      .single();
    return (data as SiteSettings) || null;
  },
  ['site-settings'],
  { revalidate: 3600, tags: ['settings'] } // 1 hour
);

// ── Bot settings ──────────────────────────────────────────────────
export const getCachedBotSettings = unstable_cache(
  async () => {
    // We use the admin client because bot_settings is restricted by RLS to admins only,
    // but caching it here safely makes it available to the Next.js backend without exposing it completely.
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('bot_settings')
      .select('*')
      .limit(1)
      .single();
    return (data as any) || null;
  },
  ['bot-settings'],
  { revalidate: 300, tags: ['settings'] } // 5 minutes (faster reval for chat tweaks)
);

// ── Site content (key-value CMS pairs) ────────────────────────────
export const getCachedContent = unstable_cache(
  async () => {
    const supabase = createPublicClient();
    const { data } = await supabase.from('site_content').select('*');
    const contentMap: Record<string, string> = {};
    if (data) {
      (data as SiteContent[]).forEach((c) => {
        contentMap[c.content_key] = c.content_value;
      });
    }
    return contentMap;
  },
  ['site-content'],
  { revalidate: 3600, tags: ['content'] } // 1 hour
);

// ── Testimonials ──────────────────────────────────────────────────
export const getCachedTestimonials = unstable_cache(
  async () => {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_visible', true)
      .order('sort_order');
    return (data as Testimonial[]) || [];
  },
  ['testimonials'],
  { revalidate: 3600, tags: ['testimonials'] } // 1 hour
);

// ── Sold count (for hero stats) ──────────────────────────────────
export const getCachedSoldCount = unstable_cache(
  async () => {
    const supabase = createPublicClient();
    const { count } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true })
      .eq('listing_status', 'sold');
    return count || 0;
  },
  ['sold-count'],
  { revalidate: 3600, tags: ['vehicles'] } // 1 hour
);

// ── Homepage sections ordering ───────────────────────────────────
export const getCachedHomepageSections = unstable_cache(
  async () => {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from('homepage_sections')
      .select('*')
      .order('sort_order');
    return (data as HomepageSection[]) || [];
  },
  ['homepage-sections'],
  { revalidate: 3600, tags: ['sections'] } // 1 hour
);

// ── Published blog posts ─────────────────────────────────────────
export const getCachedBlogPosts = unstable_cache(
  async () => {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false });
    return (data as BlogPost[]) || [];
  },
  ['blog-posts'],
  { revalidate: 600, tags: ['blog'] } // 10 minutes
);

// ── Single blog post by slug ─────────────────────────────────────
export const getCachedBlogPostBySlug = (slug: string) =>
  unstable_cache(
    async () => {
      const supabase = createPublicClient();
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();
      return (data as BlogPost) || null;
    },
    [`blog-${slug}`],
    { revalidate: 600, tags: ['blog'] } // 10 minutes
  )();
