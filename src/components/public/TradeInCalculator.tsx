'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Car, ArrowRight, ArrowLeft, CheckCircle2, User, Phone, Mail, Send, Camera, AlertCircle } from 'lucide-react';
import { decodeSingleVin } from '@/lib/vpic';
import { MAKES } from '@/lib/constants';

const EXTERIOR_LOOK = ['Excellent — like new', 'Good — minor wear', 'Fair — noticeable wear', 'Needs work'];
const DENTS = ['None', 'Minor (1-2 small)', 'Moderate (several)', 'Significant'];
const WINDSHIELD = ['Perfect', 'Small chip(s)', 'Crack(s)'];
const TIRES = ['Great shape', 'Getting worn', 'Need replacing soon'];
const RUST = ['None', 'Surface rust only', 'Structural rust'];
const INTERIOR = ['Like new', 'Normal wear', 'Some stains or tears', 'Needs attention'];
const ODORS = ['None', 'Mild', 'Noticeable (smoke, pets, etc.)'];
const WARNINGS = ['None — all clear', 'Check Engine light', 'Multiple lights on', 'Not sure'];
const FEATURES = ['All working perfectly', '1-2 things need fixing', 'Several issues'];
const OIL_CHANGE = ['Within 3 months', '3-6 months ago', 'Over 6 months ago', 'Not sure'];
const ACCIDENTS = ['Never — clean history', 'Minor fender bender', 'Moderate accident', 'Major accident'];

