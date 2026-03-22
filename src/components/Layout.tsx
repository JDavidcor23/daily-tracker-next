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
  { to: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { status } = useSupabaseContext();
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);

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
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-sm font-sans">
          <div className="flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌅</span>
              <span className="font-bold text-slate-800 dark:text-slate-100 text-lg">Daily Tracker</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsDark(!isDark)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Toggle Dark Mode"
              >
                {isDark ? '☀️' : '🌙'}
              </button>
              <DownloadReportButton />
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                <div className={`w-2 h-2 rounded-full ${connectionColor}`} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {connectionLabel}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pb-24 px-4 sm:px-6">
          {children}
        </main>

        {/* Bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shadow-lg transition-colors duration-300 font-sans">
          <div className="max-w-6xl mx-auto flex">
            {NAV_ITEMS.map(({ to, label, icon }) => {
              const isActive = to === '/' ? pathname === '/' : pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  href={to}
                  className={`flex-1 flex flex-col items-center py-3 gap-0.5 text-xs font-medium transition-colors ${
                    isActive
                      ? 'text-brand-600'
                      : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
                  }`}
                >
                  <span className="text-xl">{icon}</span>
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
