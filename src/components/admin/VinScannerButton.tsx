'use client';

import React, { useRef, useState } from 'react';
import { Camera, Loader2, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import imageCompression from 'browser-image-compression';

interface VinScanResult {
  vin: string;
  confidence: 'high' | 'medium' | 'low' | 'none';
  valid: boolean;
  warning?: string;
  error?: string;
}

interface VinScannerButtonProps {
  /** Called with the extracted VIN string after a successful scan */
  onScan: (vin: string, confidence: string) => void;
  /** Visual variant */
  variant?: 'admin' | 'public';
  /** Extra classes for the outer button */
  className?: string;
  /** Whether to show compact (icon-only) button */
  compact?: boolean;
  /** Disable the button */
  disabled?: boolean;
}

export default function VinScannerButton({
  onScan,
  variant = 'admin',
  className = '',
  compact = false,
  disabled = false,
}: VinScannerButtonProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<'idle' | 'compressing' | 'scanning' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<VinScanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ''; // Reset so same file can be re-selected

    setStatus('compressing');
    setResult(null);
    setErrorMsg('');

    try {
      // Compress image to reduce upload size and API token cost
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1280,
        useWebWorker: true,
      });

      // Convert to base64
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(compressed);
      });

      setStatus('scanning');

      const res = await fetch('/api/vin-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
      });

      const data: VinScanResult = await res.json();

      if (!res.ok || data.error) {
        setStatus('error');
        setErrorMsg(data.error || 'Failed to scan VIN');
        return;
      }

      if (!data.vin || data.confidence === 'none') {
        setStatus('error');
        setErrorMsg('Could not detect a VIN. Try a clearer photo with good lighting.');
        return;
      }

      setResult(data);
      setStatus('success');
      onScan(data.vin, data.confidence);

      // Auto-clear success state after 4 seconds
      setTimeout(() => {
        setStatus('idle');
        setResult(null);
      }, 4000);
    } catch {
      setStatus('error');
      setErrorMsg('Failed to process photo. Please try again.');
    }
  };

  const dismiss = () => {
    setStatus('idle');
    setResult(null);
    setErrorMsg('');
  };

  const isPublic = variant === 'public';

  const buttonClasses = isPublic
    ? `inline-flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all text-sm font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${className}`
    : `inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
        status === 'success'
          ? 'bg-green-500 text-white'
          : status === 'error'
          ? 'bg-red-500 text-white'
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
      } ${className}`;

  return (
    <div className="relative inline-flex flex-col">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleCapture}
        className="hidden"
        disabled={disabled || status === 'compressing' || status === 'scanning'}
      />

      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={disabled || status === 'compressing' || status === 'scanning'}
        className={buttonClasses}
        title="Scan VIN with camera"
      >
        {status === 'compressing' || status === 'scanning' ? (
          <Loader2 size={compact ? 14 : 16} className="animate-spin" />
        ) : status === 'success' ? (
          <CheckCircle2 size={compact ? 14 : 16} />
        ) : status === 'error' ? (
          <AlertTriangle size={compact ? 14 : 16} />
        ) : (
          <Camera size={compact ? 14 : 16} />
        )}
        {!compact && (
          <span>
            {status === 'compressing'
              ? 'Processing...'
              : status === 'scanning'
              ? 'Scanning...'
              : status === 'success'
              ? `✓ ${result?.vin?.slice(0, 8)}...`
              : status === 'error'
              ? 'Retry'
              : 'Scan VIN'}
          </span>
        )}
      </button>

      {/* Feedback tooltip */}
      {status === 'error' && errorMsg && (
        <div className="absolute top-full left-0 mt-1 z-50 w-60 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2 shadow-lg">
          <span className="flex-1">{errorMsg}</span>
          <button onClick={dismiss} className="text-red-400 hover:text-red-600 flex-shrink-0">
            <X size={12} />
          </button>
        </div>
      )}

      {status === 'success' && result?.warning && (
        <div className="absolute top-full left-0 mt-1 z-50 w-60 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 flex items-start gap-2 shadow-lg">
          <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
          <span className="flex-1">{result.warning} — please verify</span>
        </div>
      )}

      {status === 'success' && result?.confidence === 'medium' && !result?.warning && (
        <div className="absolute top-full left-0 mt-1 z-50 w-60 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 shadow-lg">
          ⚠️ Medium confidence — double-check the VIN
        </div>
      )}
    </div>
  );
}
