'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSupabaseContext } from '@/context/SupabaseContext';
import DownloadReportButton from './DownloadReportButton';

const NAV_ITEMS = [
  { to: '/', label: 'Today', icon: '📋' },
  { to: '/history', label: 'History', icon: '📅' },
  { to: '/todos', label: 'Tasks', icon: '📝' },
  { to: '/goals', label: 'Goals', icon: '🎯' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { status } = useSupabaseContext();
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (theme === 'dark' || (!theme && prefersDark)) {
      setIsDark(true);
    }
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Cerrar el menú cuando cambia la ruta
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Evitar scroll cuando el menú está abierto
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  const connectionLabel = {
    connected: 'Connected',
    disconnected: 'Disconnected',
    checking: 'Checking…',
  }[status] || 'Unknown';

  const connectionColor = {
    connected: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]',
    disconnected: 'bg-rose-500',
    checking: 'bg-amber-400 animate-pulse',
  }[status] || 'bg-slate-300';

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="w-full max-w-6xl mx-auto flex flex-col flex-1 relative">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-sm font-sans">
          <div className="flex items-center justify-between px-5 py-3 gap-2">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMenuOpen(true)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
                aria-label="Open Menu"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="12" x2="20" y2="12"></line>
                  <line x1="4" y1="6" x2="20" y2="6"></line>
                  <line x1="4" y1="18" x2="20" y2="18"></line>
                </svg>
              </button>
              <div className="flex items-center gap-2">
                <span className="text-2xl hidden sm:block">🌅</span>
                <span className="font-bold text-slate-800 dark:text-slate-100 text-lg whitespace-nowrap">Daily Tracker</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <DownloadReportButton />
              <button
                onClick={() => setIsDark(!isDark)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Toggle Dark Mode"
              >
                {isDark ? '☀️' : '🌙'}
              </button>
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-200/50 dark:border-slate-700/50">
                <div className={`w-2 h-2 rounded-full ${connectionColor}`} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hidden xs:block">
                  {connectionLabel}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Berger Sidebar Menu (Drawer) */}
        <div 
          className={`fixed inset-0 z-50 transition-opacity duration-300 ${
            isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Backdrop Overlay */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Sidebar Drawer */}
          <aside 
            className={`absolute top-0 left-0 bottom-0 w-72 bg-white dark:bg-slate-900 shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
              isMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🌅</span>
                <span className="font-bold text-slate-800 dark:text-slate-100 text-xl">Menu</span>
              </div>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
              {NAV_ITEMS.map(({ to, label, icon }) => {
                const isActive = to === '/' ? pathname === '/' : pathname.startsWith(to);
                return (
                  <Link
                    key={to}
                    href={to}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-all ${
                      isActive
                        ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                        : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <span className="text-xl flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:scale-110 transition-transform">
                      {icon}
                    </span>
                    <span className="text-base">{label}</span>
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500" />
                    )}
                  </Link>
                );
              })}
            </nav>
            
            <div className="p-6 border-t border-slate-100 dark:border-slate-800">
              <div className="text-xs text-slate-400 dark:text-slate-500 text-center">
                Daily Tracker &copy; 2026
              </div>
            </div>
          </aside>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pb-10 px-4 sm:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
