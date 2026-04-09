'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Save, CheckCircle2 } from 'lucide-react';
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
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const u = (field: keyof SiteSettings, value: string | boolean | number) => {
    if (settings) setSettings({ ...settings, [field]: value });
  };

  if (loading || !settings) return <div className="text-center text-gray-400 py-12">Loading...</div>;

  return (
    <div className="max-w-3xl space-y-6">
      {saved && (
        <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg text-sm animate-fade-in">
          <CheckCircle2 size={16} /> Settings saved successfully!
        </div>
      )}

      {/* Contact */}
      <div className="admin-card">
        <h2 className="text-lg font-bold mb-4">Contact Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label><input className="input-field" value={settings.phone_number} onChange={(e) => u('phone_number', e.target.value)} /></div>
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">SMS Number</label><input className="input-field" value={settings.sms_number} onChange={(e) => u('sms_number', e.target.value)} /></div>
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contact Email</label><input className="input-field" value={settings.contact_email} onChange={(e) => u('contact_email', e.target.value)} /></div>
        </div>
      </div>

      {/* Location */}
      <div className="admin-card">
        <h2 className="text-lg font-bold mb-4">Location & Hours</h2>
        <div className="space-y-4">
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Lot Address</label><input className="input-field" value={settings.lot_address} onChange={(e) => u('lot_address', e.target.value)} /></div>
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hours</label><input className="input-field" value={settings.hours_of_operation} onChange={(e) => u('hours_of_operation', e.target.value)} /></div>
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Directions Note</label><input className="input-field" value={settings.directions_note || ''} onChange={(e) => u('directions_note', e.target.value)} placeholder="e.g. Next to Shell gas station" /></div>
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Google Maps Embed URL</label><input className="input-field" value={settings.google_maps_embed_url || ''} onChange={(e) => u('google_maps_embed_url', e.target.value)} placeholder="https://www.google.com/maps/embed?..." /></div>
        </div>
      </div>

      {/* Social */}
      <div className="admin-card">
        <h2 className="text-lg font-bold mb-4">Social Media</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Facebook URL</label><input className="input-field" value={settings.facebook_url || ''} onChange={(e) => u('facebook_url', e.target.value)} /></div>
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Instagram URL</label><input className="input-field" value={settings.instagram_url || ''} onChange={(e) => u('instagram_url', e.target.value)} /></div>
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">TikTok URL</label><input className="input-field" value={settings.tiktok_url || ''} onChange={(e) => u('tiktok_url', e.target.value)} placeholder="https://www.tiktok.com/@tyfix" /></div>
        </div>
      </div>

      {/* Pricing Tagline */}
      <div className="admin-card">
        <h2 className="text-lg font-bold mb-4">Pricing Display</h2>
        <label className="flex items-center gap-2 text-sm cursor-pointer mb-3">
          <input type="checkbox" checked={settings.show_price_tagline} onChange={(e) => u('show_price_tagline', e.target.checked)} className="w-4 h-4 accent-primary" />
          Show price tagline on site
        </label>
        <input className="input-field" value={settings.price_tagline_text} onChange={(e) => u('price_tagline_text', e.target.value)} />
      </div>

      {/* Reviews */}
      <div className="admin-card">
        <h2 className="text-lg font-bold mb-4">Reviews Section</h2>
        <label className="flex items-center gap-2 text-sm cursor-pointer mb-3">
          <input type="checkbox" checked={settings.show_reviews_section} onChange={(e) => u('show_reviews_section', e.target.checked)} className="w-4 h-4 accent-primary" />
          Show reviews section on homepage
        </label>
        <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Google Reviews Embed Code</label><textarea className="input-field resize-none" rows={3} value={settings.google_reviews_embed || ''} onChange={(e) => u('google_reviews_embed', e.target.value)} placeholder="Paste embed code here..." /></div>
      </div>

      {/* Site Experience */}
      <div className="admin-card">
        <h2 className="text-lg font-bold mb-4">Site Experience</h2>
        <div className="space-y-6">
          <div>
            <label className="flex items-center gap-2 text-sm cursor-pointer mb-1">
              <input 
                type="checkbox" 
                checked={settings.auto_carousel_enabled} 
                onChange={(e) => u('auto_carousel_enabled', e.target.checked)} 
                className="w-4 h-4 accent-primary" 
              />
              Enable auto-carousel for car thumbnails
            </label>
            <p className="text-xs text-gray-400">When enabled, car cards will smoothly cycle through all photos.</p>
          </div>

          {settings.auto_carousel_enabled && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-3">
                Transition Speed: {settings.auto_carousel_interval} Seconds
              </label>
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-400">1s</span>
                <input 
                  type="range" 
                  min={1} 
                  max={15} 
                  value={settings.auto_carousel_interval} 
                  onChange={(e) => u('auto_carousel_interval', parseInt(e.target.value))}
                  className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary" 
                />
                <span className="text-xs text-gray-400">15s</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Admin Performance Settings */}
      <div className="admin-card">
        <h2 className="text-lg font-bold mb-4">Dashboard Performance</h2>
        <p className="text-xs text-gray-400 mb-4">
          Limit how many records are loaded at once to keep the admin dashboard fast and to reduce database usage.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Max Leads to Load</label>
            <input 
              type="number" 
              className="input-field" 
              value={settings.admin_leads_per_page} 
              onChange={(e) => u('admin_leads_per_page', parseInt(e.target.value) || 10)} 
              min={10} 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Max Vehicles to Load</label>
            <input 
              type="number" 
              className="input-field" 
              value={settings.admin_inventory_per_page} 
              onChange={(e) => u('admin_inventory_per_page', parseInt(e.target.value) || 10)} 
              min={10} 
            />
          </div>
        </div>
      </div>

      {/* Bill of Sale Settings */}
      <div className="admin-card">
        <h2 className="text-lg font-bold mb-4">Bill of Sale Settings</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Dealer Printed Name</label>
            <input 
              className="input-field" 
              value={settings.dealer_printed_name || ''} 
              onChange={(e) => u('dealer_printed_name', e.target.value)} 
              placeholder="e.g. Elite Motors"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Dealer Signature</label>
            <p className="text-xs text-gray-400 mb-4">This signature will be automatically applied to the "Seller's Signature" line on all generated bills of sale.</p>
            <div className="max-w-md">
              <SignaturePad 
                initialSignature={settings.dealer_signature_data} 
                onSignatureChange={(v) => u('dealer_signature_data', v || '')} 
              />
            </div>
          </div>
        </div>
      </div>

      <button onClick={handleSave} disabled={saving} className="btn-admin"><Save size={16} /> {saving ? 'Saving...' : 'Save Settings'}</button>
    </div>
  );
}
