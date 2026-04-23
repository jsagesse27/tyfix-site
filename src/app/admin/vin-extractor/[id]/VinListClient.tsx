'use client';

import React, { useState, useEffect } from 'react';
import { Camera, Check, Copy, Download, Trash2, AlertCircle, Edit2, Loader2, Save } from 'lucide-react';
import VinScannerButton from '@/components/admin/VinScannerButton';
import type { VinExtractionItem, VinExtractionList } from '@/lib/types';
import { updateVinListItems, decodeVinExtracted } from './actions';

export default function VinListClient({ list }: { list: VinExtractionList }) {
  const [items, setItems] = useState<VinExtractionItem[]>(list.items || []);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editVinValue, setEditVinValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync back to db whenever items structurally change
  const syncItems = async (newItems: VinExtractionItem[]) => {
    setIsSaving(true);
    await updateVinListItems(list.id, newItems);
    setIsSaving(false);
  };

  const handleScan = async (vin: string, confidence: string) => {
    // Check duplicates
    if (items.some(i => i.vin === vin)) {
      alert('This VIN is already in the list!');
      return;
    }

    // Add placeholder to list immediately
    const newItem: VinExtractionItem = {
      vin,
      make: 'Decoding...',
      model: '',
      year: '',
      status: 'valid',
      confidence,
    };
    
    const newItems = [newItem, ...items];
    setItems(newItems);

    // Decode in background
    const res = await decodeVinExtracted(vin);
    if (res.success && res.data) {
      const decodedItems = newItems.map((item, idx) => {
        if (idx === 0) {
          return {
            ...item,
            make: res.data!.make,
            model: res.data!.model,
            year: res.data!.year,
            status: (res.data!.make === 'Unknown' || res.data!.make === '') ? 'invalid' : 'valid'
          } as VinExtractionItem;
        }
        return item;
      });
      setItems(decodedItems);
      syncItems(decodedItems);
    } else {
      const failedItems = newItems.map((item, idx) => {
         if (idx === 0) return { ...item, status: 'invalid', make: 'Decode Failed' } as VinExtractionItem;
         return item;
      });
      setItems(failedItems);
      syncItems(failedItems);
    }
  };

  const removeVin = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    syncItems(updated);
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditVinValue(items[index].vin);
  };

  const saveEdit = async (index: number) => {
    if (editVinValue === items[index].vin) {
      setEditingIndex(null);
      return;
    }
    
    // Quick re-decode
    const updated = [...items];
    updated[index].vin = editVinValue.toUpperCase();
    updated[index].make = 'Re-decoding...';
    updated[index].model = '';
    updated[index].year = '';
    setItems(updated);
    setEditingIndex(null);

    const res = await decodeVinExtracted(editVinValue.toUpperCase());
    if (res.success && res.data) {
      updated[index].make = res.data.make;
      updated[index].model = res.data.model;
      updated[index].year = res.data.year;
      updated[index].status = res.data.make === 'Unknown' ? 'invalid' : 'valid';
    } else {
      updated[index].status = 'invalid';
      updated[index].make = 'Decode Failed';
    }
    setItems([...updated]);
    syncItems(updated);
  };

  const handleCopy = () => {
    const text = items.map(i => i.vin).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCSV = () => {
    const header = 'VIN,Year,Make,Model,Confidence\n';
    const rows = items.map(i => `${i.vin},${i.year},"${i.make}","${i.model}",${i.confidence || 'manual'}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${list.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Scanner Control */}
      <div className="lg:col-span-1 space-y-6">
        <div className="admin-card text-center p-8 bg-gradient-to-b from-white to-gray-50/50">
          <div className="mx-auto w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
            <Camera size={32} />
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-2">Capture VIN</h2>
          <p className="text-sm text-gray-500 mb-8">
            Snap a photo of the VIN plate or door sticker. It will automatically decode and drop into your list.
          </p>
          
          <VinScannerButton 
            onScan={handleScan} 
            variant="admin" 
            className="w-full justify-center !py-4 !text-lg !rounded-xl"
          />
        </div>

        <div className="admin-card space-y-4">
          <h3 className="font-bold text-gray-900">Export Tools</h3>
          <button 
            onClick={handleCopy} 
            disabled={items.length === 0}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-gray-500" />}
            {copied ? 'Copied to Clipboard!' : 'Copy RAW List (Newline)'}
          </button>
          
          <button 
            onClick={handleExportCSV} 
            disabled={items.length === 0}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <Download size={16} /> Export to CSV
          </button>
        </div>
      </div>

      {/* Roster / Roster */}
      <div className="lg:col-span-2">
        <div className="admin-card min-h-[500px] flex flex-col">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Extraction Roster</h2>
              <p className="text-sm text-gray-500 flex items-center gap-2">
                {items.length} VINs Scanned
                {isSaving && <span className="flex items-center gap-1 text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full animate-pulse"><Save size={10}/> Auto-saving...</span>}
              </p>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="flex-grow flex items-center justify-center text-center text-gray-400">
              <p>No VINs extracted yet. Start scanning!</p>
            </div>
          ) : (
            <div className="flex-grow overflow-y-auto pr-2">
              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div key={idx} className={`p-4 border rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${item.status === 'invalid' ? 'bg-red-50/30 border-red-200' : 'bg-white border-gray-200'}`}>
                    
                    <div className="flex-grow min-w-0">
                      {editingIndex === idx ? (
                        <div className="flex items-center gap-2 mb-1">
                          <input 
                            type="text" 
                            value={editVinValue} 
                            onChange={(e) => setEditVinValue(e.target.value)} 
                            className="input-field py-1 text-sm uppercase tracking-widest font-mono"
                          />
                          <button onClick={() => saveEdit(idx)} className="btn-admin py-1 px-2 text-xs">Save</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono font-bold text-lg text-gray-900 tracking-wider">
                            {item.vin}
                          </span>
                          <button onClick={() => startEdit(idx)} className="text-gray-300 hover:text-primary transition-colors">
                            <Edit2 size={14} />
                          </button>
                          {item.confidence === 'low' && (
                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <AlertCircle size={10} /> Low Confidence Check
                            </span>
                          )}
                        </div>
                      )}
                      
                      <p className={`text-sm flex items-center gap-2 ${item.status === 'invalid' ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                        {item.make === 'Decoding...' ? (
                          <><Loader2 size={12} className="animate-spin" /> Decoding from NHTSA...</>
                        ) : item.make === 'Re-decoding...' ? (
                          <><Loader2 size={12} className="animate-spin" /> Verifying edit...</>
                        ) : (
                          <>{item.year} {item.make} {item.model}</>
                        )}
                      </p>
                    </div>

                    <button 
                      onClick={() => removeVin(idx)}
                      className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors flex-shrink-0"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
