'use client';

import { useState, useEffect } from 'react';
import { X, FileText, Download, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import SignaturePad from './SignaturePad';
import { generateBillOfSalePDF } from '@/lib/bill-of-sale-pdf';
import type { Vehicle, SiteSettings } from '@/lib/types';
import { formatPrice, formatMileage } from '@/lib/utils';
import { generateVehicleSlug } from '@/lib/slug';

interface BillOfSaleModalProps {
  vehicle: Vehicle;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BillOfSaleModal({ vehicle, onClose, onSuccess }: BillOfSaleModalProps) {
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  // Form State
  const [salePrice, setSalePrice] = useState(vehicle.price.toString());
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [buyerSignature, setBuyerSignature] = useState<string | null>(null);

  // Final confirmation step features
  const [markAsSold, setMarkAsSold] = useState(true);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase.from('site_settings').select('*').limit(1).single();
      if (data) setSettings(data as SiteSettings);
    }
    loadSettings();
  }, []);

  const handleGenerate = async () => {
    if (!settings) return;
    setLoading(true);

    try {
      const saleDate = new Date().toLocaleDateString('en-US', { timeZone: 'UTC' }); // simple date format

      // 1. Generate PDF
      const pdfBlob = generateBillOfSalePDF({
        vehicle: {
          year: vehicle.year,
          make: vehicle.make,
          model: vehicle.model,
          vin: vehicle.vin || 'N/A',
          mileage: vehicle.mileage,
          color: vehicle.exterior_color || 'N/A'
        },
        buyer: {
          name: buyerName,
          phone: buyerPhone,
          address: buyerAddress
        },
        seller: {
          printedName: settings.dealer_printed_name || 'Dealer',
          signatureBase64: settings.dealer_signature_data
        },
        buyerSignature: buyerSignature!,
        salePrice: parseInt(salePrice) || 0,
        saleDate
      });

      // 2. Upload to storage
      const fileName = `${vehicle.id}/${Date.now()}-bill-of-sale.pdf`;
      const { error: uploadError } = await supabase.storage
        .from('bill-of-sales')
        .upload(fileName, pdfBlob, { contentType: 'application/pdf' });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('bill-of-sales').getPublicUrl(fileName);
      const publicUrl = urlData.publicUrl;

      // 3. Save to database
      const { error: dbError } = await supabase.from('bill_of_sales').insert({
        vehicle_id: vehicle.id,
        vehicle_year: vehicle.year,
        vehicle_make: vehicle.make,
        vehicle_model: vehicle.model,
        vehicle_vin: vehicle.vin,
        vehicle_stock_number: vehicle.stock_number,
        vehicle_mileage: vehicle.mileage,
        vehicle_color: vehicle.exterior_color,
        vehicle_price: vehicle.price,
        buyer_name: buyerName,
        buyer_phone: buyerPhone,
        buyer_address: buyerAddress,
        sale_price: parseInt(salePrice) || 0,
        pdf_storage_path: fileName,
        pdf_public_url: publicUrl,
        buyer_signature_data: buyerSignature
      });

      if (dbError) throw dbError;

      // 4. Update vehicle status if checked
      if (markAsSold) {
        await supabase.from('vehicles').update({ listing_status: 'sold' }).eq('id', vehicle.id);
      }

      setGeneratedPdfUrl(publicUrl);
      setStep(4);
    } catch (err) {
      console.error('Failed to generate Bill of Sale:', err);
      alert('Failed to generate Bill of Sale. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (generatedPdfUrl) {
      window.open(generatedPdfUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FileText className="text-primary" /> Generate Bill of Sale
            </h2>
            <p className="text-sm text-gray-500">
              {step < 4 ? `Step ${step} of 3` : 'Complete'}
            </p>
          </div>
          {step < 4 && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-900 p-2">
              <X size={20} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {step === 1 && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h3 className="font-bold mb-4 border-b border-gray-200 pb-2">Vehicle Snapshot</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500">Vehicle:</span> <span className="font-medium">{vehicle.year} {vehicle.make} {vehicle.model}</span></div>
                  <div><span className="text-gray-500">VIN:</span> <span className="font-medium">{vehicle.vin || 'N/A'}</span></div>
                  <div><span className="text-gray-500">Stock #:</span> <span className="font-medium">{vehicle.stock_number || 'N/A'}</span></div>
                  <div><span className="text-gray-500">Mileage:</span> <span className="font-medium">{formatMileage(vehicle.mileage)} mi</span></div>
                  <div><span className="text-gray-500">Color:</span> <span className="font-medium">{vehicle.exterior_color || 'N/A'}</span></div>
                  <div><span className="text-gray-500">Listed Price:</span> <span className="font-medium">{formatPrice(vehicle.price)}</span></div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Final Sale Price (USD) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    className="input-field pl-8"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Buyer Full Name *</label>
                <input
                  type="text"
                  className="input-field"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Buyer Phone</label>
                <input
                  type="tel"
                  className="input-field"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Buyer Address</label>
                <textarea
                  className="input-field resize-none h-20"
                  value={buyerAddress}
                  onChange={(e) => setBuyerAddress(e.target.value)}
                  placeholder="123 Main St..."
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-amber-50 text-amber-800 p-4 rounded-lg text-sm border border-amber-200">
                Please have the buyer review the terms and sign below. They are agreeing to purchase the vehicle AS IS with no warranties.
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Buyer Signature *</label>
                <SignaturePad onSignatureChange={setBuyerSignature} initialSignature={buyerSignature} />
              </div>
              {!settings?.dealer_signature_data && (
                <div className="text-sm text-red-500 mt-2">
                  Warning: You have not set a dealer signature in Settings. The seller signature line will be blank.
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="py-8 flex flex-col items-center justify-center space-y-6 text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Bill of Sale Generated!</h3>
                <p className="text-gray-500">The PDF has been saved to your File Cabinet.</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 w-full max-w-sm text-left space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                    checked={markAsSold}
                    onChange={(e) => setMarkAsSold(e.target.checked)}
                  />
                  <span className="font-medium">Mark vehicle as "Sold"</span>
                </label>
              </div>

              <button onClick={handleDownload} className="btn-primary w-full max-w-sm flex items-center justify-center gap-2 py-3">
                <Download size={20} /> Download PDF
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {step < 4 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
            <button
              onClick={step === 1 ? onClose : () => setStep(step - 1)}
              className="text-gray-500 font-medium hover:text-gray-900 px-4 py-2"
              disabled={loading}
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </button>
            
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="btn-primary"
                disabled={(step === 1 && !salePrice) || (step === 2 && !buyerName)}
              >
                Next Step
              </button>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={!buyerSignature || loading}
                className="btn-primary"
              >
                {loading ? 'Generating...' : 'Generate Bill of Sale'}
              </button>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-center shrink-0">
             <button
                onClick={() => {
                  onSuccess();
                  onClose();
                }}
                className="text-gray-500 font-medium hover:text-gray-900 px-4 py-2"
              >
                Close & Return to Inventory
              </button>
          </div>
        )}
      </div>
    </div>
  );
}
