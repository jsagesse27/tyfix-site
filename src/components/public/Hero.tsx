import Link from 'next/link';
import { ArrowRight, Phone } from 'lucide-react';
import type { SiteSettings, SiteContent } from '@/lib/types';

interface HeroProps {
  settings: SiteSettings | null;
  content: Record<string, string>;
}

export default function Hero({ settings, content }: HeroProps) {
  const phone = settings?.phone_number || '(555) 123-4567';
  const smsNumber = settings?.sms_number || '5551234567';
  const tagline = content['homepage_tagline'] || 'Reliable Cars. Cash Prices. No Games.';
  const headline = content['homepage_headline'] || 'Quality Vehicles Under $7,500';
  const subheadline = content['homepage_subheadline'] || 'No credit checks. No interest. No monthly payments. Pay cash and drive away today in a vehicle you can trust.';
  const heroImage = content['hero_image_url'] || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1920';

  return (
    <section className="relative min-h-[700px] h-[90vh] flex items-center bg-gray-900">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={heroImage}
          alt="Quality used cars at TyFix Auto Sales"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/60 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-2xl animate-fade-in">
          <span className="inline-block bg-primary text-white text-sm font-bold px-4 py-1 rounded-full mb-6 uppercase tracking-[0.2em]">
            {tagline}
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6">
            {headline.includes('$') ? (
              <>
                {headline.split('$')[0]}
                <br />
                <span className="text-primary">${headline.split('$')[1]}</span>
              </>
            ) : (
              headline
            )}
          </h1>
          <p className="text-xl text-gray-300 mb-10 leading-relaxed">
            {subheadline}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/inventory" className="btn-primary flex items-center justify-center gap-2">
              Browse Inventory <ArrowRight size={20} />
            </Link>
            <a href={`tel:${smsNumber}`} className="btn-outline !text-white !border-white hover:!bg-white hover:!text-primary flex items-center justify-center gap-2">
              <Phone size={18} /> Call {phone}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
