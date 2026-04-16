'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import {
  LayoutDashboard,
  Car,
  Users,
  Star,
  Settings,
  FileText,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Bot,
  PenSquare,
  BarChart3,
  LayoutList,
  FolderOpen,
  RefreshCw
} from 'lucide-react';
import { clearAllCaches } from './actions';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard size={20} /> },
  { label: 'Inventory', href: '/admin/inventory', icon: <Car size={20} /> },
  { label: 'File Cabinet', href: '/admin/file-cabinet', icon: <FolderOpen size={20} /> },
  { label: 'Leads', href: '/admin/leads', icon: <Users size={20} /> },
  { label: 'Reviews', href: '/admin/testimonials', icon: <Star size={20} /> },
  { label: 'Blog', href: '/admin/blog', icon: <PenSquare size={20} /> },
  { label: 'AI Bot', href: '/admin/bot', icon: <Bot size={20} /> },
  { label: 'Analytics', href: '/admin/analytics', icon: <BarChart3 size={20} /> },
  { label: 'Sections', href: '/admin/sections', icon: <LayoutList size={20} /> },
  { label: 'Settings', href: '/admin/settings', icon: <Settings size={20} /> },
  { label: 'Content', href: '/admin/content', icon: <FileText size={20} /> },
];


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  // ── Admin Idle Session Timeout (30 min) ─────────────────────────
  const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetIdleTimer = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/login?reason=idle');
      router.refresh();
    }, IDLE_TIMEOUT_MS);
  }, [router]);

  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(e => window.addEventListener(e, resetIdleTimer));
    resetIdleTimer(); // start the timer

    return () => {
      events.forEach(e => window.removeEventListener(e, resetIdleTimer));
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [resetIdleTimer]);
  // ── End Idle Timeout ────────────────────────────────────────────

  const handleClearCache = async () => {
    setClearing(true);
    try {
      await clearAllCaches();
      alert('Global cache cleared successfully! The live site now shows your latest updates.');
    } catch (e) {
      alert('Failed to clear cache.');
    }
    setClearing(false);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 lg:translate-x-0 lg:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <Link href="/admin" className="flex items-center gap-2">
                <Image src="/tyfix-logo.png" alt="TyFix" width={100} height={34} className="h-8 w-auto" />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Admin</span>
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100 space-y-2">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ExternalLink size={18} />
              View Live Site
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors w-full text-left"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 lg:px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-900"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-bold text-gray-900 truncate">
              {NAV_ITEMS.find((item) => isActive(item.href))?.label || 'Admin'}
            </h1>
          </div>
          
          <button
            onClick={handleClearCache}
            disabled={clearing}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
            title="Force refresh the public website's data cache globally"
          >
            <RefreshCw size={16} className={clearing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">{clearing ? 'Purging Cache...' : 'Clear Cache'}</span>
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
