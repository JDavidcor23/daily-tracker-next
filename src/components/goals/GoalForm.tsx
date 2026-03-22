'use client';

import React, { useState, useEffect } from 'react';
import { Goal, GoalLifeArea } from '@/lib/types';
import { LIFE_AREA_LABELS, GOAL_STATUS_LABELS } from '@/lib/constants';

interface GoalFormProps {
  editingGoal: Goal | null;
  onSubmit: (data: Omit<Goal, 'id' | 'created_at'>) => void;
  onClose: () => void;
}

export const GoalForm: React.FC<GoalFormProps> = ({ editingGoal, onSubmit, onClose }) => {
  const [formData, setFormData] = useState<Omit<Goal, 'id' | 'created_at'>>({
    title: '',
    description: '',
    life_area: 'profesional',
    due_date: new Date().toISOString().split('T')[0],
    status: 'active',
    progress: 0
  });

  useEffect(() => {
    if (editingGoal) {
      setFormData({
        title: editingGoal.title || '',
        description: editingGoal.description || '',
        life_area: editingGoal.life_area || 'profesional',
        due_date: editingGoal.due_date || new Date().toISOString().split('T')[0],
        status: editingGoal.status || 'active',
        progress: editingGoal.progress || 0
      });
    }
  }, [editingGoal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
            {editingGoal ? 'Edit Goal' : 'Create New Goal'}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Title</label>
            <input
              type="text"
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 placeholder:text-slate-400 dark:text-slate-100 focus:ring-2 focus:ring-brand-500/20 transition-all"
              placeholder="e.g. Master React Query"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Area</label>
              <select
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 dark:text-slate-100 focus:ring-2 focus:ring-brand-500/20 transition-all appearance-none"
                value={formData.life_area}
                onChange={(e) => setFormData({ ...formData, life_area: e.target.value as GoalLifeArea })}
              >
                {Object.entries(LIFE_AREA_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Due Date</label>
              <input
                type="date"
                required
                min={today}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 dark:text-slate-100 focus:ring-2 focus:ring-brand-500/20 transition-all"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>
          </div>

          {editingGoal && (
            <div>
              <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Status</label>
              <select
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 dark:text-slate-100 focus:ring-2 focus:ring-brand-500/20 transition-all appearance-none"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              >
                {Object.entries(GOAL_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Description</label>
            <textarea
              rows={3}
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 placeholder:text-slate-400 dark:text-slate-100 focus:ring-2 focus:ring-brand-500/20 transition-all resize-none"
              placeholder="Detailed description of your goal..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-500/20 active:scale-[0.98] transition-all"
            >
              {editingGoal ? 'Save Changes' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
