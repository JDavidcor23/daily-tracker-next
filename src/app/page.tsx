'use client';

import { useTodayPage } from '@/hooks/useTodayPage';
import { MOOD_LABELS, Mood } from '@/lib/types';
import { DATE_LOCALE } from '@/lib/constants';
import { NutritionModule, TrainingModule, StudyModule, MindModule, FitnessModule } from '@/components/modules';

function formatDisplayDate(iso: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString(DATE_LOCALE, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(DATE_LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function TodayPage() {
  const { today, timeline, loading, handleLog } = useTodayPage();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="animate-spin text-4xl">🌅</div>
        <p className="text-slate-400 font-medium animate-pulse">Loading daily summary…</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 space-y-10 animate-fade-in font-sans">
      <div className="card bg-gradient-to-r from-brand-600 to-violet-600 text-white border-0 shadow-lg p-6 sm:p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-white/20 transition-all duration-700" />
        <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2 drop-shadow-sm">
          Timeline Mode
        </p>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-md">{formatDisplayDate(today)}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <NutritionModule onLog={(data) => handleLog('nutrition', data)} />
        <TrainingModule onLog={(data) => handleLog('training', data)} />
        <StudyModule onLog={(data) => handleLog('study', data)} />
        <MindModule onLog={(data) => handleLog('mind', data)} />
        <FitnessModule />
      </div>

      <section className="mt-8 mb-12 max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-2xl shadow-sm border border-slate-50 dark:border-slate-800">
            🕒
          </div>
          <div>
            <h2 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Today's Timeline</h2>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-tighter">Your chronological activity log</p>
          </div>
        </div>

        {timeline.length === 0 ? (
          <div className="card border-dashed border-2 py-16 text-center text-slate-400 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
            <p className="text-4xl mb-3 opacity-20">📝</p>
            <p className="font-medium">No activities logged yet for today.</p>
            <p className="text-[10px] mt-1 uppercase tracking-widest opacity-60">Log something above to get started</p>
          </div>
        ) : (
          <div className="relative space-y-6 before:absolute before:left-5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
            {timeline.map((entry) => (
              <div key={entry.id} className="relative pl-12 sm:pl-16 group">
                <span className={`absolute left-3 top-3 w-4 h-4 rounded-full border-4 border-white dark:border-slate-950 shadow-md transition-all duration-300 group-hover:scale-125
                  ${entry.log_module === 'nutrition' ? 'bg-emerald-400' :
                    entry.log_module === 'training' ? 'bg-orange-400' :
                    entry.log_module === 'study' ? 'bg-blue-400' :
                    'bg-violet-400'}`}
                />

                <div className="card hover:shadow-md dark:hover:border-slate-700 transition-all duration-300 transform hover:-translate-x-1 group-hover:border-slate-200 dark:group-hover:border-slate-700/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-brand-500 transition-colors">
                      {entry.log_module}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                      {entry.created_at ? formatTime(entry.created_at) : ''}
                    </span>
                  </div>

                  {entry.log_module === 'nutrition' && (
                    <div className="animate-fade-in">
                      <p className="font-bold text-slate-700 dark:text-slate-200 text-sm leading-relaxed">{entry.food_meals}</p>
                      {entry.food_notes && <p className="text-xs text-slate-500 mt-2 italic border-l-2 border-emerald-100 dark:border-emerald-950 pl-3">"{entry.food_notes}"</p>}
                    </div>
                  )}

                  {entry.log_module === 'training' && (
                    <div className="animate-fade-in">
                      <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">
                        {entry.trained ? `🏋️ ${entry.train_type}` : '🛋️ Rest Day'}
                        {entry.train_duration && <span className="text-brand-500 ml-2">· {entry.train_duration}m</span>}
                      </p>
                      {entry.train_notes && <p className="text-xs text-slate-500 mt-2 italic border-l-2 border-orange-100 dark:border-orange-950 pl-2">{entry.train_notes}</p>}
                    </div>
                  )}

                  {entry.log_module === 'study' && (
                    <div className="animate-fade-in">
                      <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">📚 {entry.study_topic}</p>
                      {entry.study_time && <p className="text-[10px] text-brand-500 font-bold mt-0.5 uppercase tracking-wide">⏱️ {entry.study_time} mins</p>}
                      {entry.study_notes && <p className="text-xs text-slate-500 mt-2 italic border-l-2 border-blue-100 dark:border-blue-950 pl-2">{entry.study_notes}</p>}
                    </div>
                  )}

                  {entry.log_module === 'mind' && (
                    <div className="animate-fade-in">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl drop-shadow-sm">{entry.mood}</span>
                        <div>
                          <p className="font-bold text-slate-700 dark:text-slate-200 text-sm leading-none">
                            {entry.mood ? MOOD_LABELS[entry.mood as Mood] : 'Mood Log'}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                            Stress Level: {entry.stress_level}/10
                          </p>
                        </div>
                      </div>
                      {entry.mind_notes && <p className="text-xs text-slate-500 mt-3 italic bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">"{entry.mind_notes}"</p>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
