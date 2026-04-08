'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Save, ArrowLeft, Eye } from 'lucide-react';
import type { BlogPost } from '@/lib/types';

export default function AdminBlogEditorPage() {
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === 'new';
  const supabase = createClient();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image_url: '',
    author: 'TyFix Team',
    category: '',
    tags: '',
    is_published: false,
  });

  useEffect(() => {
    if (!isNew) loadPost();
  }, [params.id]);

  const loadPost = async () => {
    const { data } = await supabase.from('blog_posts').select('*').eq('id', params.id).single();
    if (data) {
      const p = data as BlogPost;
      setForm({
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt || '',
        content: p.content,
        featured_image_url: p.featured_image_url || '',
        author: p.author,
        category: p.category || '',
        tags: p.tags?.join(', ') || '',
        is_published: p.is_published,
      });
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 60);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      title: form.title,
      slug: form.slug || generateSlug(form.title),
      excerpt: form.excerpt || null,
      content: form.content,
      featured_image_url: form.featured_image_url || null,
      author: form.author,
      category: form.category || null,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      is_published: form.is_published,
      published_at: form.is_published ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    if (isNew) {
      const { data, error } = await supabase.from('blog_posts').insert(payload).select().single();
      if (!error && data) {
        router.push(`/admin/blog/${data.id}`);
        router.refresh();
      }
    } else {
      await supabase.from('blog_posts').update(payload).eq('id', params.id);
    }
    setSaving(false);
  };

  const u = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => router.push('/admin/blog')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-medium">
          <ArrowLeft size={16} /> Back to Blog
        </button>
        <div className="flex items-center gap-3">
          {!isNew && form.slug && (
            <a href={`/blog/${form.slug}`} target="_blank" className="btn-admin-outline text-sm">
              <Eye size={16} /> Preview
            </a>
          )}
          <button onClick={handleSave} disabled={saving} className="btn-admin">
            <Save size={16} /> {saving ? 'Saving...' : 'Save Post'}
          </button>
        </div>
      </div>

      {/* Title & Slug */}
      <div className="admin-card">
        <h2 className="text-lg font-bold mb-4">{isNew ? 'New Blog Post' : 'Edit Post'}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title *</label>
            <input
              className="input-field text-lg font-bold"
              value={form.title}
              onChange={(e) => {
                u('title', e.target.value);
                if (isNew) u('slug', generateSlug(e.target.value));
              }}
              placeholder="How to Buy a Cash Car in Brooklyn"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">URL Slug</label>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">/blog/</span>
              <input
                className="input-field flex-1"
                value={form.slug}
                onChange={(e) => u('slug', e.target.value)}
                placeholder="how-to-buy-a-cash-car"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Excerpt</label>
            <textarea
              className="input-field resize-none"
              rows={2}
              value={form.excerpt}
              onChange={(e) => u('excerpt', e.target.value)}
              placeholder="A brief summary for the blog index page..."
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="admin-card">
        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Content (HTML) *</label>
        <textarea
          className="input-field resize-none font-mono text-sm"
          rows={20}
          value={form.content}
          onChange={(e) => u('content', e.target.value)}
          placeholder="<h2>Introduction</h2><p>Your blog content here...</p>"
        />
        <p className="text-xs text-gray-400 mt-1">Write content using HTML tags. Use &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;a&gt; etc.</p>
      </div>

      {/* Metadata */}
      <div className="admin-card">
        <h2 className="text-lg font-bold mb-4">Metadata</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Author</label>
            <input className="input-field" value={form.author} onChange={(e) => u('author', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
            <input className="input-field" value={form.category} onChange={(e) => u('category', e.target.value)} placeholder="Car Buying Tips" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Featured Image URL</label>
            <input className="input-field" value={form.featured_image_url} onChange={(e) => u('featured_image_url', e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tags (comma separated)</label>
            <input className="input-field" value={form.tags} onChange={(e) => u('tags', e.target.value)} placeholder="brooklyn, cash cars, tips" />
          </div>
        </div>
        <div className="mt-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(e) => u('is_published', e.target.checked)}
              className="w-4 h-4 accent-primary rounded"
            />
            Publish this post
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button onClick={() => router.push('/admin/blog')} className="btn-admin-outline">Cancel</button>
        <button onClick={handleSave} disabled={saving} className="btn-admin">
          <Save size={16} /> {saving ? 'Saving...' : 'Save Post'}
        </button>
      </div>
    </div>
  );
}
