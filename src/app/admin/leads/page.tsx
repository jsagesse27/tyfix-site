'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search } from 'lucide-react';
import { timeAgo } from '@/lib/utils';
import type { Lead } from '@/lib/types';

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const supabase = createClient();

  const loadLeads = async () => {
    setLoading(true);
    const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    setLeads((data as Lead[]) || []);
    setLoading(false);
  };

  useEffect(() => { loadLeads(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('leads').update({ status }).eq('id', id);
    setLeads(leads.map((l) => l.id === id ? { ...l, status: status as Lead['status'] } : l));
  };

  const filtered = leads.filter((l) => {
    if (statusFilter !== 'all' && l.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return `${l.name} ${l.phone} ${l.email} ${l.vehicle_of_interest}`.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search leads..."
            className="input-field pl-9 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input-field w-auto text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Leads Table */}
      <div className="admin-card !p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading leads...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            {search || statusFilter !== 'all' ? 'No leads match your filters.' : 'No leads yet.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase border-b border-gray-100 bg-gray-50/50">
                  <th className="p-4 font-bold">Type</th>
                  <th className="p-4 font-bold">Name</th>
                  <th className="p-4 font-bold">Contact</th>
                  <th className="p-4 font-bold">Topic</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold">When</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        lead.lead_type === 'trade-in' ? 'bg-amber-100 text-amber-700' :
                        lead.lead_type === 'autoconnect' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {lead.lead_type}
                      </span>
                    </td>
                    <td className="p-4 font-black text-slate-900 group-hover:text-primary transition-colors">{lead.name}</td>
                    <td className="p-4">
                      <div className="flex flex-col gap-0.5">
                        <a href={`tel:${lead.phone}`} className="font-bold text-slate-700 hover:text-primary">{lead.phone}</a>
                        <span className="text-xs text-slate-400">{lead.email}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="max-w-[240px]">
                        <p className="font-bold text-slate-900 truncate">{lead.vehicle_of_interest}</p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{lead.message}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <select
                        className="text-xs font-bold rounded-full px-2 py-1 border border-slate-200 cursor-pointer bg-white"
                        value={lead.status}
                        onChange={(e) => updateStatus(lead.id, e.target.value)}
                      >
                        <option value="new">🔵 New</option>
                        <option value="contacted">✅ Contacted</option>
                        <option value="closed">⬜ Closed</option>
                      </select>
                    </td>
                    <td className="p-4 text-slate-400 whitespace-nowrap">{timeAgo(lead.created_at)}</td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => setSelectedLead(lead)}
                        className="px-4 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-primary transition-all active:scale-95"
                      >
                        View Full
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center font-bold uppercase tracking-widest">{filtered.length} lead{filtered.length !== 1 ? 's' : ''} total</p>
      
      {/* Lead Details Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedLead(null)} />
          <div className="relative bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-300">
            {/* Modal Header */}
            <div className={`px-8 py-6 text-white ${
              selectedLead.lead_type === 'trade-in' ? 'bg-amber-600' :
              selectedLead.lead_type === 'autoconnect' ? 'bg-red-800' :
              'bg-slate-900'
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest leading-none">
                    {selectedLead.lead_type} Submission
                  </span>
                  <h3 className="text-3xl font-black mt-2 leading-none">{selectedLead.name}</h3>
                </div>
                <button onClick={() => setSelectedLead(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors font-black text-xl leading-none">×</button>
              </div>
            </div>

            <div className="p-8 max-h-[70vh] overflow-y-auto font-sans">
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Contact Methods</h4>
                  <div className="space-y-3">
                    <p className="flex flex-col"><span className="text-xs font-bold text-slate-500">Phone</span> <span className="font-black text-slate-900">{selectedLead.phone}</span></p>
                    <p className="flex flex-col"><span className="text-xs font-bold text-slate-500">Email</span> <span className="font-bold text-primary">{selectedLead.email}</span></p>
                    {selectedLead.instagram && (
                      <p className="flex flex-col"><span className="text-xs font-bold text-slate-500">Instagram</span> <span className="font-bold text-pink-600">@{selectedLead.instagram.replace('@','')}</span></p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Lead Info</h4>
                  <div className="space-y-3">
                    <p className="flex flex-col"><span className="text-xs font-bold text-slate-500">Received</span> <span className="font-bold text-slate-900">{new Date(selectedLead.created_at).toLocaleString()}</span></p>
                    <p className="flex flex-col">
                      <span className="text-xs font-bold text-slate-500">Consent to Contact</span> 
                      <span className={`font-bold ${selectedLead.contact_consent ? 'text-green-600' : 'text-slate-400'}`}>
                        {selectedLead.contact_consent ? '✓ Yes' : 'No'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-8 p-6 rounded-3xl bg-slate-50 border border-slate-100">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Subject / Message</h4>
                <p className="font-black text-slate-900 text-lg mb-2">{selectedLead.vehicle_of_interest}</p>
                <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">{selectedLead.message}</p>
              </div>

              {selectedLead.timeline && (
                <div className="mb-8 p-6 rounded-3xl bg-red-50 border border-red-100">
                  <h4 className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Buy Timeline</h4>
                  <p className="font-black text-red-900 text-xl uppercase tracking-tight">{selectedLead.timeline}</p>
                </div>
              )}

              {selectedLead.extra_data && (
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Detailed Submission Info</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(selectedLead.extra_data).map(([key, value]: [string, any]) => (
                      <div key={key} className="p-3 bg-white border border-slate-100 rounded-xl">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block leading-none mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
              <button 
                onClick={() => setSelectedLead(null)}
                className="btn-primary"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
