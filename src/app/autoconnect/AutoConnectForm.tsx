'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Send, CheckCircle2 } from 'lucide-react';
import { MAKES, YEARS } from '@/lib/constants';

export default function AutoConnectForm() {
  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    year: '', make: '', model: '',
    budget: '', timeline: 'flexible', notes: '',
  });
  
  const [fetchedModels, setFetchedModels] = useState<string[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);

  useEffect(() => {
    if (form.year && form.make) {
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
    } else {
      setFetchedModels([]);
    }
  }, [form.year, form.make]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const supabase = createClient();
    const vehicle_of_interest = `${form.year} ${form.make} ${form.model}`.trim();
    
    await supabase.from('leads').insert({
      name: form.name,
      phone: form.phone,
      email: form.email,
      vehicle_of_interest: vehicle_of_interest || 'Unspecified Vehicle',
      message: `AutoConnect Request | Budget: ${form.budget} | Timeline: ${form.timeline} | Notes: ${form.notes}`,
      status: 'new',
      lead_type: 'autoconnect',
      contact_consent: true,
    });

    setSubmitted(true);
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="text-center py-12 px-6 bg-green-50 rounded-2xl">
        <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-black text-gray-900 mb-2">Request Submitted!</h3>
        <p className="text-gray-600">
          We&apos;ll be in touch within 24 hours to discuss your ideal vehicle and get the search started.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-8 rounded-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Your Name *</label>
          <input
            className="input-field"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number *</label>
          <input
            className="input-field"
            required
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="(555) 000-0000"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
        <input
          className="input-field"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="john@email.com"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Year *</label>
          <select required className="input-field" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value, model: '' })}>
            <option value="">Year</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Make *</label>
          <select required className="input-field" value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value, model: '' })}>
            <option value="">Make</option>
            {MAKES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Model *</label>
          {modelsLoading ? (
            <div className="input-field flex items-center text-slate-400 text-sm">Loading...</div>
          ) : fetchedModels.length > 0 ? (
            <select required className="input-field" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })}>
              <option value="">Select Model</option>
              {fetchedModels.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          ) : (
            <input required className="input-field" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="e.g. Civic" />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Budget *</label>
          <select
            className="input-field"
            required
            value={form.budget}
            onChange={(e) => setForm({ ...form, budget: e.target.value })}
          >
            <option value="">Select budget range</option>
            <option value="$3,500 - $5,000">$3,500 - $5,000</option>
            <option value="$5,000 - $7,500">$5,000 - $7,500</option>
            <option value="$7,500 - $10,000">$7,500 - $10,000</option>
            <option value="$10,000+">$10,000+</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Timeline</label>
          <select
            className="input-field"
            value={form.timeline}
            onChange={(e) => setForm({ ...form, timeline: e.target.value })}
          >
            <option value="asap">ASAP - Need it now</option>
            <option value="2weeks">Within 2 weeks</option>
            <option value="month">Within a month</option>
            <option value="flexible">Flexible</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Additional Notes</label>
        <textarea
          className="input-field resize-none"
          rows={3}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Any specific features, colors, or requirements..."
        />
      </div>

      <button type="submit" disabled={submitting} className="btn-primary w-full">
        <Send size={18} />
        {submitting ? 'Submitting...' : 'Start My AutoConnect™ Search'}
      </button>

      <p className="text-xs text-gray-400 text-center">
        By submitting, you agree to be contacted about your AutoConnect™ request. $1,000 refundable deposit required to begin search.
      </p>
    </form>
  );
}
