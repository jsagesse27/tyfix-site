'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Save, ArrowLeft, Upload, X, Plus, Trash2, ImagePlus, Search } from 'lucide-react';
import type { Vehicle, VehiclePhoto } from '@/lib/types';
import { clearCacheByKey } from '../actions';
import {
  YEARS, MAKES, BODY_TYPES, TRANSMISSIONS, FUEL_TYPES,
  DRIVETRAINS, CYLINDERS, EXTERIOR_COLORS, INTERIOR_COLORS,
  DOORS, FEATURED_LABELS, LISTING_STATUSES,
  DEFAULT_LISTING_STATUS
} from '@/lib/constants';
import { generateVehicleSlug } from '@/lib/slug';
import imageCompression from 'browser-image-compression';
import { decodeSingleVin, decodeBatchVins, VinDecodeResult } from '@/lib/vpic';

const compressImage = async (file: File) => {
  const options = {
    maxSizeMB: 1, // 1MB max size
    maxWidthOrHeight: 1920, // 1920px max dimension
    useWebWorker: true,
  };
  try {
    return await imageCompression(file, options);
  } catch (error) {
    console.warn('Image compression failed, using original', error);
    return file;
  }
};

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
  vin: string;
  year: string; make: string; model: string; trim: string;
  mileage: string; price: string; body_type: string; transmission: string;
  fuel_type: string; drivetrain: string; exterior_color: string; interior_color: string;
  listing_status: string; engine: string; cylinders: string;
  doors: string; condition_notes: string; stock_number: string;
}

