'use client';

import { useState, useEffect, useRef } from 'react';
import { DollarSign, TrendingUp, AlertTriangle, ChevronRight, RotateCcw, Car, Minus, Plus } from 'lucide-react';
import { useReveal } from '@/lib/useReveal';

/* ── Fee Constants ───────────────────────────── */
const DOC_FEE       = 175; // NY limit
const TITLE_REG_FEE = 175; // Title $50 + Plates $25 + Reg ~$100
const SALES_TAX_RATE = 0.08875; // NYC rate
const ADV_FEE       = 350; // Average
const RECOND_FEE    = 250; // Updated
const MAINTENANCE_REPAIR_RATE = 0.20; // 20%
const MARKET_ADJ_RATE= 0.10; // 10%
const DEFAULT_APR   = 14.9;
const DEFAULT_TERM  = 60; // months

/* ── Helpers ─────────────────────────────────── */
function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function pmt(rate: number, nper: number, pv: number) {
  if (rate === 0) return pv / nper;
  const r = rate / 12;
  return (pv * r * Math.pow(1 + r, nper)) / (Math.pow(1 + r, nper) - 1);
}

/* ── Animated Counter ────────────────────────── */
function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    const start = prev.current;
    const diff = value - start;
    const duration = 600;
    let t0: number;

    const step = (ts: number) => {
      if (!t0) t0 = ts;
      const progress = Math.min((ts - t0) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setDisplay(Math.round(start + diff * ease));
      if (progress < 1) raf.current = requestAnimationFrame(step);
    };

    raf.current = requestAnimationFrame(step);
    prev.current = value;
    return () => cancelAnimationFrame(raf.current);
  }, [value]);

  return <span className={className}>{fmt(display)}</span>;
}

/* ── Animated Bar ────────────────────────────── */
function FeeBar({ label, amount, total, color, delay }: {
  label: string; amount: number; total: number; color: string; delay: number;
}) {
  const pct = total > 0 ? Math.min((amount / total) * 100, 100) : 0;
  return (
    <div className="space-y-1.5" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex justify-between text-xs">
        <span className="text-slate-400 font-medium">{label}</span>
        <span className="text-white font-bold">{fmt(amount)}</span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color, transitionDelay: `${delay}ms` }}
        />
      </div>
    </div>
  );
}

