'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Save, CheckCircle2, GripVertical, Eye, EyeOff, Lock } from 'lucide-react';
import { Reorder } from 'framer-motion';
import { clearCacheByKey } from '../actions';
import type { HomepageSection } from '@/lib/types';

export default function AdminSectionsPage() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('homepage_sections')
        .select('*')
        .order('sort_order');
      setSections((data as HomepageSection[]) || []);
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const now = new Date().toISOString();

    // Update each section's sort_order and visibility
    const updates = sections.map((s, i) =>
      supabase
        .from('homepage_sections')
        .update({ sort_order: i, is_visible: s.is_visible, updated_at: now })
        .eq('id', s.id)
    );

    await Promise.all(updates);
    await clearCacheByKey('sections');
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const toggleVisibility = (index: number) => {
    // Don't allow toggling hero
    if (sections[index].id === 'hero') return;
    const updated = [...sections];
    updated[index] = { ...updated[index], is_visible: !updated[index].is_visible };
    setSections(updated);
  };

  // ───── Drag & Drop ─────

  // Section descriptions for the admin UI
  const descriptions: Record<string, string> = {
    hero: 'Main banner with headline, stats, and CTA',
    trust_badges: '"Buy With Confidence", "No Hidden Fees", "Drive Today" badges',
    featured_vehicles: 'Grid of featured vehicle cards with photos and prices',
    request_vehicle: '"Don\'t see what you\'re looking for?" CTA with vehicle request form',
    cash_advantage: '"Why Cash?" section with benefits list and photo',
    cash_calculator: 'Interactive dealer fees vs. cash price comparison calculator',
    autoconnect: 'AutoConnect vehicle sourcing program signup',
    testimonials: 'Customer reviews and star ratings carousel',
    social_bridge: 'Instagram and Facebook follow CTAs',
    sell_your_car: '"Sell Us Your Car" CTA linking to trade-in page',
    contact: 'Location, hours, phone, map, and booking buttons',
  };

  // Section icons/emojis for quick visual identification
  const icons: Record<string, string> = {
    hero: '🏠',
    trust_badges: '🛡️',
    featured_vehicles: '🚗',
    request_vehicle: '🔍',
    cash_advantage: '💰',
    cash_calculator: '🧮',
    autoconnect: '🔗',
    testimonials: '⭐',
    social_bridge: '📱',
    sell_your_car: '💵',
    contact: '📍',
  };

  if (loading) {
    return <div className="text-center text-gray-400 py-12">Loading sections...</div>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      {saved && (
        <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg text-sm animate-fade-in">
          <CheckCircle2 size={16} /> Section layout saved! Changes will appear on the next page load.
        </div>
      )}

      <div className="admin-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold">Homepage Layout</h2>
            <p className="text-sm text-gray-500 mt-1">
              Drag to reorder sections. Toggle visibility with the eye icon.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {(() => {
            const heroSection = sections.find(s => s.id === 'hero');
            const draggableSections = sections.filter(s => s.id !== 'hero');

            const handleReorder = (newOrder: HomepageSection[]) => {
              if (heroSection) {
                setSections([heroSection, ...newOrder]);
              } else {
                setSections(newOrder);
              }
            };
            
            return (
              <>
                {/* Hero section rendered fixed outside Reorder Group */}
                {heroSection && (
                  <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border transition-all duration-200 bg-gray-50 border-gray-200">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 flex-shrink-0 w-8 sm:w-auto text-gray-300">
                      <Lock size={18} />
                    </div>
                    <span className="text-xl flex-shrink-0">{icons[heroSection.id] || '📦'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900">{heroSection.label}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Pinned</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{descriptions[heroSection.id] || ''}</p>
                    </div>
                    <button disabled className="flex-shrink-0 p-2 rounded-lg text-gray-300">
                      <Eye size={18} />
                    </button>
                  </div>
                )}
                
                <Reorder.Group axis="y" values={draggableSections} onReorder={handleReorder} className="space-y-2">
                  {draggableSections.map((section, index) => {
                    const realIndex = heroSection ? index + 1 : index;
                    return (
                      <Reorder.Item
                        key={section.id}
                        value={section}
                        className={`
                          flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border transition-all duration-200
                          bg-white border-gray-100 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-gray-200
                          ${!section.is_visible ? 'opacity-50' : ''}
                        `}
                      >
                        {/* Drag Handle */}
                        <div className="flex items-center justify-center flex-shrink-0 w-8 sm:w-auto text-gray-400">
                          <GripVertical size={18} />
                        </div>

                        {/* Icon */}
                        <span className="text-xl flex-shrink-0">{icons[section.id] || '📦'}</span>

                        {/* Label & Description */}
                        <div className="flex-1 min-w-0 select-none">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold text-sm ${!section.is_visible ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                              {section.label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5 truncate pointer-events-none">
                            {descriptions[section.id] || ''}
                          </p>
                        </div>

                        {/* Visibility Toggle */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleVisibility(realIndex);
                          }}
                          className={`
                            flex-shrink-0 p-2 rounded-lg transition-colors cursor-pointer relative z-10
                            ${section.is_visible ? 'text-green-600 hover:bg-green-50' : 'text-red-400 hover:bg-red-50'}
                          `}
                          title={section.is_visible ? 'Click to hide' : 'Click to show'}
                        >
                          {section.is_visible ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                      </Reorder.Item>
                    );
                  })}
                </Reorder.Group>
              </>
            );
          })()}
        </div>
      </div>

      <button onClick={handleSave} disabled={saving} className="btn-admin">
        <Save size={16} /> {saving ? 'Saving...' : 'Save Layout'}
      </button>
    </div>
  );
}
