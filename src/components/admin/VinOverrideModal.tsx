'use client';

import React, { useState, useMemo } from 'react';
import { X, CheckCircle2, ArrowRight } from 'lucide-react';
import type { VinDecodeResult } from '@/lib/vpic';

/** The fields from VinDecodeResult that can be overridden on the vehicle form */
const OVERRIDE_FIELDS = [
  { key: 'year', label: 'Year' },
  { key: 'make', label: 'Make' },
  { key: 'model', label: 'Model' },
  { key: 'trim', label: 'Trim' },
  { key: 'body_type', label: 'Body Type' },
  { key: 'transmission', label: 'Transmission' },
  { key: 'engine', label: 'Engine' },
  { key: 'fuel_type', label: 'Fuel Type' },
  { key: 'drivetrain', label: 'Drivetrain' },
  { key: 'cylinders', label: 'Cylinders' },
  { key: 'doors', label: 'Doors' },
] as const;

type FieldKey = (typeof OVERRIDE_FIELDS)[number]['key'];

interface VinOverrideModalProps {
  /** The decoded VIN data (new values) */
  decoded: VinDecodeResult;
  /** The current form values (for showing old → new comparison) */
  currentValues: Record<string, string | number | boolean | null>;
  /** Called with the map of selected fields to apply */
  onApply: (selectedFields: Record<string, string>) => void;
  /** Called when user cancels */
  onCancel: () => void;
}

export default function VinOverrideModal({
  decoded,
  currentValues,
  onApply,
  onCancel,
}: VinOverrideModalProps) {
  // Determine which fields have new values from the decode
  const availableFields = useMemo(() => {
    return OVERRIDE_FIELDS.map((f) => {
      const newVal = (decoded as unknown as Record<string, string>)[f.key] || '';
      const oldVal = String(currentValues[f.key] || '');
      const hasNewValue = !!newVal; // new data exists from NHTSA
      const isSame = oldVal === newVal;
      const oldIsEmpty = !oldVal || oldVal === '0';

      return {
        ...f,
        newVal,
        oldVal,
        hasNewValue,
        isSame,
        oldIsEmpty,
      };
    }).filter((f) => f.hasNewValue); // Only show fields where NHTSA returned data
  }, [decoded, currentValues]);

  // Default selection: auto-check fields where old is empty or different
  const [selected, setSelected] = useState<Set<FieldKey>>(() => {
    const defaults = new Set<FieldKey>();
    availableFields.forEach((f) => {
      if (f.oldIsEmpty || !f.isSame) {
        defaults.add(f.key);
      }
    });
    return defaults;
  });

  const allSelected = availableFields.length > 0 && selected.size === availableFields.length;
  const noneSelected = selected.size === 0;

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(availableFields.map((f) => f.key)));
    }
  };

  const toggle = (key: FieldKey) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleApply = () => {
    const result: Record<string, string> = {};
    availableFields.forEach((f) => {
      if (selected.has(f.key)) {
        result[f.key] = f.newVal;
      }
    });
    onApply(result);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-black text-gray-900">Override Vehicle Information?</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              This vehicle already has data. Select which fields to update from VIN decode.
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Field List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-1">
          {/* Select All */}
          <label className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors mb-3 border border-gray-200">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              className="w-5 h-5 accent-primary rounded"
            />
            <span className="font-bold text-sm text-gray-900">
              {allSelected ? 'Deselect All' : 'Select All'}
            </span>
            <span className="text-xs text-gray-400 ml-auto">
              {selected.size}/{availableFields.length} selected
            </span>
          </label>

          {/* Divider */}
          <div className="border-t border-gray-100 my-2" />

          {/* Individual fields */}
          {availableFields.map((field) => {
            const isChecked = selected.has(field.key);
            const valueChanged = !field.isSame;

            return (
              <label
                key={field.key}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                  isChecked
                    ? 'bg-primary/5 border border-primary/20'
                    : 'hover:bg-gray-50 border border-transparent'
                } ${field.isSame ? 'opacity-60' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggle(field.key)}
                  className="w-5 h-5 accent-primary rounded flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {field.label}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {field.oldIsEmpty ? (
                      <span className="text-xs text-gray-300 italic">empty</span>
                    ) : (
                      <span className={`text-sm ${valueChanged ? 'text-red-500 line-through' : 'text-gray-700'}`}>
                        {field.oldVal}
                      </span>
                    )}
                    {valueChanged && (
                      <>
                        <ArrowRight size={12} className="text-gray-300 flex-shrink-0" />
                        <span className="text-sm font-bold text-green-700">{field.newVal}</span>
                      </>
                    )}
                    {field.isSame && (
                      <span className="text-xs text-gray-400 italic ml-1">(same)</span>
                    )}
                  </div>
                </div>
              </label>
            );
          })}

          {availableFields.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-6">
              No new data available from VIN decode.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 p-5 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={noneSelected}
            className="flex-[2] py-3 px-4 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={16} />
            Apply {selected.size} Field{selected.size !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
