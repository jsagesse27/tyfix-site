'use client';

import { ShieldCheck, DollarSign, Zap } from 'lucide-react';
import { useReveal, useStaggerReveal } from '@/lib/useReveal';

interface TrustBadgesProps {
  content: Record<string, string>;
}

const ICONS = [
  <ShieldCheck key="shield" size={28} strokeWidth={1.5} />,
  <DollarSign key="dollar" size={28} strokeWidth={1.5} />,
  <Zap key="zap" size={28} strokeWidth={1.5} />,
];

export default function TrustBadges({ content }: TrustBadgesProps) {
  const headingRef = useReveal();
  const cardsRef = useStaggerReveal(0.1);

  const badges = [
    { icon: ICONS[0], title: content['trust_badge_1_title'] || 'TyFix 25-Point Check', desc: content['trust_badge_1_desc'] || 'Every vehicle passes a rigorous mechanical inspection before it hits the lot.' },
    { icon: ICONS[1], title: content['trust_badge_2_title'] || 'No Hidden Fees', desc: content['trust_badge_2_desc'] || 'The price you see is the price you pay. No doc fees, no admin fees, no surprises.' },
    { icon: ICONS[2], title: content['trust_badge_3_title'] || 'Drive Today', desc: content['trust_badge_3_desc'] || 'Cash-only means no waiting for bank approvals. Sign the papers and drive away in minutes.' },
  ];

  return (
    <section className="py-20 bg-white overflow-hidden">
      {/* Thin accent top border */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent mb-16" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div ref={headingRef} className="reveal text-center mb-14">
          <span className="section-label mx-auto justify-center">Why TyFix</span>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900">
            Built on trust. Priced with honesty.
          </h2>
        </div>

        {/* Cards */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger">
          {badges.map((item, i) => (
            <div
              key={i}
              className="reveal group relative flex flex-col items-start p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-default"
            >
              {/* Icon bubble */}
              <div className="w-14 h-14 rounded-xl bg-primary/8 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                {item.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">{item.title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm">{item.desc}</p>

              {/* Hover accent line */}
              <div className="absolute bottom-0 left-8 right-8 h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
