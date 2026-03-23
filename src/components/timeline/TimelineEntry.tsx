'use client';

import React from 'react';
import { MOOD_LABELS, Mood } from '@/lib/types';
import { formatTime } from '@/lib/utils';

interface TimelineEntryProps {
  entry: any;
  onClick: (entry: any) => void;
  onEdit: (entry: any) => void;
  onDelete: (entry: any) => void;
}

export const TimelineEntry: React.FC<TimelineEntryProps> = ({
  entry,
  onClick,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="relative pl-12 sm:pl-16 group">
      <span className={`absolute left-3 top-3 w-4 h-4 rounded-full border-4 border-white dark:border-slate-950 shadow-md transition-all duration-300 group-hover:scale-125
        ${entry.log_module === 'nutrition' ? 'bg-emerald-400' :
          entry.log_module === 'training' ? 'bg-orange-400' :
          entry.log_module === 'study' ? 'bg-blue-400' :
          entry.log_module === 'task' ? 'bg-sky-400' :
          'bg-violet-400'}`}
      />

      <div 
        onClick={() => onClick(entry)}
        className="card cursor-pointer hover:shadow-md dark:hover:border-slate-700 transition-all duration-300 transform hover:-translate-x-1 group-hover:border-slate-200 dark:group-hover:border-slate-700/50 relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-brand-500 transition-colors">
            {entry.log_module}
          </span>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
              {entry.created_at ? formatTime(entry.created_at) : ''}
            </span>
          </div>
        </div>

        {entry.log_module === 'nutrition' && (
          <div className="animate-fade-in pr-12">
            <p className="font-bold text-slate-700 dark:text-slate-200 text-sm leading-relaxed">{entry.food_meals}</p>
            {entry.food_notes && <p className="text-xs text-slate-500 mt-2 italic border-l-2 border-emerald-100 dark:border-emerald-950 pl-3">"{entry.food_notes}"</p>}
          </div>
        )}

        {entry.log_module === 'training' && (
          <div className="animate-fade-in pr-12">
            <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">
              {entry.trained ? `🏋️ ${entry.train_type}` : '🛋️ Rest Day'}
              {entry.train_duration && <span className="text-brand-500 ml-2">· {entry.train_duration}m</span>}
            </p>
            {entry.train_notes && <p className="text-xs text-slate-500 mt-2 italic border-l-2 border-orange-100 dark:border-orange-950 pl-2">{entry.train_notes}</p>}
          </div>
        )}

        {entry.log_module === 'study' && (
          <div className="animate-fade-in pr-12">
            <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">📚 {entry.study_topic}</p>
            {entry.study_time && <p className="text-[10px] text-brand-500 font-bold mt-0.5 uppercase tracking-wide">⏱️ {entry.study_time} mins</p>}
            {entry.study_notes && <p className="text-xs text-slate-500 mt-2 italic border-l-2 border-blue-100 dark:border-blue-950 pl-2">{entry.study_notes}</p>}
          </div>
        )}

        {entry.log_module === 'mind' && (
          <div className="animate-fade-in pr-12">
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

        {entry.log_module === 'task' && (
          <div className="animate-fade-in pr-12">
            <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">
              <span className="text-green-500 mr-2">✔️</span>
              <span className="line-through opacity-80">{entry.text}</span>
            </p>
            {entry.description && <p className="text-xs text-slate-500 mt-2 italic border-l-2 border-slate-100 dark:border-slate-800 pl-2">{entry.description}</p>}
          </div>
        )}

        {/* Quick Action Overlay */}
        <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-center gap-2 px-3 bg-gradient-to-l from-white dark:from-slate-900 to-transparent translate-x-full group-hover:translate-x-0 transition-transform duration-200">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(entry); }}
            className="p-2 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-lg hover:scale-110 shadow-sm"
          >
            ✏️
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(entry); }}
            className="p-2 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg hover:scale-110 shadow-sm"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};