function OptionGrid({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {options.map(opt => (
        <button key={opt} type="button" onClick={() => onChange(opt)} className={`text-left px-4 py-3 rounded-xl border text-sm transition-all cursor-pointer ${value === opt ? 'border-primary bg-primary/5 text-primary font-bold' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
          {opt}
        </button>
      ))}
    </div>
  );
}

export default function TradeInCalculator() {
  const [step, setStep] = useState(1);
  const [vinMode, setVinMode] = useState(true);
  const [vinInput, setVinInput] = useState('');
  const [vinLoading, setVinLoading] = useState(false);
  const [vinError, setVinError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    vin: '', year: '', make: '', model: '', trim: '', engine: '', mileage: '', exteriorColor: '',
    body_type: '', transmission: '', fuel_type: '', drivetrain: '', cylinders: '', doors: '',
    isOriginalOwner: '', ownershipDuration: '',
    exteriorLook: '', dentsScratches: '', windshield: '', tireCondition: '', rust: '',
    interiorCondition: '', odors: '', warningLights: '', workingFeatures: '', lastOilChange: '', accidentHistory: '',
    name: '', phone: '', email: '', notes: '',
  });

  const [fetchedModels, setFetchedModels] = useState<string[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);

  const u = useCallback((k: string, v: string) => setForm(p => ({ ...p, [k]: v })), []);
  const totalSteps = 6;
  const next = () => setStep(s => Math.min(s + 1, totalSteps));
  const prev = () => setStep(s => Math.max(s - 1, 1));

  React.useEffect(() => {
    if (!vinMode && form.year && form.make) {
      const fetchModels = async () => {
        setModelsLoading(true);
        try {
          const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${form.make}/modelyear/${form.year}?format=json`);
          if (res.ok) {
            const data = await res.json();
            if (data.Results) {
              const modelNames = data.Results.map((r: any) => r.Model_Name);
              setFetchedModels(Array.from(new Set(modelNames)).sort() as string[]);
            }
          }
        } catch {
          setFetchedModels([]);
        } finally {
          setModelsLoading(false);
        }
      };
      
      const debounce = setTimeout(fetchModels, 300);
      return () => clearTimeout(debounce);
    }
  }, [vinMode, form.year, form.make]);

  const decodeVin = async () => {
    if (vinInput.length < 11) { setVinError('Please enter a valid VIN (at least 11 characters)'); return; }
    setVinLoading(true); setVinError('');
    try {
      const result = await decodeSingleVin(vinInput);
      if (!result.error) {
        setForm(p => ({ 
          ...p, vin: vinInput, year: result.year, make: result.make, model: result.model, 
          trim: result.trim, engine: result.engine, body_type: result.body_type, 
          transmission: result.transmission, fuel_type: result.fuel_type, 
          drivetrain: result.drivetrain, cylinders: result.cylinders, doors: result.doors 
        }));
        next();
      } else { setVinError('Could not decode this VIN. Please check and try again, or enter info manually.'); }
    } catch { setVinError('Network error. Please try again or enter info manually.'); }
    finally { setVinLoading(false); }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/trade-in', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch { alert('Failed to submit. Please call us directly.'); }
    finally { setSubmitting(false); }
  };

  const Label = ({ children }: { children: React.ReactNode }) => <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{children}</label>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-6 text-white">
          <h2 className="text-2xl font-black">Get Your Instant Quote</h2>
          <p className="text-slate-400 text-sm mt-1">Step {step} of {totalSteps}</p>
          <div className="mt-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div className="h-full bg-primary rounded-full" animate={{ width: `${(step / totalSteps) * 100}%` }} transition={{ duration: 0.5 }} />
          </div>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 size={40} /></div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Submission Received!</h3>
                <p className="text-slate-500">We'll review your vehicle info and get back to you within <strong>24 hours</strong> with a cash offer.</p>
              </motion.div>
            ) : step === 1 ? (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900 mb-1">Let's Identify Your Vehicle</h3>
                  <p className="text-slate-500 text-sm">VIN gives us the most accurate information for the best quote.</p>
                </div>
                <div className="flex gap-2 mb-4">
                  <button onClick={() => setVinMode(true)} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${vinMode ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'}`}>Enter VIN (Recommended)</button>
                  <button onClick={() => setVinMode(false)} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${!vinMode ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'}`}>Enter Manually</button>
                </div>

                {vinMode ? (
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input
                        placeholder="Enter your 17-character VIN"
                        className="input-field pl-12 h-14 font-mono uppercase tracking-wider"
                        maxLength={17}
                        value={vinInput}
                        onChange={e => { setVinInput(e.target.value.toUpperCase()); setVinError(''); }}
                      />
                    </div>
                    {vinError && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={14} /> {vinError}</p>}
                    <p className="text-[11px] text-slate-400 italic">Find your VIN on the driver's side dashboard (visible through windshield) or inside the driver's door jamb.</p>
                    <button onClick={decodeVin} disabled={vinLoading || vinInput.length < 11} className="btn-primary w-full h-14 disabled:opacity-50">
                      {vinLoading ? 'Decoding...' : 'Decode VIN'} <ArrowRight size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Year *</Label>
                        <select className="input-field h-12" value={form.year} onChange={e => { u('year', e.target.value); u('model', ''); }}>
                          <option value="">Select Year</option>
                          {Array.from({ length: 30 }, (_, i) => String(2026 - i)).map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>
                      <div>
                        <Label>Make *</Label>
                        <select className="input-field h-12" value={form.make} onChange={e => { u('make', e.target.value); u('model', ''); }}>
                          <option value="">Select Make</option>
                          {MAKES.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Model *</Label>
                        {modelsLoading ? (
                          <div className="input-field h-12 flex items-center text-slate-400 text-sm">Loading...</div>
                        ) : fetchedModels.length > 0 ? (
                          <select className="input-field h-12" value={form.model} onChange={e => u('model', e.target.value)}>
                            <option value="">Select Model</option>
                            {fetchedModels.map(m => <option key={m} value={m}>{m}</option>)}
                          </select>
                        ) : (
                          <input placeholder="e.g. Civic" className="input-field h-12" value={form.model} onChange={e => u('model', e.target.value)} />
                        )}
                      </div>
                      <div><Label>Trim</Label><input placeholder="e.g. EX" className="input-field h-12" value={form.trim} onChange={e => u('trim', e.target.value)} /></div>
                    </div>
                    <button onClick={next} disabled={!form.year || !form.make || !form.model} className="btn-primary w-full h-14 disabled:opacity-50">
                      Continue <ArrowRight size={18} />
                    </button>
                  </div>
                )}
              </motion.div>
            ) : step === 2 ? (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                {form.vin && (
                  <div className="p-4 rounded-xl bg-green-50 border border-green-200 flex items-start gap-3">
                    <Car className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="font-bold text-green-800">{form.year} {form.make} {form.model} {form.trim}</p>
                      {form.engine && <p className="text-green-600 text-sm">{form.engine}</p>}
                      <p className="text-green-500 text-xs mt-1">VIN: {form.vin}</p>
                    </div>
                  </div>
                )}
                <div><Label>Current Mileage *</Label><input type="number" placeholder="e.g. 85,000" className="input-field h-14" value={form.mileage} onChange={e => u('mileage', e.target.value)} /></div>
                <div><Label>Exterior Color</Label><input placeholder="e.g. Silver" className="input-field h-14" value={form.exteriorColor} onChange={e => u('exteriorColor', e.target.value)} /></div>
                <div><Label>Are you the original owner?</Label>
                  <div className="flex gap-3">
                    {['Yes', 'No'].map(v => <button key={v} onClick={() => u('isOriginalOwner', v)} className={`flex-1 py-3 rounded-xl border text-sm font-bold cursor-pointer transition-all ${form.isOriginalOwner === v ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-slate-600'}`}>{v}</button>)}
                  </div>
                </div>
                <div><Label>How long have you owned it?</Label>
                  <OptionGrid options={['Less than 1 year', '1-3 years', '3-5 years', '5+ years']} value={form.ownershipDuration} onChange={v => u('ownershipDuration', v)} />
                </div>
                <div className="flex gap-4 pt-2">
                  <button onClick={prev} className="btn-outline flex-1 h-14"><ArrowLeft size={18} /> Back</button>
                  <button onClick={next} disabled={!form.mileage} className="btn-primary flex-[2] h-14 disabled:opacity-50">Continue <ArrowRight size={18} /></button>
                </div>
              </motion.div>
            ) : step === 3 ? (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <h3 className="text-lg font-black text-slate-900">Exterior Condition</h3>
                <div><Label>How does your car look from 10 feet away?</Label><OptionGrid options={EXTERIOR_LOOK} value={form.exteriorLook} onChange={v => u('exteriorLook', v)} /></div>
                <div><Label>Any dents, scratches, or paint issues?</Label><OptionGrid options={DENTS} value={form.dentsScratches} onChange={v => u('dentsScratches', v)} /></div>
                <div><Label>Windshield condition?</Label><OptionGrid options={WINDSHIELD} value={form.windshield} onChange={v => u('windshield', v)} /></div>
                <div><Label>Tire condition?</Label><OptionGrid options={TIRES} value={form.tireCondition} onChange={v => u('tireCondition', v)} /></div>
                <div><Label>Any rust?</Label><OptionGrid options={RUST} value={form.rust} onChange={v => u('rust', v)} /></div>
                <div className="flex gap-4 pt-2">
                  <button onClick={prev} className="btn-outline flex-1 h-14"><ArrowLeft size={18} /> Back</button>
                  <button onClick={next} className="btn-primary flex-[2] h-14">Continue <ArrowRight size={18} /></button>
                </div>
              </motion.div>
            ) : step === 4 ? (
              <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <h3 className="text-lg font-black text-slate-900">Interior & Mechanical</h3>
                <div><Label>How's the interior?</Label><OptionGrid options={INTERIOR} value={form.interiorCondition} onChange={v => u('interiorCondition', v)} /></div>
                <div><Label>Any odors? (Be honest — it won't hurt your quote)</Label><OptionGrid options={ODORS} value={form.odors} onChange={v => u('odors', v)} /></div>
                <div><Label>Dashboard warning lights on?</Label><OptionGrid options={WARNINGS} value={form.warningLights} onChange={v => u('warningLights', v)} /></div>
                <div><Label>All features working? (AC, windows, locks, radio)</Label><OptionGrid options={FEATURES} value={form.workingFeatures} onChange={v => u('workingFeatures', v)} /></div>
                <div><Label>When was the last oil change?</Label><OptionGrid options={OIL_CHANGE} value={form.lastOilChange} onChange={v => u('lastOilChange', v)} /></div>
                <div><Label>Has this vehicle been in any accidents?</Label><OptionGrid options={ACCIDENTS} value={form.accidentHistory} onChange={v => u('accidentHistory', v)} /></div>
                <div className="flex gap-4 pt-2">
                  <button onClick={prev} className="btn-outline flex-1 h-14"><ArrowLeft size={18} /> Back</button>
                  <button onClick={next} className="btn-primary flex-[2] h-14">Continue <ArrowRight size={18} /></button>
                </div>
              </motion.div>
            ) : step === 5 ? (
              <motion.div key="s5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <h3 className="text-lg font-black text-slate-900">Photos</h3>
                <p className="text-slate-500 text-sm">Clear photos help us give you a more accurate quote. This step is optional but highly recommended.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {['Front', 'Rear', 'Driver Side', 'Passenger Side', 'Dashboard', 'Any Damage'].map(label => (
                    <div key={label} className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-3 hover:border-primary/50 transition-colors cursor-pointer group">
                      <Camera size={24} className="text-slate-300 group-hover:text-primary transition-colors mb-2" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 italic">Photo upload coming soon — for now, you can text photos directly to us after submitting.</p>
                <div className="flex gap-4 pt-2">
                  <button onClick={prev} className="btn-outline flex-1 h-14"><ArrowLeft size={18} /> Back</button>
                  <button onClick={next} className="btn-primary flex-[2] h-14">Continue <ArrowRight size={18} /></button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="s6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <h3 className="text-lg font-black text-slate-900">Your Contact Info</h3>
                <div className="space-y-3">
                  <div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} /><input required placeholder="Full Name" className="input-field pl-12 h-14" value={form.name} onChange={e => u('name', e.target.value)} /></div>
                  <div className="relative"><Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} /><input required type="tel" placeholder="Phone Number" className="input-field pl-12 h-14" value={form.phone} onChange={e => u('phone', e.target.value)} /></div>
                  <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} /><input type="email" placeholder="Email (Optional)" className="input-field pl-12 h-14" value={form.email} onChange={e => u('email', e.target.value)} /></div>
                </div>
                <div><Label>Anything else we should know?</Label><textarea rows={2} placeholder="Additional notes about your vehicle..." className="input-field resize-none p-4" value={form.notes} onChange={e => u('notes', e.target.value)} /></div>
                <div className="flex gap-4 pt-2">
                  <button onClick={prev} className="btn-outline flex-1 h-14"><ArrowLeft size={18} /> Back</button>
                  <button onClick={handleSubmit} disabled={submitting || !form.name || !form.phone} className="btn-primary flex-[2] h-14 disabled:opacity-50">
                    {submitting ? 'Submitting...' : 'Get My Quote'} <Send size={18} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
