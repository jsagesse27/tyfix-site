'use client';

import { Star } from 'lucide-react';
import type { Testimonial, SiteSettings } from '@/lib/types';
import { useEffect } from 'react';

interface TestimonialsProps {
  testimonials: Testimonial[];
  settings: SiteSettings | null;
}

export default function Testimonials({ testimonials, settings }: TestimonialsProps) {
  // Check if we should show the section at all
  const showSection = settings?.show_reviews_section ?? true;
  if (!showSection) return null;

  // Option 1: Live Embed Script (GBP Real Reviews)
  const hasEmbed = !!settings?.google_reviews_embed;

  return (
    <section id="reviews" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-gray-900 mb-4">
            {hasEmbed ? 'Verified Reviews' : 'What Our Buyers Say'}
          </h2>
          <div className="flex items-center justify-center gap-1 text-yellow-500 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} fill="currentColor" size={24} />
            ))}
          </div>
          <p className="text-gray-500 font-medium">
            {hasEmbed ? 'Direct from TyFix Business Profile' : 'Rated 5 stars by real buyers'}
          </p>
        </div>

        {hasEmbed ? (
          /* Option 1: Real GBP Reviews Rendered Here */
          <div className="google-reviews-wrapper overflow-hidden rounded-[2.5rem] bg-white border border-slate-100 shadow-sm min-h-[400px]">
            <div
              className="px-4 py-8 md:px-8"
              dangerouslySetInnerHTML={{ __html: settings?.google_reviews_embed || '' }}
            />
          </div>
        ) : (
          /* Option 2: Fallback to Manual DB Reviews (the ones you saw initially) */
          <>
            {testimonials.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.map((t) => (
                  <div
                    key={t.id}
                    className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative hover:shadow-md transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{t.name}</h4>
                        {t.date_label && (
                          <p className="text-xs text-gray-500 uppercase tracking-widest font-black">{t.date_label}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500 mb-4">
                      {[...Array(t.star_rating)].map((_, i) => (
                        <Star key={i} fill="currentColor" size={16} />
                      ))}
                      {[...Array(5 - t.star_rating)].map((_, i) => (
                        <Star key={`empty-${i}`} size={16} className="text-gray-200" />
                      ))}
                    </div>
                    <p className="text-gray-600 italic leading-relaxed">&ldquo;{t.review_text}&rdquo;</p>
                    <div className="absolute top-8 right-8 text-primary/10">
                      <Star size={40} fill="currentColor" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 italic">Be our first reviewer!</p>
            )}
          </>
        )}
      </div>
    </section>
  );
}

