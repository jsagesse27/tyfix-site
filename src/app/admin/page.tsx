import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Car, Users, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import { timeAgo } from '@/lib/utils';
import type { Vehicle, Lead } from '@/lib/types';

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [vehiclesRes, leadsRes, recentLeadsRes] = await Promise.all([
    supabase.from('vehicles').select('id, listing_status, featured_label', { count: 'exact' }),
    supabase.from('leads').select('id', { count: 'exact' }),
    supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(10),
  ]);

  const vehicles = vehiclesRes.data || [];
  const activeCount = vehicles.filter((v: { listing_status: string }) => v.listing_status === 'active').length;
  const featuredCount = vehicles.filter((v: { featured_label: string | null }) => v.featured_label).length;
  const totalLeads = leadsRes.count || 0;
  const recentLeads = (recentLeadsRes.data as Lead[]) || [];

  const stats = [
    { label: 'Active Vehicles', value: activeCount, icon: <Car size={24} />, color: 'bg-blue-50 text-blue-600', href: '/admin/inventory' },
    { label: 'Total Leads', value: totalLeads, icon: <Users size={24} />, color: 'bg-green-50 text-green-600', href: '/admin/leads' },
    { label: 'Featured', value: featuredCount, icon: <TrendingUp size={24} />, color: 'bg-purple-50 text-purple-600', href: '/admin/inventory' },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/admin/inventory?new=true" className="btn-admin">
          <Plus size={16} /> Add Vehicle
        </Link>
        <Link href="/admin/vin-extractor" className="btn-admin-outline">
          <TrendingUp size={16} /> VIN Extractor
        </Link>
        <Link href="/" target="_blank" className="btn-admin-outline">
          View Live Site
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="admin-card hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                <p className="text-3xl font-black text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Leads */}
      <div className="admin-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Recent Leads</h2>
          <Link href="/admin/leads" className="text-primary text-sm font-bold flex items-center gap-1">
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {recentLeads.length === 0 ? (
          <p className="text-gray-400 text-sm py-8 text-center">No leads yet. They&apos;ll appear here once someone submits an inquiry.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase border-b border-gray-100">
                  <th className="pb-3 pr-4 font-bold">Name</th>
                  <th className="pb-3 pr-4 font-bold">Phone</th>
                  <th className="pb-3 pr-4 font-bold">Vehicle</th>
                  <th className="pb-3 pr-4 font-bold">Status</th>
                  <th className="pb-3 font-bold">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="py-3 pr-4 font-medium text-gray-900">{lead.name}</td>
                    <td className="py-3 pr-4 text-gray-600">{lead.phone || '—'}</td>
                    <td className="py-3 pr-4 text-gray-600 max-w-[200px] truncate">{lead.vehicle_of_interest || '—'}</td>
                    <td className="py-3 pr-4">
                      <span className={`badge ${lead.status === 'new' ? 'badge-new' : lead.status === 'contacted' ? 'badge-active' : 'badge-hidden'}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-400">{timeAgo(lead.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
