'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Plus, Search, Eye, Pencil, Trash2, Copy, FileText } from 'lucide-react';
import { formatPrice, formatMileage, getOptimizedImageUrl } from '@/lib/utils';
import type { Vehicle } from '@/lib/types';
import BillOfSaleModal from '@/components/admin/BillOfSaleModal';
import { clearCacheByKey } from '../actions';

export default function AdminInventoryPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedVehicleForBill, setSelectedVehicleForBill] = useState<Vehicle | null>(null);

  const supabase = createClient();

  const loadVehicles = async () => {
    setLoading(true);
    
    // First fetch settings to get the pagination cap
    const { data: settingsData } = await supabase.from('site_settings').select('admin_inventory_per_page').limit(1).single();
    const limit = settingsData?.admin_inventory_per_page || 200;

    const query = supabase
      .from('vehicles')
      .select('*, photos:vehicle_photos(id, public_url, sort_order)')
      .order('created_at', { ascending: false })
      .limit(limit);
      
    const { data } = await query;
    setVehicles((data as Vehicle[]) || []);
    setLoading(false);
  };

  useEffect(() => { loadVehicles(); }, []);

  const filtered = vehicles.filter((v) => {
    if (statusFilter !== 'all' && v.listing_status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const match = `${v.year} ${v.make} ${v.model} ${v.vin || ''} ${v.stock_number || ''}`.toLowerCase();
      if (!match.includes(q)) return false;
    }
    return true;
  });

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('vehicles').update({ listing_status: status, updated_at: new Date().toISOString() }).eq('id', id);
    await clearCacheByKey('vehicles');
    loadVehicles();
  };

  const duplicateVehicle = async (vehicle: Vehicle) => {
    const { id, created_at, updated_at, photos, ...rest } = vehicle;
    const { data } = await supabase.from('vehicles').insert({ ...rest, stock_number: null, vin: null, listing_status: 'hidden' }).select().single();
    await clearCacheByKey('vehicles');
    if (data) {
      router.push(`/admin/inventory/${data.id}`);
    } else {
      loadVehicles(); // fallback
    }
  };

  const deleteVehicle = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this vehicle?')) return;
    await supabase.from('vehicles').delete().eq('id', id);
    await clearCacheByKey('vehicles');
    loadVehicles();
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-3 flex-1 w-full">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search vehicles..."
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
            <option value="active">Active</option>
            <option value="sold">Sold</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>
        <div className="flex gap-2 whitespace-nowrap">
          <Link href="/admin/inventory/batch" className="btn-admin-outline">
            <Plus size={16} /> Batch Add
          </Link>
          <Link href="/admin/inventory/new" className="btn-admin">
            <Plus size={16} /> Add Vehicle
          </Link>
        </div>
      </div>

      {/* Vehicle List */}
      <div className="admin-card !p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading inventory...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            {search || statusFilter !== 'all' ? 'No vehicles match your filters.' : 'No vehicles yet. Add your first vehicle!'}
          </div>
        ) : (
          <div className="overflow-hidden md:overflow-visible">
            <table className="w-full text-sm block md:table">
              <thead className="hidden md:table-header-group">
                <tr className="text-left text-xs text-gray-400 uppercase border-b border-gray-100 bg-gray-50/50">
                  <th className="p-3 font-bold">Vehicle</th>
                  <th className="p-3 font-bold">Price</th>
                  <th className="p-3 font-bold">Mileage</th>
                  <th className="p-3 font-bold">Status</th>
                  <th className="p-3 font-bold">Label</th>
                  <th className="p-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="block md:table-row-group divide-y divide-gray-100 md:divide-y md:divide-gray-50">
                {filtered.map((v) => (
                  <tr key={v.id} className="block md:table-row bg-white md:bg-transparent hover:bg-gray-50/50 border md:border-0 rounded-xl mb-4 md:mb-0 shadow-sm md:shadow-none p-4 md:p-0">
                    <td className="block md:table-cell p-0 md:p-3 pb-3 md:pb-0 mb-3 md:mb-0 border-b border-gray-50 md:border-0">
                      <div className="flex items-center gap-3">
                        {v.photos && v.photos.length > 0 ? (
                          <img src={getOptimizedImageUrl(v.photos.sort((a, b) => a.sort_order - b.sort_order)[0].public_url)} alt="" className="w-14 h-10 rounded-md object-cover" />
                        ) : (
                          <div className="w-14 h-10 rounded-md bg-gray-100 flex items-center justify-center text-gray-300 text-xs">No img</div>
                        )}
                        <div>
                          <p className="font-bold text-gray-900">{v.year} {v.make} {v.model}</p>
                          {v.stock_number && <p className="text-xs text-gray-400">Stock #{v.stock_number}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="flex md:table-cell items-center justify-between p-1 md:p-3 font-bold text-gray-900">
                      <span className="md:hidden text-xs text-gray-400 uppercase font-normal">Price</span>
                      {formatPrice(v.price)}
                    </td>
                    <td className="flex md:table-cell items-center justify-between p-1 md:p-3 text-gray-600">
                      <span className="md:hidden text-xs text-gray-400 uppercase font-normal">Mileage</span>
                      {formatMileage(v.mileage)} mi
                    </td>
                    <td className="flex md:table-cell items-center justify-between p-1 md:p-3">
                      <span className="md:hidden text-xs text-gray-400 uppercase font-normal">Status</span>
                      <select
                        className="text-sm md:text-xs font-bold rounded-full px-2 py-1 md:px-2 md:py-1 border-0 cursor-pointer bg-transparent text-right md:text-left -mr-2 md:mr-0"
                        value={v.listing_status}
                        onChange={(e) => updateStatus(v.id, e.target.value)}
                      >
                        <option value="active">✅ Active</option>
                        <option value="sold">🔴 Sold</option>
                        <option value="hidden">⬜ Hidden</option>
                      </select>
                    </td>
                    <td className="flex md:table-cell items-center justify-between p-1 md:p-3">
                      <span className="md:hidden text-xs text-gray-400 uppercase font-normal">Label</span>
                      {v.featured_label ? (
                        <span className="badge badge-featured">{v.featured_label}</span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="flex md:table-cell items-center justify-between md:justify-end p-1 md:p-3 border-t border-gray-50 md:border-0 mt-3 md:mt-0 pt-3 md:pt-3">
                      <span className="md:hidden text-xs text-gray-400 uppercase font-normal">Actions</span>
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/vehicles/${v.id}`} target="_blank" className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100" title="View on site">
                          <Eye size={16} />
                        </Link>
                        <Link href={`/admin/inventory/${v.id}`} className="p-2 text-gray-400 hover:text-primary rounded-lg hover:bg-gray-100" title="Edit">
                          <Pencil size={16} />
                        </Link>
                        <button onClick={() => duplicateVehicle(v)} className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100" title="Duplicate">
                          <Copy size={16} />
                        </button>
                        <button onClick={() => deleteVehicle(v.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50" title="Delete">
                          <Trash2 size={16} />
                        </button>
                        <button onClick={() => setSelectedVehicleForBill(v)} className="p-2 text-gray-400 hover:text-green-500 rounded-lg hover:bg-green-50 ml-2" title="Generate Bill of Sale">
                          <FileText size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center">{filtered.length} vehicle{filtered.length !== 1 ? 's' : ''}</p>
      
      {selectedVehicleForBill && (
        <BillOfSaleModal
          vehicle={selectedVehicleForBill}
          onClose={() => setSelectedVehicleForBill(null)}
          onSuccess={() => {
            loadVehicles(); // Reload to capture status changes
          }}
        />
      )}
    </div>
  );
}
