'use client';

import React from 'react';
import { GoalSummary } from '@/lib/types';
import { LIFE_AREA_META, GOAL_STATUS_COLORS, GOAL_STATUS_LABELS } from '@/lib/constants';

interface GoalCardProps {
  goal: GoalSummary;
  onClick: (id: string) => void;
  onEdit: (e: React.MouseEvent, goal: GoalSummary) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, onClick, onEdit, onDelete }) => {
  const meta = LIFE_AREA_META[goal.life_area] || { bg: 'bg-gray-100', text: 'text-gray-600', icon: '🎯' };
  const doneCount = (goal.milestones || []).filter(m => m.completed).length;
  const totalCount = (goal.milestones || []).length;
  const progressText = totalCount > 0 ? `${doneCount}/${totalCount} milestones` : 'No milestones';

  return (
    <div 
      className="group relative bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:border-brand-300 dark:hover:border-brand-700 transition-all cursor-pointer shadow-sm hover:shadow-md"
      onClick={() => onClick(goal.id)}
    >
      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={(e) => onEdit(e, goal)}
          className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button 
          onClick={(e) => onDelete(e, goal.id)}
          className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 mb-3">
          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${meta.bg} ${meta.text}`}>
            <span>{meta.icon}</span>
            <span className="capitalize">{goal.life_area.replace('_', ' ')}</span>
          </span>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${GOAL_STATUS_COLORS[goal.status]}`}>
            {GOAL_STATUS_LABELS[goal.status]}
          </span>
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 line-clamp-2 leading-snug">
          {goal.title}
        </h3>
        
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {new Date(goal.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>

        <div className="mt-auto">
          <div className="flex justify-between items-end mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{progressText}</span>
            <span className="text-sm font-black text-brand-600 dark:text-brand-400">{goal.progress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-brand-500 dark:bg-brand-600 transition-all duration-500 ease-out shadow-[0_0_8px_rgba(var(--color-brand-500),0.3)]"
              style={{ width: `${goal.progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
