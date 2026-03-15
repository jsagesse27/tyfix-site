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
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase border-b border-gray-100 bg-gray-50/50">
                  <th className="p-3 font-bold">Name</th>
                  <th className="p-3 font-bold">Phone</th>
                  <th className="p-3 font-bold">Email</th>
                  <th className="p-3 font-bold">Vehicle</th>
                  <th className="p-3 font-bold">Message</th>
                  <th className="p-3 font-bold">Status</th>
                  <th className="p-3 font-bold">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50/50">
                    <td className="p-3 font-medium text-gray-900 whitespace-nowrap">{lead.name}</td>
                    <td className="p-3">
                      {lead.phone ? (
                        <a href={`tel:${lead.phone}`} className="text-primary hover:underline">{lead.phone}</a>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="p-3">
                      {lead.email ? (
                        <a href={`mailto:${lead.email}`} className="text-primary hover:underline">{lead.email}</a>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="p-3 text-gray-600 max-w-[200px] truncate">{lead.vehicle_of_interest || '—'}</td>
                    <td className="p-3 text-gray-500 max-w-[200px] truncate">{lead.message || '—'}</td>
                    <td className="p-3">
                      <select
                        className="text-xs font-bold rounded-full px-2 py-1 border-0 cursor-pointer bg-transparent"
                        value={lead.status}
                        onChange={(e) => updateStatus(lead.id, e.target.value)}
                      >
                        <option value="new">🔵 New</option>
                        <option value="contacted">✅ Contacted</option>
                        <option value="closed">⬜ Closed</option>
                      </select>
                    </td>
                    <td className="p-3 text-gray-400 whitespace-nowrap">{timeAgo(lead.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center">{filtered.length} lead{filtered.length !== 1 ? 's' : ''}</p>
    </div>
  );
}
