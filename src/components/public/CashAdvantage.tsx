import { CheckCircle2 } from 'lucide-react';

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

  return (
    <section id="about" className="py-24 bg-gray-900 text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=1000"
          alt="Car lot"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="lg:w-1/2">
          <h2 className="text-4xl font-black mb-8 leading-tight">
            {title.includes('Cash') ? (
              <>
                {title.split('Cash')[0]}<span className="text-primary">Cash{title.split('Cash')[1]}</span>
              </>
            ) : (
              title
            )}
          </h2>
          {content['about_text'] && (
            <p className="text-gray-400 mb-10 leading-relaxed text-lg">
              {content['about_text']}
            </p>
          )}
          <div className="space-y-8">
            {advantages.map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                  <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
