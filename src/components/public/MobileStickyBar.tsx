'use client';

import { Phone, MessageCircle } from 'lucide-react';
import type { SiteSettings } from '@/lib/types';

export default function MobileStickyBar({ settings }: { settings: SiteSettings | null }) {
  const phone = settings?.sms_number || '5551234567';

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
      <div className="grid grid-cols-2 gap-0">
        <a
          href={`tel:${phone}`}
          className="flex items-center justify-center gap-2 bg-primary text-white py-4 font-bold text-sm"
        >
          <Phone size={20} />
          CALL NOW
        </a>
        <a
          href={`sms:${phone}`}
          className="flex items-center justify-center gap-2 bg-gray-900 text-white py-4 font-bold text-sm"
        >
          <MessageCircle size={20} />
          TEXT US
        </a>
      </div>
    </div>
  );
}
