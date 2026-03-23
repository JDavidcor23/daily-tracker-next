'use client';

import React from 'react';
import { STUDY_TIME_ADVANCED_THRESHOLD } from '@/lib/constants';
import { MOODS, Mood } from '@/lib/types';
import { formatTime } from '@/lib/utils';
import { 
  NutritionContent, 
  TrainingContent, 
  StudyContent, 
  MindContent 
} from './modal-content';

interface EntryDetailModalProps {
  selectedEntry: any;
  isEditing: boolean;
  editData: any;
  onEdit: (entry: any) => void;
  onSave: () => void;
  onDelete: (entry: any) => void;
  onClose: () => void;
  onEditDataChange: (data: any) => void;
  onCancelEdit: () => void;
}

export const EntryDetailModal: React.FC<EntryDetailModalProps> = ({
  selectedEntry,
  isEditing,
  editData,
  onEdit,
  onSave,
  onDelete,
  onClose,
  onEditDataChange,
  onCancelEdit,
}) => {
  if (!selectedEntry) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div className="card w-full max-w-lg overflow-hidden shadow-2xl relative border-0 dark:border dark:border-slate-800 animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          {!isEditing && (
            <>
              <button
                onClick={() => onEdit(selectedEntry)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-brand-500 transition-colors"
                title="Edit"
              >
                ✏️
              </button>
              <button
                onClick={() => onDelete(selectedEntry)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-500 transition-colors"
                title="Delete"
              >
                🗑️
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            title="Close"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className={`h-2 absolute top-0 left-0 right-0 ${
          selectedEntry.log_module === 'nutrition' ? 'bg-emerald-500' :
          selectedEntry.log_module === 'training' ? 'bg-orange-500' :
          selectedEntry.log_module === 'study' ? 'bg-blue-500' :
          selectedEntry.log_module === 'task' ? 'bg-amber-500' :
          selectedEntry.log_module === 'mind' ? 'bg-violet-500' :
          'bg-violet-500'}`} />

        <div className="pt-8 px-6 pb-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
          <div className="mb-6">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-1">
              {isEditing ? 'EDITING ' : ''}{selectedEntry.log_module}
            </span>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
              <span className="text-4xl drop-shadow-sm">
                {selectedEntry.log_module === 'nutrition' ? (selectedEntry.food_meals?.toLowerCase()?.includes('fruit') ? '🍎' : '🥗') :
                  selectedEntry.log_module === 'training' ? (selectedEntry.train_type?.toLowerCase()?.includes('run') ? '🏃' : '🏋️') :
                  selectedEntry.log_module === 'study' ? (selectedEntry.study_time && parseInt(selectedEntry.study_time) > STUDY_TIME_ADVANCED_THRESHOLD ? '🎓' : '📚') :
                  selectedEntry.log_module === 'mind' ? (MOODS.includes(selectedEntry.mood as Mood) ? selectedEntry.mood : '🧠') :
                  '🧠'}
              </span>
              {selectedEntry.log_module === 'nutrition' ? 'Nutrition' :
                selectedEntry.log_module === 'training' ? 'Training' :
                selectedEntry.log_module === 'study' ? 'Study session' :
                selectedEntry.log_module === 'mind' ? 'Mind & Mood' :
                'Activity'
              }
            </h2>
          </div>

          <div className="space-y-6">
            {selectedEntry.log_module === 'nutrition' && (
              <NutritionContent 
                entry={selectedEntry} 
                isEditing={isEditing} 
                editData={editData} 
                onEditDataChange={onEditDataChange} 
              />
            )}

            {selectedEntry.log_module === 'training' && (
              <TrainingContent 
                entry={selectedEntry} 
                isEditing={isEditing} 
                editData={editData} 
                onEditDataChange={onEditDataChange} 
              />
            )}

            {selectedEntry.log_module === 'study' && (
              <StudyContent 
                entry={selectedEntry} 
                isEditing={isEditing} 
                editData={editData} 
                onEditDataChange={onEditDataChange} 
              />
            )}

            {selectedEntry.log_module === 'mind' && (
              <MindContent 
                entry={selectedEntry} 
                isEditing={isEditing} 
                editData={editData} 
                onEditDataChange={onEditDataChange} 
              />
            )}

            {!isEditing && (
              <div className="border-t border-slate-100 dark:border-slate-800 pt-6 mt-6 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <span className="flex items-center gap-1.5"><span className="text-sm">🗓️</span> Today</span>
                <span className="flex items-center gap-1.5"><span className="text-sm">🕘</span> {selectedEntry.created_at ? formatTime(selectedEntry.created_at) : ''}</span>
              </div>
            )}

            {isEditing && (
              <div className="flex gap-3 pt-4">
                <button
                  onClick={onSave}
                  className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95"
                >
                  Save Changes
                </button>
                <button
                  onClick={onCancelEdit}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

