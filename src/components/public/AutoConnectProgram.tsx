'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, Handshake, Banknote, Search, Truck, ChevronRight, ChevronLeft, User, Phone, Mail, CheckCircle2, Send, Zap } from 'lucide-react';
import { useReveal } from '@/lib/useReveal';

const STEPS = [
  { icon: ClipboardList, title: 'Fill Out the Form', desc: 'Provide your budget, vehicle type, preferences, and upload realistic comps.' },
  { icon: Handshake, title: 'We Review & Connect', desc: 'A TyFix representative will contact you to confirm details and ensure alignment.' },
  { icon: Banknote, title: 'Agreement & Deposit', desc: '$1,000 non-refundable deposit collected. For serious buyers only.' },
  { icon: Search, title: 'We Hunt the Deal', desc: 'TyFix personally attends auctions to locate your ideal vehicle at below-market prices.' },
  { icon: Truck, title: 'Pick Up or Delivery', desc: 'Once secured, pick it up directly or request delivery for an additional fee.' },
];

const FLEXIBILITY_OPTIONS = ['Very flexible — open to suggestions', 'Somewhat flexible', 'Specific requirements only'];

export default function AutoConnectProgram() {
  const [activeStep, setActiveStep] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    budget: '', vehicleType: '', preferences: '', yearRange: '', maxMileage: '', colorPref: '', flexibility: '', name: '', phone: '', email: '', depositAck: false,
  });

  const sectionRef = useReveal();
  const u = (k: string, v: string | boolean) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/autoconnect', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch { alert('Failed to submit. Please call us directly.'); }
    finally { setSubmitting(false); }
  };

  return (
    <section id="autoconnect" className="relative py-28 bg-[#070C18] text-white overflow-hidden">
      {/* Ambient effects */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-primary/20 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div ref={sectionRef} className="reveal text-center mb-16">
          <span className="section-label !text-primary">Skip the Search</span>
          <h2 className="text-4xl md:text-5xl font-black leading-tight mb-4">
            TyFix <span className="text-primary">AutoConnect</span>™
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Don't waste time searching dealerships and marketplaces. We go directly to auctions to secure your ideal vehicle at below-market prices.
          </p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-6">
            <span className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 border border-primary/20 text-primary-light text-[10px] sm:text-sm font-bold tracking-tight uppercase">Min. $3,500 Budget</span>
            <span className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 border border-primary/20 text-primary-light text-[10px] sm:text-sm font-bold tracking-tight uppercase">~3 Weeks Avg.</span>
            <span className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 border border-primary/20 text-primary-light text-[10px] sm:text-sm font-bold tracking-tight uppercase">$1,000 Deposit</span>
          </div>
        </div>

        {/* How It Works — Interactive Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-3">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const isActive = activeStep === i;
              return (
                <button
                  key={i}
                  onClick={() => setActiveStep(i)}
                  className={`w-full text-left flex gap-4 p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                    isActive ? 'bg-primary/10 border-primary/30' : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm transition-all ${
                    isActive ? 'bg-primary text-white shadow-lg shadow-primary/40' : 'bg-white/10 text-white/60'
                  }`}>
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-base">{step.title}</h4>
                    <AnimatePresence mode="wait">
                      {isActive && (
                        <motion.p
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="text-slate-400 text-sm mt-1 leading-relaxed overflow-hidden"
                        >
                          {step.desc}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center"
                >
                  {(() => { const Icon = STEPS[activeStep].icon; return <Icon size={48} className="text-primary-light mx-auto mb-4" />; })()}
                  <h3 className="text-2xl font-black mb-3">Step {activeStep + 1}: {STEPS[activeStep].title}</h3>
                  <p className="text-slate-300 leading-relaxed">{STEPS[activeStep].desc}</p>
                  {activeStep === 2 && (
                    <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                      ⚠️ The $1,000 deposit is non-refundable. It safeguards our time and resources for committed buyers only.
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button onClick={() => setShowForm(true)} className="btn-primary inline-flex items-center gap-2 px-10 py-5 text-lg font-black tracking-tight uppercase shadow-2xl shadow-primary/25">
            <Zap size={22} className="fill-white" /> Enroll in AutoConnect™
          </button>
        </div>

        {/* Enrollment Modal */}
        <AnimatePresence>
          {showForm && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden text-slate-900 max-h-[90vh] overflow-y-auto"
              >
                <div className="px-5 sm:px-8 py-4 sm:py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <div>
                    <h3 className="text-base sm:text-lg font-black">AutoConnect™ Enrollment</h3>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-0.5">Step {formStep} of 2</p>
                  </div>
                  <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-full"><span className="text-slate-400 text-xl">✕</span></button>
                </div>

                <div className="p-5 sm:p-8">
                  <AnimatePresence mode="wait">
                    {submitted ? (
                      <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 size={32} /></div>
                        <h4 className="text-2xl font-black mb-2">Enrollment Submitted!</h4>
                        <p className="text-slate-500 text-sm">A TyFix representative will contact you within 24 hours to confirm details and next steps.</p>
                        <button onClick={() => setShowForm(false)} className="btn-primary mt-6 w-full">Got It</button>
                      </motion.div>
                    ) : formStep === 1 ? (
                      <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Your Total Budget *</label>
                          <input type="number" min="3500" placeholder="Minimum $3,500" className="input-field h-14" value={form.budget} onChange={e => u('budget', e.target.value)} />
                          {form.budget && Number(form.budget) < 3500 && <p className="text-red-500 text-xs mt-1">Minimum budget is $3,500</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">What type of vehicle? *</label>
                          <input placeholder="e.g. Honda Civic, Small SUV, Sedan" className="input-field h-14" value={form.vehicleType} onChange={e => u('vehicleType', e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Preferences</label>
                          <textarea placeholder="Color, features, specific models, brands..." rows={2} className="input-field resize-none p-4" value={form.preferences} onChange={e => u('preferences', e.target.value)} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Year Range</label>
                            <input placeholder="e.g. 2015-2020" className="input-field h-12" value={form.yearRange} onChange={e => u('yearRange', e.target.value)} />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Max Mileage</label>
                            <input placeholder="e.g. 100,000" className="input-field h-12" value={form.maxMileage} onChange={e => u('maxMileage', e.target.value)} />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">How flexible are you?</label>
                          <div className="space-y-2">
                            {FLEXIBILITY_OPTIONS.map(opt => (
                              <button key={opt} onClick={() => u('flexibility', opt)} className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all cursor-pointer ${form.flexibility === opt ? 'border-primary bg-primary/5 text-primary font-bold' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                        <button onClick={() => setFormStep(2)} disabled={!form.budget || Number(form.budget) < 3500 || !form.vehicleType} className="btn-primary w-full h-14 disabled:opacity-50 mt-2">
                          Continue <ChevronRight size={18} />
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                        <div className="space-y-3">
                          <div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} /><input required placeholder="Full Name" className="input-field pl-12 h-14" value={form.name} onChange={e => u('name', e.target.value)} /></div>
                          <div className="relative"><Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} /><input required type="tel" placeholder="Phone Number" className="input-field pl-12 h-14" value={form.phone} onChange={e => u('phone', e.target.value)} /></div>
                          <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} /><input type="email" placeholder="Email (Optional)" className="input-field pl-12 h-14" value={form.email} onChange={e => u('email', e.target.value)} /></div>
                        </div>
                        <label className="flex items-start gap-2 cursor-pointer pt-2">
                          <input type="checkbox" checked={form.depositAck} onChange={e => u('depositAck', e.target.checked)} className="mt-1 accent-primary w-4 h-4" />
                          <span className="text-xs text-slate-500 leading-tight">I understand a <strong className="text-slate-700">$1,000 non-refundable deposit</strong> is required after my submission is reviewed and a search plan is confirmed.</span>
                        </label>
                        <div className="flex gap-4 pt-2">
                          <button onClick={() => setFormStep(1)} className="btn-outline flex-1 h-14"><ChevronLeft size={18} /> Back</button>
                          <button onClick={handleSubmit} disabled={submitting || !form.name || !form.phone || !form.depositAck} className="btn-primary flex-[2] h-14 disabled:opacity-50">
                            {submitting ? 'Submitting...' : 'Submit Enrollment'} <Send size={18} />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
