'use client';

import { BarChart3, ExternalLink } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Analytics</h2>
        <p className="text-sm text-gray-400 mt-1">Website performance and tracking overview</p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <a
          href="https://analytics.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="admin-card hover:shadow-lg transition-shadow flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
            <BarChart3 size={24} />
          </div>
          <div>
            <p className="font-bold text-gray-900">Google Analytics</p>
            <p className="text-xs text-gray-400">View full GA4 dashboard</p>
          </div>
          <ExternalLink size={16} className="text-gray-300 ml-auto" />
        </a>

        <a
          href="https://search.google.com/search-console"
          target="_blank"
          rel="noopener noreferrer"
          className="admin-card hover:shadow-lg transition-shadow flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
            <BarChart3 size={24} />
          </div>
          <div>
            <p className="font-bold text-gray-900">Search Console</p>
            <p className="text-xs text-gray-400">SEO performance & indexing</p>
          </div>
          <ExternalLink size={16} className="text-gray-300 ml-auto" />
        </a>

        <a
          href="https://business.facebook.com/events_manager2"
          target="_blank"
          rel="noopener noreferrer"
          className="admin-card hover:shadow-lg transition-shadow flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
            <BarChart3 size={24} />
          </div>
          <div>
            <p className="font-bold text-gray-900">Meta Pixel</p>
            <p className="text-xs text-gray-400">Conversion tracking & audiences</p>
          </div>
          <ExternalLink size={16} className="text-gray-300 ml-auto" />
        </a>
      </div>

      {/* Event Tracking Status */}
      <div className="admin-card">
        <h3 className="font-bold text-gray-900 mb-4">Conversion Events Configured</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { event: 'click_to_call', desc: 'Phone calls from website' },
            { event: 'click_to_text', desc: 'SMS messages from website' },
            { event: 'form_submission', desc: 'Lead form submissions' },
            { event: 'appointment_booked', desc: 'Test drive bookings' },
            { event: 'vdp_view', desc: 'Vehicle detail page views' },
            { event: 'chat_initiated', desc: 'AI chatbot conversations started' },
            { event: 'inventory_search', desc: 'Inventory filter usage' },
            { event: 'directions_clicked', desc: 'Google Maps clicks' },
            { event: 'social_click', desc: 'Social media link clicks' },
            { event: 'share', desc: 'Vehicle share/copy link' },
          ].map((e) => (
            <div key={e.event} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <div>
                <p className="text-sm font-bold text-gray-700 font-mono">{e.event}</p>
                <p className="text-xs text-gray-400">{e.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Setup Status */}
      <div className="admin-card">
        <h3 className="font-bold text-gray-900 mb-4">Tracking Setup Status</h3>
        <div className="space-y-3">
          {[
            { name: 'Google Tag Manager', envVar: 'NEXT_PUBLIC_GTM_ID', status: !!process.env.NEXT_PUBLIC_GTM_ID },
            { name: 'Google Analytics 4', envVar: 'NEXT_PUBLIC_GA4_ID', status: !!process.env.NEXT_PUBLIC_GA4_ID },
            { name: 'Meta Pixel', envVar: 'NEXT_PUBLIC_META_PIXEL_ID', status: !!process.env.NEXT_PUBLIC_META_PIXEL_ID },
          ].map((item) => (
            <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-bold text-gray-700">{item.name}</p>
                <p className="text-xs text-gray-400 font-mono">{item.envVar}</p>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${item.status ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {item.status ? 'Active' : 'Not Set'}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Add tracking IDs to your <code className="bg-gray-100 px-1 rounded">.env.local</code> file to activate.
        </p>
      </div>
    </div>
  );
}
