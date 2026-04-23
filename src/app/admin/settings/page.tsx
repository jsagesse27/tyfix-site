'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Save, CheckCircle2 } from 'lucide-react';
import { clearCacheByKey } from '../actions';
import type { SiteSettings } from '@/lib/types';
import SignaturePad from '@/components/admin/SignaturePad';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('site_settings').select('*').limit(1).single();
      setSettings(data as SiteSettings);
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    await supabase.from('site_settings').update({ ...settings, updated_at: new Date().toISOString() }).eq('id', settings.id);
    await clearCacheByKey('settings');
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const u = (field: keyof SiteSettings, value: string | boolean | number) => {
    if (settings) setSettings({ ...settings, [field]: value });
  };

  if (loading || !settings) return <div className="text-center text-gray-400 py-12">Loading...</div>;

  return (
    <div className="max-w-4xl space-y-12 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900">Admin Settings</h1>
        <button onClick={handleSave} disabled={saving} className="btn-admin shadow-lg px-8 py-3">
          {saving ? 'Saving...' : saved ? 'Settings Saved!' : <><Save size={18} /> Save All Changes</>}
        </button>
      </div>

      {saved && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-100 text-green-700 rounded-xl text-sm animate-fade-in shadow-sm">
          <CheckCircle2 size={18} /> All settings synchronized successfully. Cache has been revalidated.
        </div>
      )}

      {/* SECTION 1: BUSINESS PROFILE */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <div className="w-1.5 h-6 bg-primary rounded-full"></div>
          <h2 className="text-xl font-black text-gray-800 tracking-tight">Business Profile</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="admin-card">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Contact Info</h3>
            <div className="space-y-4">
              <div><label className="block text-xs font-bold text-gray-500 mb-1 font-mono uppercase tracking-tighter">Phone Number</label><input className="input-field" value={settings.phone_number} onChange={(e) => u('phone_number', e.target.value)} /></div>
              <div><label className="block text-xs font-bold text-gray-500 mb-1 font-mono uppercase tracking-tighter">SMS Number</label><input className="input-field" value={settings.sms_number} onChange={(e) => u('sms_number', e.target.value)} /></div>
              <div><label className="block text-xs font-bold text-gray-500 mb-1 font-mono uppercase tracking-tighter">Contact Email</label><input className="input-field" value={settings.contact_email} onChange={(e) => u('contact_email', e.target.value)} /></div>
            </div>
          </div>

          <div className="admin-card">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Location & Social</h3>
            <div className="space-y-4">
              <div><label className="block text-xs font-bold text-gray-500 mb-1 font-mono uppercase tracking-tighter">Lot Address</label><input className="input-field" value={settings.lot_address} onChange={(e) => u('lot_address', e.target.value)} /></div>
              <div><label className="block text-xs font-bold text-gray-500 mb-1 font-mono uppercase tracking-tighter">Facebook URL</label><input className="input-field" value={settings.facebook_url || ''} onChange={(e) => u('facebook_url', e.target.value)} /></div>
              <div><label className="block text-xs font-bold text-gray-500 mb-1 font-mono uppercase tracking-tighter">Instagram URL</label><input className="input-field" value={settings.instagram_url || ''} onChange={(e) => u('instagram_url', e.target.value)} /></div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: MARKETING & EXPERIENCE */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <div className="w-1.5 h-6 bg-primary rounded-full"></div>
          <h2 className="text-xl font-black text-gray-800 tracking-tight">Marketing & Experience</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="admin-card">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Display & Popups</h3>
            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-3 text-sm font-bold cursor-pointer group">
                  <input type="checkbox" checked={settings.show_price_tagline} onChange={(e) => u('show_price_tagline', e.target.checked)} className="w-4 h-4 accent-primary rounded" />
                  Show Price Tagline
                </label>
                {settings.show_price_tagline && <input className="input-field mt-2" value={settings.price_tagline_text} onChange={(e) => u('price_tagline_text', e.target.value)} />}
              </div>
              <div className="pt-4 border-t border-gray-50">
                <label className="flex items-center gap-3 text-sm font-bold cursor-pointer group">
                  <input type="checkbox" checked={settings.show_lead_popup} onChange={(e) => u('show_lead_popup', e.target.checked)} className="w-4 h-4 accent-primary rounded" />
                  Enable Lead Capture Popup
                </label>
                {settings.show_lead_popup && (
                  <div className="space-y-3 mt-3">
                    <input className="input-field" value={settings.lead_popup_title || ''} onChange={(e) => u('lead_popup_title', e.target.value)} placeholder="Headline" />
                    <input className="input-field" value={settings.lead_popup_text || ''} onChange={(e) => u('lead_popup_text', e.target.value)} placeholder="Description" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="admin-card">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Reviews & Media</h3>
            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-3 text-sm font-bold cursor-pointer">
                  <input type="checkbox" checked={settings.show_reviews_section} onChange={(e) => u('show_reviews_section', e.target.checked)} className="w-4 h-4 accent-primary rounded" />
                  Show Reviews Section
                </label>
                <textarea className="input-field mt-3 text-xs font-mono" rows={3} value={settings.google_reviews_embed || ''} onChange={(e) => u('google_reviews_embed', e.target.value)} placeholder="Embed Code" />
              </div>
              <div className="pt-4 border-t border-gray-50">
                 <label className="flex items-center gap-3 text-sm font-bold cursor-pointer">
                  <input type="checkbox" checked={settings.auto_carousel_enabled} onChange={(e) => u('auto_carousel_enabled', e.target.checked)} className="w-4 h-4 accent-primary rounded" />
                  Auto-Cycle Car Photos
                </label>
                {settings.auto_carousel_enabled && (
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest">
                      <span>Speed</span>
                      <span>{settings.auto_carousel_interval}s</span>
                    </div>
                    <input type="range" min={1} max={15} value={settings.auto_carousel_interval} onChange={(e) => u('auto_carousel_interval', parseInt(e.target.value))} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none accent-primary" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: SYSTEM & OPERATION */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <div className="w-1.5 h-6 bg-slate-800 rounded-full"></div>
          <h2 className="text-xl font-black text-gray-800 tracking-tight">System & Operations</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="admin-card">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Documents & Performance</h3>
            <div className="space-y-4">
              <div><label className="block text-xs font-bold text-gray-500 mb-1 font-mono uppercase tracking-tighter">Dealer Name (Prints on Bill)</label><input className="input-field" value={settings.dealer_printed_name || ''} onChange={(e) => u('dealer_printed_name', e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Leads/Page</label><input type="number" className="input-field h-8 text-xs" value={settings.admin_leads_per_page} onChange={(e) => u('admin_leads_per_page', parseInt(e.target.value) || 10)} /></div>
                <div><label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Cars/Page</label><input type="number" className="input-field h-8 text-xs" value={settings.admin_inventory_per_page} onChange={(e) => u('admin_inventory_per_page', parseInt(e.target.value) || 10)} /></div>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 mt-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Stored Dealer Signature</label>
                <SignaturePad initialSignature={settings.dealer_signature_data} onSignatureChange={(v) => u('dealer_signature_data', v || '')} />
              </div>
            </div>
          </div>

          <div className="admin-card border-red-100">
            <h3 className="text-sm font-black text-red-500 uppercase tracking-widest mb-4">Security</h3>
            <div className="space-y-4">
              <div><label className="block text-xs font-bold text-gray-500 mb-1 font-mono uppercase tracking-tighter">Lock Screen PIN</label><input type="password" maxLength={4} className="input-field border-red-100" value={settings.admin_pin || ''} onChange={(e) => u('admin_pin', e.target.value)} /></div>
              <div><label className="block text-xs font-bold text-gray-500 mb-1 font-mono uppercase tracking-tighter">Timeout (Minutes)</label><input type="number" className="input-field" value={settings.inactivity_timeout_minutes || 4320} onChange={(e) => u('inactivity_timeout_minutes', parseInt(e.target.value) || 4320)} /></div>
              <div className="p-3 bg-red-50/30 rounded-lg text-[10px] text-red-600 font-medium">
                PIN is required to unlock the dashboard after the specified inactivity timeout.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
