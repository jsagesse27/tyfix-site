import React from 'react';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Plus, List, Search, ArrowRight, Trash2 } from 'lucide-react';
import { timeAgo } from '@/lib/utils';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

async function createNewList(formData: FormData) {
  'use server';
  const supabase = await createClient();
  const title = formData.get('title') as string || `VIN List - ${new Date().toLocaleDateString()}`;
  
  const { data, error } = await supabase
    .from('vin_extraction_lists')
    .insert({ title, items: [] })
    .select('id')
    .single();

  if (error) {
    console.error('Failed to create VIN list:', error);
    return;
  }

  redirect(`/admin/vin-extractor/${data.id}`);
}

async function deleteList(formData: FormData) {
  'use server';
  const id = formData.get('id') as string;
  const supabase = await createClient();
  await supabase.from('vin_extraction_lists').delete().eq('id', id);
  revalidatePath('/admin/vin-extractor');
}

export default async function VinExtractorDashboard({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const query = searchParams?.q || '';
  const supabase = await createClient();

  let dbQuery = supabase
    .from('vin_extraction_lists')
    .select('*')
    .order('created_at', { ascending: false });

  if (query) {
    dbQuery = dbQuery.ilike('title', `%${query}%`);
  }

  const { data: lists } = await dbQuery;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <List className="text-primary" /> VIN Extractor
          </h1>
          <p className="text-gray-500 mt-1">
            Rapid fire VIN scanning and batch extraction.
          </p>
        </div>

        <form action={createNewList} className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <input 
            type="text" 
            name="title" 
            placeholder="List name (optional)" 
            className="input-field w-full sm:w-64"
          />
          <button type="submit" className="btn-admin whitespace-nowrap">
            <Plus size={16} /> New Scanner List
          </button>
        </form>
      </div>

      <div className="admin-card">
        <form className="mb-6 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search extraction lists..."
            className="input-field pl-10"
          />
        </form>

        {(!lists || lists.length === 0) ? (
          <div className="text-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-xl">
            <List size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-900">No lists found</h3>
            <p className="text-gray-500 max-w-md mx-auto mt-2 mb-6">
              Create your first VIN Extractor list to start scanning inventory.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lists.map((list: any) => (
              <div key={list.id} className="border border-gray-200 rounded-xl p-4 hover:border-primary/30 transition-all flex flex-col h-full bg-gray-50/50 hover:bg-white shadow-sm">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-gray-900 truncate pr-2" title={list.title}>{list.title}</h3>
                  <div className="flex items-center gap-1.5 text-xs font-medium px-2 py-1 bg-gray-200 text-gray-700 rounded-md">
                    {list.items?.length || 0} VINs
                  </div>
                </div>
                
                <p className="text-xs text-gray-500 mt-2 flex-grow">
                  Created {timeAgo(list.created_at)}
                </p>

                <div className="mt-4 flex justify-between items-center pt-4 border-t border-gray-100">
                  <form action={deleteList}>
                    <input type="hidden" name="id" value={list.id} />
                    <button type="submit" className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Delete List">
                      <Trash2 size={16} />
                    </button>
                  </form>
                  <Link href={`/admin/vin-extractor/${list.id}`} className="text-primary text-sm font-bold flex items-center gap-1 hover:text-primary-dark hover:underline">
                    Open List <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
