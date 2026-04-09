'use client';

import { useState } from 'react';
import { Car } from 'lucide-react';
import { useReveal } from '@/lib/useReveal';
import VehicleRequestFlow from './VehicleRequestFlow';

export default function RequestVehicleSection() {
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const ref = useReveal();

  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className="text-center reveal">
          <div className="inline-block p-8 bg-white rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Don&apos;t see what you&apos;re looking for?</h3>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto">
              Our inventory changes daily. Tell us what you want and we&apos;ll track it down for you.
            </p>
            <button
              onClick={() => setIsRequestOpen(true)}
              className="btn-outline px-10 py-4 text-base font-black uppercase tracking-widest inline-flex items-center gap-3 w-full sm:w-auto"
            >
              <Car size={20} /> Request a Vehicle
            </button>
          </div>
        </div>
      </div>

      <VehicleRequestFlow isOpen={isRequestOpen} onClose={() => setIsRequestOpen(false)} />
    </section>
  );
}
