'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, Download, Trash2, FileText } from 'lucide-react';
import { formatPrice, getOptimizedImageUrl } from '@/lib/utils';
import type { BillOfSale } from '@/lib/types';

export default function FileCabinetPage() {
  const [bills, setBills] = useState<BillOfSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const supabase = createClient();

  const loadBills = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('bill_of_sales')
      .select('*')
      .order('created_at', { ascending: false });
    
    setBills((data as BillOfSale[]) || []);
    setLoading(false);
  };

  useEffect(() => { loadBills(); }, []);

  const filtered = bills.filter((b) => {
    if (search) {
      const q = search.toLowerCase();
      const match = `${b.vehicle_year} ${b.vehicle_make} ${b.vehicle_model} ${b.buyer_name} ${b.vehicle_vin || ''}`.toLowerCase();
      if (!match.includes(q)) return false;
    }
    return true;
  });

  const deleteBill = async (id: string, storagePath: string) => {
    if (!confirm('Are you sure you want to delete this Bill of Sale? This action cannot be undone.')) return;
    
    // Delete file from storage
    if (storagePath) {
      await supabase.storage.from('bill-of-sales').remove([storagePath]);
    }
    
    // Delete database record
    await supabase.from('bill_of_sales').delete().eq('id', id);
    loadBills();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="text-primary" /> File Cabinet
          </h1>
          <p className="text-sm text-gray-500 mt-1">Archived bills of sale and legal documents.</p>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search by buyer name, vehicle, or VIN..."
            className="input-field pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-card !p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading documents...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <FileText className="text-gray-300" size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No Documents Found</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              {search ? 'No documents match your search criteria.' : 'Generate your first Bill of Sale from the Inventory page, and it will appear here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-xs text-gray-400 uppercase border-b border-gray-100 bg-gray-50/50">
                  <th className="p-4 font-bold">Date</th>
                  <th className="p-4 font-bold">Vehicle</th>
                  <th className="p-4 font-bold">Buyer</th>
                  <th className="p-4 font-bold">Sale Price</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((bill) => (
                  <tr key={bill.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">
                      {new Date(bill.sale_date).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-gray-900">
                        {bill.vehicle_year} {bill.vehicle_make} {bill.vehicle_model}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 font-mono">
                        {bill.vehicle_vin || 'No VIN'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{bill.buyer_name}</div>
                      {bill.buyer_phone && <div className="text-xs text-gray-500">{bill.buyer_phone}</div>}
                    </td>
                    <td className="p-4 font-bold text-gray-900">
                      {formatPrice(bill.sale_price)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <a 
                          href={getOptimizedImageUrl(bill.pdf_public_url)} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-2 text-gray-500 hover:text-primary rounded-lg hover:bg-primary/5 transition-colors"
                          title="Download PDF"
                        >
                          <Download size={18} />
                        </a>
                        <button 
                          onClick={() => deleteBill(bill.id, bill.pdf_storage_path)} 
                          className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 size={18} />
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
      
      <div className="text-center text-xs text-gray-400">
        Showing {filtered.length} document{filtered.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
