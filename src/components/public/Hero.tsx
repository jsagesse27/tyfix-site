'use client';

import Link from 'next/link';
import { ArrowRight, Phone, ChevronDown } from 'lucide-react';
import type { SiteSettings, SiteContent } from '@/lib/types';

interface HeroProps {
  settings: SiteSettings | null;
  content: Record<string, string>;
  soldCount: number;
}

export default function Hero({ settings, content, soldCount }: HeroProps) {
  const phone = settings?.phone_number || '(555) 123-4567';
  const smsNumber = settings?.sms_number || '5551234567';
  const tagline = content['homepage_tagline'] || 'Tell a friend to tell a friend, come shop with TyFix!';
  const headline = content['homepage_headline'] || 'Quality Vehicles Under $5,000';
  const subheadline = content['homepage_subheadline'] || 'No credit checks. No interest. No monthly payments. Pay cash and drive away today in a vehicle you can trust.';
  const heroImage = content['hero_image_url'] || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1920';

  const stats = [
    { 
      value: `${parseInt(content['hero_stat_1_base'] || '5639') + soldCount}+`, 
      label: content['hero_stat_1_label'] || 'Cars Sold' 
    },
    { 
      value: content['hero_stat_2_value'] || '100k+', 
      label: content['hero_stat_2_label'] || 'Happy Clients' 
    },
    { 
      value: content['hero_stat_3_value'] || '100%', 
      label: content['hero_stat_3_label'] || 'Cash-Only' 
    },
  ];

  const headlineParts = headline.includes('$')
    ? [headline.split('$')[0], '$' + headline.split('$')[1]]
    : [headline, null];

  return (
    <section className="relative min-h-[100svh] flex flex-col justify-center bg-[#050A14] overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Quality used cars at TyFix Auto Sales"
          className="w-full h-full object-cover opacity-30"
        />
        {/* Multi-layer gradient — parallax depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#050A14] via-[#050A14]/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050A14] via-transparent to-[#050A14]/40" />
      </div>

      {/* Ambient blobs (Motion-Driven style) */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-primary/10 blur-[120px] animate-blob pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/3 w-72 h-72 rounded-full bg-red-900/15 blur-[100px] animate-blob-delayed pointer-events-none" />

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-28 pb-16">
        <div className="max-w-3xl">
          {/* Section label */}
          <div className="animate-fade-in" style={{ animationDelay: '0ms' }}>
            <span className="section-label !text-primary/90">
              {tagline}
            </span>
          </div>

          {/* Headline */}
          <h1
            className="text-5xl sm:text-6xl md:text-7xl xl:text-8xl font-black text-white leading-[1.0] tracking-tight mb-6 animate-fade-in"
            style={{ animationDelay: '100ms', opacity: 0, fontFamily: 'Space Grotesk, sans-serif' }}
          >
            {headlineParts[1] ? (
              <>
                {headlineParts[0]}
                <br />
                <span
                  className="text-primary"
                  style={{ textShadow: '0 0 60px rgba(139,0,0,0.4)' }}
                >
                  {headlineParts[1]}
                </span>
              </>
            ) : (
              headline
            )}
          </h1>

          {/* Subheadline */}
          <p
            className="text-lg md:text-xl text-slate-300 mb-10 leading-relaxed max-w-xl animate-fade-in"
            style={{ animationDelay: '200ms', opacity: 0 }}
          >
            {subheadline}
          </p>

          {/* CTAs */}
          <div
            className="flex flex-col sm:flex-row gap-4 animate-fade-in"
            style={{ animationDelay: '300ms', opacity: 0 }}
          >
            <Link href="/inventory" className="btn-primary text-base px-8 py-4">
              Browse Inventory <ArrowRight size={20} />
            </Link>
            <a
              href={`tel:${smsNumber}`}
              className="btn-outline !text-white !border-white/40 hover:!bg-white/10 hover:!border-white text-base px-8 py-4"
            >
              <Phone size={18} /> Call {phone}
            </a>
          </div>
        </div>

        {/* Stats strip */}
        <div
          className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in"
          style={{ animationDelay: '450ms', opacity: 0 }}
        >
          {stats.map((stat, i) => (
            <div
              key={i}
              className="border border-white/10 rounded-2xl p-4 backdrop-blur-sm bg-white/5 text-center"
            >
              <p className="text-2xl md:text-3xl font-black text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{stat.value}</p>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-float">
        <ChevronDown size={28} className="text-white/30" />
      </div>
    </section>
  );
}
