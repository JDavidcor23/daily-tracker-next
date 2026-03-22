'use client';

import React from 'react';

interface NutritionContentProps {
  entry: any;
  isEditing: boolean;
  editData?: any;
  onEditDataChange?: (data: any) => void;
}

export const NutritionContent: React.FC<NutritionContentProps> = ({
  entry,
  isEditing,
  editData,
  onEditDataChange,
}) => {
  if (!isEditing) {
    return (
      <div>
        <h3 className="text-[10px] font-black uppercase text-slate-400 mb-2">Meals Logged</h3>
        <div className="bg-emerald-50/30 dark:bg-emerald-950/20 rounded-2xl p-4 text-sm text-slate-700 dark:text-slate-200 leading-relaxed min-h-[100px] border border-emerald-100/50 dark:border-emerald-900/30 font-bold whitespace-pre-wrap">
          {entry.food_meals}
        </div>
        {entry.food_notes && (
          <div className="mt-6">
            <h3 className="text-[10px] font-black uppercase text-slate-400 mb-2">Internal Notes</h3>
            <div className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-4 text-sm text-slate-500 dark:text-slate-400 italic border border-slate-100 dark:border-slate-800">
              "{entry.food_notes}"
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div>
        <label className="label text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase mb-1 block">Meals</label>
        <textarea
          className="input-field min-h-[100px] w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-brand-500 focus:border-brand-500"
          value={editData.food_meals}
          onChange={e => onEditDataChange?.({...editData, food_meals: e.target.value})}
        />
      </div>
      <div>
        <label className="label text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase mb-1 block">Notes</label>
        <input
          type="text"
          className="input-field w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-brand-500 focus:border-brand-500"
          value={editData.food_notes || ''}
          onChange={e => onEditDataChange?.({...editData, food_notes: e.target.value})}
        />
      </div>
    </>
  );
};
