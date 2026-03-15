'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Save, ArrowLeft, Upload, X, Plus, Trash2, ImagePlus } from 'lucide-react';
import type { Vehicle, VehiclePhoto } from '@/lib/types';
import {
  YEARS, MAKES, BODY_TYPES, TRANSMISSIONS, FUEL_TYPES,
  DRIVETRAINS, CYLINDERS, EXTERIOR_COLORS, INTERIOR_COLORS,
  DOORS, FEATURED_LABELS, LISTING_STATUSES,
} from '@/lib/constants';

// Reusable dropdown component
function SelectField({ label, value, onChange, options, required }: {
  label: string; value: string; onChange: (v: string) => void;
  options: string[] | { value: string; label: string }[]; required?: boolean;
}) {
  const opts = typeof options[0] === 'string'
    ? (options as string[]).map((o) => ({ value: o, label: o }))
    : (options as { value: string; label: string }[]);
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{label}{required && ' *'}</label>
      <select className="input-field" value={value} onChange={(e) => onChange(e.target.value)}>
        {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// Batch upload row type
interface BatchRow {
  id: string;
  year: string; make: string; model: string; trim: string;
  mileage: string; price: string; body_type: string; transmission: string;
  fuel_type: string; drivetrain: string; exterior_color: string;
  listing_status: string;
}

const emptyBatchRow = (): BatchRow => ({
  id: crypto.randomUUID(),
  year: '2012', make: 'Honda', model: '', trim: '',
  mileage: '100000', price: '5000', body_type: 'Sedan', transmission: 'Automatic',
  fuel_type: 'Gasoline', drivetrain: 'FWD', exterior_color: '',
  listing_status: 'active',
});

export default function EditVehiclePage() {
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === 'new';
  const isBatch = params.id === 'batch';
  const supabase = createClient();

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState<VehiclePhoto[]>([]);

  // Batch state
  const [batchRows, setBatchRows] = useState<BatchRow[]>([emptyBatchRow(), emptyBatchRow(), emptyBatchRow()]);
  const [batchSaved, setBatchSaved] = useState(0);
  const [batchFiles, setBatchFiles] = useState<Record<string, File[]>>({});
  const [batchStatus, setBatchStatus] = useState('');

  const addBatchPhotos = (rowId: string, files: FileList | null) => {
    if (!files) return;
    setBatchFiles((prev) => ({
      ...prev,
      [rowId]: [...(prev[rowId] || []), ...Array.from(files)],
    }));
  };

  const removeBatchPhoto = (rowId: string, fileIndex: number) => {
    setBatchFiles((prev) => ({
      ...prev,
      [rowId]: (prev[rowId] || []).filter((_, i) => i !== fileIndex),
    }));
  };

  // Single vehicle form
  const [form, setForm] = useState({
    year: '2012', make: 'Honda', model: '', trim: '', mileage: 0, price: 0,
    cash_price: null as number | null, internet_price: null as number | null, msrp: null as number | null,
    stock_number: '', vin: '', body_type: 'Sedan', exterior_color: '', interior_color: '',
    transmission: 'Automatic', engine: '', fuel_type: 'Gasoline', drivetrain: 'FWD',
    cylinders: '', doors: 4, condition_notes: '',
    inspection_status: 'pass' as string | null, history_report_url: '',
    listing_status: 'active', featured_label: '',
    show_cash_price: false, show_internet_price: false, show_msrp: false, show_call_for_price: false,
    sort_order: 0,
  });

  useEffect(() => {
    if (!isNew && !isBatch) loadVehicle();
  }, [params.id]);

  const loadVehicle = async () => {
    const { data } = await supabase.from('vehicles').select('*, photos:vehicle_photos(*)').eq('id', params.id).single();
    if (data) {
      const v = data as Vehicle;
      setForm({
        year: v.year, make: v.make, model: v.model, trim: v.trim || '',
        mileage: v.mileage, price: v.price,
        cash_price: v.cash_price, internet_price: v.internet_price, msrp: v.msrp,
        stock_number: v.stock_number || '', vin: v.vin || '',
        body_type: v.body_type, exterior_color: v.exterior_color || '',
        interior_color: v.interior_color || '', transmission: v.transmission,
        engine: v.engine || '', fuel_type: v.fuel_type || 'Gasoline',
        drivetrain: v.drivetrain || 'FWD', cylinders: v.cylinders || '', doors: v.doors || 4,
        condition_notes: v.condition_notes || '',
        inspection_status: v.inspection_status, history_report_url: v.history_report_url || '',
        listing_status: v.listing_status, featured_label: v.featured_label || '',
        show_cash_price: v.show_cash_price, show_internet_price: v.show_internet_price,
        show_msrp: v.show_msrp, show_call_for_price: v.show_call_for_price,
        sort_order: v.sort_order,
      });
      setPhotos(v.photos?.sort((a, b) => a.sort_order - b.sort_order) || []);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      ...form,
      trim: form.trim || null,
      cash_price: form.cash_price || null,
      internet_price: form.internet_price || null,
      msrp: form.msrp || null,
      stock_number: form.stock_number || null,
      vin: form.vin || null,
      exterior_color: form.exterior_color || null,
      interior_color: form.interior_color || null,
      engine: form.engine || null,
      cylinders: form.cylinders || null,
      condition_notes: form.condition_notes || null,
      history_report_url: form.history_report_url || null,
      featured_label: form.featured_label || null,
      updated_at: new Date().toISOString(),
    };

    if (isNew) {
      const { data, error } = await supabase.from('vehicles').insert(payload).select().single();
      if (!error && data) {
        router.push(`/admin/inventory/${data.id}`);
        router.refresh();
      }
    } else {
      await supabase.from('vehicles').update(payload).eq('id', params.id);
    }
    setSaving(false);
  };

  // Batch save
  const handleBatchSave = async () => {
    setSaving(true);
    setBatchSaved(0);
    const valid = batchRows.filter((r) => r.model.trim() !== '');
    for (let i = 0; i < valid.length; i++) {
      const r = valid[i];
      setBatchStatus(`Saving ${r.year} ${r.make} ${r.model}...`);
      const { data, error } = await supabase.from('vehicles').insert({
        year: r.year, make: r.make, model: r.model, trim: r.trim || null,
        mileage: parseInt(r.mileage) || 0, price: parseInt(r.price) || 0,
        body_type: r.body_type, transmission: r.transmission,
        fuel_type: r.fuel_type, drivetrain: r.drivetrain,
        exterior_color: r.exterior_color || null,
        listing_status: r.listing_status,
      }).select().single();

      // Upload photos for this vehicle
      if (!error && data) {
        const rowFiles = batchFiles[r.id] || [];
        if (rowFiles.length > 0) {
          setBatchStatus(`Uploading ${rowFiles.length} photo${rowFiles.length > 1 ? 's' : ''} for ${r.year} ${r.make} ${r.model}...`);
          for (let j = 0; j < rowFiles.length; j++) {
            const file = rowFiles[j];
            const fileName = `${data.id}/${Date.now()}_${file.name}`;
            const { error: uploadError } = await supabase.storage.from('vehicle-photos').upload(fileName, file);
            if (!uploadError) {
              const { data: urlData } = supabase.storage.from('vehicle-photos').getPublicUrl(fileName);
              await supabase.from('vehicle_photos').insert({
                vehicle_id: data.id,
                storage_path: fileName,
                public_url: urlData.publicUrl,
                sort_order: j,
              });
            }
          }
        }
      }
      setBatchSaved(i + 1);
    }
    setBatchStatus('');
    setSaving(false);
    router.push('/admin/inventory');
    router.refresh();
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || isNew || isBatch) return;
    setUploading(true);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileName = `${params.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from('vehicle-photos').upload(fileName, file);
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('vehicle-photos').getPublicUrl(fileName);
        await supabase.from('vehicle_photos').insert({
          vehicle_id: params.id,
          storage_path: fileName,
          public_url: urlData.publicUrl,
          sort_order: photos.length + i,
        });
      }
    }
    await loadVehicle();
    setUploading(false);
  };

  const deletePhoto = async (photo: VehiclePhoto) => {
    await supabase.storage.from('vehicle-photos').remove([photo.storage_path]);
    await supabase.from('vehicle_photos').delete().eq('id', photo.id);
    setPhotos(photos.filter((p) => p.id !== photo.id));
  };

  const u = (field: string, value: string | number | boolean | null) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const updateBatchRow = (id: string, field: keyof BatchRow, value: string) =>
    setBatchRows((prev) => prev.map((r) => r.id === id ? { ...r, [field]: value } : r));

  // ===================== BATCH MODE =====================
  if (isBatch) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => router.push('/admin/inventory')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-medium">
            <ArrowLeft size={16} /> Back to Inventory
          </button>
          <button onClick={handleBatchSave} disabled={saving} className="btn-admin">
            <Save size={16} /> {saving ? (batchStatus || `Saving ${batchSaved}/${batchRows.filter(r => r.model).length}...`) : `Save ${batchRows.filter(r => r.model).length} Vehicles`}
          </button>
        </div>

        <div className="admin-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold">Batch Add Vehicles</h2>
              <p className="text-xs text-gray-400 mt-1">Fill in the rows below. Only rows with a model name will be saved. Add more rows with the button below.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-bold text-gray-500 uppercase border-b border-gray-100">
                  <th className="py-2 px-2 text-left">Year</th>
                  <th className="py-2 px-2 text-left">Make</th>
                  <th className="py-2 px-2 text-left">Model *</th>
                  <th className="py-2 px-2 text-left">Trim</th>
                  <th className="py-2 px-2 text-left">Price</th>
                  <th className="py-2 px-2 text-left">Mileage</th>
                  <th className="py-2 px-2 text-left">Body</th>
                  <th className="py-2 px-2 text-left">Trans.</th>
                  <th className="py-2 px-2 text-left">Fuel</th>
                  <th className="py-2 px-2 text-left">Drive</th>
                  <th className="py-2 px-2 text-left">Color</th>
                  <th className="py-2 px-2 text-left">Status</th>
                  <th className="py-2 px-2 text-left">Photos</th>
                  <th className="py-2 px-2"></th>
                </tr>
              </thead>
              <tbody>
                {batchRows.map((row) => (
                  <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-1 px-1">
                      <select className="input-field !py-1.5 text-xs" value={row.year} onChange={(e) => updateBatchRow(row.id, 'year', e.target.value)}>
                        {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </td>
                    <td className="py-1 px-1">
                      <select className="input-field !py-1.5 text-xs" value={row.make} onChange={(e) => updateBatchRow(row.id, 'make', e.target.value)}>
                        {MAKES.map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </td>
                    <td className="py-1 px-1">
                      <input className="input-field !py-1.5 text-xs" value={row.model} onChange={(e) => updateBatchRow(row.id, 'model', e.target.value)} placeholder="Civic" />
                    </td>
                    <td className="py-1 px-1">
                      <input className="input-field !py-1.5 text-xs" value={row.trim} onChange={(e) => updateBatchRow(row.id, 'trim', e.target.value)} placeholder="LX" />
                    </td>
                    <td className="py-1 px-1">
                      <input className="input-field !py-1.5 text-xs" type="number" value={row.price} onChange={(e) => updateBatchRow(row.id, 'price', e.target.value)} />
                    </td>
                    <td className="py-1 px-1">
                      <input className="input-field !py-1.5 text-xs" type="number" value={row.mileage} onChange={(e) => updateBatchRow(row.id, 'mileage', e.target.value)} />
                    </td>
                    <td className="py-1 px-1">
                      <select className="input-field !py-1.5 text-xs" value={row.body_type} onChange={(e) => updateBatchRow(row.id, 'body_type', e.target.value)}>
                        {BODY_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </td>
                    <td className="py-1 px-1">
                      <select className="input-field !py-1.5 text-xs" value={row.transmission} onChange={(e) => updateBatchRow(row.id, 'transmission', e.target.value)}>
                        {TRANSMISSIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </td>
                    <td className="py-1 px-1">
                      <select className="input-field !py-1.5 text-xs" value={row.fuel_type} onChange={(e) => updateBatchRow(row.id, 'fuel_type', e.target.value)}>
                        {FUEL_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </td>
                    <td className="py-1 px-1">
                      <select className="input-field !py-1.5 text-xs" value={row.drivetrain} onChange={(e) => updateBatchRow(row.id, 'drivetrain', e.target.value)}>
                        {DRIVETRAINS.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </td>
                    <td className="py-1 px-1">
                      <select className="input-field !py-1.5 text-xs" value={row.exterior_color} onChange={(e) => updateBatchRow(row.id, 'exterior_color', e.target.value)}>
                        <option value="">—</option>
                        {EXTERIOR_COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </td>
                    <td className="py-1 px-1">
                      <select className="input-field !py-1.5 text-xs" value={row.listing_status} onChange={(e) => updateBatchRow(row.id, 'listing_status', e.target.value)}>
                        {LISTING_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </td>
                    <td className="py-1 px-1">
                      <div className="flex items-center gap-1">
                        <label className="cursor-pointer flex items-center gap-1 px-2 py-1.5 rounded-lg border border-dashed border-gray-300 hover:border-primary hover:bg-primary/5 transition-colors text-xs">
                          <ImagePlus size={14} className="text-gray-400" />
                          <span className="text-gray-500 font-medium">
                            {(batchFiles[row.id]?.length || 0) > 0 ? `${batchFiles[row.id].length}` : '+'}
                          </span>
                          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => addBatchPhotos(row.id, e.target.files)} />
                        </label>
                        {(batchFiles[row.id]?.length || 0) > 0 && (
                          <div className="flex gap-1">
                            {batchFiles[row.id].slice(0, 3).map((f, fi) => (
                              <div key={fi} className="relative w-8 h-8 rounded overflow-hidden border border-gray-200 group">
                                <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                                <button onClick={() => removeBatchPhoto(row.id, fi)} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs">✕</button>
                              </div>
                            ))}
                            {batchFiles[row.id].length > 3 && <span className="text-[10px] text-gray-400 self-center">+{batchFiles[row.id].length - 3}</span>}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-1 px-1">
                      <button onClick={() => { setBatchRows((prev) => prev.filter((r) => r.id !== row.id)); setBatchFiles((prev) => { const n = {...prev}; delete n[row.id]; return n; }); }} className="text-gray-300 hover:text-red-500 p-1">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={() => setBatchRows((prev) => [...prev, emptyBatchRow()])}
            className="mt-4 flex items-center gap-2 text-primary font-bold text-sm hover:underline"
          >
            <Plus size={16} /> Add Another Row
          </button>
        </div>
      </div>
    );
  }

  // ===================== SINGLE VEHICLE MODE =====================
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => router.push('/admin/inventory')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-medium">
          <ArrowLeft size={16} /> Back to Inventory
        </button>
        <button onClick={handleSave} disabled={saving} className="btn-admin">
          <Save size={16} /> {saving ? 'Saving...' : 'Save Vehicle'}
        </button>
      </div>

      {/* Basic Info */}
      <div className="admin-card">
        <h2 className="text-lg font-bold mb-4">Vehicle Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SelectField label="Year" value={form.year} onChange={(v) => u('year', v)} options={YEARS} required />
          <SelectField label="Make" value={form.make} onChange={(v) => u('make', v)} options={MAKES} required />
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Model *</label>
            <input className="input-field" value={form.model} onChange={(e) => u('model', e.target.value)} placeholder="Civic" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Trim</label>
            <input className="input-field" value={form.trim} onChange={(e) => u('trim', e.target.value)} placeholder="LX" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mileage *</label>
            <input className="input-field" type="number" value={form.mileage} onChange={(e) => u('mileage', parseInt(e.target.value) || 0)} />
          </div>
          <SelectField label="Body Type" value={form.body_type} onChange={(v) => u('body_type', v)} options={BODY_TYPES} />
          <SelectField label="Transmission" value={form.transmission} onChange={(v) => u('transmission', v)} options={TRANSMISSIONS} />
          <SelectField label="Fuel Type" value={form.fuel_type} onChange={(v) => u('fuel_type', v)} options={FUEL_TYPES} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <SelectField label="Drivetrain" value={form.drivetrain} onChange={(v) => u('drivetrain', v)} options={DRIVETRAINS} />
          <SelectField label="Cylinders" value={form.cylinders} onChange={(v) => u('cylinders', v)} options={['', ...CYLINDERS].map(c => ({ value: c, label: c || 'Not Set' }))} />
          <SelectField label="Doors" value={String(form.doors)} onChange={(v) => u('doors', parseInt(v))} options={DOORS.map(d => ({ value: String(d), label: String(d) }))} />
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Engine</label>
            <input className="input-field" value={form.engine} onChange={(e) => u('engine', e.target.value)} placeholder="2.0L 4-Cyl" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <SelectField label="Exterior Color" value={form.exterior_color} onChange={(v) => u('exterior_color', v)} options={['', ...EXTERIOR_COLORS].map(c => ({ value: c, label: c || '—' }))} />
          <SelectField label="Interior Color" value={form.interior_color} onChange={(v) => u('interior_color', v)} options={['', ...INTERIOR_COLORS].map(c => ({ value: c, label: c || '—' }))} />
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Stock #</label>
            <input className="input-field" value={form.stock_number} onChange={(e) => u('stock_number', e.target.value)} placeholder="TF-001" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">VIN</label>
            <input className="input-field" value={form.vin} onChange={(e) => u('vin', e.target.value)} placeholder="1HGBH41JXMN109186" />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="admin-card">
        <h2 className="text-lg font-bold mb-4">Pricing</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price *</label>
            <input className="input-field" type="number" value={form.price} onChange={(e) => u('price', parseInt(e.target.value) || 0)} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cash Price</label>
            <input className="input-field" type="number" value={form.cash_price || ''} onChange={(e) => u('cash_price', e.target.value ? parseInt(e.target.value) : null)} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Internet Price</label>
            <input className="input-field" type="number" value={form.internet_price || ''} onChange={(e) => u('internet_price', e.target.value ? parseInt(e.target.value) : null)} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">MSRP</label>
            <input className="input-field" type="number" value={form.msrp || ''} onChange={(e) => u('msrp', e.target.value ? parseInt(e.target.value) : null)} />
          </div>
        </div>
        <div className="flex flex-wrap gap-6 mt-4">
          {[
            { key: 'show_cash_price', label: 'Show Cash Price' },
            { key: 'show_internet_price', label: 'Show Internet Price' },
            { key: 'show_msrp', label: 'Show MSRP' },
            { key: 'show_call_for_price', label: 'Call for Price' },
          ].map((toggle) => (
            <label key={toggle.key} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form[toggle.key as keyof typeof form] as boolean}
                onChange={(e) => u(toggle.key, e.target.checked)}
                className="w-4 h-4 accent-primary rounded"
              />
              {toggle.label}
            </label>
          ))}
        </div>
      </div>

      {/* Status & Labels */}
      <div className="admin-card">
        <h2 className="text-lg font-bold mb-4">Status & Labels</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SelectField
            label="Listing Status"
            value={form.listing_status}
            onChange={(v) => u('listing_status', v)}
            options={LISTING_STATUSES.map(s => ({ value: s.value, label: s.label }))}
          />
          <SelectField
            label="Featured Label"
            value={form.featured_label}
            onChange={(v) => u('featured_label', v)}
            options={FEATURED_LABELS.map(l => ({ value: l, label: l || 'None' }))}
          />
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Inspection</label>
            <select className="input-field" value={form.inspection_status || ''} onChange={(e) => u('inspection_status', e.target.value || null)}>
              <option value="">Not Set</option>
              <option value="pass">Pass ✅</option>
              <option value="fail">Fail ❌</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Vehicle History Report URL</label>
          <input className="input-field" value={form.history_report_url} onChange={(e) => u('history_report_url', e.target.value)} placeholder="https://..." />
        </div>
        <div className="mt-4">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Condition Notes</label>
          <textarea className="input-field resize-none" rows={3} value={form.condition_notes} onChange={(e) => u('condition_notes', e.target.value)} placeholder="Describe the vehicle condition..." />
        </div>
      </div>

      {/* Photos */}
      {!isNew && (
        <div className="admin-card">
          <h2 className="text-lg font-bold mb-4">Photos ({photos.length})</h2>
          <p className="text-xs text-gray-400 mb-4">First photo is the hero/thumbnail image.</p>
          <label className={`flex items-center justify-center gap-2 p-6 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors mb-4 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
            <Upload size={20} className="text-gray-400" />
            <span className="text-sm text-gray-500 font-medium">{uploading ? 'Uploading...' : 'Click to upload photos'}</span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
          </label>
          {photos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {photos.map((photo, i) => (
                <div key={photo.id} className="relative group rounded-lg overflow-hidden border border-gray-200">
                  <img src={photo.public_url} alt={`Photo ${i + 1}`} className="w-full h-28 object-cover" />
                  {i === 0 && <span className="absolute top-1 left-1 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">HERO</span>}
                  <button onClick={() => deletePhoto(photo)} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isNew && (
        <div className="admin-card text-center text-gray-400 text-sm">
          Save the vehicle first, then you can upload photos.
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <button onClick={() => router.push('/admin/inventory')} className="btn-admin-outline">Cancel</button>
        <button onClick={handleSave} disabled={saving} className="btn-admin">
          <Save size={16} /> {saving ? 'Saving...' : 'Save Vehicle'}
        </button>
      </div>
    </div>
  );
}
