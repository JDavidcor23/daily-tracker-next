'use client';

import React from 'react';
import { useHistory } from '@/hooks/useHistory';
import type { HistoryFilter } from '@/hooks/useHistory';
import { MOOD_LABELS, Mood } from '@/lib/types';
import { DATE_LOCALE, STUDY_TIME_ADVANCED_THRESHOLD } from '@/lib/constants';

function formatDate(iso: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString(DATE_LOCALE, {
    weekday: 'short',
    month: 'short',
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

const FILTER_OPTIONS: { id: HistoryFilter; label: string; icon: string }[] = [
  { id: 'all', label: 'All', icon: '🌈' },
  { id: 'nutrition', label: 'Food', icon: '🥗' },
  { id: 'training', label: 'Workouts', icon: '🏋️' },
  { id: 'study', label: 'Study', icon: '📚' },
  { id: 'mind', label: 'Mind', icon: '🧠' },
  { id: 'task', label: 'Tasks', icon: '✅' },
];

export default function HistoryPage() {
  const { loading, search, setSearch, activeFilter, setActiveFilter, groups, sortedDates } = useHistory();
  const [selectedEntry, setSelectedEntry] = React.useState<any | null>(null);

  return (
    <div className="px-4 py-8 space-y-10 font-sans animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">History</h1>
          <p className="text-sm text-slate-500 font-medium">Timeline of all your past activities</p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <input
              type="text"
              placeholder="Search entries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-slate-100"
            />
            <span className="absolute right-3 top-2 text-slate-400">🔍</span>
          </div>
          {loading && <div className="animate-spin text-2xl h-8 w-8 flex items-center justify-center">⏳</div>}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {FILTER_OPTIONS.map(filter => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all whitespace-nowrap
              ${activeFilter === filter.id
                ? 'bg-brand-500 border-brand-500 text-white shadow-md shadow-brand-500/20'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-brand-300'}`}
          >
            <span>{filter.icon}</span>
            {filter.label}
          </button>
        ))}
      </div>

      {!loading && sortedDates.length === 0 && (
        <div className="card border-dashed border-2 py-20 text-center text-slate-400 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10">
          <p className="text-4xl mb-4 opacity-20">📜</p>
          <p className="font-medium">No entries found in your history yet.</p>
        </div>
      )}

      <div className="space-y-12">
        {sortedDates.map((date) => (
          <div key={date} className="animate-fade-in">
            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-6 pl-1 border-l-4 border-brand-500 ml-1 py-1">
              {formatDate(date)}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups[date].map((entry) => (
                <div
                  key={entry.id}
                  onClick={() => setSelectedEntry(entry)}
                  className="card p-5 group hover:shadow-md transition-all duration-300 border-slate-100 dark:border-slate-800/50 cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-sm border border-slate-50 dark:border-slate-800 transition-transform group-hover:scale-110
                      ${entry.log_module === 'nutrition' ? 'bg-emerald-50 dark:bg-emerald-950/30' :
                        entry.log_module === 'training' ? 'bg-orange-50 dark:bg-orange-950/30' :
                        entry.log_module === 'study' ? 'bg-blue-50 dark:bg-blue-950/30' :
                        entry.log_module === 'task' ? 'bg-amber-50 dark:bg-amber-950/30' :
                        'bg-violet-50 dark:bg-violet-950/30'}`}
                    >
                      {entry.type === 'task' ? (entry.completed ? '✅' : '⏳') : (
                        entry.log_module === 'nutrition' ? (entry.food_meals.toLowerCase().includes('fruit') ? '🍎' : '🥗') :
                        entry.log_module === 'training' ? (entry.train_type?.toLowerCase().includes('run') ? '🏃' : '🏋️') :
                        entry.log_module === 'study' ? (entry.study_time && parseInt(entry.study_time) > STUDY_TIME_ADVANCED_THRESHOLD ? '🎓' : '📚') :
                        (entry.mood ? entry.mood : '🧠')
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-brand-500 transition-colors">
                          {entry.type === 'task' ? 'TASK' : entry.log_module}
                        </span>
                        <span className="text-[10px] font-bold text-slate-300 dark:text-slate-600 bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded-full">
                          {entry.created_at ? formatTime(entry.created_at) : ''}
                        </span>
                      </div>

                      <div className="space-y-1">
                        {entry.type === 'task' && (
                          <div>
                            <p className={`text-sm font-bold leading-tight ${entry.completed ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                              {entry.text}
                            </p>
                            {entry.description && <p className="text-xs text-slate-400 mt-1 line-clamp-1 italic">"{entry.description}"</p>}
                            <span className={`text-[9px] font-black uppercase mt-1.5 inline-block px-1.5 py-0.5 rounded ${
                              entry.priority === 'high' ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' :
                              entry.priority === 'medium' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                            }`}>
                              {entry.priority}
                            </span>
                          </div>
                        )}

                        {entry.log_module === 'nutrition' && (
                          <p className="text-sm text-slate-700 dark:text-slate-200 font-bold leading-tight line-clamp-2">{entry.food_meals}</p>
                        )}
                        {entry.log_module === 'training' && (
                          <p className="text-sm text-slate-700 dark:text-slate-200 font-bold leading-tight">
                            {entry.trained ? `${entry.train_type} · ${entry.train_duration}m` : 'Rest Day'}
                          </p>
                        )}
                        {entry.log_module === 'study' && (
                          <p className="text-sm text-slate-700 dark:text-slate-200 font-bold leading-tight line-clamp-2">
                            {entry.study_topic} {entry.study_time ? ` · ${entry.study_time}m` : ''}
                          </p>
                        )}
                        {entry.log_module === 'mind' && (
                          <div className="items-center gap-2">
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                              {entry.mood} {entry.mood ? MOOD_LABELS[entry.mood as Mood] : ''}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold block mt-1 uppercase tracking-tighter">Stress Level {entry.stress_level}/10</span>
                          </div>
                        )}

                        {(entry.food_notes || entry.train_notes || entry.study_notes || entry.mind_notes) && (
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 italic line-clamp-1 border-l border-slate-100 dark:border-slate-800 pl-2">
                            "{entry.food_notes || entry.train_notes || entry.study_notes || entry.mind_notes}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedEntry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedEntry(null)}
        >
          <div className="card w-full max-w-lg overflow-hidden shadow-2xl relative border-0 dark:border dark:border-slate-800 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedEntry(null)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors z-10"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className={`h-2 absolute top-0 left-0 right-0 ${
              selectedEntry.log_module === 'nutrition' ? 'bg-emerald-500' :
              selectedEntry.log_module === 'training' ? 'bg-orange-500' :
              selectedEntry.log_module === 'study' ? 'bg-blue-500' :
              selectedEntry.log_module === 'task' ? 'bg-amber-500' :
              'bg-violet-500'}`} />

            <div className="pt-8 px-6 pb-8">
              <div className="mb-6">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-1">
                  {selectedEntry.type === 'task' ? 'TASK' : selectedEntry.log_module}
                </span>
                <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
                  <span className="text-4xl drop-shadow-sm">
                    {selectedEntry.type === 'task' ? (selectedEntry.completed ? '✅' : '⏳') : (
                      selectedEntry.log_module === 'nutrition' ? (selectedEntry.food_meals.toLowerCase().includes('fruit') ? '🍎' : '🥗') :
                      selectedEntry.log_module === 'training' ? (selectedEntry.train_type?.toLowerCase().includes('run') ? '🏃' : '🏋️') :
                      selectedEntry.log_module === 'study' ? (selectedEntry.study_time && parseInt(selectedEntry.study_time) > STUDY_TIME_ADVANCED_THRESHOLD ? '🎓' : '📚') :
                      (selectedEntry.mood ? selectedEntry.mood : '🧠')
                    )}
                  </span>
                  {selectedEntry.type === 'task' ? selectedEntry.text :
                    selectedEntry.log_module === 'nutrition' ? 'Nutrition' :
                    selectedEntry.log_module === 'training' ? 'Training' :
                    selectedEntry.log_module === 'study' ? 'Study session' :
                    'Mind & Mood'
                  }
                </h2>
              </div>

              <div className="space-y-6">
                {selectedEntry.type === 'task' && (
                  <>
                    <div>
                      <h3 className="text-[10px] font-black uppercase text-slate-400 mb-2">Description</h3>
                      <div className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed min-h-[80px] border border-slate-100 dark:border-slate-800 font-medium whitespace-pre-wrap">
                        {selectedEntry.description || <span className="italic opacity-30">No description provided.</span>}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 dark:bg-slate-800/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <h3 className="text-[10px] font-black uppercase text-slate-400 mb-1">Priority</h3>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                          selectedEntry.priority === 'high' ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400' :
                          selectedEntry.priority === 'medium' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                        }`}>
                          {selectedEntry.priority}
                        </span>
                      </div>
                      {selectedEntry.due_date && (
                        <div className="bg-slate-50 dark:bg-slate-800/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                          <h3 className="text-[10px] font-black uppercase text-slate-400 mb-1">Due Date</h3>
                          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-black text-sm">
                            <span className="text-xl">📅</span> {selectedEntry.due_date}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {selectedEntry.log_module === 'nutrition' && (
                  <div>
                    <h3 className="text-[10px] font-black uppercase text-slate-400 mb-2">Meals Logged</h3>
                    <div className="bg-emerald-50/30 dark:bg-emerald-950/20 rounded-2xl p-4 text-sm text-slate-700 dark:text-slate-200 leading-relaxed min-h-[100px] border border-emerald-100/50 dark:border-emerald-900/30 font-bold whitespace-pre-wrap">
                      {selectedEntry.food_meals}
                    </div>
                    {selectedEntry.food_notes && (
                      <div className="mt-6">
                        <h3 className="text-[10px] font-black uppercase text-slate-400 mb-2">Internal Notes</h3>
                        <div className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-4 text-sm text-slate-500 dark:text-slate-400 italic border border-slate-100 dark:border-slate-800">
                          "{selectedEntry.food_notes}"
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {selectedEntry.log_module === 'training' && (
                  <div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-orange-50/30 dark:bg-orange-950/20 p-4 rounded-2xl border border-orange-100 dark:border-orange-900/30">
                        <h3 className="text-[10px] font-black uppercase text-slate-400 mb-1">Workout Type</h3>
                        <p className="text-lg font-black text-slate-800 dark:text-slate-100">{selectedEntry.train_type || 'Rest Day'}</p>
                      </div>
                      {selectedEntry.train_duration && (
                        <div className="bg-brand-50/30 dark:bg-brand-950/20 p-4 rounded-2xl border border-brand-100 dark:border-brand-900/30">
                          <h3 className="text-[10px] font-black uppercase text-slate-400 mb-1">Duration</h3>
                          <p className="text-lg font-black text-brand-600 dark:text-brand-400">{selectedEntry.train_duration}m</p>
                        </div>
                      )}
                    </div>
                    {selectedEntry.train_notes && (
                      <div>
                        <h3 className="text-[10px] font-black uppercase text-slate-400 mb-2">Session Notes</h3>
                        <div className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-4 text-sm text-slate-700 dark:text-slate-200 leading-relaxed border border-slate-100 dark:border-slate-800 font-medium whitespace-pre-wrap">
                          {selectedEntry.train_notes}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {selectedEntry.log_module === 'study' && (
                  <div>
                    <div className="bg-blue-50/30 dark:bg-blue-950/20 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/30 mb-4">
                      <h3 className="text-[10px] font-black uppercase text-slate-400 mb-1">Study Topic</h3>
                      <p className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{selectedEntry.study_topic}</p>
                      {selectedEntry.study_time && (
                        <div className="mt-3 flex items-center gap-2 text-brand-500 font-black">
                          <span className="text-xl">⏱️</span> {selectedEntry.study_time} minutes spent
                        </div>
                      )}
                    </div>
                    {selectedEntry.study_notes && (
                      <div>
                        <h3 className="text-[10px] font-black uppercase text-slate-400 mb-2">Learned Today</h3>
                        <div className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-4 text-sm text-slate-700 dark:text-slate-200 leading-relaxed border border-slate-100 dark:border-slate-800 font-medium whitespace-pre-wrap">
                          {selectedEntry.study_notes}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {selectedEntry.log_module === 'mind' && (
                  <div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-violet-50/30 dark:bg-violet-950/20 p-4 rounded-2xl border border-violet-100 dark:border-violet-900/30">
                        <h3 className="text-[10px] font-black uppercase text-slate-400 mb-1">Mood Status</h3>
                        <p className="text-xl font-black text-slate-800 dark:text-slate-100">{selectedEntry.mood} {selectedEntry.mood ? MOOD_LABELS[selectedEntry.mood as Mood] : ''}</p>
                      </div>
                      <div className="bg-brand-50/30 dark:bg-brand-950/20 p-4 rounded-2xl border border-brand-100 dark:border-brand-900/30">
                        <h3 className="text-[10px] font-black uppercase text-slate-400 mb-1">Stress Factor</h3>
                        <p className="text-xl font-black text-slate-800 dark:text-slate-100">{selectedEntry.stress_level}/10</p>
                      </div>
                    </div>
                    {selectedEntry.mind_notes && (
                      <div>
                        <h3 className="text-[10px] font-black uppercase text-slate-400 mb-2">Thoughts Logged</h3>
                        <div className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-4 text-sm text-slate-700 dark:text-slate-200 leading-relaxed border border-slate-100 dark:border-slate-800 font-medium whitespace-pre-wrap">
                          {selectedEntry.mind_notes}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="border-t border-slate-100 dark:border-slate-800 pt-6 mt-6 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <span className="flex items-center gap-1.5"><span className="text-sm">🗓️</span> {formatDate(selectedEntry.date)}</span>
                  <span className="flex items-center gap-1.5"><span className="text-sm">🕘</span> {selectedEntry.created_at ? formatTime(selectedEntry.created_at) : ''}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
