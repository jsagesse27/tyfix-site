'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface BookTestDriveProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BookTestDrive({ isOpen, onClose }: BookTestDriveProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h3 className="text-xl font-black text-slate-900">Book a Test Drive</h3>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-0.5">Pick a time that works for you</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} className="text-slate-400" /></button>
          </div>
          <div ref={containerRef} style={{ minHeight: '580px' }}>
            <div
              className="calendly-inline-widget"
              data-url="https://calendly.com/tyfixautosales/car-test-drive?hide_gdpr_banner=1"
              style={{ minWidth: '300px', height: '580px' }}
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
