import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import MobileStickyBar from '@/components/public/MobileStickyBar';
import Breadcrumbs from '@/components/public/Breadcrumbs';
import type { SiteSettings, SiteContent, BlogPost } from '@/lib/types';
import type { Metadata } from 'next';
import { Calendar, ArrowRight, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog — Car Buying Tips & Guides | TyFix Auto Sales',
  description:
    'Read expert car buying tips, guides, and industry insights from TyFix Auto Sales. Learn how to buy smart, maintain your vehicle, and save money.',
  alternates: { canonical: 'https://tyfixautosales.com/blog' },
};

export const revalidate = 600; // ISR: 10 minutes

export default async function BlogPage() {
  const supabase = await createClient();
  const [settingsRes, contentRes, postsRes] = await Promise.all([
    supabase.from('site_settings').select('*').limit(1).single(),
    supabase.from('site_content').select('*'),
    supabase.from('blog_posts').select('*').eq('is_published', true).order('published_at', { ascending: false }),
  ]);

  const settings = settingsRes.data as SiteSettings;
  const posts = (postsRes.data as BlogPost[]) || [];
  const contentMap: Record<string, string> = {};
  if (contentRes.data) (contentRes.data as SiteContent[]).forEach(c => { contentMap[c.content_key] = c.content_value; });

  return (
    <div className="min-h-screen">
      <Navbar settings={settings} />

      <section className="pt-28 pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: 'Blog', href: '/blog' }]} />

          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              TyFix Blog
            </h1>
            <p className="text-gray-500 text-lg max-w-xl">
              Car buying tips, industry insights, and behind-the-scenes looks at TyFix Auto Sales.
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="py-20 text-center">
              <BookOpen size={48} className="text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-400 mb-2">Coming Soon</h2>
              <p className="text-gray-400">
                We&apos;re working on helpful articles for car buyers. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group block bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  {post.featured_image_url && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={post.featured_image_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    {post.category && (
                      <span className="text-xs font-bold text-primary uppercase tracking-wider">
                        {post.category}
                      </span>
                    )}
                    <h2 className="text-lg font-black text-gray-900 mt-2 mb-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-gray-500 text-sm line-clamp-2 mb-4">{post.excerpt}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Calendar size={14} />
                        {post.published_at
                          ? new Date(post.published_at).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'Draft'}
                      </div>
                      <span className="text-primary font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                        Read <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer settings={settings} content={contentMap} />
      <MobileStickyBar settings={settings} />
    </div>
  );
}
