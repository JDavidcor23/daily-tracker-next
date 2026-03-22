'use client';

import React, { useState } from 'react';
import { GoalWithDetails, Todo, Goal, Milestone } from '@/lib/types';
import { LIFE_AREA_META, GOAL_STATUS_COLORS, GOAL_STATUS_LABELS } from '@/lib/constants';

interface GoalDetailModalProps {
  goal: GoalWithDetails;
  detailLoading: boolean;
  allTodos: Todo[];
  onClose: () => void;
  onEdit: (goal: Goal) => void;
  onToggleMilestone: (milestone: Milestone) => void;
  onAddMilestone: (goalId: string, title: string, dueDate: string) => void;
  onDeleteMilestone: (id: string) => void;
  onLinkTask: (goalId: string, todoId: string) => void;
  onUnlinkTask: (goalId: string, todoId: string) => void;
  onUpdateStatus: (id: string, status: any) => void;
}

export const GoalDetailModal: React.FC<GoalDetailModalProps> = ({
  goal,
  detailLoading,
  allTodos,
  onClose,
  onEdit,
  onToggleMilestone,
  onAddMilestone,
  onDeleteMilestone,
  onLinkTask,
  onUnlinkTask,
  onUpdateStatus
}) => {
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [linkTaskId, setLinkTaskId] = useState('');

  const meta = LIFE_AREA_META[goal.life_area] || { bg: 'bg-gray-100', text: 'text-gray-600', icon: '🎯' };
  
  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle) return;
    onAddMilestone(goal.id, newMilestoneTitle, newMilestoneDueDate);
    setNewMilestoneTitle('');
    setShowAddMilestone(false);
  };

  const handleLinkTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkTaskId) return;
    onLinkTask(goal.id, linkTaskId);
    setLinkTaskId('');
  };

  const unlinkedTodos = allTodos.filter(todo => !goal.linkedTodos.some(lt => lt.id === todo.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${meta.bg} ${meta.text}`}>
                <span>{meta.icon}</span>
                <span className="capitalize">{goal.life_area.replace('_', ' ')}</span>
              </span>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${GOAL_STATUS_COLORS[goal.status]}`}>
                {GOAL_STATUS_LABELS[goal.status]}
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 leading-tight">
              {goal.title}
            </h2>
            {goal.description && (
              <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm leading-relaxed">
                {goal.description}
              </p>
            )}
          </div>
          <div className="flex gap-2 ml-4">
            <button 
              onClick={() => onEdit(goal)}
              className="p-2 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors bg-slate-50 dark:bg-slate-800 rounded-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors bg-slate-50 dark:bg-slate-800 rounded-xl">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-8">
          {/* Progress Section */}
          <section>
            <div className="flex justify-between items-end mb-2.5">
              <div>
                <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-0.5">Overall Progress</span>
                <span className="text-slate-900 dark:text-slate-100 text-sm font-semibold">
                  Due {new Date(goal.due_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <span className="text-3xl font-black text-brand-600 dark:text-brand-400">{goal.progress}%</span>
            </div>
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-500 dark:bg-brand-600 transition-all duration-700 ease-out shadow-[0_0_12px_rgba(var(--color-brand-500),0.3)]"
                style={{ width: `${goal.progress}%` }}
              />
            </div>
            
            {goal.progress === 100 && goal.status !== 'completed' && (
              <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🎉</span>
                  <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">All milestones reached!</span>
                </div>
                <button 
                  onClick={() => onUpdateStatus(goal.id, 'completed')}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all"
                >
                  Complete Goal
                </button>
              </div>
            )}
          </section>

          {/* Milestones Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Roadmap Milestones</h3>
              <button 
                onClick={() => setShowAddMilestone(!showAddMilestone)}
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
              >
                {showAddMilestone ? 'Cancel' : '+ Add Milestone'}
              </button>
            </div>

            {showAddMilestone && (
              <form onSubmit={handleAddMilestone} className="mb-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/50 space-y-3 animate-in slide-in-from-top-2">
                <input
                  type="text"
                  required
                  placeholder="Milestone title..."
                  className="w-full bg-white dark:bg-slate-900 border-none rounded-xl px-4 py-2 text-sm"
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                />
                <div className="flex gap-2">
                  <input
                    type="date"
                    required
                    className="flex-1 bg-white dark:bg-slate-900 border-none rounded-xl px-4 py-2 text-sm"
                    value={newMilestoneDueDate}
                    onChange={(e) => setNewMilestoneDueDate(e.target.value)}
                  />
                  <button type="submit" className="bg-brand-600 text-white px-4 rounded-xl text-sm font-bold">Add</button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {goal.milestones.length === 0 ? (
                <p className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm italic">No milestones yet. Break down your goal into steps!</p>
              ) : (
                goal.milestones.map((m) => (
                  <div 
                    key={m.id}
                    className={`group flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                      m.completed 
                        ? 'bg-emerald-50/30 dark:bg-emerald-950/5 border-emerald-100/50 dark:border-emerald-900/20' 
                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => onToggleMilestone(m)}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all ${
                          m.completed 
                            ? 'bg-emerald-500 border-emerald-500 text-white' 
                            : 'border-slate-200 dark:border-slate-700 hover:border-brand-500'
                        }`}
                      >
                        {m.completed && (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <div>
                        <span className={`text-sm font-bold leading-tight block ${m.completed ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-900 dark:text-slate-100'}`}>
                          {m.title}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                          Due {new Date(m.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => onDeleteMilestone(m.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Linked Tasks Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Linked Todos</h3>
            </div>

            <div className="space-y-3">
              {goal.linkedTodos.map((todo) => (
                <div key={todo.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-6 rounded-full ${
                      todo.priority === 'high' ? 'bg-red-500' : todo.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                    }`} />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{todo.text}</span>
                  </div>
                  <button 
                    onClick={() => onUnlinkTask(goal.id, todo.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}

              <form onSubmit={handleLinkTask} className="flex gap-2">
                <select 
                  className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 text-sm dark:text-slate-100 focus:ring-2 focus:ring-brand-500/20"
                  value={linkTaskId}
                  onChange={(e) => setLinkTaskId(e.target.value)}
                >
                  <option value="">Link a daily task...</option>
                  {unlinkedTodos.map(todo => (
                    <option key={todo.id} value={todo.id}>{todo.text}</option>
                  ))}
                </select>
                <button 
                  type="submit" 
                  disabled={!linkTaskId}
                  className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 rounded-xl text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 active:scale-95 transition-all"
                >
                  Link
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
