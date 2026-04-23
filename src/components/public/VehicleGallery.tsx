'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import type { VehiclePhoto } from '@/lib/types';
import { getOptimizedImageUrl } from '@/lib/utils';

interface VehicleGalleryProps {
  photos: VehiclePhoto[];
  alt: string;
}

export default function VehicleGallery({ photos, alt }: VehicleGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  if (photos.length === 0) {
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
        <p>No photos available</p>
      </div>
    );
  }

  const prev = () => setActiveIndex((i) => (i === 0 ? photos.length - 1 : i - 1));
  const next = () => setActiveIndex((i) => (i === photos.length - 1 ? 0 : i + 1));

  return (
    <>
      {/* Main Image */}
      <div className="relative w-full h-[350px] md:h-[450px] rounded-2xl overflow-hidden bg-gray-100 group">
        <Image
          src={getOptimizedImageUrl(photos[activeIndex].public_url)}
          alt={`${alt} - Photo ${activeIndex + 1}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 800px"
          className="object-cover cursor-pointer"
          onClick={() => setIsZoomed(true)}
        />
        {photos.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
              <ChevronLeft size={20} />
            </button>
            <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
              <ChevronRight size={20} />
            </button>
          </>
        )}
        <button onClick={() => setIsZoomed(true)} className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
          <ZoomIn size={18} />
        </button>
        <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs font-bold px-3 py-1 rounded-full">
          {activeIndex + 1} / {photos.length}
        </div>
      </div>

      {/* Thumbnails */}
      {photos.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              onClick={() => setActiveIndex(i)}
              className={`relative flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                i === activeIndex ? 'border-primary shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <Image src={getOptimizedImageUrl(photo.public_url)} alt={`Thumbnail ${i + 1}`} fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {isZoomed && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setIsZoomed(false)}>
          <button onClick={() => setIsZoomed(false)} className="absolute top-4 right-4 text-white text-lg font-bold bg-white/20 rounded-full w-10 h-10 flex items-center justify-center hover:bg-white/30">
            ✕
          </button>
          {photos.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30">
                <ChevronLeft size={24} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30">
                <ChevronRight size={24} />
              </button>
            </>
          )}
          <img
            src={getOptimizedImageUrl(photos[activeIndex].public_url)}
            alt={`${alt} - Full size`}
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