const emptyBatchRow = (): BatchRow => ({
  id: crypto.randomUUID(),
  vin: '', year: '2012', make: 'Honda', model: '', trim: '',
  mileage: '100000', price: '5000', body_type: 'Sedan', transmission: 'Automatic',
  fuel_type: 'Gasoline', drivetrain: 'FWD', exterior_color: '', interior_color: '',
  listing_status: 'active', engine: '', cylinders: '',
  doors: '4', condition_notes: '', stock_number: '',
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
  const [newVehiclePhotos, setNewVehiclePhotos] = useState<File[]>([]);

  // Batch state
  const [batchRows, setBatchRows] = useState<BatchRow[]>([emptyBatchRow(), emptyBatchRow(), emptyBatchRow()]);
  const [batchSaved, setBatchSaved] = useState(0);
  const [batchFiles, setBatchFiles] = useState<Record<string, File[]>>({});
  const [batchStatus, setBatchStatus] = useState('');

  // Batch VIN Input state
  const [activeTab, setActiveTab] = useState<'paste' | 'csv' | 'scanner'>('paste');
  const [pasteText, setPasteText] = useState('');
  const [isDecodingBatch, setIsDecodingBatch] = useState(false);
  const [batchDecodeMsg, setBatchDecodeMsg] = useState('');
  const [scannerVin, setScannerVin] = useState('');

  const appendDecodedVins = (results: VinDecodeResult[]) => {
    let toAdd = results.slice(0, 50);
    if (results.length > 50) {
      alert(`Warning: NHTSA API is limited to 50 VINs per request. Truncated from ${results.length} to 50.`);
    }
    
    setBatchRows(prev => {
      const existingVins = new Set(prev.map(r => r.vin).filter(Boolean));
      const newRows: BatchRow[] = [];
      let skipped = 0;

      toAdd.forEach(res => {
        if (existingVins.has(res.vin)) {
          skipped++;
          return;
        }
        
        newRows.push({
          id: crypto.randomUUID(),
          vin: res.vin,
          year: res.year || '2012', 
          make: res.make || 'Honda', 
          model: res.model || '', 
          trim: res.trim || '',
          mileage: '100000', 
          price: '0', 
          body_type: res.body_type || 'Sedan', 
          transmission: res.transmission || 'Automatic',
          fuel_type: res.fuel_type || 'Gasoline', 
          drivetrain: res.drivetrain || 'FWD', 
          exterior_color: '', 
          interior_color: '',
          listing_status: DEFAULT_LISTING_STATUS, 
          engine: res.engine || '', 
          cylinders: res.cylinders || '',
          doors: res.doors || '4', 
          condition_notes: '', 
          stock_number: '',
        });
        existingVins.add(res.vin);
      });

      if (skipped > 0) alert(`Skipped ${skipped} duplicate VIN(s) already in the table.`);
      
      const currentHasData = prev.some(r => r.vin || r.model);
      return currentHasData ? [...prev, ...newRows] : newRows;
    });
  };

  const handlePasteDecode = async () => {
    const vins = pasteText.split('\n').map(v => v.trim()).filter(Boolean);
    if (vins.length === 0) return;
    
    setIsDecodingBatch(true);
    setBatchDecodeMsg('');
    try {
      const results = await decodeBatchVins(vins);
      appendDecodedVins(results);
      setBatchDecodeMsg(`✅ Decoded ${Math.min(results.length, 50)} VIN(s)`);
      setPasteText('');
      setTimeout(() => setBatchDecodeMsg(''), 3000);
    } catch (e: any) {
      setBatchDecodeMsg('❌ Failed to decode VINs');
      setTimeout(() => setBatchDecodeMsg(''), 3000);
    } finally {
      setIsDecodingBatch(false);
    }
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const text = ev.target?.result as string;
      if (!text) return;
      const lines = text.split('\n').map(l => l.trim());
      if (lines.length < 2) return;
      
      const headerIndex = lines[0].split(',').findIndex(h => h.toUpperCase().includes('VIN'));
      const vinCol = headerIndex >= 0 ? headerIndex : 0;

      const vins = lines.slice(1).map(l => l.split(',')[vinCol]?.trim()).filter(Boolean);
      if (vins.length === 0) return;

      setIsDecodingBatch(true);
      setBatchDecodeMsg('');
      try {
        const results = await decodeBatchVins(vins);
        appendDecodedVins(results);
        setBatchDecodeMsg(`✅ Decoded ${Math.min(results.length, 50)} VIN(s) from CSV`);
        setTimeout(() => setBatchDecodeMsg(''), 3000);
      } catch (err) {
        setBatchDecodeMsg('❌ Failed to decode CSV');
        setTimeout(() => setBatchDecodeMsg(''), 3000);
      } finally {
        setIsDecodingBatch(false);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleScannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (scannerVin.length < 11) return;
    
    setIsDecodingBatch(true);
    setBatchDecodeMsg('');
    try {
      const results = await decodeBatchVins([scannerVin]);
      appendDecodedVins(results);
      setBatchDecodeMsg(`✅ Scanned & added: ${scannerVin}`);
      setTimeout(() => setBatchDecodeMsg(''), 2000);
      setScannerVin('');
    } catch (err) {
      setBatchDecodeMsg('❌ Failed to scan VIN');
      setTimeout(() => setBatchDecodeMsg(''), 3000);
    } finally {
      setIsDecodingBatch(false);
    }
  };

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

  const [vinLoading, setVinLoading] = useState(false);
  const [vinError, setVinError] = useState('');
  const [vinSuccess, setVinSuccess] = useState('');

  const [fetchedModels, setFetchedModels] = useState<string[]>([]);
  
  useEffect(() => {
    if (form.year && form.make && isNew) {
      const fetchModels = async () => {
        try {
          const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${form.make}/modelyear/${form.year}?format=json`);
          if (res.ok) {
            const data = await res.json();
            if (data.Results) {
              const modelNames = data.Results.map((r: any) => r.Model_Name);
              setFetchedModels(Array.from(new Set(modelNames)).sort() as string[]);
            }
          }
        } catch {
          setFetchedModels([]);
        }
      };
      const debounce = setTimeout(fetchModels, 300);
      return () => clearTimeout(debounce);
    } else {
      setFetchedModels([]);
    }
  }, [form.year, form.make, isNew]);

  const handleVinLookup = async () => {
    if (!form.vin || form.vin.length < 11) {
      setVinError('Enter a valid VIN');
      return;
    }
    setVinLoading(true);
    setVinError('');
    setVinSuccess('');
    try {
      const result = await decodeSingleVin(form.vin);
      if (result.error) {
        setVinError(result.error);
        return;
      }
      
      let fillCount = 0;
      setForm(prev => {
        const next = { ...prev };
        Object.entries(result).forEach(([k, v]) => {
          if (v && k !== 'vin' && k !== 'error') {
            (next as any)[k] = v;
            fillCount++;
          }
        });
        return next;
      });
      setVinSuccess(`✅ ${fillCount} fields auto-filled`);
      setTimeout(() => setVinSuccess(''), 3000);
    } catch (e: any) {
      setVinError('Failed to decode VIN');
    } finally {
      setVinLoading(false);
    }
  };

  useEffect(() => {
    if (!isNew && !isBatch) loadVehicle();
    if (isNew) loadNewVehicleDefaults();
  }, [params.id]);

  const loadNewVehicleDefaults = async () => {
    const { data } = await supabase
      .from('vehicles')
      .select('stock_number')
      .not('stock_number', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1);
      
    let nextNum = 1;
    if (data && data.length > 0 && data[0].stock_number) {
      const match = data[0].stock_number.match(/\d+$/);
      if (match) {
        nextNum = parseInt(match[0], 10) + 1;
      }
    }
    
    setForm(prev => ({ 
      ...prev, 
      stock_number: `TF-${nextNum.toString().padStart(3, '0')}`,
      listing_status: DEFAULT_LISTING_STATUS,
      inspection_status: 'pass'
    }));
  };

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
      slug: generateVehicleSlug({
        year: form.year,
        make: form.make,
        model: form.model,
        trim: form.trim || null,
        stock_number: form.stock_number || null,
      }),
    };

    if (isNew) {
      const { data, error } = await supabase.from('vehicles').insert(payload).select().single();
      if (!error && data) {
        if (newVehiclePhotos.length > 0) {
          for (let i = 0; i < newVehiclePhotos.length; i++) {
            const rawFile = newVehiclePhotos[i];
            const file = await compressImage(rawFile);
            const fileName = `${data.id}/${Date.now()}_${file.name}`;
            const { error: uploadError } = await supabase.storage.from('vehicle-photos').upload(fileName, file);
            if (!uploadError) {
              const { data: urlData } = supabase.storage.from('vehicle-photos').getPublicUrl(fileName);
              await supabase.from('vehicle_photos').insert({
                vehicle_id: data.id,
                storage_path: fileName,
                public_url: urlData.publicUrl,
                sort_order: i,
              });
            }
          }
        }
        await clearCacheByKey('vehicles');
        router.push(`/admin/inventory/${data.id}`);
        router.refresh();
      }
    } else {
      await supabase.from('vehicles').update(payload).eq('id', params.id);
      await clearCacheByKey('vehicles');
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
        vin: r.vin || null,
        year: r.year, make: r.make, model: r.model, trim: r.trim || null,
        mileage: parseInt(r.mileage) || 0, price: parseInt(r.price) || 0,
        body_type: r.body_type, transmission: r.transmission,
        fuel_type: r.fuel_type, drivetrain: r.drivetrain,
        exterior_color: r.exterior_color || null,
        interior_color: r.interior_color || null,
        engine: r.engine || null,
        cylinders: r.cylinders || null,
        doors: parseInt(r.doors) || 4,
        condition_notes: r.condition_notes || null,
        stock_number: r.stock_number || null,
        listing_status: r.listing_status,
        slug: generateVehicleSlug({
          year: r.year,
          make: r.make,
          model: r.model,
          trim: r.trim || null,
          stock_number: r.stock_number || null,
        }),
      }).select().single();

      // Upload photos for this vehicle
      if (!error && data) {
        const rowFiles = batchFiles[r.id] || [];
        if (rowFiles.length > 0) {
          setBatchStatus(`Compressing and uploading ${rowFiles.length} photo${rowFiles.length > 1 ? 's' : ''} for ${r.year} ${r.make} ${r.model}...`);
          for (let j = 0; j < rowFiles.length; j++) {
            const rawFile = rowFiles[j];
            const file = await compressImage(rawFile);
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
    await clearCacheByKey('vehicles');
    setBatchStatus('');
    setSaving(false);
    router.push('/admin/inventory');
    router.refresh();
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || isBatch) return;

    if (isNew) {
      setNewVehiclePhotos((prev) => [...prev, ...Array.from(files)]);
      e.target.value = '';
      return;
    }

    setUploading(true);
    for (let i = 0; i < files.length; i++) {
      const rawFile = files[i];
      const file = await compressImage(rawFile);
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

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropReorder = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (isNaN(sourceIndex) || sourceIndex === targetIndex) return;

    const newPhotos = [...photos];
    const [moved] = newPhotos.splice(sourceIndex, 1);
    newPhotos.splice(targetIndex, 0, moved);

    setPhotos(newPhotos);
    
    // update sort_order in background
    for (let i = 0; i < newPhotos.length; i++) {
       await supabase.from('vehicle_photos').update({ sort_order: i }).eq('id', newPhotos[i].id);
    }
  };

  const handleDropReorderNew = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (isNaN(sourceIndex) || sourceIndex === targetIndex) return;

    const newPhotos = [...newVehiclePhotos];
    const [moved] = newPhotos.splice(sourceIndex, 1);
    newPhotos.splice(targetIndex, 0, moved);

    setNewVehiclePhotos(newPhotos);
  };

  const handleDropFiles = async (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (isNew) {
         setNewVehiclePhotos(prev => [...prev, ...Array.from(e.dataTransfer.files!)]);
      } else {
         const fakeEvent = { target: { files: e.dataTransfer.files } } as any;
         handlePhotoUpload(fakeEvent);
      }
    }
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
          <h2 className="text-lg font-bold mb-4">Decode VINs (Auto-fill)</h2>
          <div className="flex gap-2 border-b border-gray-100 mb-4">
            {(['paste', 'csv', 'scanner'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                {tab === 'paste' ? 'Paste List' : tab === 'csv' ? 'CSV Upload' : 'Barcode Scanner'}
              </button>
            ))}
          </div>

          <div className="min-h-[120px]">
            {activeTab === 'paste' && (
              <div className="space-y-3">
                <textarea
                  className="input-field w-full h-24 resize-none font-mono text-sm"
                  placeholder="Paste 17-character VINs here (one per line)...&#10;Max 50 VINs per batch."
                  value={pasteText}
                  onChange={e => setPasteText(e.target.value)}
                />
                <button
                  onClick={handlePasteDecode}
                  disabled={isDecodingBatch || !pasteText.trim()}
                  className="btn-primary py-2 px-4 text-sm disabled:opacity-50"
                >
                  {isDecodingBatch ? 'Decoding...' : 'Decode All VINs'}
                </button>
              </div>
            )}
            
            {activeTab === 'csv' && (
              <div className="space-y-3 border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-primary transition-colors">
                <input type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" id="csv-upload" disabled={isDecodingBatch} />
                <label htmlFor="csv-upload" className={`btn-primary inline-flex py-2 px-4 text-sm font-bold cursor-pointer transition-opacity ${isDecodingBatch ? 'opacity-50 pointer-events-none' : ''}`}>
                  {isDecodingBatch ? 'Decoding...' : 'Select CSV File'}
                </label>
                <p className="text-xs text-gray-500 mt-2">File must contain a column header with "VIN".</p>
              </div>
            )}

            {activeTab === 'scanner' && (
              <div className="space-y-3 text-center py-4">
                <p className="text-sm text-gray-500 mb-2">Ensure your scanner cursor is in the box below before scanning.</p>
                <form onSubmit={handleScannerSubmit}>
                  <input
                    autoFocus
                    className="input-field max-w-sm mx-auto text-center font-mono uppercase text-lg h-14"
                    placeholder="SCAN BARCODE HERE"
                    value={scannerVin}
                    onChange={e => setScannerVin(e.target.value.toUpperCase())}
                    disabled={isDecodingBatch}
                  />
                  <button type="submit" className="hidden">Submit</button>
                </form>
              </div>
            )}
            
            {batchDecodeMsg && (
              <div className={`mt-3 p-3 rounded-lg text-sm font-medium text-center ${batchDecodeMsg.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {batchDecodeMsg}
              </div>
            )}
          </div>
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
                  <th className="py-2 px-2 text-left whitespace-nowrap">VIN</th>
                  <th className="py-2 px-2 text-left">Year</th>
                  <th className="py-2 px-2 text-left">Make</th>
                  <th className="py-2 px-2 text-left min-w-[100px]">Model *</th>
                  <th className="py-2 px-2 text-left">Trim</th>
                  <th className="py-2 px-2 text-left">Price</th>
                  <th className="py-2 px-2 text-left">Mileage</th>
                  <th className="py-2 px-2 text-left">Stock #</th>
                  <th className="py-2 px-2 text-left">Body</th>
                  <th className="py-2 px-2 text-left">Trans.</th>
                  <th className="py-2 px-2 text-left">Engine</th>
                  <th className="py-2 px-2 text-left">Cyls</th>
                  <th className="py-2 px-2 text-left">Doors</th>
                  <th className="py-2 px-2 text-left">Drive</th>
                  <th className="py-2 px-2 text-left">Fuel</th>
                  <th className="py-2 px-2 text-left">Ext Color</th>
                  <th className="py-2 px-2 text-left">Int Color</th>
                  <th className="py-2 px-2 text-left min-w-[150px]">Notes</th>
                  <th className="py-2 px-2 text-left">Status</th>
                  <th className="py-2 px-2 text-left">Photos</th>
                  <th className="py-2 px-2"></th>
                </tr>
              </thead>
              <tbody>
                {batchRows.map((row) => (
                  <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-1 px-1">
                      <input className="input-field !py-1.5 text-xs w-36 uppercase font-mono" value={row.vin || ''} onChange={(e) => updateBatchRow(row.id, 'vin', e.target.value.toUpperCase())} placeholder="VIN" maxLength={17} />
                    </td>
                    <td className="py-1 px-1">
                      <select className="input-field !py-1.5 text-xs w-20" value={row.year} onChange={(e) => updateBatchRow(row.id, 'year', e.target.value)}>
                        {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </td>
                    <td className="py-1 px-1">
                      <select className="input-field !py-1.5 text-xs w-32" value={row.make} onChange={(e) => updateBatchRow(row.id, 'make', e.target.value)}>
                        {MAKES.map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </td>
                    <td className="py-1 px-1">
                      <input className="input-field !py-1.5 text-xs w-32" value={row.model} onChange={(e) => updateBatchRow(row.id, 'model', e.target.value)} placeholder="Model" />
                    </td>
                    <td className="py-1 px-1">
                      <input className="input-field !py-1.5 text-xs w-28" value={row.trim} onChange={(e) => updateBatchRow(row.id, 'trim', e.target.value)} placeholder="Trim" />
                    </td>
                    <td className="py-1 px-1">
                      <input className={`input-field !py-1.5 text-xs w-24 ${parseInt(row.price) === 0 ? 'border-amber-400 bg-amber-50' : ''}`} type="number" value={row.price} onChange={(e) => updateBatchRow(row.id, 'price', e.target.value)} />
                    </td>
                    <td className="py-1 px-1">
                      <input className={`input-field !py-1.5 text-xs w-24 ${parseInt(row.mileage) === 0 || row.mileage === '100000' ? 'border-amber-400 bg-amber-50' : ''}`} type="number" value={row.mileage} onChange={(e) => updateBatchRow(row.id, 'mileage', e.target.value)} />
                    </td>
                    <td className="py-1 px-1">
                      <input className="input-field !py-1.5 text-xs w-24 uppercase" value={row.stock_number || ''} onChange={(e) => updateBatchRow(row.id, 'stock_number', e.target.value.toUpperCase())} placeholder="TF-XXX" />
                    </td>
                    <td className="py-1 px-1">
                      <select className="input-field !py-1.5 text-xs w-28" value={row.body_type} onChange={(e) => updateBatchRow(row.id, 'body_type', e.target.value)}>
                        {BODY_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </td>
                    <td className="py-1 px-1">
                      <select className="input-field !py-1.5 text-xs w-28" value={row.transmission} onChange={(e) => updateBatchRow(row.id, 'transmission', e.target.value)}>
                        {TRANSMISSIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </td>
                    <td className="py-1 px-1">
                      <input className="input-field !py-1.5 text-xs w-28" value={row.engine || ''} onChange={(e) => updateBatchRow(row.id, 'engine', e.target.value)} placeholder="Engine" />
                    </td>
                    <td className="py-1 px-1">
                      <select className="input-field !py-1.5 text-xs w-20" value={row.cylinders || ''} onChange={(e) => updateBatchRow(row.id, 'cylinders', e.target.value)}>
                        <option value="">—</option>
                        {CYLINDERS.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </td>
                    <td className="py-1 px-1">
                      <select className="input-field !py-1.5 text-xs w-16" value={row.doors || ''} onChange={(e) => updateBatchRow(row.id, 'doors', e.target.value)}>
                        <option value="">—</option>
                        {DOORS.map((d) => <option key={d} value={String(d)}>{d}</option>)}
                      </select>
                    </td>
                    <td className="py-1 px-1">
                      <select className="input-field !py-1.5 text-xs w-20" value={row.drivetrain} onChange={(e) => updateBatchRow(row.id, 'drivetrain', e.target.value)}>
                        {DRIVETRAINS.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </td>
                    <td className="py-1 px-1">
                      <select className="input-field !py-1.5 text-xs w-24" value={row.fuel_type} onChange={(e) => updateBatchRow(row.id, 'fuel_type', e.target.value)}>
                        {FUEL_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </td>
                    <td className="py-1 px-1">
                      <select className="input-field !py-1.5 text-xs w-24" value={row.exterior_color || ''} onChange={(e) => updateBatchRow(row.id, 'exterior_color', e.target.value)}>
                        <option value="">—</option>
                        {EXTERIOR_COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </td>
                    <td className="py-1 px-1">
                      <select className="input-field !py-1.5 text-xs w-24" value={row.interior_color || ''} onChange={(e) => updateBatchRow(row.id, 'interior_color', e.target.value)}>
                        <option value="">—</option>
                        {INTERIOR_COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </td>
                    <td className="py-1 px-1">
                      <input className="input-field !py-1.5 text-xs w-40" value={row.condition_notes || ''} onChange={(e) => updateBatchRow(row.id, 'condition_notes', e.target.value)} placeholder="Notes..." />
                    </td>
                    <td className="py-1 px-1">
                      <select className="input-field !py-1.5 text-xs w-24" value={row.listing_status} onChange={(e) => updateBatchRow(row.id, 'listing_status', e.target.value)}>
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
            <input 
              list="admin-model-list"
              className="input-field" 
              value={form.model} 
              onChange={(e) => u('model', e.target.value)} 
              placeholder="Civic" 
              required 
            />
            {fetchedModels.length > 0 && (
              <datalist id="admin-model-list">
                {fetchedModels.map(m => <option key={m} value={m} />)}
              </datalist>
            )}
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
            <div className="flex gap-2">
              <input className="input-field flex-1 uppercase" value={form.vin} onChange={(e) => u('vin', e.target.value.toUpperCase())} placeholder="1HGBH41JXMN109186" maxLength={17} />
              <button 
                type="button" 
                onClick={handleVinLookup} 
                disabled={vinLoading || !form.vin} 
                className="bg-primary text-white px-3 py-2 rounded-xl text-sm font-bold flex items-center gap-1 hover:bg-primary/90 disabled:opacity-50"
              >
                <Search size={14} /> {vinLoading ? '...' : 'Lookup'}
              </button>
            </div>
            {vinError && <p className="text-red-500 text-xs mt-1">{vinError}</p>}
            {vinSuccess && <p className="text-green-600 text-xs mt-1 font-bold">{vinSuccess}</p>}
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
      <div className="admin-card">
        <h2 className="text-lg font-bold mb-4">Photos ({isNew ? newVehiclePhotos.length : photos.length})</h2>
        <p className="text-xs text-gray-400 mb-4">First photo is the hero/thumbnail image. Drag and drop to reorder.</p>
        <label 
          onDragOver={handleDragOver}
          onDrop={handleDropFiles}
          className={`flex items-center justify-center gap-2 p-6 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors mb-4 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <Upload size={20} className="text-gray-400" />
          <span className="text-sm text-gray-500 font-medium">{uploading ? 'Uploading...' : 'Click or drop photos here to upload'}</span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
        </label>

        {/* Existing photos (not new) */}
        {!isNew && photos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {photos.map((photo, i) => (
              <div 
                key={photo.id} 
                draggable 
                onDragStart={(e) => handleDragStart(e, i)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropReorder(e, i)}
                className="relative group rounded-lg overflow-hidden border border-gray-200 cursor-move"
              >
                <img src={photo.public_url} alt={`Photo ${i + 1}`} className="w-full h-28 object-cover pointer-events-none" />
                {i === 0 && <span className="absolute top-1 left-1 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">HERO</span>}
                <button type="button" onClick={(e) => { e.preventDefault(); deletePhoto(photo); }} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* New vehicle photos (queued) */}
        {isNew && newVehiclePhotos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {newVehiclePhotos.map((f, i) => (
              <div 
                key={i} 
                draggable
                onDragStart={(e) => handleDragStart(e, i)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropReorderNew(e, i)}
                className="relative group rounded-lg overflow-hidden border border-gray-200 cursor-move"
              >
                <img src={URL.createObjectURL(f)} alt={`Queued ${i + 1}`} className="w-full h-28 object-cover pointer-events-none" />
                {i === 0 && <span className="absolute top-1 left-1 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">HERO</span>}
                <button type="button" onClick={(e) => { e.preventDefault(); setNewVehiclePhotos(prev => prev.filter((_, idx) => idx !== i)); }} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <X size={12} />
                </button>
                <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[10px] text-center py-0.5">Queued</div>
              </div>
            ))}
          </div>
        )}
      </div>

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
