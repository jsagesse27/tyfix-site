'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Save, Trash2, Star, Eye, EyeOff } from 'lucide-react';
import { clearCacheByKey } from '../actions';
import type { Testimonial } from '@/lib/types';

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', star_rating: 5, review_text: '', date_label: '' });
  const supabase = createClient();

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('testimonials').select('*').order('sort_order');
    setTestimonials((data as Testimonial[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addNew = async () => {
    await supabase.from('testimonials').insert({
      name: form.name || 'New Review', star_rating: form.star_rating,
      review_text: form.review_text || 'Review text here.', date_label: form.date_label || null,
      is_visible: true, sort_order: testimonials.length,
    });
    setForm({ name: '', star_rating: 5, review_text: '', date_label: '' });
    await clearCacheByKey('testimonials');
    load();
  };

  const update = async (id: string, fields: Partial<Testimonial>) => {
    await supabase.from('testimonials').update(fields).eq('id', id);
    await clearCacheByKey('testimonials');
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return;
    await supabase.from('testimonials').delete().eq('id', id);
    await clearCacheByKey('testimonials');
    load();
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="admin-card">
        <h2 className="text-lg font-bold mb-4">Add Testimonial</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input className="input-field" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input-field" placeholder="Date (e.g. March 2026)" value={form.date_label} onChange={(e) => setForm({ ...form, date_label: e.target.value })} />
        </div>
        <div className="mt-3 flex gap-1">
          {[1,2,3,4,5].map((n) => (
            <button key={n} onClick={() => setForm({ ...form, star_rating: n })}>
              <Star size={24} fill={n <= form.star_rating ? '#F59E0B' : 'none'} className={n <= form.star_rating ? 'text-yellow-500' : 'text-gray-200'} />
            </button>
          ))}
        </div>
        <textarea className="input-field mt-3 resize-none" rows={3} placeholder="Review text..." value={form.review_text} onChange={(e) => setForm({ ...form, review_text: e.target.value })} />
        <button onClick={addNew} className="btn-admin mt-3"><Plus size={16} /> Add</button>
      </div>

      {loading ? <p className="text-center text-gray-400 py-12">Loading...</p> : testimonials.length === 0 ? <p className="text-center text-gray-400 py-12">No testimonials yet.</p> : (
        <div className="space-y-4">
          {testimonials.map((t) => (
            <div key={t.id} className={`admin-card ${!t.is_visible ? 'opacity-50' : ''}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-gray-900">{t.name}</h3>
                    <div className="flex gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < t.star_rating ? '#F59E0B' : 'none'} className={i < t.star_rating ? 'text-yellow-500' : 'text-gray-200'} />)}</div>
                  </div>
                  <p className="text-gray-600 text-sm italic">&ldquo;{t.review_text}&rdquo;</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => update(t.id, { is_visible: !t.is_visible })} className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100">{t.is_visible ? <Eye size={16} /> : <EyeOff size={16} />}</button>
                  <button onClick={() => remove(t.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
