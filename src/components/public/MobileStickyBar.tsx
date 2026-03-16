'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone } from 'lucide-react';
import type { SiteSettings } from '@/lib/types';

export default function MobileStickyBar({ settings }: { settings: SiteSettings | null }) {
  const [isVisible, setIsVisible] = useState(true);
  const phone = settings?.sms_number || '5551234567';

  useEffect(() => {
    const handleScroll = () => {
      // Hide bar after 100px of scrolling
      if (window.scrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ y: 80 }}
          animate={{ y: 0 }}
          exit={{ y: 80 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
        >
          <div className="flex">
            <a
              href={`tel:${phone}`}
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-4 font-bold text-sm"
            >
              <Phone size={20} />
              CALL NOW
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
