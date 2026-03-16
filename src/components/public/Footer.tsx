import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Facebook, Instagram } from 'lucide-react';
import type { SiteSettings } from '@/lib/types';

interface FooterProps {
  settings: SiteSettings | null;
  content: Record<string, string>;
}

export default function Footer({ settings, content }: FooterProps) {
  const footerAbout = content['footer_about'] || settings?.footer_text || 'Tell a friend to tell a friend, come shop with TyFix!';
  const tagline = settings?.show_price_tagline ? settings.price_tagline_text : null;
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Image src="/tyfix-logo.png" alt="TyFix" width={100} height={34} className="h-8 w-auto brightness-0 invert" />
            </div>
            <p className="text-gray-400 leading-relaxed mb-6">{footerAbout}</p>
            {tagline && (
              <p className="text-primary font-bold text-sm mb-6">{tagline}</p>
            )}
            <div className="flex gap-4">
              {settings?.facebook_url && (
                <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors">
                  <Facebook size={20} />
                </a>
              )}
              {settings?.instagram_url && (
                <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors">
                  <Instagram size={20} />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-6 uppercase tracking-widest text-sm text-primary">Quick Links</h4>
            <ul className="space-y-4 text-gray-400">
              <li><Link href="/inventory" className="hover:text-white transition-colors">Inventory</Link></li>
              <li><Link href="/#about" className="hover:text-white transition-colors">Why Cash?</Link></li>
              <li><Link href="/#reviews" className="hover:text-white transition-colors">Reviews</Link></li>
              <li><Link href="/#contact" className="hover:text-white transition-colors">Location</Link></li>
            </ul>
          </div>

          {/* Inventory by Type */}
          <div>
            <h4 className="font-bold mb-6 uppercase tracking-widest text-sm text-primary">Inventory</h4>
            <ul className="space-y-4 text-gray-400">
              <li><Link href="/inventory?bodyType=Sedan" className="hover:text-white transition-colors">Sedans</Link></li>
              <li><Link href="/inventory?bodyType=SUV" className="hover:text-white transition-colors">SUVs</Link></li>
              <li><Link href="/inventory?bodyType=Truck" className="hover:text-white transition-colors">Trucks</Link></li>
              <li><Link href="/inventory?maxPrice=5000" className="hover:text-white transition-colors">Under $5,000</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-bold mb-6 uppercase tracking-widest text-sm text-primary">Contact</h4>
            <p className="text-gray-400 mb-2 text-sm">{settings?.lot_address}</p>
            <p className="text-gray-400 mb-2 text-sm">{settings?.phone_number}</p>
            <p className="text-gray-400 mb-6 text-sm">{settings?.contact_email}</p>
            <Link href="/#contact" className="text-primary font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
              Send us a message <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <div className="pt-10 border-t border-gray-800 text-center text-gray-500 text-sm">
          <p>&copy; {year} TyFix Auto Sales. All rights reserved.</p>
          {settings?.legal_disclaimer && (
            <p className="mt-2 text-xs text-gray-600">{settings.legal_disclaimer}</p>
          )}
        </div>
      </div>
    </footer>
  );
}
