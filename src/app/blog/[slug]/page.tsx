import { notFound } from 'next/navigation';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import MobileStickyBar from '@/components/public/MobileStickyBar';
import Breadcrumbs from '@/components/public/Breadcrumbs';
import { getCachedSettings, getCachedContent, getCachedBlogPostBySlug } from '@/lib/cache';
import type { Metadata } from 'next';
import { Calendar, User, ArrowLeft, Share2 } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getCachedBlogPostBySlug(slug);

  if (!post) return { title: 'Post Not Found' };

  return {
    title: post.title,
    description: post.excerpt || post.content.slice(0, 160),
    openGraph: {
      title: post.title,
      description: post.excerpt || post.content.slice(0, 160),
      type: 'article',
      url: `https://tyfixautosales.com/blog/${slug}`,
      images: post.featured_image_url ? [{ url: post.featured_image_url, alt: post.title }] : [],
      publishedTime: post.published_at || undefined,
      authors: [post.author],
    },
    alternates: { canonical: `https://tyfixautosales.com/blog/${slug}` },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;

  const [post, settings, contentMap] = await Promise.all([
    getCachedBlogPostBySlug(slug),
    getCachedSettings(),
    getCachedContent(),
  ]);

  if (!post) notFound();

  return (
    <div className="min-h-screen">
      <Navbar settings={settings} />

      <article className="pt-28 pb-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: 'Blog', href: '/blog' },
              { label: post.title, href: `/blog/${slug}` },
            ]}
          />

          {/* Header */}
          {post.category && (
            <span className="inline-block text-xs font-bold text-primary uppercase tracking-wider mb-4">
              {post.category}
            </span>
          )}
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-gray-400 mb-8">
            <div className="flex items-center gap-1">
              <User size={14} />
              {post.author}
            </div>
            {post.published_at && (
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                {new Date(post.published_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
            )}
          </div>

          {/* Featured Image */}
          {post.featured_image_url && (
            <div className="mb-10 rounded-2xl overflow-hidden">
              <img
                src={post.featured_image_url}
                alt={post.title}
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-lg prose-gray max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-10 pt-6 border-t border-gray-100">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Back to blog */}
          <div className="mt-10">
            <Link href="/blog" className="text-primary font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
              <ArrowLeft size={14} /> Back to Blog
            </Link>
          </div>
        </div>
      </article>

      <Footer settings={settings} content={contentMap} />
      <MobileStickyBar settings={settings} />
    </div>
  );
}
