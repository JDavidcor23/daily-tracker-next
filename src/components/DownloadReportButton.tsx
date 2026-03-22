'use client';

import { useDownloadReport } from '@/hooks/useDownloadReport';
import { SVG_ICON_SIZE } from '@/lib/constants';

export default function DownloadReportButton() {
  const { isOpen, setIsOpen, loading, dropdownRef, handleDownload } = useDownloadReport();

  return (
    <div className="relative font-sans" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className={`flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width={SVG_ICON_SIZE} height={SVG_ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={loading ? 'animate-bounce' : ''}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        <span className="tracking-tight">{loading ? 'Processing...' : 'Export PDF'}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-52 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in origin-top-right ring-1 ring-black/5 dark:ring-white/5">
          <div className="p-1.5 flex flex-col gap-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 py-2 mb-1">Select Period</p>
            <button
              onClick={() => handleDownload('today')}
              className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all flex items-center gap-3"
            >
              <span className="text-base">☀️</span> Today
            </button>
            <button
              onClick={() => handleDownload('week')}
              className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all flex items-center gap-3"
            >
              <span className="text-base">📅</span> This Week
            </button>
            <button
              onClick={() => handleDownload('month')}
              className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all flex items-center gap-3"
            >
              <span className="text-base">📊</span> This Month
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
