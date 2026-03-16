'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Save, CheckCircle2 } from 'lucide-react';
import type { SiteContent } from '@/lib/types';

const CONTENT_SECTIONS = [
  // Hero Section
  { key: 'homepage_tagline', label: 'Hero: Tagline (Above Headline)', rows: 1 },
  { key: 'homepage_headline', label: 'Hero: Main Headline', rows: 1 },
  { key: 'homepage_subheadline', label: 'Hero: Sub-headline', rows: 2 },
  { key: 'hero_image_url', label: 'Hero: Background Image URL', rows: 1 },
  
  // Hero Stats
  { key: 'hero_stat_1_label', label: 'Hero Stat 1: Label (e.g. Cars Sold)', rows: 1 },
  { key: 'hero_stat_1_base', label: 'Hero Stat 1: Base Count (Number only)', rows: 1 },
  { key: 'hero_stat_2_label', label: 'Hero Stat 2: Label (e.g. Happy Clients)', rows: 1 },
  { key: 'hero_stat_2_value', label: 'Hero Stat 2: Value (e.g. 100k+)', rows: 1 },
  { key: 'hero_stat_3_label', label: 'Hero Stat 3: Label (e.g. Cash-Only)', rows: 1 },
  { key: 'hero_stat_3_value', label: 'Hero Stat 3: Value (e.g. 100%)', rows: 1 },

  // Trust Badges
  { key: 'trust_badge_1_title', label: 'Trust Badge 1: Title', rows: 1 },
  { key: 'trust_badge_1_desc', label: 'Trust Badge 1: Description', rows: 2 },
  { key: 'trust_badge_2_title', label: 'Trust Badge 2: Title', rows: 1 },
  { key: 'trust_badge_2_desc', label: 'Trust Badge 2: Description', rows: 2 },
  { key: 'trust_badge_3_title', label: 'Trust Badge 3: Title', rows: 1 },
  { key: 'trust_badge_3_desc', label: 'Trust Badge 3: Description', rows: 2 },

  // Cash Advantage / About
  { key: 'about_title', label: 'About: Section Title', rows: 1 },
  { key: 'about_text', label: 'About: Main Text Paragraph', rows: 3 },
  { key: 'cash_advantage_1_title', label: 'Cash Advantage 1: Title', rows: 1 },
  { key: 'cash_advantage_1_desc', label: 'Cash Advantage 1: Description', rows: 2 },
  { key: 'cash_advantage_2_title', label: 'Cash Advantage 2: Title', rows: 1 },
  { key: 'cash_advantage_2_desc', label: 'Cash Advantage 2: Description', rows: 2 },
  { key: 'cash_advantage_3_title', label: 'Cash Advantage 3: Title', rows: 1 },
  { key: 'cash_advantage_3_desc', label: 'Cash Advantage 3: Description', rows: 2 },
  { key: 'cash_advantage_4_title', label: 'Cash Advantage 4: Title', rows: 1 },
  { key: 'cash_advantage_4_desc', label: 'Cash Advantage 4: Description', rows: 2 },

  // Footer
  { key: 'footer_about', label: 'Footer: About TyFix Text', rows: 2 },
];

export default function AdminContentPage() {
  const [content, setContent] = useState<Record<string, SiteContent>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('site_content').select('*');
      const map: Record<string, SiteContent> = {};
      if (data) (data as SiteContent[]).forEach((c) => { map[c.content_key] = c; });
      setContent(map);
      setLoading(false);
    })();
  }, []);

  const updateValue = (key: string, value: string) => {
    setContent((prev) => ({
      ...prev,
      [key]: { ...prev[key], content_value: value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    const updates = Object.values(content).map((c) =>
      supabase.from('site_content').update({ content_value: c.content_value, updated_at: new Date().toISOString() }).eq('id', c.id)
    );
    await Promise.all(updates);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) return <div className="text-center text-gray-400 py-12">Loading...</div>;

  return (
    <div className="max-w-3xl space-y-6">
      {saved && (
        <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg text-sm animate-fade-in">
          <CheckCircle2 size={16} /> Content saved!
        </div>
      )}

      <p className="text-sm text-gray-500">Edit all website text from here. Changes reflect immediately on the live site.</p>

      {CONTENT_SECTIONS.map((section) => (
        <div key={section.key} className="admin-card">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{section.label}</label>
          {section.rows > 1 ? (
            <textarea
              className="input-field resize-none"
              rows={section.rows}
              value={content[section.key]?.content_value || ''}
              onChange={(e) => updateValue(section.key, e.target.value)}
            />
          ) : (
            <input
              className="input-field"
              value={content[section.key]?.content_value || ''}
              onChange={(e) => updateValue(section.key, e.target.value)}
            />
          )}
        </div>
      ))}

      <button onClick={handleSave} disabled={saving} className="btn-admin">
        <Save size={16} /> {saving ? 'Saving...' : 'Save All Content'}
      </button>
    </div>
  );
}
