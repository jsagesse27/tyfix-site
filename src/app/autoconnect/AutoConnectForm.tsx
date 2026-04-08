'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Send, CheckCircle2 } from 'lucide-react';

export default function AutoConnectForm() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    desiredVehicle: '',
    budget: '',
    timeline: 'flexible',
    notes: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const supabase = createClient();
    await supabase.from('leads').insert({
      name: form.name,
      phone: form.phone,
      email: form.email,
      vehicle_of_interest: form.desiredVehicle,
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

      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">What Vehicle Are You Looking For? *</label>
        <input
          className="input-field"
          required
          value={form.desiredVehicle}
          onChange={(e) => setForm({ ...form, desiredVehicle: e.target.value })}
          placeholder="e.g., 2018 Honda Civic, white, under 80K miles"
        />
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
