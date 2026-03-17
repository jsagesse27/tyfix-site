'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Check } from 'lucide-react';

export default function LeadCapturePopup() {
  const [show, setShow] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', instagram: '', consent: false });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem('tyfix_popup_dismissed')) return;
    const t = setTimeout(() => setShow(true), 4000);
    return () => clearTimeout(t);
  }, []);

  const close = () => { setShow(false); localStorage.setItem('tyfix_popup_dismissed', '1'); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.consent) return;
    setSubmitting(true);
    try {
      await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setSubmitted(true);
      localStorage.setItem('tyfix_popup_dismissed', '1');
    } catch { alert('Something went wrong. Please try again.'); }
    finally { setSubmitting(false); }
  };

  const u = (k: string, v: string | boolean) => setForm(p => ({ ...p, [k]: v }));

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            <button onClick={close} className="absolute top-4 right-4 z-10 p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={18} className="text-slate-400" /></button>

            {submitted ? (
              <div className="p-10 text-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"><Check size={32} /></div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">You're In! 🎉</h3>
                 <p className="text-slate-500 text-sm">We'll notify you when new cars hit the lot. Your $250 discount will be applied at purchase.</p>
                <button onClick={close} className="btn-primary mt-6 w-full">Got It</button>
              </div>
            ) : (
              <>
                <div className="bg-gradient-to-br from-primary to-red-900 p-8 text-center text-white">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4"><Gift size={28} /></div>
                  <h3 className="text-2xl font-black mb-1">Get $250 Off Your Next Car</h3>
                  <p className="text-white/80 text-sm">Sign up for alerts when new cars hit the lot</p>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input required placeholder="First Name" className="input-field h-12 text-sm" value={form.firstName} onChange={e => u('firstName', e.target.value)} />
                    <input required placeholder="Last Name" className="input-field h-12 text-sm" value={form.lastName} onChange={e => u('lastName', e.target.value)} />
                  </div>
                  <input required type="email" placeholder="Email Address" className="input-field h-12 text-sm" value={form.email} onChange={e => u('email', e.target.value)} />
                  <input required type="tel" placeholder="Phone Number" className="input-field h-12 text-sm" value={form.phone} onChange={e => u('phone', e.target.value)} />
                  <input placeholder="@instagram (optional)" className="input-field h-12 text-sm" value={form.instagram} onChange={e => u('instagram', e.target.value)} />
                  <label className="flex items-start gap-2 cursor-pointer pt-1">
                    <input type="checkbox" checked={form.consent} onChange={e => u('consent', e.target.checked)} className="mt-1 accent-primary w-4 h-4" />
                    <span className="text-[11px] text-slate-500 leading-tight">I agree to receive calls, texts, and emails from TyFix Auto Sales about inventory updates and promotions.</span>
                  </label>
                   <button type="submit" disabled={submitting || !form.consent} className="btn-primary w-full h-12 disabled:opacity-50 text-sm">
                    {submitting ? 'Signing Up...' : 'Claim My $250 Discount'}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
