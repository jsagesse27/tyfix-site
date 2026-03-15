import { ShieldCheck, DollarSign, Zap } from 'lucide-react';

interface TrustBadgesProps {
  content: Record<string, string>;
}

const ICONS = [
  <ShieldCheck key="shield" size={40} />,
  <DollarSign key="dollar" size={40} />,
  <Zap key="zap" size={40} />,
];

export default function TrustBadges({ content }: TrustBadgesProps) {
  const badges = [
    { icon: ICONS[0], title: content['trust_badge_1_title'] || 'TyFix 25-Point Check', desc: content['trust_badge_1_desc'] || 'Every vehicle passes a rigorous mechanical inspection before it hits the lot.' },
    { icon: ICONS[1], title: content['trust_badge_2_title'] || 'No Hidden Fees', desc: content['trust_badge_2_desc'] || 'The price you see is the price you pay. No doc fees, no admin fees, no surprises.' },
    { icon: ICONS[2], title: content['trust_badge_3_title'] || 'Drive Today', desc: content['trust_badge_3_desc'] || 'Cash-only means no waiting for bank approvals. Sign the papers and drive away in minutes.' },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {badges.map((item, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center p-8 rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="text-primary mb-6">{item.icon}</div>
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
