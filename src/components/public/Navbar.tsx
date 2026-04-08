'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Menu, X, MessageCircle } from 'lucide-react';
import type { SiteSettings } from '@/lib/types';

const NAV_LINKS = [
  { label: 'Inventory', href: '/inventory' },
  { label: 'AutoConnect', href: '/autoconnect' },
  { label: 'Trade-In', href: '/trade-in' },
  { label: 'Visit Us', href: '/visit-us' },
  { label: 'Blog', href: '/blog' },
];

export default function Navbar({ settings }: { settings: SiteSettings | null }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const phone = settings?.phone_number || '(555) 123-4567';
  const smsNumber = settings?.sms_number || '5551234567';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed z-50 transition-all duration-500 ${
          isScrolled
            ? 'top-0 left-0 right-0 bg-white/90 backdrop-blur-xl shadow-sm border-b border-slate-100 py-2'
            : 'top-4 left-4 right-4 rounded-2xl bg-black/30 backdrop-blur-md border border-white/10 py-3'
        }`}
        style={{ transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)' }}
      >
        <div className={`${isScrolled ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' : 'px-4 sm:px-6'}`}>
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 cursor-pointer">
              <Image
                src="/tyfix-logo.png"
                alt="TyFix Auto Sales"
                width={110}
                height={36}
                className="h-9 w-auto"
                priority
              />
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-7">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`text-sm font-semibold transition-colors duration-200 hover:text-primary ${
                    isScrolled ? 'text-slate-700' : 'text-white/90'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <a
                href={`tel:${smsNumber}`}
                className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-primary-dark transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 cursor-pointer"
              >
                <Phone size={16} />
                {phone}
              </a>
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden cursor-pointer p-1"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X size={26} className="text-primary" />
              ) : (
                <Menu size={26} className={isScrolled ? 'text-slate-800' : 'text-white'} />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white flex flex-col pt-24 px-6 pb-10 animate-fade-in md:hidden overflow-y-auto">
          <div className="space-y-1 flex-1">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="block px-4 py-4 text-lg font-semibold text-slate-800 hover:text-primary hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="space-y-3 pt-6 border-t border-slate-100">
            <a
              href={`tel:${smsNumber}`}
              className="flex items-center justify-center gap-2 bg-primary text-white px-5 py-4 rounded-xl font-bold text-base w-full cursor-pointer"
            >
              <Phone size={18} /> Call Now: {phone}
            </a>
          </div>
        </div>
      )}
    </>
  );
}
