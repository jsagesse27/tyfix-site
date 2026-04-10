'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';

interface InquiryFormProps {
  vehicleOfInterest?: string;
  vehicleId?: string;
}

export default function InquiryForm({ vehicleOfInterest, vehicleId }: InquiryFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
    vehicle_of_interest: vehicleOfInterest || '',
    vehicle_id: vehicleId || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to submit');
      setIsSubmitted(true);
      setFormData({ name: '', phone: '', email: '', message: '', vehicle_of_interest: vehicleOfInterest || '', vehicle_id: vehicleId || '' });
    } catch {
      setError('Something went wrong. Please call us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center p-8">
        <CheckCircle2 size={48} className="text-success mx-auto mb-4" />
        <h4 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h4>
        <p className="text-gray-500">We&apos;ll get back to you as soon as possible.</p>
        <button
          onClick={() => setIsSubmitted(false)}
          className="mt-4 text-primary font-bold text-sm hover:underline"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="text"
          placeholder="Your Name *"
          required
          className="input-field"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          type="tel"
          placeholder="Phone Number *"
          required
          className="input-field"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email Address"
          className="input-field"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>
      {!vehicleOfInterest && (
        <input
          type="text"
          placeholder="Vehicle of Interest"
          className="input-field"
          value={formData.vehicle_of_interest}
          onChange={(e) => setFormData({ ...formData, vehicle_of_interest: e.target.value })}
        />
      )}
      <textarea
        placeholder="Message (optional)"
        rows={3}
        className="input-field resize-none"
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
      />
      {error && (
        <p className="text-danger text-sm">{error}</p>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send size={18} />
        {isSubmitting ? 'Sending...' : 'Send Inquiry'}
      </button>
    </form>
  );
}
