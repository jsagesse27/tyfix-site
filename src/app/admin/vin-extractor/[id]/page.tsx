import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import VinListClient from './VinListClient';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

async function updateListTitle(formData: FormData) {
  'use server';
  const id = formData.get('id') as string;
  const title = formData.get('title') as string;
  const supabase = await createClient();
  await supabase.from('vin_extraction_lists').update({ title }).eq('id', id);
  revalidatePath(`/admin/vin-extractor/${id}`);
}

export default async function VinExtractorPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: list, error } = await supabase
    .from('vin_extraction_lists')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !list) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link href="/admin/vin-extractor" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors mb-2">
            <ArrowLeft size={14} /> Back to History
          </Link>
          <form action={updateListTitle} className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <input type="hidden" name="id" value={list.id} />
            <input 
              type="text" 
              name="title" 
              defaultValue={list.title} 
              className="text-2xl font-black text-gray-900 bg-transparent border-b-2 border-transparent hover:border-gray-200 focus:border-primary focus:outline-none transition-colors px-1 -ml-1 w-full max-w-sm"
              placeholder="List Title"
            />
            <button type="submit" className="text-xs font-bold text-gray-400 hover:text-primary flex items-center gap-1 transition-colors">
              <Save size={12} /> Save Title
            </button>
          </form>
        </div>
      </div>

      {/* Main Extractor Client */}
      <VinListClient list={list} />
    </div>
  );
}
