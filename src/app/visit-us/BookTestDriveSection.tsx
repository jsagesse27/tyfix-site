'use client';

import { useState } from 'react';
import { CalendarCheck } from 'lucide-react';
import BookTestDrive from '@/components/public/BookTestDrive';

export default function BookTestDriveSection() {
  const [showBooking, setShowBooking] = useState(false);

  return (
    <>
      <div className="p-6 bg-primary/5 border border-primary/10 rounded-2xl text-center">
        <h3 className="text-xl font-black text-gray-900 mb-2">Ready to Visit?</h3>
        <p className="text-gray-600 text-sm mb-4">Schedule your appointment and we&apos;ll have your vehicles ready to view.</p>
        <button
          onClick={() => setShowBooking(true)}
          className="btn-primary cursor-pointer"
        >
          <CalendarCheck size={18} /> Book an Appointment
        </button>
      </div>
      <BookTestDrive isOpen={showBooking} onClose={() => setShowBooking(false)} />
    </>
  );
}
