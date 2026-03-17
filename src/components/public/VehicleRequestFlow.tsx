'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Car, DollarSign, User, Phone, Mail, Send, CheckCircle2, ChevronRight, ChevronLeft, Clock, Zap } from 'lucide-react';

interface VehicleRequestFlowProps {
  isOpen: boolean;
  onClose: () => void;
}

const TIMELINE_OPTIONS = [
  { value: 'this_week', label: '⚡ This week', urgent: true },
  { value: '2_3_weeks', label: '📅 Within 2-3 weeks', urgent: true },
  { value: 'within_month', label: '🔍 Within a month', urgent: false },
  { value: 'browsing', label: '🕐 Just browsing / Not sure', urgent: false },
];

export default function VehicleRequestFlow({ isOpen, onClose }: VehicleRequestFlowProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showAutoConnect, setShowAutoConnect] = useState(false);
  const [formData, setFormData] = useState({
    vehicleType: '', budget: '', name: '', phone: '', email: '', notes: '', timeline: '',
  });

  const totalSteps = 4;
  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleTimelineSelect = (value: string) => {
    setFormData(p => ({ ...p, timeline: value }));
    const isUrgent = TIMELINE_OPTIONS.find(o => o.value === value)?.urgent;
    if (isUrgent) {
      setShowAutoConnect(true);
    } else {
      handleSubmit(value);
    }
  };

  const handleSubmit = async (timeline?: string) => {
    setIsSubmitting(true);
    try {
      const tl = timeline || formData.timeline;
      const message = `VEHICLE REQUEST:\nType: ${formData.vehicleType}\nBudget: ${formData.budget}\nTimeline: ${TIMELINE_OPTIONS.find(o => o.value === tl)?.label || tl}\nNotes: ${formData.notes}`;
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name, phone: formData.phone, email: formData.email,
          message, vehicle_of_interest: 'Vehicle Request', vehicle_id: null,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      setIsSubmitted(true);
    } catch { alert('Failed to send request. Please call us directly.'); }
    finally { setIsSubmitting(false); }
  };

  const handleAutoConnectEnroll = () => {
    // Submit the vehicle request first, then redirect conceptually to AutoConnect
    handleSubmit();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-black text-slate-900">{showAutoConnect ? 'Skip the Wait!' : 'Request a Vehicle'}</h3>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-0.5">
              {showAutoConnect ? 'AutoConnect™ Program' : `Step ${step} of ${totalSteps}`}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} className="text-slate-400" /></button>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {isSubmitted ? (
              <motion.div key="success" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 size={40} /></div>
                <h4 className="text-2xl font-black text-slate-900 mb-2">Request Received!</h4>
                <p className="text-slate-500">We've added you to our watchlist and will contact you as soon as we find a match.</p>
                <button onClick={onClose} className="btn-primary mt-8 w-full">Got it</button>
              </motion.div>
            ) : showAutoConnect ? (
              <motion.div key="autoconnect" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4"><Zap size={32} /></div>
                  <h4 className="text-xl font-black text-slate-900 mb-2">Need Your Car ASAP?</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    With our <strong className="text-slate-800">AutoConnect™ Program</strong>, we go directly to auctions to find your ideal vehicle at below-market prices — instead of waiting to see if we get your request.
                  </p>
                </div>
                <div className="space-y-3 bg-amber-50 rounded-2xl p-5 border border-amber-100">
                  {['We personally attend auctions to find your match', 'Below-market prices — no Marketplace markup', 'Average turnaround: ~3 weeks (faster if flexible)', 'Min. $3,500 budget • $1,000 deposit required'].map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <a href="/#autoconnect" onClick={onClose} className="btn-primary w-full h-14 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 !border-amber-500">
                    <Zap size={18} /> Learn More & Enroll
                  </a>
                  <button onClick={() => { setShowAutoConnect(false); handleSubmit(); }} className="btn-outline w-full h-14">
                    No thanks, submit my request
                  </button>
                </div>
              </motion.div>
            ) : step === 1 ? (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">What are you looking for?</label>
                  <div className="relative">
                    <Car className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input type="text" placeholder="e.g. 2015 Honda Civic or Small SUV" className="input-field pl-12 h-14" value={formData.vehicleType} onChange={e => setFormData({...formData, vehicleType: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Any specific preferences? (Optional)</label>
                  <textarea placeholder="Color, mileage, features..." rows={3} className="input-field resize-none p-4" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
                </div>
                <button onClick={nextStep} disabled={!formData.vehicleType} className="btn-primary w-full h-14 disabled:opacity-50">
                  Continue <ChevronRight size={18} />
                </button>
              </motion.div>
            ) : step === 2 ? (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">What's your total cash budget?</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input type="text" placeholder="e.g. $4,500" className="input-field pl-12 h-14" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 italic font-medium">Remember, all our cars are quality inspected and priced for cash buyers.</p>
                </div>
                <div className="flex gap-4">
                  <button onClick={prevStep} className="btn-outline flex-1 h-14">Back</button>
                  <button onClick={nextStep} disabled={!formData.budget} className="btn-primary flex-[2] h-14 disabled:opacity-50">
                    Continue <ChevronRight size={18} />
                  </button>
                </div>
              </motion.div>
            ) : step === 3 ? (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Your Contact Info</label>
                  <div className="space-y-3">
                    <div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} /><input type="text" placeholder="Full Name" className="input-field pl-12 h-14" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
                    <div className="relative"><Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} /><input type="tel" placeholder="Phone Number" className="input-field pl-12 h-14" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
                    <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} /><input type="email" placeholder="Email Address (Optional)" className="input-field pl-12 h-14" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
                  </div>
                </div>
                <div className="flex gap-4 pt-2">
                  <button onClick={prevStep} className="btn-outline flex-1 h-14">Back</button>
                  <button onClick={nextStep} disabled={!formData.name || !formData.phone} className="btn-primary flex-[2] h-14 disabled:opacity-50">
                    Continue <ChevronRight size={18} />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">How soon are you looking to buy?</label>
                  <div className="space-y-3">
                    {TIMELINE_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => handleTimelineSelect(opt.value)}
                        disabled={isSubmitting}
                        className="w-full text-left px-5 py-4 rounded-xl border border-slate-200 text-slate-700 font-medium hover:border-primary hover:bg-primary/5 transition-all cursor-pointer flex items-center justify-between group"
                      >
                        <span>{opt.label}</span>
                        <ChevronRight size={16} className="text-slate-300 group-hover:text-primary" />
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={prevStep} className="btn-outline w-full h-14">Back</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!isSubmitted && !showAutoConnect && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-100">
            <motion.div className="h-full bg-primary" initial={{ width: '25%' }} animate={{ width: `${(step / totalSteps) * 100}%` }} transition={{ duration: 0.5, ease: 'circOut' }} />
          </div>
        )}
      </motion.div>
    </div>
  );
}
