'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Menu, X, MessageCircle } from 'lucide-react';
import type { SiteSettings } from '@/lib/types';

export default function Navbar({ settings }: { settings: SiteSettings | null }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const phone = settings?.phone_number || '(555) 123-4567';
  const smsNumber = settings?.sms_number || '5551234567';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/tyfix-logo.png" alt="TyFix Auto Sales" width={120} height={40} className="h-10 w-auto" priority />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {[
              { label: 'Inventory', href: '/inventory' },
              { label: 'Recently Sold', href: '/sold' },
              { label: 'About', href: '/#about' },
              { label: 'Reviews', href: '/#reviews' },
              { label: 'Contact', href: '/#contact' },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`font-medium transition-colors hover:text-primary ${isScrolled ? 'text-gray-700' : 'text-white'}`}
              >
                {item.label}
              </Link>
            ))}
            <a
              href={`sms:${smsNumber}`}
              className={`flex items-center gap-2 font-medium transition-colors hover:text-primary ${isScrolled ? 'text-gray-700' : 'text-white'}`}
            >
              <MessageCircle size={18} />
              Text Us
            </a>
            <a
              href={`tel:${smsNumber}`}
              className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-full font-bold hover:bg-primary-dark transition-all transform hover:scale-105"
            >
              <Phone size={18} />
              {phone}
            </a>
          </div>

          <button
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X size={28} className="text-primary" />
            ) : (
              <Menu size={28} className={isScrolled ? 'text-primary' : 'text-white'} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 animate-fade-in">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {[
              { label: 'Inventory', href: '/inventory' },
              { label: 'Recently Sold', href: '/sold' },
              { label: 'About', href: '/#about' },
              { label: 'Reviews', href: '/#reviews' },
              { label: 'Contact', href: '/#contact' },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="block px-3 py-4 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <a
              href={`tel:${smsNumber}`}
              className="flex items-center justify-center gap-2 bg-primary text-white px-5 py-4 rounded-lg font-bold mt-4"
            >
              <Phone size={18} />
              Call Now: {phone}
            </a>
            <a
              href={`sms:${smsNumber}`}
              className="flex items-center justify-center gap-2 bg-white text-primary border-2 border-primary px-5 py-4 rounded-lg font-bold"
            >
              <MessageCircle size={18} />
              Text Us
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
