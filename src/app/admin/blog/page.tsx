'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Plus, Edit, Eye, EyeOff, Trash2 } from 'lucide-react';
import type { BlogPost } from '@/lib/types';

export default function AdminBlogPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });
    setPosts((data as BlogPost[]) || []);
    setLoading(false);
  };

  const togglePublish = async (post: BlogPost) => {
    await supabase.from('blog_posts').update({
      is_published: !post.is_published,
      published_at: !post.is_published ? new Date().toISOString() : null,
    }).eq('id', post.id);
    loadPosts();
  };

  const deletePost = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    await supabase.from('blog_posts').delete().eq('id', id);
    loadPosts();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Blog Posts</h2>
          <p className="text-sm text-gray-400 mt-1">{posts.length} post{posts.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/admin/blog/new" className="btn-admin">
          <Plus size={16} /> New Post
        </Link>
      </div>

      {loading ? (
        <div className="admin-card text-center py-12 text-gray-400">Loading...</div>
      ) : posts.length === 0 ? (
        <div className="admin-card text-center py-12">
          <p className="text-gray-400 mb-4">No blog posts yet</p>
          <Link href="/admin/blog/new" className="btn-admin">
            <Plus size={16} /> Create Your First Post
          </Link>
        </div>
      ) : (
        <div className="admin-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-xs font-bold text-gray-500 uppercase border-b border-gray-100">
                <th className="py-3 px-4 text-left">Title</th>
                <th className="py-3 px-4 text-left">Category</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-3 px-4">
                    <Link href={`/admin/blog/${post.id}`} className="font-bold text-gray-900 hover:text-primary transition-colors">
                      {post.title}
                    </Link>
                    {post.excerpt && <p className="text-xs text-gray-400 mt-1 line-clamp-1">{post.excerpt}</p>}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">{post.category || '—'}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${post.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {post.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-400">
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString()
                      : new Date(post.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/blog/${post.id}`} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                        <Edit size={16} />
                      </Link>
                      <button onClick={() => togglePublish(post)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                        {post.is_published ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button onClick={() => deletePost(post.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
