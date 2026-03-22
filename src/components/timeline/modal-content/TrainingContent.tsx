'use client';

import React from 'react';

interface TrainingContentProps {
  entry: any;
  isEditing: boolean;
  editData?: any;
  onEditDataChange?: (data: any) => void;
}

export const TrainingContent: React.FC<TrainingContentProps> = ({
  entry,
  isEditing,
  editData,
  onEditDataChange,
}) => {
  if (!isEditing) {
    return (
      <div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-orange-50/30 dark:bg-orange-950/20 p-4 rounded-2xl border border-orange-100 dark:border-orange-900/30">
            <h3 className="text-[10px] font-black uppercase text-slate-400 mb-1">Workout Type</h3>
            <p className="text-lg font-black text-slate-800 dark:text-slate-100">{entry.train_type || 'Rest Day'}</p>
          </div>
          {entry.train_duration && (
            <div className="bg-brand-50/30 dark:bg-brand-950/20 p-4 rounded-2xl border border-brand-100 dark:border-brand-900/30">
              <h3 className="text-[10px] font-black uppercase text-slate-400 mb-1">Duration</h3>
              <p className="text-lg font-black text-brand-600 dark:text-brand-400">{entry.train_duration}m</p>
            </div>
          )}
        </div>
        {entry.train_notes && (
          <div>
            <h3 className="text-[10px] font-black uppercase text-slate-400 mb-2">Session Notes</h3>
            <div className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-4 text-sm text-slate-700 dark:text-slate-200 leading-relaxed border border-slate-100 dark:border-slate-800 font-medium whitespace-pre-wrap">
              {entry.train_notes}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase mb-1 block">Workout Type</label>
          <input
            type="text"
            className="input-field w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-brand-500 focus:border-brand-500"
            value={editData.train_type || ''}
            onChange={e => onEditDataChange?.({...editData, train_type: e.target.value})}
          />
        </div>
        <div>
          <label className="label text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase mb-1 block">Duration (min)</label>
          <input
            type="number"
            className="input-field w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-brand-500 focus:border-brand-500"
            value={editData.train_duration || ''}
            onChange={e => onEditDataChange?.({...editData, train_duration: e.target.value})}
          />
        </div>
      </div>
      <div>
        <label className="label text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase mb-1 block">Notes</label>
        <textarea
          className="input-field min-h-[80px] w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-brand-500 focus:border-brand-500"
          value={editData.train_notes || ''}
          onChange={e => onEditDataChange?.({...editData, train_notes: e.target.value})}
        />
      </div>
    </>
  );
};
