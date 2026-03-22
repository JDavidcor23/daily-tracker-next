'use client';

import React from 'react';

interface StudyContentProps {
  entry: any;
  isEditing: boolean;
  editData?: any;
  onEditDataChange?: (data: any) => void;
}

export const StudyContent: React.FC<StudyContentProps> = ({
  entry,
  isEditing,
  editData,
  onEditDataChange,
}) => {
  if (!isEditing) {
    return (
      <div>
        <div className="bg-blue-50/30 dark:bg-blue-950/20 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/30 mb-4">
          <h3 className="text-[10px] font-black uppercase text-slate-400 mb-1">Study Topic</h3>
          <p className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{entry.study_topic}</p>
          {entry.study_time && (
            <div className="mt-3 flex items-center gap-2 text-brand-500 font-black">
              <span className="text-xl">⏱️</span> {entry.study_time} minutes spent
            </div>
          )}
        </div>
        {entry.study_notes && (
          <div>
            <h3 className="text-[10px] font-black uppercase text-slate-400 mb-2">Learned Today</h3>
            <div className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-4 text-sm text-slate-700 dark:text-slate-200 leading-relaxed border border-slate-100 dark:border-slate-800 font-medium whitespace-pre-wrap">
              {entry.study_notes}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div>
        <label className="label text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase mb-1 block">Topic</label>
        <input
          type="text"
          className="input-field w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-brand-500 focus:border-brand-500"
          value={editData.study_topic}
          onChange={e => onEditDataChange?.({...editData, study_topic: e.target.value})}
        />
      </div>
      <div>
        <label className="label text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase mb-1 block">Duration (min)</label>
        <input
          type="number"
          className="input-field w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-brand-500 focus:border-brand-500"
          value={editData.study_time || ''}
          onChange={e => onEditDataChange?.({...editData, study_time: e.target.value})}
        />
      </div>
      <div>
        <label className="label text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase mb-1 block">Notes</label>
        <textarea
          className="input-field min-h-[80px] w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-brand-500 focus:border-brand-500"
          value={editData.study_notes || ''}
          onChange={e => onEditDataChange?.({...editData, study_notes: e.target.value})}
        />
      </div>
    </>
  );
};
