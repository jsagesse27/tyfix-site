'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CalendarCheck, ChevronDown } from 'lucide-react';
import type { SiteSettings } from '@/lib/types';
import Image from 'next/image';
import BookTestDrive from './BookTestDrive';

interface HeroProps {
  settings: SiteSettings | null;
  content: Record<string, string>;
  soldCount: number;
}

export default function Hero({ settings, content, soldCount }: HeroProps) {
  const [showBooking, setShowBooking] = useState(false);
  const tagline = content['homepage_tagline'] || 'Reliable Cars. Cash Prices. No Games.';
  const subheadline = content['homepage_subheadline'] || 'No credit checks. No interest. No monthly payments. Pay cash and drive away today in a vehicle you can trust.';
  const heroImage = content['hero_image_url'] || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1920';

  const stats = [
    { value: `${parseInt(content['hero_stat_1_base'] || '5639') + soldCount}+`, label: content['hero_stat_1_label'] || 'Cars Sold' },
    { value: content['hero_stat_2_value'] || '100k+', label: content['hero_stat_2_label'] || 'Happy Clients' },
    { value: content['hero_stat_3_value'] || '100%', label: content['hero_stat_3_label'] || 'Cash-Only' },
  ];

  return (
    <>
      <section className="relative min-h-[100svh] flex flex-col justify-center bg-[#050A14] overflow-hidden text-center">
        <div className="absolute inset-0 z-0">
          <img src={heroImage} alt="Quality used cars at TyFix Auto Sales" className="w-full h-full object-cover opacity-20 scale-105" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050A14] via-transparent to-[#050A14]" />
        </div>

        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-32 pb-16 flex flex-col items-center">
          <div className="animate-fade-in mb-8" style={{ animationDelay: '0ms' }}>
            <span className="section-label !text-primary/90">{tagline}</span>
          </div>

          <div className="flex flex-col items-center mb-10 animate-fade-in" style={{ animationDelay: '100ms', opacity: 0 }}>
            {/* Scaled Up Logo */}
            <div className="relative mb-4">
              <Image 
                src="/tyfix-logo.png" 
                alt="TyFix" 
                width={600} 
                height={200} 
                className="w-auto h-24 sm:h-32 md:h-40 xl:h-48 drop-shadow-[0_0_30px_rgba(139,0,0,0.3)]"
                priority
              />
            </div>
            
            <h1 className="flex flex-col items-center gap-1 sm:gap-4 font-black tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              <span className="text-4xl sm:text-5xl md:text-6xl text-white/90 uppercase tracking-[0.2em] -mt-4 sm:-mt-8 mb-8">Auto Sales</span>
              
              <div className="flex flex-col gap-0 leading-[1.0]">
                <span className="text-5xl sm:text-7xl md:text-8xl xl:text-9xl text-white">Quality Cars</span>
                <span className="text-6xl sm:text-8xl md:text-9xl xl:text-[11rem] text-primary" style={{ textShadow: '0 0 80px rgba(139,0,0,0.5)' }}>Under $5000</span>
              </div>
            </h1>
          </div>

            <p className="text-lg md:text-xl text-slate-300 mb-10 leading-relaxed max-w-xl animate-fade-in" style={{ animationDelay: '200ms', opacity: 0 }}>{subheadline}</p>

            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '300ms', opacity: 0 }}>
              <Link href="/inventory" className="btn-primary text-base px-8 py-4">
                Browse Inventory <ArrowRight size={20} />
              </Link>
              <button onClick={() => setShowBooking(true)} className="btn-outline !text-white !border-white/40 hover:!bg-white/10 hover:!border-white text-base px-8 py-4 cursor-pointer">
                <CalendarCheck size={18} /> Book a Test Drive
              </button>
            </div>

            <div className="mt-16 sm:mt-24 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full animate-fade-in" style={{ animationDelay: '450ms', opacity: 0 }}>
              {stats.map((stat, i) => (
                <div key={i} className="border border-white/10 rounded-2xl p-6 backdrop-blur-sm bg-white/5 text-center">
                  <p className="text-2xl md:text-3xl font-black text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{stat.value}</p>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-float">
            <ChevronDown size={28} className="text-white/30" />
          </div>
        </section>
        <BookTestDrive isOpen={showBooking} onClose={() => setShowBooking(false)} />
      </>
    );
}