/* ── Main Calculator ─────────────────────────── */
export default function CashCalculator() {
  const containerRef = useReveal(0.1);
  const [step, setStep] = useState(0); // 0=input, 1=results
  const [price, setPrice] = useState(5000);
  const [includeFinancing, setIncludeFinancing] = useState(true);
  const [apr, setApr] = useState(DEFAULT_APR);
  const [term, setTerm] = useState(DEFAULT_TERM);

  /* Computed values */
  const salesTax    = Math.round(price * SALES_TAX_RATE);
  const marketAdj   = Math.round(price * MARKET_ADJ_RATE);
  const maintenanceRepairs = Math.round(price * MAINTENANCE_REPAIR_RATE);
  const hiddenFees  = ADV_FEE + RECOND_FEE + marketAdj + maintenanceRepairs;
  const totalBefore = price + DOC_FEE + TITLE_REG_FEE + salesTax + hiddenFees;

  const monthlyPmt  = includeFinancing ? pmt(apr / 100, term, totalBefore) : 0;
  const totalFinanced = includeFinancing ? Math.round(monthlyPmt * term) : totalBefore;
  const interestPaid = includeFinancing ? totalFinanced - totalBefore : 0;

  const tyfixTotal  = price;
  const savings     = totalFinanced - tyfixTotal;

  const feeBreakdown = [
    { label: 'Car Price', amount: price, color: '#64748b' },
    { label: 'Doc Fees', amount: DOC_FEE, color: '#f59e0b' },
    { label: 'Title & Registration', amount: TITLE_REG_FEE, color: '#f97316' },
    { label: 'Sales Tax (8.875%)', amount: salesTax, color: '#ef4444' },
    { label: 'Advertising Fee', amount: ADV_FEE, color: '#ec4899' },
    { label: 'Reconditioning Fee', amount: RECOND_FEE, color: '#a855f7' },
    { label: 'Market Adjustment', amount: marketAdj, color: '#8b5cf6' },
    { label: 'Maintenance Repairs (20%)', amount: maintenanceRepairs, color: '#f5dada' },
    ...(includeFinancing ? [{ label: `Interest (${apr}% × ${term}mo)`, amount: interestPaid, color: '#dc2626' }] : []),
  ];

  return (
    <div ref={containerRef} className="reveal mt-20">
      {/* Section heading */}
      <div className="text-center mb-10">
        <span className="section-label mx-auto justify-center !text-primary">See The Real Numbers</span>
        <h3 className="text-3xl md:text-4xl font-black text-white">
          How Much Are You <span className="text-primary">Really</span> Paying?
        </h3>
        <p className="text-slate-400 mt-3 max-w-lg mx-auto text-sm">
          Traditional dealers pile on hidden fees. Enter a car price below to see the true cost side-by-side.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {step === 0 ? (
          /* ── STEP 1: Input ──────────────────────────── */
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-10 animate-fade-in">
            {/* Price slider */}
            <div className="mb-10">
              <div className="flex justify-between items-end mb-4">
                <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">Vehicle Price</span>
                <span className="text-4xl font-black text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {fmt(price)}
                </span>
              </div>
              
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setPrice(Math.max(2000, price - 50))}
                    className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
                    aria-label="Decrease price"
                  >
                    <Minus size={20} />
                  </button>

                  <div className="flex-1 relative py-4">
                    <input
                      type="range"
                      min={2000}
                      max={15000}
                      step={50}
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10"
                      style={{
                        background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${((price - 2000) / 13000) * 100}%, rgba(255,255,255,0.1) ${((price - 2000) / 13000) * 100}%, rgba(255,255,255,0.1) 100%)`,
                      }}
                    />
                  </div>

                  <button 
                    onClick={() => setPrice(Math.min(15000, price + 50))}
                    className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
                    aria-label="Increase price"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Financing toggle */}
            <div className="flex flex-col sm:flex-row gap-6 mb-8">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${includeFinancing ? 'bg-primary' : 'bg-white/15'}`}
                  onClick={() => setIncludeFinancing(!includeFinancing)}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-md ${includeFinancing ? 'translate-x-6' : 'translate-x-0'}`}
                  />
                </div>
                <span className="text-sm font-medium text-slate-300">Include Financing Costs</span>
              </label>

              {includeFinancing && (
                <div className="flex gap-4 animate-fade-in">
                  <label className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">APR</span>
                    <select
                      value={apr}
                      onChange={(e) => setApr(Number(e.target.value))}
                      className="bg-white/10 border border-white/10 text-white text-sm rounded-lg px-2 py-1.5 cursor-pointer focus:ring-1 focus:ring-primary outline-none"
                    >
                      {[6.9, 9.9, 12.9, 14.9, 18.9, 24.9].map((r) => (
                        <option key={r} value={r} className="bg-gray-900">{r}%</option>
                      ))}
                    </select>
                  </label>
                  <label className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Term</span>
                    <select
                      value={term}
                      onChange={(e) => setTerm(Number(e.target.value))}
                      className="bg-white/10 border border-white/10 text-white text-sm rounded-lg px-2 py-1.5 cursor-pointer focus:ring-1 focus:ring-primary outline-none"
                    >
                      {[36, 48, 60, 72, 84].map((t) => (
                        <option key={t} value={t} className="bg-gray-900">{t} months</option>
                      ))}
                    </select>
                  </label>
                </div>
              )}
            </div>

            {/* CTA */}
            <button
              onClick={() => setStep(1)}
              className="btn-primary w-full py-4 text-base"
            >
              Show Me The Real Cost <ChevronRight size={20} />
            </button>
          </div>
        ) : (
          /* ── STEP 2: Results ────────────────────────── */
          <div className="animate-fade-in space-y-8">
            {/* Comparison cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dealer card */}
              <div className="bg-gradient-to-br from-red-950/80 to-red-900/40 backdrop-blur-sm border border-red-500/20 rounded-3xl p-7 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-[60px]" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle size={16} className="text-red-400" />
                    <span className="text-xs font-bold text-red-300 uppercase tracking-widest">Traditional Dealer</span>
                  </div>
                  <AnimatedNumber
                    value={totalFinanced}
                    className="text-4xl md:text-5xl font-black text-red-300 block mt-3"
                  />
                  {includeFinancing && (
                    <p className="text-xs text-red-400/60 mt-2">
                      {fmt(Math.round(monthlyPmt))}/mo × {term} months
                    </p>
                  )}
                </div>
              </div>

              {/* TyFix card */}
              <div className="bg-gradient-to-br from-emerald-950/80 to-emerald-900/40 backdrop-blur-sm border border-emerald-500/20 rounded-3xl p-7 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[60px]" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign size={16} className="text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest">TyFix Cash Price</span>
                  </div>
                  <AnimatedNumber
                    value={tyfixTotal}
                    className="text-4xl md:text-5xl font-black text-emerald-300 block mt-3"
                  />
                  <p className="text-xs text-emerald-400/60 mt-2">Cash. No extras. Drive away today.</p>
                </div>
              </div>
            </div>

            {/* Savings callout */}
            <div className="text-center bg-primary/10 border border-primary/20 rounded-2xl p-5 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <p className="text-sm text-slate-400 mb-1">You save with TyFix</p>
              <div className="flex items-center justify-center gap-2">
                <TrendingUp size={24} className="text-primary" />
                <AnimatedNumber
                  value={savings}
                  className="text-3xl md:text-4xl font-black text-primary"
                />
              </div>
            </div>

            {/* Fee breakdown bars */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-7">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Where Your Money Goes at a Dealer</h4>
              <div className="space-y-4">
                {feeBreakdown.map((fee, i) => (
                  <FeeBar
                    key={fee.label}
                    label={fee.label}
                    amount={fee.amount}
                    total={totalFinanced}
                    color={fee.color}
                    delay={i * 80}
                  />
                ))}
              </div>
              <div className="mt-6 pt-5 border-t border-white/10 flex justify-between items-center">
                <span className="text-sm text-slate-300 font-bold">Total at Dealer</span>
                <AnimatedNumber value={totalFinanced} className="text-xl font-black text-white" />
              </div>
            </div>

            {/* Reset */}
            <button
              onClick={() => setStep(0)}
              className="mx-auto flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw size={14} /> Try a different price
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
