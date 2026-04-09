'use client';

import { useRef, useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

interface SignaturePadProps {
  onSignatureChange: (base64: string | null) => void;
  initialSignature?: string | null;
}

export default function SignaturePad({ onSignatureChange, initialSignature }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(!!initialSignature);
  const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set real size vs display size for high DPI
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.scale(2, 2);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#000000';

    if (initialSignature) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, rect.width, rect.height);
        // Scale and draw image
        const ratio = Math.min(rect.width / img.width, rect.height / img.height);
        const w = img.width * ratio;
        const h = img.height * ratio;
        ctx.drawImage(img, (rect.width - w) / 2, (rect.height - h) / 2, w, h);
      };
      img.src = initialSignature;
    }
  }, [initialSignature]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else {
      return {
        x: (e as React.MouseEvent).clientX - rect.left,
        y: (e as React.MouseEvent).clientY - rect.top
      };
    }
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling on touch
    setIsDrawing(true);
    const pos = getCoordinates(e);
    if (!pos) return;
    setLastPos(pos);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.arc(pos.x, pos.y, ctx.lineWidth / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const handleMove = (e: unknown) => {
    if (!isDrawing) return;
    const ev = e as React.MouseEvent | React.TouchEvent;
    ev.preventDefault(); // Prevent scrolling while signing
    
    const pos = getCoordinates(ev);
    if (!pos || !lastPos) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    setLastPos(pos);
    setHasSignature(true);
  };

  const handleEnd = () => {
    setIsDrawing(false);
    setLastPos(null);
    if (hasSignature) {
      triggerChange();
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    setHasSignature(false);
    onSignatureChange(null);
  };

  const triggerChange = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Debounce this or just use toDataURL
    const dataUrl = canvas.toDataURL('image/png');
    onSignatureChange(dataUrl);
  };

  // Setup global event listeners to prevent body scroll on touch
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      handleMove(e);
    };
    
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => canvas.removeEventListener('touchmove', handleTouchMove);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDrawing, lastPos]);

  return (
    <div className="relative border-2 border-gray-200 border-dashed rounded-xl overflow-hidden bg-white group hover:border-gray-300 transition-colors">
      <canvas
        ref={canvasRef}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseOut={handleEnd}
        onTouchStart={handleStart}
        onTouchEnd={handleEnd}
        className="w-full h-40 md:h-48 cursor-crosshair touch-none"
      />
      
      {!hasSignature && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-40">
          <span className="text-gray-400 font-medium">Sign here</span>
        </div>
      )}

      {hasSignature && (
        <button
          type="button"
          onClick={clear}
          className="absolute bottom-2 right-2 p-2 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-500 hover:text-red-500 hover:border-red-200 transition-colors z-10"
          title="Clear Signature"
        >
          <RotateCcw size={16} />
        </button>
      )}
    </div>
  );
}
