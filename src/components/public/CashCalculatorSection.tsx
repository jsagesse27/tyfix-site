'use client';

import CashCalculator from './CashCalculator';

/**
 * Standalone section wrapper for the Cash Calculator.
 * Previously lived inside CashAdvantage, now independently toggleable.
 */
export default function CashCalculatorSection() {
  return (
    <section className="relative py-20 bg-[#0A0F1A] text-white overflow-hidden">
      {/* Ambient blob */}
      <div className="absolute top-0 left-1/2 w-[600px] h-[600px] -translate-x-1/2 rounded-full bg-primary/8 blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <CashCalculator />
      </div>
    </section>
  );
}
