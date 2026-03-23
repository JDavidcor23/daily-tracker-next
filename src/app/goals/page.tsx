'use client';

import React, { useState, useMemo } from 'react';
import { useGoals } from '@/hooks/useGoals';
import { GoalCard, GoalForm, GoalDetailModal } from '@/components/goals';
import { GoalLifeArea, GoalSummary } from '@/lib/types';
import { LIFE_AREA_LABELS, LIFE_AREA_META } from '@/lib/constants';

type FilterArea = GoalLifeArea | 'all';

export default function GoalsPage() {
  const {
    goals,
    allTodos,
    loading,
    selectedGoal,
    detailLoading,
    isFormOpen,
    editingGoal,
    setSelectedGoal,
    setIsFormOpen,
    setEditingGoal,
    loadGoalDetails,
    handleCreateGoal,
    handleUpdateGoal,
    handleDeleteGoal,
    handleAddMilestone,
    handleToggleMilestone,
    handleDeleteMilestone,
    handleLinkTask,
    handleUnlinkTask,
    handleLinkMultipleTasks
  } = useGoals();

  const [activeArea, setActiveArea] = useState<FilterArea>('all');

  const filteredGoals = useMemo(() => {
    if (activeArea === 'all') return goals;
    return goals.filter(g => g.life_area === activeArea);
  }, [goals, activeArea]);

  const goalsByArea = useMemo(() => {
    const grouped: Record<GoalLifeArea, GoalSummary[]> = {
      profesional: [],
      salud_cuerpo: [],
      salud_mental: [],
      financiero: []
    };
    goals.forEach(g => {
      if (grouped[g.life_area]) {
        grouped[g.life_area].push(g);
      }
    });
    return grouped;
  }, [goals]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-2">
            My Life Goals 🎯
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Track your progress across all areas of your life.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingGoal(null);
            setIsFormOpen(true);
          }}
          className="bg-brand-600 hover:bg-brand-500 text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-brand-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
          </svg>
          Build a New Goal
        </button>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto pb-4 gap-2 mb-8 no-scrollbar scroll-smooth">
        <button
          onClick={() => setActiveArea('all')}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all whitespace-nowrap border-2 ${
            activeArea === 'all'
              ? 'bg-slate-900 border-slate-900 text-white dark:bg-slate-100 dark:border-slate-100 dark:text-slate-900 shadow-lg'
              : 'bg-white dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <span>🌐</span>
          <span>All Areas</span>
        </button>
        {(Object.keys(LIFE_AREA_LABELS) as GoalLifeArea[]).map(area => {
          const meta = LIFE_AREA_META[area];
          const isActive = activeArea === area;
          return (
            <button
              key={area}
              onClick={() => setActiveArea(area)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all whitespace-nowrap border-2 ${
                isActive
                  ? `${meta.bg} ${meta.text} ${meta.border.replace('dark:border-white/10', 'dark:border-white/30')} border-current shadow-md`
                  : `bg-white dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700`
              }`}
            >
              <span>{meta.icon}</span>
              <span>{LIFE_AREA_LABELS[area]}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {activeArea === 'all' ? (
        <div className="space-y-16">
          {(Object.keys(goalsByArea) as GoalLifeArea[]).map(area => {
            const areaGoals = goalsByArea[area];
            if (areaGoals.length === 0) return null;
            const meta = LIFE_AREA_META[area];
            return (
              <section key={area} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm ${meta.bg}`}>
                    {meta.icon}
                  </span>
                  <h2 className="text-2xl font-black text-slate-800 dark:text-slate-200">
                    {LIFE_AREA_LABELS[area]}
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {areaGoals.map(goal => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onClick={loadGoalDetails}
                      onEdit={(e, g) => {
                        e.stopPropagation();
                        setEditingGoal(g);
                        setIsFormOpen(true);
                      }}
                      onDelete={(e, id) => {
                        e.stopPropagation();
                        handleDeleteGoal(id);
                      }}
                    />
                  ))}
                </div>
              </section>
            );
          })}
          {goals.length === 0 && (
            <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/30 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
              <span className="text-6xl mb-6 block">✨</span>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">No goals created yet</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">Start charting your course today. Dream big, break it down, and make it happen.</p>
              <button 
                onClick={() => setIsFormOpen(true)}
                className="bg-brand-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:bg-brand-500 transition-all font-outfit"
              >
                Create Your First Goal
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
          {filteredGoals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onClick={loadGoalDetails}
              onEdit={(e, g) => {
                e.stopPropagation();
                setEditingGoal(g);
                setIsFormOpen(true);
              }}
              onDelete={(e, id) => {
                e.stopPropagation();
                handleDeleteGoal(id);
              }}
            />
          ))}
          {filteredGoals.length === 0 && (
            <div className="col-span-full text-center py-20">
              <p className="text-slate-500 dark:text-slate-400 font-bold italic text-lg">
                No goals in {LIFE_AREA_LABELS[activeArea]} yet.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {isFormOpen && (
        <GoalForm
          editingGoal={editingGoal}
          onSubmit={(data) => {
            if (editingGoal) handleUpdateGoal(editingGoal.id, data);
            else handleCreateGoal(data);
          }}
          onClose={() => {
            setIsFormOpen(false);
            setEditingGoal(null);
          }}
        />
      )}

      {selectedGoal && (
        <GoalDetailModal
          goal={selectedGoal}
          detailLoading={detailLoading}
          allTodos={allTodos}
          onClose={() => setSelectedGoal(null)}
          onEdit={(g) => {
            setEditingGoal(g);
            setIsFormOpen(true);
          }}
          onToggleMilestone={handleToggleMilestone}
          onAddMilestone={handleAddMilestone}
          onDeleteMilestone={handleDeleteMilestone}
          onLinkTask={handleLinkTask}
          onUnlinkTask={handleUnlinkTask}
          onLinkMultipleTasks={handleLinkMultipleTasks}
          onUpdateStatus={(id, status) => handleUpdateGoal(id, { status })}
        />
      )}
    </div>
  );
}
