'use client';

import React from 'react';
import { MOOD_LABELS, Mood } from '@/lib/types';

interface MindContentProps
{
  entry: any;
  isEditing: boolean;
  editData?: any;
  onEditDataChange?: ( data: any ) => void;
}

export const MindContent: React.FC<MindContentProps> = ( {
  entry,
  isEditing,
  editData,
  onEditDataChange,
} ) =>
{
  if ( !isEditing )
  {
    return (
      <div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-violet-50/30 dark:bg-violet-950/20 p-4 rounded-2xl border border-violet-100 dark:border-violet-900/30">
            <h3 className="text-[10px] font-black uppercase text-slate-400 mb-1">Mood Status</h3>
            <p className="text-xl font-black text-slate-800 dark:text-slate-100">{ entry.mood } { entry.mood ? MOOD_LABELS[ entry.mood as Mood ] : '' }</p>
          </div>
          <div className="bg-brand-50/30 dark:bg-brand-950/20 p-4 rounded-2xl border border-brand-100 dark:border-brand-900/30">
            <h3 className="text-[10px] font-black uppercase text-slate-400 mb-1">Stress Factor</h3>
            <p className="text-xl font-black text-slate-800 dark:text-slate-100">{ entry.stress_level }/10</p>
          </div>
        </div>
        { ( entry.mind_title || entry.mind_description ) && (
          <div className="mb-4">
            { entry.mind_title && <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-1">{ entry.mind_title }</h3> }
            { entry.mind_description && (
              <div className="bg-brand-50/50 dark:bg-brand-950/20 rounded-2xl p-4 text-sm text-slate-700 dark:text-slate-200 leading-relaxed border border-brand-100 dark:border-brand-900/30 font-medium whitespace-pre-wrap">
                { entry.mind_description }
              </div>
            ) }
          </div>
        ) }
        { entry.mind_notes && (
          <div>
            <h3 className="text-[10px] font-black uppercase text-slate-400 mb-2">Thoughts Logged</h3>
            <div className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-4 text-sm text-slate-700 dark:text-slate-200 leading-relaxed border border-slate-100 dark:border-slate-800 font-medium whitespace-pre-wrap">
              { entry.mind_notes }
            </div>
          </div>
        ) }
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase mb-1 block">Mood</label>
          <select
            className="input-field w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-brand-500 focus:border-brand-500"
            value={ editData.mood }
            onChange={ e => onEditDataChange?.( { ...editData, mood: e.target.value } ) }
          >
            <option value="">None</option>
            <option value="😩">😩 Terrible</option>
            <option value="😕">😕 Bad</option>
            <option value="😐">😐 Neutral</option>
            <option value="🙂">🙂 Good</option>
            <option value="😄">😄 Great</option>
          </select>
        </div>
        <div>
          <label className="label text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase mb-1 block">Stress ({ editData.stress_level }/10)</label>
          <input
            type="range"
            min="1"
            max="10"
            className="mt-2 w-full accent-brand-500"
            value={ editData.stress_level }
            onChange={ e => onEditDataChange?.( { ...editData, stress_level: parseInt( e.target.value ) } ) }
          />
        </div>
      </div>
      <div>
        <label className="label text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase mb-1 block">Topic/Title</label>
        <input
          type="text"
          className="input-field mb-4 w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-brand-500 focus:border-brand-500"
          placeholder="What's on your mind?"
          value={ editData.mind_title || '' }
          onChange={ e => onEditDataChange?.( { ...editData, mind_title: e.target.value } ) }
        />
        <label className="label text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase mb-1 block">Detailed Description</label>
        <textarea
          className="input-field min-h-[100px] mb-4 w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-brand-500 focus:border-brand-500"
          placeholder="Describe your mental state..."
          value={ editData.mind_description || '' }
          onChange={ e => onEditDataChange?.( { ...editData, mind_description: e.target.value } ) }
        />
        <label className="label text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase mb-1 block">Private Notes</label>
        <textarea
          className="input-field min-h-[80px] w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-brand-500 focus:border-brand-500"
          placeholder="Any extra thoughts?"
          value={ editData.mind_notes || '' }
          onChange={ e => onEditDataChange?.( { ...editData, mind_notes: e.target.value } ) }
        />
      </div>
    </>
  );
};
