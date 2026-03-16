'use client';

import { CheckCircle2 } from 'lucide-react';
import { useReveal } from '@/lib/useReveal';
import CashCalculator from './CashCalculator';

interface CashAdvantageProps {
  content: Record<string, string>;
}

export default function CashAdvantage({ content }: CashAdvantageProps) {
  const title = content['about_title'] || 'The TyFix Cash Advantage';
  const advantages = [
    { title: content['cash_advantage_1_title'] || 'No Credit Checks', desc: content['cash_advantage_1_desc'] || 'Your credit score does not matter here. If you have the cash, you have the car.' },
    { title: content['cash_advantage_2_title'] || 'No Interest Payments', desc: content['cash_advantage_2_desc'] || 'Why pay thousands in interest to a bank? Own your car outright from day one.' },
    { title: content['cash_advantage_3_title'] || 'Lower Insurance Costs', desc: content['cash_advantage_3_desc'] || 'Owning your vehicle means you are not forced into expensive full-coverage plans.' },
    { title: content['cash_advantage_4_title'] || 'Transparent History', desc: content['cash_advantage_4_desc'] || 'We provide full vehicle history reports and are honest about every dent and scratch.' },
  ];

  const leftRef = useReveal();
  const rightRef = useReveal();

  return (
    <section id="about" className="relative py-28 bg-[#0A0F1A] text-white overflow-hidden">
      {/* Ambient blob */}
      <div className="absolute top-0 left-1/2 w-[600px] h-[600px] -translate-x-1/2 rounded-full bg-primary/8 blur-[140px] pointer-events-none" />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text */}
          <div ref={leftRef} className="reveal-left">
            <span className="section-label !text-primary">Why Cash?</span>
            <h2 className="text-4xl md:text-5xl font-black leading-tight mb-6">
              {title.includes('Cash') ? (
                <>
                  {title.split('Cash')[0]}
                  <span className="text-primary">Cash{title.split('Cash')[1]}</span>
                </>
              ) : title}
            </h2>

            {content['about_text'] && (
              <p className="text-slate-400 mb-10 leading-relaxed text-lg">
                {content['about_text']}
              </p>
            )}

            <div className="space-y-6">
              {advantages.map((item, i) => (
                <div
                  key={i}
                  className="flex gap-4 group cursor-default"
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  <div className="flex-shrink-0 w-11 h-11 bg-primary/15 border border-primary/20 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                    <CheckCircle2 size={20} className="text-primary group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold mb-1">{item.title}</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Photo with frame */}
          <div ref={rightRef} className="reveal hidden lg:block">
            <div className="relative">
              {/* Frame accent */}
              <div className="absolute -top-3 -left-3 w-full h-full border border-primary/20 rounded-2xl" />
              <img
                src="https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=900"
                alt="TyFix car lot"
                className="relative z-10 w-full h-[460px] object-cover rounded-2xl"
              />
              {/* Overlay badge */}
              <div className="absolute z-20 bottom-6 left-6 bg-black/70 backdrop-blur-md border border-white/10 rounded-xl p-4">
                <p className="text-2xl font-black text-white">500+</p>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-0.5">Happy Drivers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Calculator */}
        <CashCalculator />
      </div>
    </section>
  );
}
