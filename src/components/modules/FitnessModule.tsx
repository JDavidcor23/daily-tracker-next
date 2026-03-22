'use client';

import { useFitnessData } from '@/hooks/useFitnessData';
import { MINUTES_PER_HOUR } from '@/lib/constants';

interface StatCard {
  icon: string;
  label: string;
  value: string;
  gradient: string;
  bgLight: string;
}

export default function FitnessModule() {
  const { data, connected, loading, refreshing, fetchData } = useFitnessData();

  const formatSleep = (minutes: number) => {
    const h = Math.floor(minutes / MINUTES_PER_HOUR);
    const m = minutes % MINUTES_PER_HOUR;
    if (h === 0) return `${m}m`;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const stats: StatCard[] = data ? [
    {
      icon: '🚶',
      label: 'Steps',
      value: data.steps.toLocaleString(),
      gradient: 'from-emerald-500 to-teal-500',
      bgLight: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      icon: '🔥',
      label: 'Calories',
      value: `${data.calories.toLocaleString()} kcal`,
      gradient: 'from-orange-500 to-red-500',
      bgLight: 'bg-orange-50 dark:bg-orange-900/20',
    },
    {
      icon: '📏',
      label: 'Distance',
      value: `${data.distance.toFixed(2)} km`,
      gradient: 'from-blue-500 to-cyan-500',
      bgLight: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      icon: '⏱️',
      label: 'Active Min',
      value: `${data.activeMinutes} min`,
      gradient: 'from-violet-500 to-purple-500',
      bgLight: 'bg-violet-50 dark:bg-violet-900/20',
    },
    {
      icon: '😴',
      label: 'Sleep',
      value: formatSleep(data.sleepMinutes),
      gradient: 'from-indigo-500 to-blue-600',
      bgLight: 'bg-indigo-50 dark:bg-indigo-900/20',
    },
  ] : [];

  if (loading) {
    return (
      <div className="card module-section col-span-1 md:col-span-2 font-sans">
        <div className="module-header">
          <div className="module-icon bg-green-50 dark:bg-green-900/20">💪</div>
          <div>
            <p className="module-title font-bold">Google Fit</p>
            <p className="module-subtitle uppercase tracking-tight">Loading fitness data…</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-slate-100 dark:bg-slate-800 h-24 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="card module-section col-span-1 md:col-span-2 font-sans">
        <div className="module-header">
          <div className="module-icon bg-green-50 dark:bg-green-900/20">💪</div>
          <div>
            <p className="module-title font-bold">Google Fit</p>
            <p className="module-subtitle uppercase tracking-tight">Connect to see your fitness data</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-8 gap-4">
          <div className="text-5xl opacity-30">🏃‍♂️</div>
          <p className="text-sm text-slate-400 dark:text-slate-500 text-center max-w-xs">
            Connect Google Fit in <strong>Settings</strong> to see your steps, calories, distance, and more.
          </p>
          <a
            href="/settings"
            className="inline-flex items-center gap-2 text-sm font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
          >
            ⚙️ Go to Settings
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="card module-section col-span-1 md:col-span-2 font-sans">
      <div className="flex items-center justify-between mb-4">
        <div className="module-header mb-0">
          <div className="module-icon bg-green-50 dark:bg-green-900/20">💪</div>
          <div>
            <p className="module-title font-bold text-slate-800 dark:text-slate-100">Google Fit</p>
            <p className="module-subtitle uppercase tracking-tight">Today's fitness summary</p>
          </div>
        </div>
        <button
          onClick={fetchData}
          disabled={refreshing}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors disabled:opacity-50"
          title="Refresh data"
        >
          <span className={`text-base ${refreshing ? 'animate-spin' : ''}`}>🔄</span>
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 animate-fade-in">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`relative overflow-hidden rounded-2xl ${stat.bgLight} p-4 group hover:scale-[1.02] transition-all duration-300`}
          >
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient} opacity-80`} />
            <div className="flex flex-col gap-1.5">
              <span className="text-xl drop-shadow-sm">{stat.icon}</span>
              <span className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-none">
                {stat.value}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 translate-y-[-1px]">
                {stat.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
