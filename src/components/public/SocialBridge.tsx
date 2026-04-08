import { Instagram, Facebook } from 'lucide-react';
import type { SiteSettings } from '@/lib/types';

// TikTok icon
function TikTokIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.18 8.18 0 0 0 4.76 1.52V6.83a4.84 4.84 0 0 1-1-.14Z" />
    </svg>
  );
}

interface SocialBridgeProps {
  settings: SiteSettings | null;
}

/**
 * "Follow TyFix" social media section for the homepage.
 * Bridges the ~100K social following to the website.
 */
export default function SocialBridge({ settings }: SocialBridgeProps) {
  const socials = [
    settings?.instagram_url && {
      name: 'Instagram',
      handle: '@_tyfix',
      icon: <Instagram size={28} />,
      url: settings.instagram_url,
      color: 'from-purple-500 to-pink-500',
      desc: 'New arrivals, lot updates, and behind-the-scenes content',
    },
    settings?.tiktok_url && {
      name: 'TikTok',
      handle: '@tyfix',
      icon: <TikTokIcon size={28} />,
      url: settings.tiktok_url,
      color: 'from-gray-900 to-gray-700',
      desc: 'Car reviews, auction finds, and car-buying tips',
    },
    settings?.facebook_url && {
      name: 'Facebook',
      handle: 'TyFix Consultations',
      icon: <Facebook size={28} />,
      url: settings.facebook_url,
      color: 'from-blue-600 to-blue-500',
      desc: 'Customer stories, promotions, and latest inventory',
    },
  ].filter(Boolean) as Array<{
    name: string;
    handle: string;
    icon: React.ReactElement;
    url: string;
    color: string;
    desc: string;
  }>;

  if (socials.length === 0) return null;

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
          Follow TyFix on Social
        </h2>
        <p className="text-gray-500 max-w-xl mx-auto mb-12">
          Join our growing community for daily inventory drops, car-buying tips, and exclusive deals you won&apos;t find anywhere else.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {socials.map((social) => (
            <a
              key={social.name}
              href={`${social.url}?utm_source=website&utm_medium=social_bridge&utm_campaign=homepage`}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative p-6 bg-white rounded-2xl border border-gray-100 hover:border-transparent hover:shadow-2xl transition-all duration-300 text-left"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${social.color} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                {social.icon}
              </div>
              <h3 className="font-black text-gray-900 text-lg mb-1">{social.name}</h3>
              <p className="text-primary font-bold text-sm mb-2">{social.handle}</p>
              <p className="text-gray-500 text-sm">{social.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
